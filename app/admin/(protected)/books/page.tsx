import { requireAdminPage } from "@/lib/admin-auth"
import { BooksManager } from "@/components/admin/books-manager"

export default async function AdminBooksPage() {
  await requireAdminPage({ debugLabel: "/admin/books" })

  return <BooksManager />
}
