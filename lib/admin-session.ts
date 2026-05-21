import "server-only"
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const ADMIN_COOKIE_NAME = "heba_admin_session"
export const ADMIN_SESSION_COOKIE = ADMIN_COOKIE_NAME
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

type SessionPayload = {
  iat: number
  exp: number
  nonce: string
}

export type AdminSessionReason =
  | "ok"
  | "missing_cookie"
  | "invalid_format"
  | "missing_secret"
  | "invalid_signature"
  | "invalid_payload"
  | "expired"
  | "issued_in_future"

export type AdminSessionState = {
  ok: boolean
  reason: AdminSessionReason
}

type AdminSessionConfig = {
  adminPasswordConfigured: boolean
  sessionSecretConfigured: boolean
}

function getAdminSessionSecret() {
  return (process.env.ADMIN_SESSION_SECRET || "").trim()
}

function getAdminPassword() {
  return (process.env.ADMIN_PASSWORD || "").trim()
}

function encodeBase64Url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url")
}

function decodeBase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8")
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url")
}

export function getAdminSessionConfig(): AdminSessionConfig {
  return {
    adminPasswordConfigured: Boolean(getAdminPassword()),
    sessionSecretConfigured: Boolean(getAdminSessionSecret()),
  }
}

export function getAdminSessionSetupErrors() {
  const errors: string[] = []
  const config = getAdminSessionConfig()
  if (!config.adminPasswordConfigured) {
    errors.push("ADMIN_PASSWORD is missing. Add a strong admin password in your environment variables.")
  }
  if (!config.sessionSecretConfigured) {
    errors.push("ADMIN_SESSION_SECRET is missing. Set a long random secret used to sign admin sessions.")
  }
  return errors
}

export function createAdminSession(nowMs = Date.now()) {
  const secret = getAdminSessionSecret()
  if (!secret) {
    return { ok: false, reason: "missing_secret", token: "" } as const
  }

  const issuedAt = Math.floor(nowMs / 1000)
  const payload: SessionPayload = {
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS,
    nonce: randomBytes(12).toString("hex"),
  }

  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = signPayload(encodedPayload, secret)
  return { ok: true, reason: "ok", token: `${encodedPayload}.${signature}` } as const
}

export function verifyAdminSession(token?: string | null, nowMs = Date.now()): AdminSessionState {
  if (!token) return { ok: false, reason: "missing_cookie" }

  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature) return { ok: false, reason: "invalid_format" }

  const secret = getAdminSessionSecret()
  if (!secret) return { ok: false, reason: "missing_secret" }

  const expectedSignature = signPayload(encodedPayload, secret)
  if (!safeEqual(signature, expectedSignature)) return { ok: false, reason: "invalid_signature" }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as Partial<SessionPayload>
    if (typeof payload.iat !== "number" || typeof payload.exp !== "number" || typeof payload.nonce !== "string") {
      return { ok: false, reason: "invalid_payload" }
    }

    const nowSeconds = Math.floor(nowMs / 1000)
    if (payload.exp < nowSeconds) return { ok: false, reason: "expired" }
    if (payload.iat > nowSeconds + 60) return { ok: false, reason: "issued_in_future" }
    return { ok: true, reason: "ok" }
  } catch {
    return { ok: false, reason: "invalid_payload" }
  }
}

export function isValidAdminSessionToken(token?: string | null, nowMs = Date.now()) {
  return verifyAdminSession(token, nowMs).ok
}

export function getConfiguredAdminPassword() {
  return getAdminPassword()
}

export function isAdminPasswordConfigured() {
  return Boolean(getConfiguredAdminPassword())
}

export function verifyAdminPassword(password: string) {
  const configured = getConfiguredAdminPassword()
  if (!configured) return false
  return safeEqual(configured, password.trim())
}

export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value
  return verifyAdminSession(token)
}

export function shouldClearAdminSessionCookie(reason: AdminSessionReason) {
  return reason !== "missing_cookie" && reason !== "ok"
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  })
  return response
}

export function setAdminSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  })
  return response
}

export function unauthorizedAdminResponse(state: AdminSessionState, message = "غير مصرح") {
  const response = NextResponse.json(
    {
      ok: false,
      authenticated: false,
      reason: state.reason,
      message,
    },
    { status: 401 },
  )
  if (shouldClearAdminSessionCookie(state.reason)) {
    clearAdminSessionCookie(response)
  }
  return response
}
