import { requireAdminPage } from "@/lib/admin-auth"
import { CoursesManager } from "@/components/admin/courses-manager"

export default async function AdminCoursesPage() {
  await requireAdminPage({ debugLabel: "/admin/courses" })

  return <CoursesManager />
}
