import { timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { ADMIN_COOKIE_NAME, createAdminSession, requireAdmin } from "@/lib/admin-session"

export const runtime = "nodejs"

const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const MAX_ATTEMPTS = 6
const WINDOW_MS = 10 * 60 * 1000
const loginAttempts = new Map<string, number[]>()

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function getConfiguredAdminPassword() {
  return (process.env.ADMIN_PASSWORD || "").trim()
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

function isValidAdminPassword(password: string) {
  const configured = getConfiguredAdminPassword()
  if (!configured) return false
  return safeEqual(configured, password.trim())
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
  const admin = await requireAdmin()
  if (admin.ok) {
    return NextResponse.json({ ok: true })
  }

  if (!getConfiguredAdminPassword()) {
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

  const session = await createAdminSession()
  if (!session.ok || !session.token) {
    return NextResponse.json({ ok: false, message: "تعذر تهيئة جلسة الإدارة. راجعي إعدادات الخادم." }, { status: 503 })
  }

  const cookieStore = await cookies()
  cookieStore.delete({
    name: ADMIN_COOKIE_NAME,
    path: "/",
  })
  cookieStore.set(ADMIN_COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  })

  return NextResponse.json({ ok: true })
}
