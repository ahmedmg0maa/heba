import { AlertTriangle, Eye } from "lucide-react"
import { isFirebaseConfigured, listDocuments } from "@/lib/firebase/admin"

function parseDate(value: unknown) {
  const date = new Date(String(value || ""))
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateTime(value: unknown) {
  const date = parseDate(value)
  if (!date) return "-"
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
    timeZone: "Africa/Cairo",
    numberingSystem: "arab",
  }).format(date)
}

export default async function AdminAccessLogsPage() {
  if (!isFirebaseConfigured()) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-black text-foreground">سجل الوصول للمحتوى المحمي</h1>
          <p className="mt-2 text-destructive">تعذر تحميل السجل: إعدادات Firebase Admin غير مكتملة.</p>
        </div>
      </div>
    )
  }

  const logs = await listDocuments("protected_access_logs", {
    orderByField: "timestamp",
    orderDirection: "desc",
    limit: 500,
  })

  const suspiciousCount = logs.filter((item) => Boolean(item.suspicious)).length

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">سجل الوصول للمحتوى المحمي</h1>
        <p className="mt-2 text-muted-foreground">مراجعة محاولات الوصول، الأجهزة النشطة، والإشارات المشبوهة.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
            <Eye className="h-4 w-4" />
            إجمالي السجلات: {logs.length}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            مشبوه: {suspiciousCount}
          </span>
        </div>
      </div>

      <div className="grid gap-3 lg:hidden">
        {logs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">لا توجد سجلات بعد.</div>
        ) : (
          logs.map((item) => (
            <article key={String(item.id)} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{formatDateTime(item.timestamp || item.createdAt)}</p>
              <p className="mt-2 break-all text-sm font-bold text-foreground">{String(item.email || "-")}</p>
              <p className="break-all text-xs text-muted-foreground">{String(item.userId || "-")}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {String(item.productType || "-")} · {String(item.productId || "-")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">الإجراء: {String(item.action || "-")}</p>
              <p className="text-xs text-muted-foreground">IP: {String(item.ip || "-")}</p>
              <p className="mt-1 break-all text-xs text-muted-foreground">المتصفح: {String(item.userAgent || "-")}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className={`rounded-full px-3 py-1 font-bold ${item.allowed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {item.allowed ? "مسموح" : "مرفوض"}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 font-bold text-muted-foreground">
                  {item.suspicious ? "مشبوه" : "سليم"}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">السبب: {String(item.reason || "-")}</p>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-[2rem] border border-border bg-card shadow-sm lg:block">
        <table className="w-full min-w-[1280px] text-right">
          <thead className="bg-muted/70 text-sm">
            <tr>
              <th className="px-4 py-3">الوقت</th>
              <th className="px-4 py-3">المستخدم</th>
              <th className="px-4 py-3">المنتج</th>
              <th className="px-4 py-3">الإجراء</th>
              <th className="px-4 py-3">IP</th>
              <th className="px-4 py-3">المتصفح</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">السبب</th>
              <th className="px-4 py-3">مشبوه</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  لا توجد سجلات بعد.
                </td>
              </tr>
            ) : (
              logs.map((item) => (
                <tr key={String(item.id)} className="border-t border-border text-sm">
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(item.timestamp || item.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p className="font-bold text-foreground">{String(item.email || "-")}</p>
                    <p className="max-w-[220px] break-all text-xs">{String(item.userId || "-")}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{String(item.productType || "-")}</p>
                    <p className="max-w-[220px] break-all text-xs">{String(item.productId || "-")}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{String(item.action || "-")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{String(item.ip || "-")}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="max-w-[280px] truncate">{String(item.userAgent || "-")}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${item.allowed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {item.allowed ? "مسموح" : "مرفوض"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{String(item.reason || "-")}</td>
                  <td className="px-4 py-3">
                    {item.suspicious ? (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">نعم</span>
                    ) : (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">لا</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
