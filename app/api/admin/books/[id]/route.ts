import { NextResponse } from "next/server"
import { deleteDocument, getFirebaseAdminErrorMessage, setDocument } from "@/lib/firebase/admin"
import { requireAdmin } from "@/lib/require-admin"

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

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرح." }, { status: 401 })
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
  if ("coverImageUrl" in body) payload.coverImageUrl = asText(body.coverImageUrl)
  if ("fileUrl" in body) payload.fileUrl = asText(body.fileUrl)
  if ("status" in body) payload.status = asStatus(body.status)

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ ok: false, message: "لا توجد بيانات للتحديث." }, { status: 400 })
  }

  const result = await setDocument("books", id, payload, true)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: getFirebaseAdminErrorMessage(result.error) || "تعذر تحديث الكتاب." },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرح." }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ ok: false, message: "معرف غير صالح." }, { status: 400 })
  }

  const result = await deleteDocument("books", id)
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: getFirebaseAdminErrorMessage(result.error) || "تعذر حذف الكتاب." },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
