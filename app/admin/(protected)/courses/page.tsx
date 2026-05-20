import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin-session"
import { CoursesManager } from "@/components/admin/courses-manager"

export default async function AdminCoursesPage() {
  const admin = await requireAdmin()
  if (!admin.ok) {
    if (process.env.NODE_ENV === "development") {
      console.info("[admin-page-auth]", { page: "/admin/courses", ok: false, reason: admin.reason })
    }
    redirect("/admin/login")
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[admin-page-auth]", { page: "/admin/courses", ok: true, reason: admin.reason })
  }

  return <CoursesManager />
}
