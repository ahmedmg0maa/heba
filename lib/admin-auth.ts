import "server-only"
import { timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const ADMIN_SESSION_COOKIE = "admin-auth"
const ADMIN_SESSION_VALUE = "true"

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

type RequireAdminPageOptions = {
  redirectTo?: string
  debugLabel?: string
}

export async function requireAdminPage(options: RequireAdminPageOptions = {}) {
  const { redirectTo = "/admin/login", debugLabel } = options
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  const authenticated = isValidAdminSessionToken(token)
  if (!authenticated) {
    if (process.env.NODE_ENV === "development" && debugLabel) {
      console.info("[admin-page-auth]", { page: debugLabel, ok: false, reason: "missing_or_invalid_session" })
    }
    redirect(redirectTo)
  }

  if (process.env.NODE_ENV === "development" && debugLabel) {
    console.info("[admin-page-auth]", { page: debugLabel, ok: true, reason: "ok" })
  }

  return { ok: true as const, reason: "ok" as const }
}

export function getConfiguredAdminPassword() {
  return (process.env.ADMIN_PASSWORD || "").trim()
}

export function hasConfiguredAdminPassword() {
  return Boolean(getConfiguredAdminPassword())
}

export function isValidAdminPassword(password: string) {
  const configured = getConfiguredAdminPassword()
  if (!configured) return false
  return safeEqual(configured, password.trim())
}

export function createAdminSessionToken() {
  return ADMIN_SESSION_VALUE
}

export function isValidAdminSessionToken(token?: string | null) {
  if (!token) return false
  if (!hasConfiguredAdminPassword()) return false
  return safeEqual(ADMIN_SESSION_VALUE, token)
}
