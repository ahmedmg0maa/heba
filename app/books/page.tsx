import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, ShoppingBag } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { listCatalogBooks } from "@/lib/catalog"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "الكتب",
  description: "كتب هبة الشريف المتاحة حاليًا.",
  alternates: {
    canonical: "/books",
  },
  openGraph: {
    title: "كتب هبة الشريف",
    description: "كتب عملية عربية تساعدك على الوضوح والاتزان.",
    url: "/books",
    images: ["/images/heba-banner.jpeg"],
  },
}

export default async function BooksPage() {
  const books = await listCatalogBooks({ onlyActive: true })

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand text-center">
            <p className="eyebrow">الكتب</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              كتب هادئة وعملية ترافقك في كل مرحلة
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              نعرض هنا الكتب النشطة فقط، ويتم تحديثها مباشرة من لوحة الإدارة.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand">
            {books.length === 0 ? (
              <div className="rounded-[2rem] border border-border bg-card p-10 text-center text-muted-foreground">
                لا توجد كتب متاحة الآن.
              </div>
            ) : (
              <div className="grid gap-7 lg:grid-cols-3">
                {books.map((book) => (
                  <article
                    key={book.id}
                    className="group overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative flex h-56 items-center justify-center overflow-hidden bg-primary p-8 text-primary-foreground">
                      <div className="relative w-52 rounded-[1.5rem] border border-white/30 bg-white/12 p-6 text-center shadow-lg">
                        <BookOpen className="mx-auto h-10 w-10" />
                        <h2 className="mt-6 text-3xl font-black leading-tight">{book.title}</h2>
                        <p className="mt-3 text-sm text-white/75">{book.shortDescription}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="font-bold text-foreground">{book.shortDescription}</p>
                      <p className="mt-3 leading-7 text-muted-foreground">{book.description}</p>
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <p className="text-2xl font-black text-primary latin">{book.price.toLocaleString("ar-EG")} ج.م</p>
                        <Link href={`/books/${book.slug || book.id}`}>
                          <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                            <ShoppingBag className="h-4 w-4" />
                            التفاصيل
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
