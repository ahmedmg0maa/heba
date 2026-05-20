import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin-session"
import { listDocuments } from "@/lib/firebase/admin"

function parseDate(value: unknown) {
  const date = new Date(String(value || ""))
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateTime(value: unknown) {
  const date = parseDate(value)
  if (!date) return "-"
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

export default async function AdminMessagesPage() {
  const admin = await requireAdmin()
  if (!admin.ok) {
    if (process.env.NODE_ENV === "development") {
      console.info("[admin-page-auth]", { page: "/admin/messages", ok: false, reason: admin.reason })
    }
    redirect("/admin/login")
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[admin-page-auth]", { page: "/admin/messages", ok: true, reason: admin.reason })
  }

  const messages = await listDocuments("messages", {
    orderByField: "createdAt",
    orderDirection: "desc",
    limit: 1000,
  })

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">الرسائل</h1>
        <p className="mt-2 text-muted-foreground">متابعة رسائل العملاء الواردة من صفحة التواصل.</p>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="rounded-[2rem] border border-border bg-card p-8 text-center text-muted-foreground">لا توجد رسائل بعد.</div>
        ) : (
          messages.map((item) => (
            <article key={String(item.id)} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-foreground">{String(item.subject || "رسالة جديدة")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    من: {String(item.name || "-")} · {String(item.email || "-")}
                  </p>
                  {item.phone ? <p className="text-sm text-muted-foreground">هاتف: {String(item.phone)}</p> : null}
                </div>
                <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
              </div>
              <p className="mt-4 whitespace-pre-line leading-8 text-muted-foreground">{String(item.message || "-")}</p>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
