import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { hasConfiguredAdminPassword } from "@/lib/admin-auth"
import { requireAdmin } from "@/lib/require-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!hasConfiguredAdminPassword()) {
    redirect("/admin/login?setup=1")
  }

  if (!(await requireAdmin())) {
    redirect("/admin/login")
  }

  return <AdminShell>{children}</AdminShell>
}
