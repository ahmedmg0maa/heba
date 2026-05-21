import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_COOKIE_NAME, clearAdminSessionCookie, requireAdmin, shouldClearAdminSessionCookie } from "@/lib/admin-session"
import { validateAdminEnv } from "@/lib/env-validation"

export const runtime = "nodejs"

function debugMeLog(payload: { cookieExists: boolean; verified: boolean; reason: string }) {
  if (process.env.NODE_ENV !== "development") return
  console.info("[admin-me]", payload)
}

export async function GET() {
  const env = validateAdminEnv()
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value
  const verification = await requireAdmin()
  debugMeLog({
    cookieExists: Boolean(token),
    verified: verification.ok,
    reason: verification.reason,
  })

  const payload: {
    authenticated: boolean
    cookieExists: boolean
    cookieName: string
    configured: boolean
    errors?: string[]
    reason?: string
  } = {
    authenticated: verification.ok,
    cookieExists: Boolean(token),
    cookieName: ADMIN_COOKIE_NAME,
    configured: env.configured,
  }

  if (!verification.ok) {
    payload.reason = verification.reason
    payload.errors = env.errors
  }

  const response = NextResponse.json(payload)
  if (!verification.ok && shouldClearAdminSessionCookie(verification.reason)) {
    clearAdminSessionCookie(response)
  }
  return response
}
