import "server-only"
import { getDocument } from "@/lib/firebase/admin"
import { getAdminNotifyEmail, sendEmailIfConfigured } from "@/lib/email"

export type NotificationEvent = "booking_approved" | "order_paid" | "account_activated" | "booking_created" | "order_created"

type NotificationPayload = {
  userId?: string
  email?: string
  bookingId?: string
  orderId?: string
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function adminNotificationEmail() {
  return getAdminNotifyEmail()
}

async function notifyBookingCreated(payload: NotificationPayload) {
  const bookingId = text(payload.bookingId)
  const booking = bookingId ? await getDocument("bookings", bookingId) : null
  const customerEmail = text(payload.email || booking?.email)
  const customerName = text(booking?.customerName || "عميلتنا")
  const adminEmail = adminNotificationEmail()

  await Promise.allSettled([
    sendEmailIfConfigured({
      to: customerEmail,
      subject: "تم استلام طلب الحجز",
      html: `<p>مرحبًا ${customerName}،</p><p>تم استلام طلب الحجز رقم <strong>${bookingId || "-"}</strong> وهو الآن قيد المراجعة.</p>`,
    }),
    sendEmailIfConfigured({
      to: adminEmail,
      subject: "طلب حجز جديد",
      html: `<p>تم استلام طلب حجز جديد.</p><p>Booking ID: <strong>${bookingId || "-"}</strong></p>`,
    }),
  ])
}

async function notifyBookingApproved(payload: NotificationPayload) {
  const bookingId = text(payload.bookingId)
  const booking = bookingId ? await getDocument("bookings", bookingId) : null
  const customerEmail = text(payload.email || booking?.email)
  const customerName = text(booking?.customerName || "عميلتنا")

  await Promise.allSettled([
    sendEmailIfConfigured({
      to: customerEmail,
      subject: "تم تأكيد الحجز",
      html: `<p>مرحبًا ${customerName}،</p><p>تم اعتماد الحجز رقم <strong>${bookingId || "-"}</strong>. ننتظرك في الموعد.</p>`,
    }),
  ])
}

async function notifyOrderCreated(payload: NotificationPayload) {
  const orderId = text(payload.orderId)
  const order = orderId ? await getDocument("orders", orderId) : null
  const customerEmail = text(payload.email || order?.email)
  const customerName = text(order?.customerName || "عميلتنا")
  const productTitle = text(order?.productTitle || "منتج")
  const adminEmail = adminNotificationEmail()

  await Promise.allSettled([
    sendEmailIfConfigured({
      to: customerEmail,
      subject: "تم استلام طلب الشراء",
      html: `<p>مرحبًا ${customerName}،</p><p>تم استلام طلبك للمنتج <strong>${productTitle}</strong> وهو الآن قيد المراجعة حتى تأكيد الدفع.</p>`,
    }),
    sendEmailIfConfigured({
      to: adminEmail,
      subject: "طلب شراء جديد",
      html: `<p>تم استلام طلب شراء جديد.</p><p>Order ID: <strong>${orderId || "-"}</strong></p><p>Product: <strong>${productTitle}</strong></p>`,
    }),
  ])
}

async function notifyOrderPaid(payload: NotificationPayload) {
  const orderId = text(payload.orderId)
  const order = orderId ? await getDocument("orders", orderId) : null
  const customerEmail = text(payload.email || order?.email)
  const customerName = text(order?.customerName || "عميلتنا")
  const productTitle = text(order?.productTitle || "منتج")

  await Promise.allSettled([
    sendEmailIfConfigured({
      to: customerEmail,
      subject: "تم تأكيد الدفع وتفعيل الوصول",
      html: `<p>مرحبًا ${customerName}،</p><p>تم تأكيد الدفع لطلب <strong>${productTitle}</strong> وتم تفعيل الوصول داخل حسابك.</p>`,
    }),
  ])
}

export async function enqueueNotification(event: NotificationEvent, payload: NotificationPayload) {
  try {
    if (event === "booking_created") await notifyBookingCreated(payload)
    if (event === "booking_approved") await notifyBookingApproved(payload)
    if (event === "order_created") await notifyOrderCreated(payload)
    if (event === "order_paid") await notifyOrderPaid(payload)
  } catch (error) {
    console.warn("[notifications] failed to send notification:", { event, payload, error })
  }

  return {
    ok: true,
    queued: false,
    event,
  } as const
}
