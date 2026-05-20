import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen, Clock, Users } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { listCatalogCourses } from "@/lib/catalog"

export const dynamic = "force-dynamic"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hebaelsharif.com"

export const metadata: Metadata = {
  title: "الكورسات والبرامج",
  description: "كورسات عملية عربية يتم تفعيلها فقط بعد تأكيد الدفع. جميع البيانات معتمدة من Firebase.",
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: "كورسات هبة الشريف",
    description: "برامج عملية لبناء الوعي والاتزان بخطوات واضحة.",
    url: `${siteUrl}/courses`,
    images: ["/images/heba-banner.jpeg"],
  },
}

export default async function CoursesPage() {
  const courses = await listCatalogCourses({ onlyActive: true })

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand text-center">
            <p className="eyebrow">الكورسات</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              برامج عملية تساعدك على بناء وضوح ثابت في حياتك اليومية
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              نعرض هنا الكورسات المتاحة حاليًا فقط، ويتم تحديث القائمة مباشرة من لوحة الإدارة.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand">
            {courses.length === 0 ? (
              <div className="rounded-[2rem] border border-border bg-card p-10 text-center text-muted-foreground">
                لا توجد كورسات متاحة الآن.
              </div>
            ) : (
              <div className="grid gap-7 lg:grid-cols-3">
                {courses.map((course) => (
                  <article
                    key={course.id}
                    className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="h-48 bg-primary p-6 text-primary-foreground">
                      <p className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold w-fit">{course.duration || "برنامج"}</p>
                      <h2 className="mt-10 text-3xl font-black leading-tight">{course.title}</h2>
                    </div>
                    <div className="p-6">
                      <p className="font-bold text-foreground">{course.shortDescription}</p>
                      <p className="mt-3 leading-7 text-muted-foreground">{course.description}</p>
                      <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <span className="rounded-2xl bg-muted p-3">
                          <Clock className="mb-1 h-4 w-4 text-accent" />
                          {course.duration || "—"}
                        </span>
                        <span className="rounded-2xl bg-muted p-3">
                          <BookOpen className="mb-1 h-4 w-4 text-accent" />
                          {course.lessonsCount ? `${course.lessonsCount} درس` : "—"}
                        </span>
                      </div>
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <p className="text-2xl font-black text-primary latin">{course.price.toLocaleString("ar-EG")} ج.م</p>
                        <Link href={`/courses/${course.slug || course.id}`}>
                          <Button className="rounded-full">التفاصيل</Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pb-20">
          <div className="container-brand">
            <div className="rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-xl md:p-12">
              <Users className="mx-auto h-10 w-10 text-accent" />
              <h2 className="mt-5 text-3xl font-black text-foreground sm:text-4xl">تحتاجين مسارًا مخصصًا؟</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted-foreground">
                يمكنك حجز جلسة تشخيصية قصيرة لتحديد المسار الأنسب لمرحلتك الحالية.
              </p>
              <Link href="/booking" className="mt-7 inline-flex">
                <Button className="rounded-full bg-[var(--burgundy)] px-7 text-primary-foreground hover:bg-[var(--burgundy)]/90">
                  احجزي جلسة اختيار المسار
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
