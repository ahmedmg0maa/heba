"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { CalendarDays, CheckCircle2, MessageCircle } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getFirebaseClientAuth } from "@/lib/firebase/client"
import { getSessionPrice, SESSION_PRICES, type SessionDuration } from "@/lib/booking-rules"
import { trackClientEvent } from "@/lib/analytics"

type BookingPrice = {
  finalPrice: number
  originalPrice: number
  discountApplied: boolean
}

type BookingSuccess = {
  bookingId?: string
  status?: string
  price?: BookingPrice
  message?: string
}

type Slot = {
  label: string
  value: string
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function parseDateInput(value: string) {
  const parts = value.split("-").map((item) => Number(item))
  if (parts.length !== 3 || parts.some((item) => !Number.isFinite(item))) return null
  const [year, month, day] = parts
  const parsed = new Date(year, month - 1, day, 0, 0, 0, 0)
  if (Number.isNaN(parsed.getTime())) return null
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return null
  return parsed
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function formatArabicDate(value: string) {
  const parsed = parseDateInput(value)
  if (!parsed) return ""
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed)
}

function isFriday(value: string) {
  const parsed = parseDateInput(value)
  return parsed?.getDay() === 5
}

function slotTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(value)
  if (!match) return ""
  return `${match[4]}:${match[5]}`
}

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialDuration = searchParams.get("duration") === "90" ? 90 : 60
  const [submitted, setSubmitted] = useState<BookingSuccess | null>(null)
  const [duration, setDuration] = useState<SessionDuration>(initialDuration)
  const [discountCode, setDiscountCode] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsMessage, setSlotsMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [dateError, setDateError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  const price = useMemo(() => getSessionPrice(duration, discountCode), [duration, discountCode])
  const hasDiscountCode = discountCode.trim().length > 0
  const couponStateMessage = hasDiscountCode
    ? price.discountApplied
      ? "تم تطبيق الكود بنجاح"
      : "الكود غير صالح أو منتهي"
    : ""
  const minDate = useMemo(() => dateInputValue(new Date()), [])
  const selectedDateLabel = useMemo(() => formatArabicDate(selectedDate), [selectedDate])

  useEffect(() => {
    const auth = getFirebaseClientAuth()
    if (!auth) return
    return onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null)
    })
  }, [])

  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate) {
        setSlots([])
        setSlotsMessage("")
        setSelectedSlot("")
        return
      }

      setSlotsLoading(true)
      setSlotsMessage("")
      setSelectedSlot("")

      try {
        const response = await fetch(`/api/booking?date=${encodeURIComponent(selectedDate)}&duration=${duration}`)
        const result = await response.json()
        if (!response.ok || !result.ok) throw new Error(result.message || "تعذر تحميل المواعيد.")

        const loadedSlots = Array.isArray(result.slots) ? result.slots : []
        setSlots(loadedSlots)
        if (loadedSlots.length === 0) setSlotsMessage("لا تتوفر مواعيد لهذا اليوم.")
      } catch (fetchError) {
        setSlots([])
        setSlotsMessage(fetchError instanceof Error ? fetchError.message : "تعذر تحميل المواعيد.")
      } finally {
        setSlotsLoading(false)
      }
    }

    void fetchSlots()
  }, [selectedDate, duration])

  function handleDateChange(value: string) {
    setError("")
    setDateError("")
    setSelectedSlot("")

    if (!value) {
      setSelectedDate("")
      setSlots([])
      setSlotsMessage("")
      return
    }

    const parsed = parseDateInput(value)
    if (!parsed) {
      setSelectedDate("")
      setDateError("صيغة التاريخ غير صحيحة.")
      return
    }

    if (startOfDay(parsed).getTime() < startOfDay(new Date()).getTime()) {
      setSelectedDate("")
      setSlots([])
      setSlotsMessage("")
      setDateError("لا يمكن اختيار تاريخ سابق.")
      return
    }

    if (isFriday(value)) {
      setSelectedDate("")
      setSlots([])
      setSlotsMessage("لا تتوفر حجوزات يوم الجمعة.")
      setDateError("لا تتوفر حجوزات يوم الجمعة.")
      return
    }

    setSelectedDate(value)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!selectedDate) {
      setIsSubmitting(false)
      setError("يرجى اختيار اليوم أولًا.")
      return
    }

    if (!selectedSlot) {
      setIsSubmitting(false)
      setError("يرجى اختيار موعد متاح.")
      return
    }

    const formData = new FormData(event.currentTarget)
    const payload = {
      customerName: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      date: selectedDate,
      time: slotTime(selectedSlot),
      startTime: selectedSlot,
      duration,
      discountCode,
      message: String(formData.get("message") ?? "").trim(),
      userId,
    }
    trackClientEvent("submit_booking", {
      date: selectedDate,
      startTime: selectedSlot,
      duration,
      amount: price.finalPrice,
    })

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      

      if (!response.ok || !result.ok) throw new Error(result.message || "تعذر إرسال طلب الحجز.")
      const successData = {
        bookingId: result.bookingId,
        price: result.price,
        status: result.status,
        message: result.message,
      }
      setSubmitted(successData)
      router.push(
        `/booking/success?bookingId=${encodeURIComponent(String(result.bookingId || ""))}&status=${encodeURIComponent(String(result.status || "pending"))}`,
      )
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "حدث خطأ غير متوقع.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="eyebrow">جلسة خاصة</p>
              <h1 className="mt-5 text-4xl font-black leading-tight text-foreground sm:text-5xl">احجزي جلستك الخاصة</h1>
              <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
                اختاري المدة والموعد المناسب، وسنساعدكِ على بدء جلسة واضحة وهادئة تناسب احتياجك.
              </p>

              <div className="mt-8 grid gap-3">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="font-bold text-foreground">جلسة 60 دقيقة — 1200 ج.م</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="font-bold text-foreground">جلسة 90 دقيقة — 1500 ج.م</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2.2rem] border border-border bg-card p-6 shadow-xl md:p-8">
              {submitted ? (
                <div className="py-16 text-center">
                  <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
                  <h2 className="mt-6 text-3xl font-black">تم إرسال طلب الحجز</h2>
                  <p className="mx-auto mt-4 max-w-md leading-8 text-muted-foreground">
                    {submitted.message || "تم إرسال طلب الحجز بنجاح. سنراجع الموعد ونؤكد لكِ قريبًا."}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    رقم الحجز: <span className="latin font-bold text-primary">{submitted.bookingId}</span>
                  </p>
                  <p className="mt-1 text-sm font-bold text-primary">الحالة الحالية: قيد المراجعة</p>
                  <Button className="mt-8 rounded-full" onClick={() => setSubmitted(null)}>
                    حجز موعد آخر
                  </Button>
                </div>
              ) : (
                <form className="grid gap-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <Input id="name" name="name" required className="h-12 rounded-2xl bg-secondary/55" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف / واتساب</Label>
                      <Input id="phone" name="phone" required className="h-12 rounded-2xl bg-secondary/55" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input id="email" name="email" type="email" required className="h-12 rounded-2xl bg-secondary/55" />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>مدة الجلسة</Label>
                      <Select value={String(duration)} onValueChange={(value) => setDuration(Number(value) as SessionDuration)}>
                        <SelectTrigger className="h-12 rounded-2xl bg-secondary/55">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SESSION_PRICES).map(([key, item]) => (
                            <SelectItem key={key} value={key}>
                              {item.label} — {item.price} ج.م
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>اختاري اليوم المناسب</Label>
                      <div className="rounded-2xl border border-border bg-secondary/35 p-3">
                        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          كارت اختيار التاريخ
                        </div>
                        <Input
                          id="date"
                          type="date"
                          required
                          min={minDate}
                          lang="ar-EG"
                          value={selectedDate}
                          onChange={(event) => handleDateChange(event.target.value)}
                          className="h-12 rounded-xl bg-background [color-scheme:light]"
                        />
                        {selectedDateLabel ? <p className="mt-2 text-sm text-muted-foreground">{selectedDateLabel}</p> : null}
                      </div>
                      {dateError ? <p className="text-sm font-bold text-destructive">{dateError}</p> : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slot">الوقت المتاح</Label>
                    <Select value={selectedSlot} onValueChange={setSelectedSlot} disabled={slotsLoading || slots.length === 0}>
                      <SelectTrigger id="slot" className="h-12 rounded-2xl bg-secondary/55">
                        <SelectValue placeholder={slotsLoading ? "جاري تحميل المواعيد..." : "اختاري موعدًا متاحًا"} />
                      </SelectTrigger>
                      <SelectContent>
                        {slots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {slotsMessage && <p className="text-sm text-muted-foreground">{slotsMessage}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountCode">الكود الخاص</Label>
                    <Input
                      id="discountCode"
                      value={discountCode}
                      onChange={(event) => setDiscountCode(event.target.value)}
                      placeholder="لديكِ كود خاص؟"
                      className="h-12 rounded-2xl bg-secondary/55 uppercase"
                    />
                    {couponStateMessage ? (
                      <p className={`text-sm font-bold ${price.discountApplied ? "text-accent" : "text-destructive"}`}>
                        {couponStateMessage}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
                    <p className="text-sm font-bold text-foreground">ملخص الحجز</p>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>السعر الأساسي</span>
                      <span className="font-bold text-foreground">{price.originalPrice.toLocaleString("en-US")} ج.م</span>
                    </div>
                    {price.discountApplied ? (
                      <div className="mt-2 flex items-center justify-between text-sm text-accent">
                        <span>السعر بعد الكود</span>
                        <span className="font-bold">{price.finalPrice.toLocaleString("en-US")} ج.م</span>
                      </div>
                    ) : null}
                    <p className="mt-3 text-3xl font-black text-primary latin">{price.finalPrice.toLocaleString("en-US")} EGP</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">ملاحظاتك قبل الجلسة</Label>
                    <Textarea id="message" name="message" className="min-h-28 rounded-2xl bg-secondary/55" />
                  </div>

                  <div className="rounded-2xl bg-secondary/50 p-4 text-sm leading-7 text-muted-foreground">
                    <CalendarDays className="mb-2 h-5 w-5 text-accent" />
                    تظهر المواعيد المتاحة فقط حسب اليوم المختار وساعات العمل.
                  </div>

                  {error ? (
                    <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">
                      {error}
                    </p>
                  ) : null}

                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    className="h-12 rounded-full bg-[var(--burgundy)] text-base text-primary-foreground hover:bg-[var(--burgundy)]/90"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {isSubmitting ? "جاري إرسال الطلب..." : "إرسال طلب الحجز"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
