import { NextRequest, NextResponse } from "next/server"
import { getDocument, getFirebaseSetupErrorMessage, isFirebaseConfigured } from "@/lib/firebase/admin"
import { resolveProtectedContentAccess } from "@/lib/protected-content"

type RouteContext = {
  params: Promise<{ orderId: string }>
}

export const runtime = "nodejs"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function firebaseConfigResponse() {
  return NextResponse.json(
    {
      ok: false,
      message:
        getFirebaseSetupErrorMessage() ||
        "تعذر تنفيذ التحميل الآن. إعدادات Firebase Admin غير مكتملة (FIREBASE_SERVICE_ACCOUNT_JSON).",
    },
    { status: 503 },
  )
}

function extractToken(request: NextRequest) {
  const bearer = request.headers.get("authorization")
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    return bearer.slice(7).trim()
  }

  return text(request.nextUrl.searchParams.get("token"))
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isFirebaseConfigured()) return firebaseConfigResponse()

  const token = extractToken(request)
  if (!token) {
    return NextResponse.json({ ok: false, message: "يجب تسجيل الدخول أولًا." }, { status: 401 })
  }

  const { orderId } = await context.params
  const normalizedOrderId = text(orderId)
  if (!normalizedOrderId) {
    return NextResponse.json({ ok: false, message: "معرّف الطلب غير صالح." }, { status: 400 })
  }

  const order = await getDocument("orders", normalizedOrderId)
  if (!order) {
    return NextResponse.json({ ok: false, message: "الطلب غير موجود." }, { status: 404 })
  }

  if (text(order.productType).toLowerCase() !== "book") {
    return NextResponse.json({ ok: false, message: "هذا الطلب ليس كتابًا قابلًا للتحميل." }, { status: 400 })
  }

  const productId = text(order.productId) || text(order.itemId) || text(order.productSlug)
  if (!productId) {
    return NextResponse.json({ ok: false, message: "بيانات المنتج غير مكتملة." }, { status: 400 })
  }

  const resolved = await resolveProtectedContentAccess({
    request,
    idToken: token,
    productId,
    productType: "book",
    mode: "download",
  })

  if (!resolved.ok) {
    return NextResponse.json({ ok: false, message: resolved.message }, { status: resolved.status })
  }

  return NextResponse.redirect(resolved.signedUrl, { status: 302 })
}
