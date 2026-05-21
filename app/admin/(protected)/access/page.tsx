import { redirect } from "next/navigation"
import { requireAdminPage } from "@/lib/admin-auth"

export default async function AdminAccessLegacyRoute() {
  await requireAdminPage({ debugLabel: "/admin/access" })

  redirect("/admin/access-logs")
}
