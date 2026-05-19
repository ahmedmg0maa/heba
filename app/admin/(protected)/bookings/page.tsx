import Link from "next/link"
import { BookingStatusSelect } from "@/components/admin/booking-status-select"
import { isFirebaseConfigured, listDocuments } from "@/lib/firebase/admin"

type PageProps = {
  searchParams: Promise<{ from?: string; to?: string; status?: string; q?: string }>
}

function parseDate(value: unknown) {
  const date = new Date(String(value || ""))
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value: unknown) {
  const date = parseDate(value)
  if (!date) return "-"
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "full",
    timeZone: "Africa/Cairo",
    numberingSystem: "arab",
  }).format(date)
}

function formatTime(value: unknown) {
  const date = parseDate(value)
  if (!date) return "-"
  return new Intl.DateTimeFormat("ar-EG", {
    timeStyle: "short",
    hour12: true,
    timeZone: "Africa/Cairo",
    numberingSystem: "arab",
  }).format(date)
}

function bookingDateTime(date: unknown, time: unknown) {
  const dateValue = String(date || "").trim()
  const timeValue = String(time || "").trim()
  if (!dateValue || !timeValue) return null
  return parseDate(`${dateValue}T${timeValue}:00`)
}

function formatBookingDate(value: ReturnType<typeof bookingDateTime>) {
  if (!value) return "-"
  return formatDate(value.toISOString())
}

function formatBookingTime(value: ReturnType<typeof bookingDateTime>) {
  if (!value) return "-"
  return formatTime(value.toISOString())
}

function mapStatus(status: string) {
  if (status === "approved") return "تم القبول"
  if (status === "completed") return "تمت الجلسة"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const { from = "", to = "", status = "all", q = "" } = await searchParams
  const search = q.trim().toLowerCase()

  if (!isFirebaseConfigured()) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-black text-foreground">الحجوزات</h1>
          <p className="mt-2 text-destructive">تعذر تحميل الحجوزات: إعدادات Firebase Admin غير مكتملة.</p>
        </div>
      </div>
    )
  }

  const bookings = await listDocuments("bookings", {
    orderByField: "createdAt",
    orderDirection: "desc",
    limit: 1000,
  })

  const fromDate = from ? parseDate(`${from}T00:00:00`) : null
  const toDate = to ? parseDate(`${to}T23:59:59.999`) : null

  const filtered = bookings.filter((booking) => {
    const bookingStatus = String(booking.status || "pending").toLowerCase()
    if (status !== "all" && bookingStatus !== status) return false

    const slot = bookingDateTime(booking.date, booking.time)
    if (slot && fromDate && slot < fromDate) return false
    if (slot && toDate && slot > toDate) return false

    if (!search) return true
    const name = String(booking.customerName || "").toLowerCase()
    const email = String(booking.email || "").toLowerCase()
    const phone = String(booking.phone || "").toLowerCase()
    return name.includes(search) || email.includes(search) || phone.includes(search)
  })

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">الحجوزات</h1>
        <p className="mt-2 text-muted-foreground">إدارة طلبات الحجز وتحديث الحالة مع بحث سريع وفلاتر التاريخ.</p>
        <p className="mt-3 text-sm font-bold text-primary">إجمالي النتائج: {filtered.length}</p>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-4 shadow-sm sm:p-6">
        <form className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="font-bold text-foreground">بحث</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="اسم، بريد، هاتف"
              className="h-11 w-full rounded-xl border border-border bg-background px-3"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-bold text-foreground">الحالة</span>
            <select name="status" defaultValue={status} className="h-11 w-full rounded-xl border border-border bg-background px-3">
              <option value="all">الكل</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">تم القبول</option>
              <option value="completed">تمت الجلسة</option>
              <option value="cancelled">ملغي</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-bold text-foreground">من تاريخ</span>
            <input name="from" type="date" defaultValue={from} className="h-11 w-full rounded-xl border border-border bg-background px-3" />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-bold text-foreground">إلى تاريخ</span>
            <input name="to" type="date" defaultValue={to} className="h-11 w-full rounded-xl border border-border bg-background px-3" />
          </label>

          <div className="flex items-end gap-2 md:col-span-4">
            <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              تطبيق الفلاتر
            </button>
            <Link href="/admin/bookings" className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground">
              مسح الفلاتر
            </Link>
          </div>
        </form>
      </section>

      <div className="grid gap-3 lg:hidden">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">لا توجد حجوزات مطابقة للفلتر.</div>
        ) : (
          filtered.map((booking) => {
            const statusValue = String(booking.status || "pending").toLowerCase()
            const amount = Number(booking.amount || 0)
            const slot = bookingDateTime(booking.date, booking.time)

            return (
              <article key={String(booking.id)} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-base font-black text-foreground">{String(booking.customerName || "-")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{String(booking.phone || "-")}</p>
                <p className="text-xs text-muted-foreground">{String(booking.email || "-")}</p>
                <p className="mt-3 text-sm text-muted-foreground">اليوم: {formatBookingDate(slot)}</p>
                <p className="text-sm text-muted-foreground">الوقت: {formatBookingTime(slot)}</p>
                <p className="text-sm text-muted-foreground">المدة: {String(booking.duration || "-")} دقيقة</p>
                <p className="text-sm text-muted-foreground">المبلغ: {amount.toLocaleString("ar-EG")} EGP</p>
                <p className="text-sm text-muted-foreground">الحالة: {mapStatus(statusValue)}</p>
                <div className="mt-3">
                  <BookingStatusSelect bookingId={String(booking.id)} initialStatus={statusValue} />
                </div>
              </article>
            )
          })
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-[2rem] border border-border bg-card shadow-sm lg:block">
        <table className="w-full min-w-[1080px] text-right">
          <thead className="bg-muted/70 text-sm">
            <tr>
              <th className="px-4 py-3">العميل</th>
              <th className="px-4 py-3">اليوم</th>
              <th className="px-4 py-3">الوقت</th>
              <th className="px-4 py-3">المدة</th>
              <th className="px-4 py-3">المبلغ</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">الإجراء</th>
              <th className="px-4 py-3">الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  لا توجد حجوزات مطابقة للفلتر.
                </td>
              </tr>
            ) : (
              filtered.map((booking) => {
                const statusValue = String(booking.status || "pending").toLowerCase()
                const amount = Number(booking.amount || 0)
                const slot = bookingDateTime(booking.date, booking.time)

                return (
                  <tr key={String(booking.id)} className="border-t border-border text-sm">
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{String(booking.customerName || "-")}</p>
                      <p className="text-xs text-muted-foreground">{String(booking.phone || "-")}</p>
                      <p className="text-xs text-muted-foreground">{String(booking.email || "-")}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatBookingDate(slot)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatBookingTime(slot)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{String(booking.duration || "-")} دقيقة</td>
                    <td className="px-4 py-3 text-muted-foreground">{amount.toLocaleString("ar-EG")} EGP</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{mapStatus(statusValue)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusSelect bookingId={String(booking.id)} initialStatus={statusValue} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(booking.createdAt)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
