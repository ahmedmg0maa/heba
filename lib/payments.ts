import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"

export type PaymentProvider = "manual" | "paymob"

export type PaymentResolution = {
  provider: PaymentProvider
  configured: boolean
  mode: "manual_review"
  customerMessage: string
}

const PENDING_PAYMENT_MESSAGE = "طلبك قيد المراجعة وسيتم تفعيل الوصول بعد تأكيد الدفع."

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function getPendingPaymentMessage() {
  return PENDING_PAYMENT_MESSAGE
}

export function getPaymobConfig() {
  return {
    apiKey: text(process.env.PAYMOB_API_KEY),
    integrationId: text(process.env.PAYMOB_INTEGRATION_ID),
    iframeId: text(process.env.PAYMOB_IFRAME_ID),
    hmacSecret: text(process.env.PAYMOB_HMAC_SECRET),
  }
}

export function isPaymobConfigured() {
  const config = getPaymobConfig()
  return Boolean(config.apiKey && config.integrationId && config.iframeId)
}

export function resolvePaymentProvider(rawMethod: unknown): PaymentResolution {
  const method = text(rawMethod).toLowerCase()
  if (method === "paymob") {
    return {
      provider: "paymob",
      configured: isPaymobConfigured(),
      mode: "manual_review",
      customerMessage: PENDING_PAYMENT_MESSAGE,
    }
  }

  return {
    provider: "manual",
    configured: true,
    mode: "manual_review",
    customerMessage: PENDING_PAYMENT_MESSAGE,
  }
}

function safeEqualHex(aHex: string, bHex: string) {
  const a = Buffer.from(aHex, "hex")
  const b = Buffer.from(bHex, "hex")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function verifyPaymobWebhookSignature(payloadText: string, signatureHex: string) {
  const secret = getPaymobConfig().hmacSecret
  if (!secret) return { ok: false as const, reason: "missing_hmac_secret" }

  const signature = signatureHex.trim().toLowerCase()
  if (!/^[a-f0-9]+$/.test(signature)) return { ok: false as const, reason: "invalid_signature_format" }

  const expected = createHmac("sha512", secret).update(payloadText).digest("hex").toLowerCase()
  if (!safeEqualHex(signature, expected)) return { ok: false as const, reason: "signature_mismatch" }
  return { ok: true as const, reason: "ok" }
}
