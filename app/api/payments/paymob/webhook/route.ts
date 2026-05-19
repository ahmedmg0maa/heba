import { NextRequest, NextResponse } from "next/server"
import { isPaymobConfigured, verifyPaymobWebhookSignature } from "@/lib/payments"

export const runtime = "nodejs"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: NextRequest) {
  const payloadText = await request.text()
  const signature =
    text(request.headers.get("x-paymob-signature")) ||
    text(request.nextUrl.searchParams.get("hmac"))

  if (!isPaymobConfigured()) {
    return NextResponse.json({
      ok: false,
      accepted: false,
      reason: "paymob_not_configured",
      message: "Webhook received, but Paymob environment is not fully configured.",
    })
  }

  if (!signature) {
    return NextResponse.json({
      ok: false,
      accepted: false,
      reason: "missing_signature",
      message: "Webhook signature is required. No payment status was changed.",
    })
  }

  const verified = verifyPaymobWebhookSignature(payloadText, signature)
  if (!verified.ok) {
    return NextResponse.json({
      ok: false,
      accepted: false,
      reason: verified.reason,
      message: "Invalid webhook signature. No payment status was changed.",
    })
  }

  return NextResponse.json({
    ok: true,
    accepted: true,
    reason: "signature_verified_manual_review_required",
    message: "Signature verified. Automatic order status updates are disabled until full mapping is configured.",
  })
}
