import Link from "next/link"
import { ArrowRight, BookOpen, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { listCatalogCourses } from "@/lib/catalog"

export async function CoursesPreview() {
  const courses = (await listCatalogCourses({ onlyActive: true })).slice(0, 3)

  return (
    <section className="section-padding" dir="rtl">
      <div className="container-brand">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">الكورسات</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
              برامج عملية تساعدكِ على بناء وعي ثابت في حياتك اليومية
            </h2>
          </div>
          <Link href="/courses">
            <Button variant="outline" className="rounded-full bg-transparent">
              كل البرامج
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-48 bg-primary p-6 text-primary-foreground">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{course.duration || "برنامج رقمي"}</span>
                <h3 className="mt-10 text-3xl font-black leading-tight">{course.title}</h3>
              </div>
              <div className="p-6">
                <p className="font-semibold text-foreground">{course.shortDescription}</p>
                <p className="mt-3 leading-7 text-muted-foreground">{course.description}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                    <Clock className="h-4 w-4" />
                    {course.duration || "—"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                    <BookOpen className="h-4 w-4" />
                    {course.lessonsCount ? `${course.lessonsCount} درس` : "—"}
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">السعر</p>
                    <p className="text-2xl font-black text-primary latin">{course.price.toLocaleString("en-US")} EGP</p>
                  </div>
                  <Link href={`/courses/${course.slug || course.id}`}>
                    <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">التفاصيل</Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
