export type NotificationEvent = "booking_approved" | "order_paid" | "account_activated"

type NotificationPayload = {
  userId?: string
  email?: string
  bookingId?: string
  orderId?: string
}

/**
 * Notification preparation layer.
 * TODO(PROD): Wire this to the email provider queue (Mailgun/SES/SendGrid...).
 */
export async function enqueueNotification(event: NotificationEvent, payload: NotificationPayload) {
  if (process.env.NODE_ENV === "development") {
    console.log("[notifications] queued", { event, payload })
  }

  return {
    ok: true,
    queued: false,
    event,
  } as const
}
