import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete({
    name: ADMIN_SESSION_COOKIE,
    path: "/admin",
  })

  return NextResponse.json({ ok: true })
}
