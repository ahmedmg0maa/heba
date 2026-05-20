import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_COOKIE_NAME, requireAdmin } from "@/lib/admin-session"

export const runtime = "nodejs"

function debugMeLog(payload: { cookieExists: boolean; verified: boolean; reason: string }) {
  if (process.env.NODE_ENV !== "development") return
  console.info("[admin-me]", payload)
}

export async function GET() {
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
    reason?: string
  } = {
    authenticated: verification.ok,
    cookieExists: Boolean(token),
    cookieName: ADMIN_COOKIE_NAME,
  }

  if (!verification.ok) {
    payload.reason = verification.reason
  }

  return NextResponse.json(payload)
}
