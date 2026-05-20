import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdmin } from "@/lib/admin-session"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function debugProtectedAuthLog(payload: { stage: "before_redirect" | "authorized"; reason: string }) {
  if (process.env.NODE_ENV !== "development") return
  console.info("[admin-protected-layout]", payload)
}

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(process.env.ADMIN_PASSWORD || "").trim()) {
    debugProtectedAuthLog({ stage: "before_redirect", reason: "missing_admin_password_config" })
    redirect("/admin/login?setup=1")
  }

  const admin = await requireAdmin()
  if (!admin.ok) {
    debugProtectedAuthLog({ stage: "before_redirect", reason: admin.reason })
    redirect("/admin/login")
  }

  debugProtectedAuthLog({ stage: "authorized", reason: admin.reason })
  return <AdminShell>{children}</AdminShell>
}
