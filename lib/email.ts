import "server-only"

type EmailPayload = {
  to: string
  subject: string
  html: string
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getFromEmail() {
  return text(process.env.EMAIL_FROM) || text(process.env.RESEND_FROM_EMAIL)
}

export function getAdminNotifyEmail() {
  return text(process.env.ADMIN_NOTIFY_EMAIL) || text(process.env.ADMIN_NOTIFICATION_EMAIL)
}

function hasResendConfig() {
  return Boolean(text(process.env.RESEND_API_KEY) && getFromEmail())
}

export async function sendEmailIfConfigured(payload: EmailPayload) {
  const to = text(payload.to)
  if (!to) return { ok: false as const, skipped: true as const, reason: "missing_to" }

  if (!hasResendConfig()) {
    if (process.env.SMTP_HOST || process.env.SMTP_URL) {
      console.warn("[email] SMTP env vars found, but SMTP sender is not configured in code. Skipping email send.")
    }
    return { ok: false as const, skipped: true as const, reason: "provider_not_configured" }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: [to],
        subject: payload.subject,
        html: payload.html,
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      console.warn("[email] Resend request failed:", response.status, details)
      return { ok: false as const, skipped: false as const, reason: "resend_failed" }
    }

    return { ok: true as const, skipped: false as const }
  } catch (error) {
    console.warn("[email] Resend send failed:", error)
    return { ok: false as const, skipped: false as const, reason: "network_failed" }
  }
}
