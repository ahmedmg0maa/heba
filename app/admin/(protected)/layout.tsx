import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdmin } from "@/lib/admin-session"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(process.env.ADMIN_PASSWORD || "").trim()) {
    redirect("/admin/login?setup=1")
  }

  const admin = await requireAdmin()
  if (!admin.ok) {
    redirect("/admin/login")
  }

  return <AdminShell>{children}</AdminShell>
}
