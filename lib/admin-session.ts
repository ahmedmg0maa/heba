import "server-only"
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const ADMIN_COOKIE_NAME = "heba_admin_session"

const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

type SessionPayload = {
  iat: number
  exp: number
  nonce: string
}

type AdminSessionState = {
  ok: boolean
  reason: string
}

function getAdminSessionSecret() {
  return (process.env.ADMIN_SESSION_SECRET || "").trim()
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

export async function createAdminSession(nowMs = Date.now()) {
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

export async function verifyAdminSession(token?: string | null, nowMs = Date.now()): Promise<AdminSessionState> {
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

export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value
  return verifyAdminSession(token)
}
