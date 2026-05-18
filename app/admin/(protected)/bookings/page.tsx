import { BookingStatusSelect } from "@/components/admin/booking-status-select"
import { isFirebaseConfigured, listDocuments } from "@/lib/firebase/admin"

function parseDate(value: unknown) {
  const date = new Date(String(value || ""))
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateTime(value: unknown) {
  const date = parseDate(value)
  if (!date) return "-"
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function formatBookingDateTime(date: unknown, time: unknown) {
  const dateValue = String(date || "").trim()
  const timeValue = String(time || "").trim()
  if (!dateValue || !timeValue) return "-"
  return formatDateTime(`${dateValue}T${timeValue}:00`)
}

function mapStatus(status: string) {
  if (status === "approved") return "تم القبول"
  if (status === "completed") return "تمت الجلسة"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

type PageProps = {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const { from = "", to = "", status = "all" } = await searchParams

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

  const fromDate = from ? new Date(`${from}T00:00:00`) : null
  const toDate = to ? new Date(`${to}T23:59:59.999`) : null

  const filtered = bookings.filter((booking) => {
    const bookingStatus = String(booking.status || "pending").toLowerCase()
    if (status !== "all" && bookingStatus !== status) return false
    const bookingDate = parseDate(`${String(booking.date || "")}T${String(booking.time || "00:00")}:00`)
    if (!bookingDate) return true
    if (fromDate && bookingDate < fromDate) return false
    if (toDate && bookingDate > toDate) return false
    return true
  })

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">الحجوزات</h1>
        <p className="mt-2 text-muted-foreground">إدارة الطلبات الواردة وتحديث حالة كل حجز.</p>
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-border bg-card shadow-sm">
        <table className="w-full min-w-[980px] text-right">
          <thead className="bg-muted/70 text-sm">
            <tr>
              <th className="px-4 py-3">العميل</th>
              <th className="px-4 py-3">الموعد</th>
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
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  لا توجد حجوزات بعد.
                </td>
              </tr>
            ) : (
              filtered.map((booking) => {
                const statusValue = String(booking.status || "pending").toLowerCase()
                const customerName = String(booking.customerName || "-")
                const amount = Number(booking.amount || 0)
                return (
                  <tr key={String(booking.id)} className="border-t border-border text-sm">
                    <td className="px-4 py-3">
                      <p className="font-bold text-foreground">{customerName}</p>
                      <p className="text-xs text-muted-foreground">{String(booking.phone || "-")}</p>
                      <p className="text-xs text-muted-foreground">{String(booking.email || "-")}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatBookingDateTime(booking.date, booking.time)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{String(booking.duration || "-")} دقيقة</td>
                    <td className="px-4 py-3 text-muted-foreground latin">{amount.toLocaleString("en-US")} EGP</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{mapStatus(statusValue)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusSelect bookingId={String(booking.id)} initialStatus={statusValue} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(booking.createdAt)}</td>
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
