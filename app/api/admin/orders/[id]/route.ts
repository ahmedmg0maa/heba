import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { getDocument, updateDocument } from "@/lib/firebase/admin"

type RouteContext = { params: Promise<{ id: string }> }

export const runtime = "nodejs"

const allowedStatuses = new Set(["paid", "cancelled"])

function adminSetupError() {
  return NextResponse.json({ ok: false, message: "إعدادات Firebase Admin غير مكتملة." }, { status: 503 })
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرح." }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ ok: false, message: "معرف الطلب غير صالح." }, { status: 400 })
  }

  let body: { status?: string } = {}
  try {
    body = (await request.json()) as { status?: string }
  } catch {
    return NextResponse.json({ ok: false, message: "تعذر قراءة الطلب." }, { status: 400 })
  }

  const status = String(body.status || "").toLowerCase()
  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ ok: false, message: "حالة الطلب غير صالحة." }, { status: 400 })
  }

  const existingOrder = await getDocument("orders", id)
  if (!existingOrder) {
    return NextResponse.json({ ok: false, message: "الطلب غير موجود." }, { status: 404 })
  }

  if (String(existingOrder.status || "").toLowerCase() === status) {
    return NextResponse.json({ ok: true, status })
  }

  const result = await updateDocument("orders", id, { status })
  if (!result.ok) {
    if (result.error === "FIREBASE_NOT_CONFIGURED" || result.error === "FIREBASE_INVALID_CREDENTIALS") {
      return adminSetupError()
    }
    return NextResponse.json({ ok: false, message: result.message || "تعذر تحديث حالة الطلب." }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status })
}

