import "server-only"
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

export const ADMIN_SESSION_COOKIE = "admin-auth"
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12

type SessionPayload = {
  iat: number
  exp: number
  nonce: string
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return timingSafeEqual(aBuffer, bBuffer)
}

function encodeBase64Url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url")
}

function decodeBase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8")
}

export function getConfiguredAdminPassword() {
  return (process.env.ADMIN_PASSWORD || "").trim()
}

export function getAdminSessionSecret() {
  return (process.env.ADMIN_SESSION_SECRET || "").trim()
}

export function hasConfiguredAdminPassword() {
  return Boolean(getConfiguredAdminPassword())
}

export function isValidAdminPassword(password: string) {
  const configured = getConfiguredAdminPassword()
  if (!configured) return false
  return safeEqual(configured, password.trim())
}

function signPayload(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url")
}

export function createAdminSessionToken(nowMs = Date.now()) {
  const secret = getAdminSessionSecret()
  if (!secret) return ""

  const issuedAt = Math.floor(nowMs / 1000)
  const payload: SessionPayload = {
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS,
    nonce: randomBytes(12).toString("hex"),
  }

  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

function parseSessionPayload(token: string) {
  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature) return null

  const secret = getAdminSessionSecret()
  if (!secret) return null
  const expectedSignature = signPayload(encodedPayload, secret)
  if (!safeEqual(signature, expectedSignature)) return null

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as Partial<SessionPayload>
    if (typeof payload.iat !== "number" || typeof payload.exp !== "number" || typeof payload.nonce !== "string") {
      return null
    }
    return payload as SessionPayload
  } catch {
    return null
  }
}

export function isValidAdminSessionToken(token?: string | null, nowMs = Date.now()) {
  if (!token || !hasConfiguredAdminPassword()) return false

  const payload = parseSessionPayload(token)
  if (!payload) return false

  const nowSeconds = Math.floor(nowMs / 1000)
  if (payload.exp < nowSeconds) return false
  if (payload.iat > nowSeconds + 60) return false
  return true
}
