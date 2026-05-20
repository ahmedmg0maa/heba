import Link from "next/link"
import { OrderStatusSelect } from "@/components/admin/order-status-select"
import { isFirebaseConfigured, listDocuments } from "@/lib/firebase/admin"

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string }>
}

function parseDate(value: unknown) {
  const date = new Date(String(value || ""))
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateTime(value: unknown) {
  const date = parseDate(value)
  if (!date) return "-"
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function mapStatus(status: string) {
  if (status === "paid") return "مدفوع"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status = "all", q = "" } = await searchParams
  const search = q.trim().toLowerCase()

  if (!isFirebaseConfigured()) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-black text-foreground">الطلبات</h1>
          <p className="mt-2 text-destructive">تعذر تحميل الطلبات: إعدادات Firebase Admin غير مكتملة.</p>
        </div>
      </div>
    )
  }

  const orders = await listDocuments("orders", {
    orderByField: "createdAt",
    orderDirection: "desc",
    limit: 1000,
  })

  const filtered = orders.filter((order) => {
    const orderStatus = String(order.status || "pending").toLowerCase()
    if (status !== "all" && orderStatus !== status) return false

    if (!search) return true
    const customer = String(order.customerName || "").toLowerCase()
    const email = String(order.email || "").toLowerCase()
    const product = String(order.productTitle || "").toLowerCase()
    return customer.includes(search) || email.includes(search) || product.includes(search)
  })

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">الطلبات</h1>
        <p className="mt-2 text-muted-foreground">تحديث حالة الطلبات وربط التفعيل في حساب المستخدم.</p>
        <p className="mt-3 text-sm font-bold text-primary">إجمالي النتائج: {filtered.length}</p>
        <div className="mt-4">
          <a
            href="/api/admin/export/orders"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground hover:border-primary hover:text-primary"
          >
            تصدير الطلبات CSV
          </a>
        </div>
      </div>

      <section className="rounded-[2rem] border border-border bg-card p-4 shadow-sm sm:p-6">
        <form className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="font-bold text-foreground">بحث</span>
            <input
              name="q"
              defaultValue={q}
              placeholder="اسم العميل، البريد الإلكتروني، أو عنوان المنتج"
              className="h-11 w-full rounded-xl border border-border bg-background px-3"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-bold text-foreground">الحالة</span>
            <select name="status" defaultValue={status} className="h-11 w-full rounded-xl border border-border bg-background px-3">
              <option value="all">الكل</option>
              <option value="pending">قيد المراجعة</option>
              <option value="paid">مدفوع</option>
              <option value="cancelled">ملغي</option>
            </select>
          </label>

          <div className="flex items-end gap-2 md:col-span-3">
            <button type="submit" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              تطبيق الفلاتر
            </button>
            <Link href="/admin/orders" className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground">
              مسح الفلاتر
            </Link>
          </div>
        </form>
      </section>

      <div className="overflow-x-auto rounded-[2rem] border border-border bg-card shadow-sm">
        <table className="w-full min-w-[1050px] text-right">
          <thead className="bg-muted/70 text-sm">
            <tr>
              <th className="px-4 py-3">رقم الطلب</th>
              <th className="px-4 py-3">المنتج</th>
              <th className="px-4 py-3">العميل</th>
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
                  لا توجد طلبات مطابقة للفلتر.
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const statusValue = String(order.status || "pending").toLowerCase()
                const customerName = String(order.customerName || "-")
                const amount = Number(order.amount || 0)
                return (
                  <tr key={String(order.id)} className="border-t border-border text-sm">
                    <td className="px-4 py-3 font-bold text-foreground">{String(order.orderNumber || order.id || "-")}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{String(order.productTitle || "-")}</p>
                      <p className="text-xs">{String(order.productType || "-")}</p>
                      <p className="text-xs">ID: {String(order.productId || order.itemId || "-")}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{customerName}</p>
                      <p className="text-xs">{String(order.email || "-")}</p>
                      <p className="text-xs">{String(order.phone || "-")}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground latin">{amount.toLocaleString("en-US")} EGP</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{mapStatus(statusValue)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusSelect orderId={String(order.id)} initialStatus={statusValue} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(order.createdAt)}</td>
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
