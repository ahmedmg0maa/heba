import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, BookOpen, Clock, CreditCard, Users } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { getCatalogCourseBySlug } from "@/lib/catalog"

type PageProps = { params: Promise<{ id: string }> }

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const course = await getCatalogCourseBySlug(id)
  if (!course || course.status !== "active") return {}
  return {
    title: course.title,
    description: course.description,
  }
}

export default async function CourseDetailsPage({ params }: PageProps) {
  const { id } = await params
  const course = await getCatalogCourseBySlug(id)

  if (!course || course.status !== "active") notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hebaelsharif.com"
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: "هبة الشريف",
      url: siteUrl,
    },
    inLanguage: "ar",
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: course.price,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/checkout?type=course&id=${course.id}`,
    },
  }

  return (
    <>
      <Header />
      <main dir="rtl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand grid gap-10 lg:grid-cols-[1fr_0.42fr] lg:items-start">
            <div>
              <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
                <ArrowRight className="h-4 w-4" /> العودة للكورسات
              </Link>
              <p className="eyebrow mt-8">كورس</p>
              <h1 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">{course.title}</h1>
              <p className="mt-4 text-2xl font-bold text-primary">{course.shortDescription}</p>
              <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{course.description}</p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2">
                  <Clock className="h-4 w-4 text-accent" />
                  {course.duration || "—"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2">
                  <BookOpen className="h-4 w-4 text-accent" />
                  {course.lessonsCount ? `${course.lessonsCount} درس` : "—"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2">
                  <Users className="h-4 w-4 text-accent" />
                  برنامج رقمي
                </span>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-border bg-card p-6 shadow-xl">
              <div className="rounded-[1.5rem] bg-primary p-6 text-primary-foreground">
                <p className="mt-10 text-3xl font-black">{course.title}</p>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-black text-primary latin">{course.price.toLocaleString("en-US")} EGP</p>
              </div>
              <Link href={`/checkout?type=course&id=${course.id}`} className="mt-6 block">
                <Button className="h-12 w-full rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">
                  <CreditCard className="h-5 w-5" />
                  اشتري البرنامج الآن
                </Button>
              </Link>
              <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
                بعد الشراء سيظهر الطلب في حسابك بحالة قيد المراجعة حتى تأكيد الدفع.
              </p>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
