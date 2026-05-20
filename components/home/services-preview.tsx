import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { services } from "@/lib/site-data"

export function ServicesPreview() {
  return (
    <section className="section-padding bg-secondary/36" dir="rtl" id="services-preview">
      <div className="container-brand">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">الخدمات</p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
            اختاري المسار الأنسب لمرحلتك الحالية
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            من جلسة فردية عميقة إلى برنامج متكامل، كل خدمة مصممة لتقودكِ من الفهم إلى التطبيق.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.id}
              className={`hover-lift group relative overflow-hidden rounded-[2rem] border p-6 shadow-sm ${
                service.featured
                  ? "border-primary/40 bg-[color:rgba(47,97,115,0.08)] text-foreground"
                  : "border-border bg-card"
              }`}
            >
              <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-accent/10 blur-xl" />
              <div
                className={`relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                  service.featured ? "bg-primary/16 text-primary" : "bg-primary/10 text-primary"
                }`}
              >
                <service.icon className="h-7 w-7" />
              </div>
              <p className={`relative text-xs font-bold tracking-[0.2em] ${service.featured ? "text-primary" : "text-accent"}`}>
                {service.kicker}
              </p>
              <h3 className="relative mt-3 text-2xl font-extrabold">{service.title}</h3>
              <p className={`relative mt-4 min-h-28 leading-7 ${service.featured ? "text-foreground/85" : "text-muted-foreground"}`}>
                {service.description}
              </p>
              <ul className="relative mt-5 space-y-2 text-sm">
                {service.points.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${service.featured ? "bg-primary" : "bg-accent"}`} />
                    {point}
                  </li>
                ))}
              </ul>
              <Link href={service.href} className="relative mt-7 inline-flex w-full">
                <Button
                  variant={service.featured ? "default" : "outline"}
                  className={`w-full rounded-full ${service.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                >
                  التفاصيل والحجز
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
