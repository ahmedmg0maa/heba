import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Gem, Layers3 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { faqs, services } from "@/lib/site-data"

export const metadata: Metadata = {
  title: "الخدمات",
  description: "جلسات كوتشنج فردية، ورش وعي، كورسات وكتب من هبة الشريف.",
}

export default function ServicesPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hebaelsharif.com"
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, index) => ({
      "@type": "Service",
      position: index + 1,
      name: service.title,
      description: service.description,
      provider: {
        "@type": "Person",
        name: "هبة الشريف",
        url: siteUrl,
      },
      url: `${siteUrl}${service.href.startsWith("/") ? service.href : "/services"}`,
    })),
  }

  return (
    <>
      <Header />
      <main dir="rtl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }} />
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand text-center">
            <p className="eyebrow">الخدمات</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              مسارات مختلفة لنفس الهدف: أن تعودي إلى ذاتك بوعي.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              اختاري بين جلسات فردية، ورش جماعية، كورسات مسجلة أو كتب عملية. كل خدمة مصممة لتناسب مرحلة مختلفة من
              رحلتك.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand grid gap-6 lg:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.id}
                id={service.id}
                className="rounded-[2.25rem] border border-border bg-card p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <service.icon className="h-8 w-8" />
                  </div>
                  {service.featured ? (
                    <span className="w-fit rounded-full bg-[var(--burgundy)] px-4 py-2 text-xs font-bold text-primary-foreground">
                      الأكثر طلبًا
                    </span>
                  ) : null}
                </div>
                <p className="mt-7 text-sm font-bold text-accent">{service.kicker}</p>
                <h2 className="mt-2 text-3xl font-black text-foreground">{service.title}</h2>
                <p className="mt-4 leading-8 text-muted-foreground">{service.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">المدة</p>
                    <p className="mt-1 font-bold">{service.duration}</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">السعر</p>
                    <p className="mt-1 font-bold">{service.price}</p>
                  </div>
                </div>
                <ul className="mt-6 grid gap-3">
                  {service.points.map((point) => (
                    <li key={point} className="flex gap-3 text-muted-foreground">
                      <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link href={service.href} className="mt-7 inline-flex">
                  <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    اختاري هذا المسار
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="workshops" className="section-padding bg-secondary/40">
          <div className="container-brand grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow">ورش خاصة وشركات</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
                ورش مصممة للمجموعات والفرق والمجتمعات النسائية.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                يمكن تصميم ورشة مخصصة حول الوعي، العلاقات، إدارة المشاعر، الحدود، أو التواصل الداخلي حسب احتياج
                المجموعة.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Gem, title: "تصميم فاخر", text: "تجربة منظمة بصريًا ومحتوائيًا مع ملفات عمل." },
                { icon: Layers3, title: "محتوى تفاعلي", text: "تمارين ومشاركة وأسئلة تقود لاكتشافات حقيقية." },
              ].map((item) => (
                <div key={item.title} className="rounded-[2rem] border border-border bg-card p-6">
                  <item.icon className="h-8 w-8 text-accent" />
                  <h3 className="mt-5 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">أسئلة مهمة</p>
              <h2 className="mt-4 text-4xl font-black text-foreground">قبل أن تبدئي</h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-[2rem] border border-border bg-card p-6">
                  <h3 className="text-xl font-bold text-foreground">{faq.question}</h3>
                  <p className="mt-3 leading-8 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
