import Link from "next/link"
import { BookOpen, Calendar, Layers3, MessageSquare, ShoppingCart, TrendingUp } from "lucide-react"
import { listDocuments } from "@/lib/firebase/admin"
import { Button } from "@/components/ui/button"

function numberValue(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default async function AdminDashboardPage() {
  const [bookings, orders, messages, courses, books] = await Promise.all([
    listDocuments("bookings", { orderByField: "createdAt", orderDirection: "desc", limit: 1000 }),
    listDocuments("orders", { orderByField: "createdAt", orderDirection: "desc", limit: 1000 }),
    listDocuments("messages", { orderByField: "createdAt", orderDirection: "desc", limit: 1000 }),
    listDocuments("courses", { orderByField: "createdAt", orderDirection: "desc", limit: 1000 }),
    listDocuments("books", { orderByField: "createdAt", orderDirection: "desc", limit: 1000 }),
  ])

  const paidOrders = orders.filter((item) => String(item.status || "").toLowerCase() === "paid")
  const pendingOrders = orders.filter((item) => String(item.status || "").toLowerCase() === "pending")
  const revenue = paidOrders.reduce((sum, item) => sum + numberValue(item.amount), 0)

  const stats = [
    { name: "الحجوزات", value: bookings.length, note: "إجمالي الحجوزات", icon: Calendar },
    { name: "الطلبات", value: orders.length, note: `${pendingOrders.length} قيد المراجعة`, icon: ShoppingCart },
    { name: "الرسائل", value: messages.length, note: "رسائل العملاء", icon: MessageSquare },
    { name: "الإيرادات المدفوعة", value: `${revenue.toLocaleString("en-US")} EGP`, note: "طلبات paid فقط", icon: TrendingUp },
  ]

  return (
    <div className="space-y-8" dir="rtl">
      <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-xl">
        <h1 className="text-3xl font-black">لوحة إدارة المنصة</h1>
        <p className="mt-2 text-primary-foreground/75">إحصاءات حيّة للحجوزات والطلبات والرسائل والمنتجات.</p>
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
          <p className="mt-2 text-sm text-muted-foreground">إدارة المواعيد وحالات الحجز.</p>
          <Link href="/admin/bookings" className="mt-5 inline-flex">
            <Button className="rounded-full">فتح الحجوزات</Button>
          </Link>
        </div>
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-black">الطلبات</h2>
          <p className="mt-2 text-sm text-muted-foreground">مراجعة الطلبات وتحديث الدفع.</p>
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
          <h2 className="text-2xl font-black">الرسائل</h2>
          <p className="mt-2 text-sm text-muted-foreground">متابعة رسائل الزوار الواردة.</p>
          <Link href="/admin/messages" className="mt-5 inline-flex">
            <Button className="rounded-full">فتح الرسائل</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
