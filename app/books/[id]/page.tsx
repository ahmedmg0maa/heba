import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, BookOpen, CreditCard, Sparkles } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { getCatalogBookBySlug } from "@/lib/catalog"
import { ViewProductTrack } from "@/components/analytics/view-product-track"

type PageProps = { params: Promise<{ id: string }> }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const book = await getCatalogBookBySlug(id)
  if (!book || book.status !== "active") return {}
  return {
    title: `${book.title} | كتب هبة الشريف`,
    description: book.description,
  }
}

export default async function BookDetailsPage({ params }: PageProps) {
  const { id } = await params
  const book = await getCatalogBookBySlug(id)
  if (!book || book.status !== "active") notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hebaelsharif.com"
  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.description,
    inLanguage: "ar",
    author: {
      "@type": "Person",
      name: "هبة الشريف",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: book.price,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/checkout?type=book&id=${book.id}`,
    },
  }

  return (
    <>
      <Header />
      <main dir="rtl">
        <ViewProductTrack productId={book.id} productType="book" price={book.price} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }} />
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand grid gap-10 lg:grid-cols-[1fr_0.42fr] lg:items-start">
            <div>
              <Link href="/books" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
                <ArrowRight className="h-4 w-4" /> العودة للكتب
              </Link>
              <p className="eyebrow mt-8">كتاب</p>
              <h1 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">{book.title}</h1>
              <p className="mt-4 text-2xl font-bold text-primary">{book.shortDescription}</p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{book.description}</p>
            </div>

            <aside className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
              <div className="rounded-[1.5rem] bg-primary p-6 text-primary-foreground">
                <BookOpen className="h-7 w-7 text-accent" />
                <p className="mt-8 text-3xl font-black">{book.title}</p>
              </div>
              <div className="mt-6">
                <p className="text-sm text-muted-foreground">السعر</p>
                <p className="text-4xl font-black text-primary latin">{book.price.toLocaleString("ar-EG")} ج.م</p>
              </div>
              <Link href={`/checkout?type=book&id=${book.id}`} className="mt-6 block">
                <Button className="h-12 w-full rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">
                  <CreditCard className="h-5 w-5" />
                  شراء الكتاب الآن
                </Button>
              </Link>
            </aside>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand">
            <div className="rounded-[2rem] border border-border bg-card p-8">
              <p className="eyebrow">ماذا ستحصلين؟</p>
              <h2 className="mt-4 text-3xl font-black text-foreground">كتاب رقمي ضمن حسابك بعد اعتماد الطلب</h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                بعد اعتماد الدفع من الإدارة سيظهر الكتاب داخل حسابك مع زر تحميل حقيقي عند توفر رابط الملف.
              </p>
              <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-5 w-5 text-accent" />
                تجربة شراء ومتابعة موحدة من صفحة الحساب.
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
