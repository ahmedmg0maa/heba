import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin-session"
import { BooksManager } from "@/components/admin/books-manager"

export default async function AdminBooksPage() {
  const admin = await requireAdmin()
  if (!admin.ok) {
    if (process.env.NODE_ENV === "development") {
      console.info("[admin-page-auth]", { page: "/admin/books", ok: false, reason: admin.reason })
    }
    redirect("/admin/login")
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[admin-page-auth]", { page: "/admin/books", ok: true, reason: admin.reason })
  }

  return <BooksManager />
}
