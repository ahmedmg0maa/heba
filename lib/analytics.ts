export type AnalyticsEvent =
  | "view_product"
  | "start_checkout"
  | "submit_booking"
  | "order_created"
  | "booking_created"
  | "admin_action"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function trackClientEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  const endpoint = text(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT)
  if (!endpoint) return

  const body = JSON.stringify({
    event,
    payload: isObject(payload) ? payload : {},
    source: "client",
    timestamp: new Date().toISOString(),
  })

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(endpoint, body)
    return
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  })
}

export async function trackServerEvent(event: AnalyticsEvent, payload?: Record<string, unknown>) {
  const endpoint = text(process.env.ANALYTICS_ENDPOINT)
  if (!endpoint) return { ok: false as const, skipped: true as const, reason: "not_configured" }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        payload: isObject(payload) ? payload : {},
        source: "server",
        timestamp: new Date().toISOString(),
      }),
      cache: "no-store",
    })

    if (!response.ok) return { ok: false as const, skipped: false as const, reason: "provider_error" }
    return { ok: true as const, skipped: false as const, reason: "ok" }
  } catch {
    return { ok: false as const, skipped: false as const, reason: "network_error" }
  }
}
