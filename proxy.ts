import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const ADMIN_SESSION_COOKIE = "admin-auth"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next()
  }

  const configuredPassword = (process.env.ADMIN_PASSWORD || "").trim()
  if (!configuredPassword) {
    return NextResponse.redirect(new URL("/admin/login?setup=1", request.url))
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || ""
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
