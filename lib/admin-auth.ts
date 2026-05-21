import "server-only"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin-session"

type RequireAdminPageOptions = {
  redirectTo?: string
  debugLabel?: string
}

export async function requireAdminPage(options: RequireAdminPageOptions = {}) {
  const { redirectTo = "/admin/login", debugLabel } = options
  const admin = await requireAdmin()
  if (!admin.ok) {
    if (process.env.NODE_ENV === "development" && debugLabel) {
      console.info("[admin-page-auth]", { page: debugLabel, ok: false, reason: admin.reason })
    }
    redirect(redirectTo)
  }

  if (process.env.NODE_ENV === "development" && debugLabel) {
    console.info("[admin-page-auth]", { page: debugLabel, ok: true, reason: admin.reason })
  }

  return admin
}
