import { NextResponse } from "next/server"
import {
  createAdminSession,
  getConfiguredAdminPassword,
  isAdminPasswordConfigured,
  requireAdmin,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin-session"
import { validateAdminEnv } from "@/lib/env-validation"

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

function debugLoginLog(payload: {
  passwordProvided: boolean
  envPasswordExists: boolean
  sessionSecretExists: boolean
  cookieSet: boolean
}) {
  if (process.env.NODE_ENV !== "development") return
  console.info("[admin-login]", payload)
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (admin.ok) {
    return NextResponse.json({ ok: true })
  }

  const env = validateAdminEnv()
  const configuredPassword = getConfiguredAdminPassword()

  if (!env.session.adminPasswordConfigured || !isAdminPasswordConfigured() || !configuredPassword) {
    return NextResponse.json(
      { ok: false, message: "لم يتم تفعيل لوحة الإدارة بعد. أضف ADMIN_PASSWORD في متغيرات البيئة." },
      { status: 503 },
    )
  }

  if (!env.session.sessionSecretConfigured) {
    return NextResponse.json(
      { ok: false, message: "المتغير ADMIN_SESSION_SECRET غير مضبوط. تعذر إنشاء جلسة الإدارة." },
      { status: 503 },
    )
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
  debugLoginLog({
    passwordProvided: Boolean(password),
    envPasswordExists: Boolean(configuredPassword),
    sessionSecretExists: env.session.sessionSecretConfigured,
    cookieSet: false,
  })

  if (!password || !verifyAdminPassword(password)) {
    registerFailure(ip)
    return NextResponse.json({ ok: false, message: "كلمة المرور غير صحيحة." }, { status: 401 })
  }

  clearFailures(ip)

  const session = await createAdminSession()
  if (!session.ok || !session.token) {
    return NextResponse.json(
      { ok: false, message: "تعذر تهيئة جلسة الإدارة. راجعي إعدادات الخادم." },
      { status: 503 },
    )
  }

  const response = NextResponse.json({ ok: true })
  setAdminSessionCookie(response, session.token)

  debugLoginLog({
    passwordProvided: Boolean(password),
    envPasswordExists: Boolean(configuredPassword),
    sessionSecretExists: env.session.sessionSecretConfigured,
    cookieSet: true,
  })

  return response
}

