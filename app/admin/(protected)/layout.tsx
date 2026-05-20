import { AdminShell } from "@/components/admin/admin-shell"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
