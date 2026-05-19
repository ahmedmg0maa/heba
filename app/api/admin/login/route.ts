import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  hasConfiguredAdminPassword,
  isValidAdminPassword,
} from "@/lib/admin-auth"

export const runtime = "nodejs"

const MAX_ATTEMPTS = 6
const WINDOW_MS = 10 * 60 * 1000
const loginAttempts = new Map<string, number[]>()

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getClientIp(request: Request) {
  const forwardedFor = text(request.headers.get("x-forwarded-for"))
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown"

  const realIp = text(request.headers.get("x-real-ip"))
  if (realIp) return realIp

  return "unknown"
}

function getRecentAttempts(ip: string, now = Date.now()) {
  const attempts = loginAttempts.get(ip) || []
  const recent = attempts.filter((attempt) => now - attempt <= WINDOW_MS)
  loginAttempts.set(ip, recent)
  return recent
}

function isRateLimited(ip: string) {
  return getRecentAttempts(ip).length >= MAX_ATTEMPTS
}

function registerFailure(ip: string) {
  const attempts = getRecentAttempts(ip)
  attempts.push(Date.now())
  loginAttempts.set(ip, attempts)
}

function clearFailures(ip: string) {
  loginAttempts.delete(ip)
}

export async function POST(request: Request) {
  if (!hasConfiguredAdminPassword()) {
    return NextResponse.json({ ok: false, message: "لم يتم تفعيل لوحة الإدارة بعد." }, { status: 503 })
  }

  const ip = getClientIp(request)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "تم إيقاف محاولات الدخول مؤقتًا. حاولي مرة أخرى بعد قليل." },
      { status: 429 },
    )
  }

  let body: { password?: string } = {}
  try {
    body = (await request.json()) as { password?: string }
  } catch {
    return NextResponse.json({ ok: false, message: "تعذر قراءة بيانات الدخول." }, { status: 400 })
  }

  const password = text(body.password)
  if (!password || !isValidAdminPassword(password)) {
    registerFailure(ip)
    return NextResponse.json({ ok: false, message: "كلمة المرور غير صحيحة." }, { status: 401 })
  }

  clearFailures(ip)

  const sessionToken = createAdminSessionToken()
  if (!sessionToken) {
    return NextResponse.json({ ok: false, message: "تعذر تهيئة جلسة الإدارة. راجعي إعدادات الخادم." }, { status: 503 })
  }

  const cookieStore = await cookies()
  cookieStore.delete({
    name: ADMIN_SESSION_COOKIE,
    path: "/admin",
  })
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  })

  return NextResponse.json({ ok: true })
}
