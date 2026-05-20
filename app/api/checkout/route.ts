import { NextResponse } from "next/server"
import {
  addDocument,
  getFirebaseAdminErrorMessage,
  getFirebaseSetupErrorMessage,
  isFirebaseConfigured,
} from "@/lib/firebase/admin"
import { getCatalogBookBySlug, getCatalogCourseBySlug } from "@/lib/catalog"
import { enqueueNotification } from "@/lib/notifications"
import { resolvePaymentProvider } from "@/lib/payments"
import { trackServerEvent } from "@/lib/analytics"

export const runtime = "nodejs"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function makeOrderNumber() {
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `HB-${new Date().getFullYear()}-${random}`
}

function firebaseConfigResponse() {
  return NextResponse.json(
    {
      ok: false,
      message:
        getFirebaseSetupErrorMessage() ||
        "تعذر تنفيذ الطلب الآن. إعدادات Firebase Admin غير مكتملة (FIREBASE_SERVICE_ACCOUNT_JSON).",
    },
    { status: 503 },
  )
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return firebaseConfigResponse()
  }

  try {
    const body = await request.json()
    const productId = text(body.productId)
    const productType = text(body.productType)
    const customerName = text(body.customerName || body.name)
    const email = text(body.email)
    const phone = text(body.phone)
    const requestedPaymentMethod = text(body.paymentMethod) || "manual"
    const payment = resolvePaymentProvider(requestedPaymentMethod)
    const userId = text(body.userId)

    if (!productId || !productType || !customerName || !email || !phone) {
      return NextResponse.json({ ok: false, message: "يرجى استكمال بيانات الطلب." }, { status: 400 })
    }

    let resolvedProduct:
      | { id: string; slug: string; title: string; price: number; status: string; type: "course" | "book" }
      | null = null

    if (productType === "course") {
      const course = await getCatalogCourseBySlug(productId)
      if (course) {
        resolvedProduct = {
          id: course.id,
          slug: course.slug || course.id,
          title: course.title,
          price: course.price,
          status: course.status,
          type: "course",
        }
      }
    }

    if (productType === "book") {
      const book = await getCatalogBookBySlug(productId)
      if (book) {
        resolvedProduct = {
          id: book.id,
          slug: book.slug || book.id,
          title: book.title,
          price: book.price,
          status: book.status,
          type: "book",
        }
      }
    }

    if (!resolvedProduct || resolvedProduct.status !== "active" || resolvedProduct.price <= 0) {
      return NextResponse.json({ ok: false, message: "هذا المنتج غير متاح للشراء حاليًا." }, { status: 400 })
    }

    const orderNumber = makeOrderNumber()
    const now = new Date().toISOString()
    const payload: Record<string, unknown> = {
      orderNumber,
      productId: resolvedProduct.id,
      itemId: resolvedProduct.id,
      productSlug: resolvedProduct.slug,
      productType: resolvedProduct.type,
      productTitle: resolvedProduct.title,
      amount: resolvedProduct.price,
      currency: "EGP",
      customerName,
      email,
      phone,
      paymentMethod: requestedPaymentMethod,
      paymentProvider: payment.provider,
      paymentConfigured: payment.configured,
      paymentMode: payment.mode,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      source: "website",
    }
    if (userId) payload.userId = userId

    const saved = await addDocument("orders", payload)
    if (!saved.ok || !saved.id) {
      const message =
        getFirebaseAdminErrorMessage(saved.error) || "تعذر إرسال الطلب حاليًا. يرجى المحاولة مرة أخرى."
      return NextResponse.json({ ok: false, message }, { status: 503 })
    }

    await enqueueNotification("order_created", {
      orderId: saved.id,
      userId,
      email,
    })
    void trackServerEvent("order_created", {
      orderId: saved.id,
      productId: resolvedProduct.id,
      productType: resolvedProduct.type,
      amount: resolvedProduct.price,
      paymentProvider: payment.provider,
      paymentConfigured: payment.configured,
    })

    return NextResponse.json({
      ok: true,
      orderId: saved.id,
      orderNumber,
      status: "pending",
      paymentProvider: payment.provider,
      paymentConfigured: payment.configured,
      message: payment.customerMessage,
    })
  } catch {
    return NextResponse.json({ ok: false, message: "تعذر إنشاء طلب الشراء." }, { status: 400 })
  }
}
