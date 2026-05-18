import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin-auth"
import { getDocument, getFirebaseAdminErrorMessage, listDocuments, setDocument } from "@/lib/firebase/admin"

export const runtime = "nodejs"

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function asNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function asStatus(value: unknown): "active" | "draft" | "hidden" {
  const text = asText(value).toLowerCase()
  if (text === "draft" || text === "hidden") return text
  return "active"
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

async function isAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  return isValidAdminSessionToken(token)
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرح." }, { status: 401 })
  }

  const books = await listDocuments("books", {
    orderByField: "createdAt",
    orderDirection: "desc",
    limit: 1000,
  })
  return NextResponse.json({ ok: true, books })
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرح." }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, message: "بيانات غير صالحة." }, { status: 400 })
  }

  const title = asText(body.title)
  const slug = toSlug(asText(body.slug) || title)
  const id = toSlug(asText(body.id) || slug)
  if (!title || !id || !slug) {
    return NextResponse.json({ ok: false, message: "يرجى إدخال عنوان ومعرف صالح." }, { status: 400 })
  }

  const existing = await getDocument("books", id)
  if (existing) {
    return NextResponse.json({ ok: false, message: "هذا المعرف مستخدم بالفعل." }, { status: 409 })
  }

  const now = new Date().toISOString()
  const payload = {
    id,
    title,
    slug,
    description: asText(body.description),
    shortDescription: asText(body.shortDescription),
    price: asNumber(body.price),
    coverImageUrl: asText(body.coverImageUrl),
    fileUrl: asText(body.fileUrl),
    status: asStatus(body.status),
    createdAt: now,
    updatedAt: now,
  }

  const result = await setDocument("books", id, payload, false)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: getFirebaseAdminErrorMessage(result.error) || "تعذر حفظ الكتاب." },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, id })
}
