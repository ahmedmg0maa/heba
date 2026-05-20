import { NextRequest, NextResponse } from "next/server"
import { listCatalogBooks, listCatalogCourses } from "@/lib/catalog"
import { getDocument, listDocuments, setDocument, verifyFirebaseIdToken } from "@/lib/firebase/admin"

export const runtime = "nodejs"

type SummaryOrder = {
  id: string
  orderNumber: string
  productType: string
  productId: string
  itemId: string
  productSlug: string
  productTitle: string
  amount: number
  status: string
  email: string
  phone: string
  createdAt: string
}

type SummaryBooking = {
  id: string
  customerName: string
  email: string
  phone: string
  duration: number
  amount: number
  status: string
  date: string
  time: string
  createdAt: string
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeEmail(value: unknown) {
  return text(value).toLowerCase()
}

function numberValue(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isoDate(value: unknown) {
  const raw = text(value)
  if (!raw) return ""
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString()
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>()
  for (const item of items) map.set(item.id, item)
  return Array.from(map.values())
}

function sortByDateDesc<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bValue - aValue
  })
}

function buildCatalogLookup(items: Array<{ id: string; slug: string }>) {
  const lookup: Record<string, string> = {}
  for (const item of items) {
    const id = text(item.id)
    const slug = text(item.slug)
    if (!id) continue
    lookup[id] = id
    lookup[id.toLowerCase()] = id
    if (slug) {
      lookup[slug] = id
      lookup[slug.toLowerCase()] = id
    }
  }
  return lookup
}

function resolveCanonicalProductId(order: SummaryOrder, lookup: Record<string, string>) {
  const candidates = [text(order.itemId), text(order.productId), text(order.productSlug)].filter(Boolean)
  for (const candidate of candidates) {
    if (lookup[candidate]) return lookup[candidate]
    if (lookup[candidate.toLowerCase()]) return lookup[candidate.toLowerCase()]
  }
  return candidates[0] || ""
}

function parseBearerToken(request: NextRequest) {
  const authHeader = text(request.headers.get("authorization"))
  if (!authHeader.toLowerCase().startsWith("bearer ")) return ""
  return authHeader.slice(7).trim()
}

function mapOrders(records: Array<{ id: string } & Record<string, unknown>>) {
  return records.map((record) => ({
    id: text(record.id),
    orderNumber: text(record.orderNumber),
    productType: text(record.productType).toLowerCase(),
    productId: text(record.productId),
    itemId: text(record.itemId),
    productSlug: text(record.productSlug),
    productTitle: text(record.productTitle),
    amount: numberValue(record.amount),
    status: text(record.status || "pending").toLowerCase(),
    email: normalizeEmail(record.email),
    phone: text(record.phone),
    createdAt: isoDate(record.createdAt),
  }))
}

function mapBookings(records: Array<{ id: string } & Record<string, unknown>>) {
  return records.map((record) => ({
    id: text(record.id),
    customerName: text(record.customerName),
    email: normalizeEmail(record.email),
    phone: text(record.phone),
    duration: numberValue(record.duration) || 60,
    amount: numberValue(record.amount),
    status: text(record.status || "pending").toLowerCase(),
    date: text(record.date),
    time: text(record.time),
    createdAt: isoDate(record.createdAt),
  }))
}

export async function GET(request: NextRequest) {
  const idToken = parseBearerToken(request)
  if (!idToken) {
    return NextResponse.json({ ok: false, message: "يجب تسجيل الدخول أولًا." }, { status: 401 })
  }

  const verification = await verifyFirebaseIdToken(idToken)
  if (!verification.ok) {
    return NextResponse.json({ ok: false, message: "تعذر التحقق من جلسة الحساب." }, { status: 401 })
  }

  try {
    const uid = text(verification.decoded.uid)
    const tokenEmail = text(verification.decoded.email)
    const normalizedTokenEmail = normalizeEmail(tokenEmail)
    if (!uid) {
      return NextResponse.json({ ok: false, message: "تعذر التحقق من هوية الحساب." }, { status: 401 })
    }

    const emailCandidates = Array.from(new Set([tokenEmail, normalizedTokenEmail].filter(Boolean)))

    const [profileDoc, ordersByUser, bookingsByUser, ...emailQueryResults] = await Promise.all([
      getDocument("users", uid),
      listDocuments("orders", {
        whereClauses: [{ field: "userId", value: uid }],
        limit: 500,
      }),
      listDocuments("bookings", {
        whereClauses: [{ field: "userId", value: uid }],
        limit: 500,
      }),
      ...emailCandidates.map((email) =>
        Promise.all([
          listDocuments("orders", {
            whereClauses: [{ field: "email", value: email }],
            limit: 500,
          }),
          listDocuments("bookings", {
            whereClauses: [{ field: "email", value: email }],
            limit: 500,
          }),
        ]),
      ),
    ])

    const ordersByEmail = emailQueryResults.flatMap(([orders]) => orders)
    const bookingsByEmail = emailQueryResults.flatMap(([, bookings]) => bookings)

    const mergedOrders = sortByDateDesc(uniqueById(mapOrders([...ordersByUser, ...ordersByEmail])))
    const mergedBookings = sortByDateDesc(uniqueById(mapBookings([...bookingsByUser, ...bookingsByEmail])))

    const [books, courses] = await Promise.all([listCatalogBooks(), listCatalogCourses()])
    const bookLookup = buildCatalogLookup(books.map((item) => ({ id: item.id, slug: item.slug })))
    const courseLookup = buildCatalogLookup(courses.map((item) => ({ id: item.id, slug: item.slug })))

    const paidOrders = mergedOrders.filter((item) => item.status === "paid")
    const paidBooks = uniqueById(
      paidOrders
        .filter((item) => item.productType === "book")
        .map((item) => ({
          ...item,
          productId: resolveCanonicalProductId(item, bookLookup),
        }))
        .filter((item) => Boolean(item.productId)),
    )
    const paidCourses = uniqueById(
      paidOrders
        .filter((item) => item.productType === "course")
        .map((item) => ({
          ...item,
          productId: resolveCanonicalProductId(item, courseLookup),
        }))
        .filter((item) => Boolean(item.productId)),
    )

    const profileName = text(profileDoc?.name) || text(verification.decoded.name) || normalizedTokenEmail || uid
    const profileEmail = normalizeEmail(profileDoc?.email || normalizedTokenEmail || tokenEmail)
    const profilePhone = text(profileDoc?.phone)
    const profileCreatedAt = isoDate(profileDoc?.createdAt)

    if (!profileDoc || (profileEmail && profileEmail !== normalizeEmail(profileDoc.email))) {
      await setDocument(
        "users",
        uid,
        {
          uid,
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          createdAt: profileCreatedAt || new Date().toISOString(),
        },
        true,
      )
    }

    return NextResponse.json(
      {
        ok: true,
        profile: {
          uid,
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          createdAt: profileCreatedAt,
        },
        orders: mergedOrders,
        bookings: mergedBookings,
        paidBooks,
        paidCourses,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    console.error("[account-summary] failed:", error)
    return NextResponse.json(
      {
        ok: false,
        message: "تعذر تحميل بيانات الحساب الآن. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.",
      },
      { status: 500 },
    )
  }
}
