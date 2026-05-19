import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-session"

export const runtime = "nodejs"

export async function GET() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value
  const verification = await verifyAdminSession(token)

  return NextResponse.json({
    authenticated: verification.ok,
    cookieExists: Boolean(token),
    cookieName: ADMIN_COOKIE_NAME,
    reason: verification.reason,
  })
}
