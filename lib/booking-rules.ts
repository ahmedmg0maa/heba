export type SessionDuration = 60 | 90

export const BOOKING_RULES = {
  workStartHour: 7,
  workEndHour: 20,
  closedDay: 5,
  bufferMinutes: 60,
  timezone: "Africa/Cairo",
  discountCodes: ["HEBA", "WA3Y", "AWARE"],
} as const

export const SESSION_PRICES: Record<SessionDuration, { label: string; price: number; discountedPrice: number }> = {
  60: { label: "60 دقيقة", price: 1200, discountedPrice: 1000 },
  90: { label: "90 دقيقة", price: 1500, discountedPrice: 1300 },
}

const DATE_TIME_LOCAL_REGEX = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/
const DATE_KEY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/

type CairoDateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function toCairoParts(value: Date): CairoDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_RULES.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(value)
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number(byType.year || "0"),
    month: Number(byType.month || "0"),
    day: Number(byType.day || "0"),
    hour: Number(byType.hour || "0"),
    minute: Number(byType.minute || "0"),
  }
}

function cairoNow() {
  return toCairoParts(new Date())
}

function isValidDuration(duration: number): duration is SessionDuration {
  return duration === 60 || duration === 90
}

function toTotalMinutes(hour: number, minute: number) {
  return hour * 60 + minute
}

function parseDateTimeLocal(value: string) {
  const parts = DATE_TIME_LOCAL_REGEX.exec(value)
  if (!parts) return null

  const year = Number(parts[1])
  const month = Number(parts[2])
  const day = Number(parts[3])
  const hour = Number(parts[4])
  const minute = Number(parts[5])
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null

  const date = new Date(year, month - 1, day, 0, 0, 0, 0)
  if (Number.isNaN(date.getTime())) return null
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null

  return { year, month, day, hour, minute }
}

function parseCandidateSlot(value: string) {
  const direct = parseDateTimeLocal(value)
  if (direct) return direct

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return toCairoParts(parsed)
}

function compareDateTime(a: CairoDateTimeParts, b: CairoDateTimeParts) {
  const left = `${a.year}${pad(a.month)}${pad(a.day)}${pad(a.hour)}${pad(a.minute)}`
  const right = `${b.year}${pad(b.month)}${pad(b.day)}${pad(b.hour)}${pad(b.minute)}`
  if (left === right) return 0
  return left > right ? 1 : -1
}

function isPastSlot(candidate: CairoDateTimeParts) {
  return compareDateTime(candidate, cairoNow()) < 0
}

function dayOfWeek(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0)).getUTCDay()
}

function dateKeyFromParts(parts: { year: number; month: number; day: number }) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

export function normalizeDiscountCode(code?: string) {
  return String(code || "").trim().toUpperCase()
}

export function isValidDiscountCode(code?: string) {
  const normalized = normalizeDiscountCode(code)
  return Boolean(normalized && BOOKING_RULES.discountCodes.includes(normalized as never))
}

export function getSessionPrice(duration: SessionDuration, code?: string) {
  const item = SESSION_PRICES[duration]
  const discountApplied = isValidDiscountCode(code)
  return {
    duration,
    originalPrice: item.price,
    finalPrice: discountApplied ? item.discountedPrice : item.price,
    discountApplied,
  }
}

export function parseBookingDate(value: string) {
  const slot = parseCandidateSlot(value)
  if (!slot) return null
  return new Date(slot.year, slot.month - 1, slot.day, slot.hour, slot.minute, 0, 0)
}

export function isClosedDay(date: Date) {
  return date.getDay() === BOOKING_RULES.closedDay
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayDateKey() {
  const now = cairoNow()
  return dateKeyFromParts(now)
}

export function parseDateKey(value: string) {
  const match = DATE_KEY_REGEX.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day, 0, 0, 0, 0)
  if (Number.isNaN(date.getTime())) return null
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

export function isDateBeforeToday(date: Date) {
  return dateKey(date) < todayDateKey()
}

export function validateBookingSlot(value: string, duration: SessionDuration) {
  const candidate = parseCandidateSlot(value)
  if (!candidate) {
    return { ok: false as const, message: "يرجى اختيار تاريخ ووقت صحيح." }
  }

  if (!isValidDuration(duration)) {
    return { ok: false as const, message: "مدة الجلسة غير صحيحة." }
  }

  const weekday = dayOfWeek(candidate.year, candidate.month, candidate.day)
  if (weekday === BOOKING_RULES.closedDay) {
    return { ok: false as const, message: "لا تتوفر حجوزات يوم الجمعة." }
  }

  if (isPastSlot(candidate)) {
    return { ok: false as const, message: "لا يمكن اختيار موعد سابق." }
  }

  const slotStartMinutes = toTotalMinutes(candidate.hour, candidate.minute)
  if (candidate.minute !== 0) {
    return { ok: false as const, message: "هذا الموعد غير متاح. يرجى اختيار موعد آخر." }
  }

  const workStartMinutes = BOOKING_RULES.workStartHour * 60
  const workEndMinutes = BOOKING_RULES.workEndHour * 60
  const candidateEndMinutes = slotStartMinutes + duration
  if (slotStartMinutes < workStartMinutes || candidateEndMinutes > workEndMinutes) {
    return { ok: false as const, message: "هذا الموعد غير متاح. يرجى اختيار موعد آخر." }
  }

  return {
    ok: true as const,
    date: new Date(candidate.year, candidate.month - 1, candidate.day, candidate.hour, candidate.minute, 0, 0),
    dateKey: dateKeyFromParts(candidate),
    time: `${pad(candidate.hour)}:${pad(candidate.minute)}`,
    startMinutes: slotStartMinutes,
    slotValue: `${dateKeyFromParts(candidate)}T${pad(candidate.hour)}:${pad(candidate.minute)}`,
  }
}

export type TimeSlot = {
  label: string
  value: string
}

export function buildDailySlots(date: Date, duration: SessionDuration) {
  const slots: TimeSlot[] = []
  if (isClosedDay(date) || isDateBeforeToday(date)) return slots

  const currentDateKey = dateKey(date)
  for (let hour = BOOKING_RULES.workStartHour; hour < BOOKING_RULES.workEndHour; hour += 1) {
    const candidateValue = `${currentDateKey}T${pad(hour)}:00`
    const validation = validateBookingSlot(candidateValue, duration)
    if (!validation.ok) continue

    slots.push({
      label: `${pad(hour)}:00`,
      value: validation.slotValue,
    })
  }

  return slots
}

export function hasBookingConflict(
  candidateStartMinutes: number,
  duration: SessionDuration,
  existing: { startMinutes: number | null; duration: number; status?: string }[],
) {
  const buffer = BOOKING_RULES.bufferMinutes
  const candidateEndMinutes = candidateStartMinutes + duration

  return existing.some((booking) => {
    if (booking.startMinutes === null) return false
    if (["cancelled", "rejected"].includes(String(booking.status || "").toLowerCase())) return false

    const bookingStart = booking.startMinutes
    const bookingEnd = bookingStart + Number(booking.duration || 60)
    return candidateStartMinutes < bookingEnd + buffer && candidateEndMinutes + buffer > bookingStart
  })
}
