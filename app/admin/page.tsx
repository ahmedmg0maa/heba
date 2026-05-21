import Link from "next/link"
import { BookOpen, Calendar, Eye, Layers3, MessageSquare, ShoppingCart, TrendingUp } from "lucide-react"
import { requireAdminPage } from "@/lib/admin-auth"
import { getFirebaseSetupErrorMessage, isFirebaseConfigured, listDocuments } from "@/lib/firebase/admin"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
const DASHBOARD_LIMIT = 250

function numberValue(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function isoDate(value: unknown) {
  const date = new Date(String(value || ""))
  if (Number.isNaN(date.getTime())) return null
  return date
}

function isTodayInCairo(value: unknown) {
  const date = isoDate(value)
  if (!date) return false
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date())
  const target = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(date)
  return today === target
}

function formatDateTimeAr(value: unknown) {
  const date = isoDate(value)
  if (!date) return "-"
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  }).format(date)
}

export default async function AdminDashboardPage() {
  await requireAdminPage({ debugLabel: "/admin" })

  if (!isFirebaseConfigured()) {
    return (
      <div className="space-y-6" dir="rtl">
          <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <h1 className="text-3xl font-black text-foreground">لوحة إدارة المنصة</h1>
            <p className="mt-3 text-destructive">
              {getFirebaseSetupErrorMessage() || "تعذر تحميل لوحة الإدارة بسبب إعدادات Firebase غير المكتملة."}
            </p>
          </section>
      </div>
    )
  }

  const [bookings, orders, messages, courses, books] = await Promise.all([
    listDocuments("bookings", { orderByField: "createdAt", orderDirection: "desc", limit: DASHBOARD_LIMIT }),
    listDocuments("orders", { orderByField: "createdAt", orderDirection: "desc", limit: DASHBOARD_LIMIT }),
    listDocuments("messages", { orderByField: "createdAt", orderDirection: "desc", limit: DASHBOARD_LIMIT }),
    listDocuments("courses", { orderByField: "createdAt", orderDirection: "desc", limit: DASHBOARD_LIMIT }),
    listDocuments("books", { orderByField: "createdAt", orderDirection: "desc", limit: DASHBOARD_LIMIT }),
  ])

  const paidOrders = orders.filter((item) => String(item.status || "").toLowerCase() === "paid")
  const pendingOrders = orders.filter((item) => String(item.status || "").toLowerCase() === "pending")
  const pendingBookings = bookings.filter((item) => String(item.status || "").toLowerCase() === "pending")
  const todayBookings = bookings.filter((item) => isTodayInCairo(item.createdAt))
  const revenue = paidOrders.reduce((sum, item) => sum + numberValue(item.amount), 0)
  const recentOrders = orders.slice(0, 6)
  const recentBookings = bookings.slice(0, 6)

  const stats = [
    { name: "إجمالي الحجوزات", value: bookings.length, note: "كل الحجوزات المسجلة", icon: Calendar },
    { name: "حجوزات قيد المراجعة", value: pendingBookings.length, note: "تحتاج متابعة", icon: Calendar },
    { name: "طلبات قيد المراجعة", value: pendingOrders.length, note: "بانتظار تأكيد الدفع", icon: ShoppingCart },
    { name: "طلبات مدفوعة", value: paidOrders.length, note: "تم تفعيلها", icon: ShoppingCart },
    { name: "إيراد تقديري", value: `${revenue.toLocaleString("ar-EG")} ج.م`, note: "من الطلبات المدفوعة", icon: TrendingUp },
    { name: "حجوزات اليوم", value: todayBookings.length, note: "حسب توقيت القاهرة", icon: Calendar },
    { name: "الرسائل", value: messages.length, note: "رسائل العملاء", icon: MessageSquare },
  ]

  return (
    <div className="space-y-8" dir="rtl">
      <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-xl">
        <h1 className="text-3xl font-black">لوحة إدارة المنصة</h1>
        <p className="mt-2 text-primary-foreground/80">متابعة فورية للحجوزات والطلبات والمنتجات والنشاط اليومي.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <stat.icon className="h-7 w-7 text-accent" />
            <p className="mt-6 text-sm text-muted-foreground">{stat.name}</p>
            <p className="mt-1 text-3xl font-black text-foreground latin">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-black">الحجوزات</h2>
          <p className="mt-2 text-sm text-muted-foreground">إدارة المواعيد وتحديث الحالات.</p>
          <Link href="/admin/bookings" className="mt-5 inline-flex">
            <Button className="rounded-full">فتح الحجوزات</Button>
          </Link>
        </div>
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-black">الطلبات</h2>
          <p className="mt-2 text-sm text-muted-foreground">مراجعة الطلبات وتحديث حالة الدفع.</p>
          <Link href="/admin/orders" className="mt-5 inline-flex">
            <Button className="rounded-full">فتح الطلبات</Button>
          </Link>
        </div>
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-black">الكورسات</h2>
          <p className="mt-2 text-sm text-muted-foreground">إجمالي الكورسات: {courses.length}</p>
          <Link href="/admin/courses" className="mt-5 inline-flex">
            <Button className="rounded-full">
              <Layers3 className="h-4 w-4" />
              إدارة الكورسات
            </Button>
          </Link>
        </div>
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-black">الكتب</h2>
          <p className="mt-2 text-sm text-muted-foreground">إجمالي الكتب: {books.length}</p>
          <Link href="/admin/books" className="mt-5 inline-flex">
            <Button className="rounded-full">
              <BookOpen className="h-4 w-4" />
              إدارة الكتب
            </Button>
          </Link>
        </div>
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-black">سجل الوصول</h2>
          <p className="mt-2 text-sm text-muted-foreground">مراجعة الوصول للمحتوى المدفوع.</p>
          <Link href="/admin/access-logs" className="mt-5 inline-flex">
            <Button className="rounded-full">
              <Eye className="h-4 w-4" />
              فتح السجل
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-black">أحدث الطلبات</h2>
          <div className="mt-4 space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground">لا توجد طلبات بعد.</p>
            ) : (
              recentOrders.map((order) => (
                <article key={String(order.id)} className="rounded-2xl border border-border bg-background p-4">
                  <p className="font-bold text-foreground">{String(order.productTitle || "-")}</p>
                  <p className="text-xs text-muted-foreground">{String(order.customerName || order.email || "-")}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTimeAr(order.createdAt)}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-black">أحدث الحجوزات</h2>
          <div className="mt-4 space-y-3">
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground">لا توجد حجوزات بعد.</p>
            ) : (
              recentBookings.map((booking) => (
                <article key={String(booking.id)} className="rounded-2xl border border-border bg-background p-4">
                  <p className="font-bold text-foreground">{String(booking.customerName || "-")}</p>
                  <p className="text-xs text-muted-foreground">{String(booking.phone || booking.email || "-")}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTimeAr(booking.createdAt)}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
