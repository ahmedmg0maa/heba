import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-session"
import { getDocument, getFirebaseAdminErrorMessage, listDocuments, setDocument } from "@/lib/firebase/admin"
import { normalizeGoogleDriveCoverUrl, normalizeGoogleDriveResourceUrl } from "@/lib/google-drive"
import { trackServerEvent } from "@/lib/analytics"

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

function asBoolean(value: unknown) {
  return value === true
}

function normalizeLessons(value: unknown, courseId: string) {
  if (!Array.isArray(value)) return undefined

  const lessons = value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null
      const raw = item as Record<string, unknown>
      const lessonId = toSlug(asText(raw.id) || `${courseId}-lesson-${index + 1}`)
      const title = asText(raw.title)
      const contentUrl = normalizeGoogleDriveResourceUrl(asText(raw.contentUrl || raw.videoUrl))
      if (!lessonId || !title || !contentUrl) return null

      return {
        id: lessonId,
        courseId,
        title,
        description: asText(raw.description),
        videoUrl: normalizeGoogleDriveResourceUrl(asText(raw.videoUrl)),
        contentUrl,
        duration: asText(raw.duration),
        order: asNumber(raw.order) || index + 1,
        isPreview: asBoolean(raw.isPreview),
      }
    })
    .filter(Boolean)

  return lessons.length ? lessons : []
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const courses = await listDocuments("courses", {
    orderByField: "createdAt",
    orderDirection: "desc",
    limit: 1000,
  })
  return NextResponse.json({ ok: true, courses })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
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

  const existing = await getDocument("courses", id)
  if (existing) {
    return NextResponse.json({ ok: false, message: "هذا المعرف مستخدم بالفعل." }, { status: 409 })
  }

  const normalizedLessons = normalizeLessons(body.lessons, id)
  const now = new Date().toISOString()
  const payload = {
    id,
    title,
    slug,
    description: asText(body.description),
    shortDescription: asText(body.shortDescription),
    price: asNumber(body.price),
    coverImageUrl: normalizeGoogleDriveCoverUrl(asText(body.coverImageUrl)),
    status: asStatus(body.status),
    lessonsCount: asNumber(body.lessonsCount),
    duration: asText(body.duration),
    accessUrl: normalizeGoogleDriveResourceUrl(asText(body.accessUrl)),
    createdAt: now,
    updatedAt: now,
    ...(normalizedLessons ? { lessons: normalizedLessons } : {}),
  }

  if (Array.isArray(payload.lessons) && payload.lessons.length > 0 && payload.lessonsCount === 0) {
    payload.lessonsCount = payload.lessons.length
  }

  const result = await setDocument("courses", id, payload, false)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: getFirebaseAdminErrorMessage(result.error) || "تعذر حفظ الكورس." },
      { status: 500 },
    )
  }
  void trackServerEvent("admin_action", {
    resource: "course",
    action: "create",
    courseId: id,
    status: payload.status,
  })

  return NextResponse.json({ ok: true, id })
}
