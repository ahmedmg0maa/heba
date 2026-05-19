import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { getDocument, updateDocument } from "@/lib/firebase/admin"
import { enqueueNotification } from "@/lib/notifications"

type RouteContext = { params: Promise<{ id: string }> }

export const runtime = "nodejs"

const allowedStatuses = new Set(["approved", "cancelled", "completed"])

function adminSetupError() {
  return NextResponse.json({ ok: false, message: "إعدادات Firebase Admin غير مكتملة." }, { status: 503 })
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرح." }, { status: 401 })
  }

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ ok: false, message: "معرف الحجز غير صالح." }, { status: 400 })
  }

  let body: { status?: string } = {}
  try {
    body = (await request.json()) as { status?: string }
  } catch {
    return NextResponse.json({ ok: false, message: "تعذر قراءة الطلب." }, { status: 400 })
  }

  const status = String(body.status || "").toLowerCase()
  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ ok: false, message: "حالة الحجز غير صالحة." }, { status: 400 })
  }

  const existingBooking = await getDocument("bookings", id)
  if (!existingBooking) {
    return NextResponse.json({ ok: false, message: "الحجز غير موجود." }, { status: 404 })
  }

  if (String(existingBooking.status || "").toLowerCase() === status) {
    return NextResponse.json({ ok: true, status })
  }

  const result = await updateDocument("bookings", id, { status })
  if (!result.ok) {
    if (result.error === "FIREBASE_NOT_CONFIGURED" || result.error === "FIREBASE_INVALID_CREDENTIALS") {
      return adminSetupError()
    }
    return NextResponse.json({ ok: false, message: result.message || "تعذر تحديث حالة الحجز." }, { status: 500 })
  }

  if (status === "approved") {
    await enqueueNotification("booking_approved", {
      bookingId: id,
      userId: String(existingBooking.userId || ""),
      email: String(existingBooking.email || ""),
    })
  }

  return NextResponse.json({ ok: true, status })
}
