import { NextResponse } from "next/server"
import { clearAdminSessionCookie, requireAdmin, shouldClearAdminSessionCookie } from "@/lib/admin-session"
import { validateAdminEnv } from "@/lib/env-validation"

export const runtime = "nodejs"

export async function GET() {
  const admin = await requireAdmin()
  const env = validateAdminEnv()
  const response = NextResponse.json({
    ok: true,
    configured: env.session.adminPasswordConfigured && env.session.sessionSecretConfigured,
    authenticated: admin.ok,
    reason: admin.reason,
    env: {
      session: env.session,
      firebaseServiceAccount: env.firebaseServiceAccount,
      firebasePublic: env.firebasePublic,
    },
    errors: env.errors,
  })
  if (!admin.ok && shouldClearAdminSessionCookie(admin.reason)) {
    clearAdminSessionCookie(response)
  }
  return response
}
