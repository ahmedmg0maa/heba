import { NextResponse } from "next/server"
import { deleteDocument, getFirebaseAdminErrorMessage, setDocument } from "@/lib/firebase/admin"
import { requireAdmin, unauthorizedAdminResponse } from "@/lib/admin-session"
import { normalizeGoogleDriveCoverUrl, normalizeGoogleDriveResourceUrl } from "@/lib/google-drive"
import { trackServerEvent } from "@/lib/analytics"

type RouteContext = { params: Promise<{ id: string }> }

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

function asBoolean(value: unknown) {
  return value === true
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
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

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return unauthorizedAdminResponse(admin)
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ ok: false, message: "معرف غير صالح." }, { status: 400 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ ok: false, message: "بيانات غير صالحة." }, { status: 400 })
  }

  const payload: Record<string, unknown> = {}
  if ("title" in body) payload.title = asText(body.title)
  if ("slug" in body) payload.slug = asText(body.slug) || id
  if ("description" in body) payload.description = asText(body.description)
  if ("shortDescription" in body) payload.shortDescription = asText(body.shortDescription)
  if ("price" in body) payload.price = asNumber(body.price)
  if ("coverImageUrl" in body) payload.coverImageUrl = normalizeGoogleDriveCoverUrl(asText(body.coverImageUrl))
  if ("status" in body) payload.status = asStatus(body.status)
  if ("lessonsCount" in body) payload.lessonsCount = asNumber(body.lessonsCount)
  if ("duration" in body) payload.duration = asText(body.duration)
  if ("accessUrl" in body) payload.accessUrl = normalizeGoogleDriveResourceUrl(asText(body.accessUrl))
  if ("lessons" in body) payload.lessons = normalizeLessons(body.lessons, id) || []

  if (Array.isArray(payload.lessons) && payload.lessons.length > 0 && !("lessonsCount" in payload)) {
    payload.lessonsCount = payload.lessons.length
  }

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ ok: false, message: "لا توجد بيانات للتحديث." }, { status: 400 })
  }

  const result = await setDocument("courses", id, payload, true)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: getFirebaseAdminErrorMessage(result.error) || "تعذر تحديث الكورس." },
      { status: 500 },
    )
  }

  void trackServerEvent("admin_action", {
    resource: "course",
    action: "update",
    courseId: id,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return unauthorizedAdminResponse(admin)
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ ok: false, message: "معرف غير صالح." }, { status: 400 })
  }

  const result = await deleteDocument("courses", id)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: getFirebaseAdminErrorMessage(result.error) || "تعذر حذف الكورس." },
      { status: 500 },
    )
  }

  void trackServerEvent("admin_action", {
    resource: "course",
    action: "delete",
    courseId: id,
  })

  return NextResponse.json({ ok: true })
}
