import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin-session"

export default async function AdminAccessLegacyRoute() {
  const admin = await requireAdmin()
  if (!admin.ok) {
    if (process.env.NODE_ENV === "development") {
      console.info("[admin-page-auth]", { page: "/admin/access", ok: false, reason: admin.reason })
    }
    redirect("/admin/login")
  }

  redirect("/admin/access-logs")
}
