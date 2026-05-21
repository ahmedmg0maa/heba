import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, hasConfiguredAdminPassword, isValidAdminSessionToken } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET() {
  try {
    const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
    const configured = hasConfiguredAdminPassword()
    const authenticated = isValidAdminSessionToken(token)
    const reason = authenticated ? "ok" : token ? "invalid_session" : "missing_cookie"
    const errors = configured ? [] : ["ADMIN_PASSWORD is missing on Vercel."]
    const message = configured ? undefined : "ADMIN_PASSWORD is not configured in the production environment."

    const response = NextResponse.json(
      {
        ok: true,
        configured,
        authenticated,
        reason,
        errors,
        message,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    )
    return response
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        authenticated: false,
        reason: "unknown_error",
        errors: ["Session check failed on the server."],
        message: error instanceof Error ? error.message : "Unknown session check error.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    )
  }
}
