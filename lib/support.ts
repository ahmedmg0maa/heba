function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "")
}

export function getSupportWhatsAppNumber() {
  return normalizePhone(text(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP))
}

export function buildWhatsAppUrl(message: string) {
  const number = getSupportWhatsAppNumber()
  if (!number) return ""
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
