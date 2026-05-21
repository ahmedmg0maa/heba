import "server-only"
import { timingSafeEqual } from "node:crypto"
import { redirect } from "next/navigation"
import { ADMIN_COOKIE_NAME, createAdminSession, isValidAdminSessionToken, requireAdmin } from "@/lib/admin-session"

export const ADMIN_SESSION_COOKIE = ADMIN_COOKIE_NAME

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
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
  const session = createAdminSession()
  return session.ok ? session.token : ""
}

export { isValidAdminSessionToken }

type RequireAdminPageOptions = {
  redirectTo?: string
  debugLabel?: string
}

export async function requireAdminPage(options: RequireAdminPageOptions = {}) {
  const { redirectTo = "/admin/login", debugLabel } = options
  const admin = await requireAdmin()
  if (!admin.ok) {
    if (process.env.NODE_ENV === "development" && debugLabel) {
      console.info("[admin-page-auth]", { page: debugLabel, ok: false, reason: admin.reason })
    }
    redirect(redirectTo)
  }

  if (process.env.NODE_ENV === "development" && debugLabel) {
    console.info("[admin-page-auth]", { page: debugLabel, ok: true, reason: admin.reason })
  }

  return admin
}
