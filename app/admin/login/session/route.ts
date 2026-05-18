import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, hasConfiguredAdminPassword, isValidAdminSessionToken } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value

  return NextResponse.json({
    ok: true,
    configured: hasConfiguredAdminPassword(),
    authenticated: isValidAdminSessionToken(token),
  })
}
