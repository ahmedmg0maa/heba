import type { Metadata } from "next"
import Link from "next/link"
import { Quote, Star } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { testimonials } from "@/lib/site-data"

export const metadata: Metadata = {
  title: "تجارب العملاء",
  description: "تجارب عملاء ومشاركين في جلسات وبرامج هبة الشريف.",
}

export default function TestimonialsPage() {
  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand text-center">
            <p className="eyebrow">تجارب العملاء</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-tight text-foreground sm:text-6xl">قصص صغيرة من رحلات وعي حقيقية.</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-muted-foreground">كلمات مختصرة من أشخاص بدأوا يسألون أسئلة أعمق ويتحركون بخطوات أوضح.</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand grid gap-6 lg:grid-cols-3">
            {testimonials.concat(testimonials).map((item, index) => (
              <article key={`${item.name}-${index}`} className="rounded-[2rem] border border-border bg-card p-7 shadow-sm">
                <Quote className="h-9 w-9 text-accent" />
                <p className="mt-6 text-lg leading-9 text-muted-foreground">“{item.text}”</p>
                <div className="mt-6 flex gap-1 text-accent">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="font-bold text-foreground">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="container-brand">
            <div className="rounded-[2.5rem] bg-primary p-8 text-center text-primary-foreground shadow-xl md:p-12">
              <h2 className="text-4xl font-black">هل تريدين كتابة قصتك القادمة؟</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/75">ابدئي بجلسة واحدة واضحة، ثم اختاري المسار الذي يناسبك.</p>
              <Link href="/booking" className="mt-7 inline-flex"><Button variant="secondary" className="rounded-full px-7">احجزي الآن</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
