import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { ADMIN_SESSION_COOKIE, hasConfiguredAdminPassword, isValidAdminSessionToken } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!hasConfiguredAdminPassword()) {
    redirect("/admin/login?setup=1")
  }

  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
  if (!isValidAdminSessionToken(token)) {
    redirect("/admin/login")
  }

  return <AdminShell>{children}</AdminShell>
}
