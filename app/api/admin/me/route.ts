import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, hasConfiguredAdminPassword, isValidAdminSessionToken } from "@/lib/admin-auth"

export const runtime = "nodejs"

function debugMeLog(payload: { cookieExists: boolean; verified: boolean; reason: string }) {
  if (process.env.NODE_ENV !== "development") return
  console.info("[admin-me]", payload)
}

export async function GET() {
  try {
    const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
    const configured = hasConfiguredAdminPassword()
    const authenticated = isValidAdminSessionToken(token)
    const reason = authenticated ? "ok" : token ? "invalid_session" : "missing_cookie"
    debugMeLog({
      cookieExists: Boolean(token),
      verified: authenticated,
      reason,
    })

    const payload: {
      authenticated: boolean
      cookieExists: boolean
      cookieName: string
      configured: boolean
      errors?: string[]
      reason?: string
    } = {
      authenticated,
      cookieExists: Boolean(token),
      cookieName: ADMIN_SESSION_COOKIE,
      configured,
    }

    if (!authenticated) {
      payload.reason = reason
      payload.errors = configured ? [] : ["ADMIN_PASSWORD is missing on Vercel."]
    }

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        cookieExists: false,
        cookieName: ADMIN_SESSION_COOKIE,
        configured: false,
        reason: "unknown_error",
        errors: [error instanceof Error ? error.message : "Unknown /api/admin/me failure."],
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
