import { NextResponse } from "next/server"
import { hasConfiguredAdminPassword } from "@/lib/admin-auth"
import { requireAdmin } from "@/lib/require-admin"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: hasConfiguredAdminPassword(),
    authenticated: await requireAdmin(),
  })
}
