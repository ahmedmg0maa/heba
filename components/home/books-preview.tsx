import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { listCatalogBooks } from "@/lib/catalog"

export async function BooksPreview() {
  const books = (await listCatalogBooks({ onlyActive: true })).slice(0, 4)

  return (
    <section className="section-padding bg-secondary/30" dir="rtl">
      <div className="container-brand">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">الكتب</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
              كلمات هادئة تعيد ترتيب الداخل وتفتح بابًا أصدق مع الذات
            </h2>
          </div>
          <Link href="/books">
            <Button variant="outline" className="rounded-full bg-transparent">
              كل الكتب
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {books.map((book) => (
            <article key={book.id} className="hover-lift luxury-panel p-6">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="size-6" />
              </div>
              <h3 className="mt-5 text-2xl font-black text-foreground">{book.title}</h3>
              <p className="mt-3 text-sm font-semibold text-accent">{book.shortDescription}</p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{book.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <p className="latin text-lg font-black text-primary">{book.price.toLocaleString("ar-EG")} ج.م</p>
                <Link href={`/books/${book.slug || book.id}`} className="text-sm font-bold text-primary hover:text-accent">
                  التفاصيل
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
