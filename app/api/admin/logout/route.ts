import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session"

export const runtime = "nodejs"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete({
    name: ADMIN_COOKIE_NAME,
    path: "/",
  })

  return NextResponse.json({ ok: true })
}
