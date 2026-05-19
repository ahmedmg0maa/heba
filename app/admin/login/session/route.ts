import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-session"

export const runtime = "nodejs"

export async function GET() {
  const admin = await requireAdmin()
  return NextResponse.json({
    ok: true,
    configured: Boolean((process.env.ADMIN_PASSWORD || "").trim()),
    authenticated: admin.ok,
    reason: admin.reason,
  })
}
