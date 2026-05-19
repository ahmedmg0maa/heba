import { OrderStatusSelect } from "@/components/admin/order-status-select"
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

function mapStatus(status: string) {
  if (status === "paid") return "مدفوع"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

export default async function AdminOrdersPage() {
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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">الطلبات</h1>
        <p className="mt-2 text-muted-foreground">تحديث حالة الطلبات وربط التفعيل في حساب المستخدم.</p>
        <div className="mt-4">
          <a
            href="/api/admin/export/orders"
            className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-bold text-foreground hover:border-primary hover:text-primary"
          >
            تصدير الطلبات CSV
          </a>
        </div>
      </div>

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
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  لا توجد طلبات بعد.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusValue = String(order.status || "pending").toLowerCase()
                const customerName = String(order.customerName || "-")
                const amount = Number(order.amount || 0)
                return (
                  <tr key={String(order.id)} className="border-t border-border text-sm">
                    <td className="px-4 py-3 font-bold text-foreground">{String(order.orderNumber || order.id || "-")}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{String(order.productTitle || "-")}</p>
                      <p className="text-xs">{String(order.productType || "-")}</p>
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
