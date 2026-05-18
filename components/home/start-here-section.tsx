import Link from "next/link"
import { ArrowRight, Compass, MessageCircleHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { startHereSteps } from "@/lib/site-data"

export function StartHereSection() {
  return (
    <section className="section-padding soft-gradient" dir="rtl">
      <div className="container-brand rounded-[2.5rem] border border-border bg-card/90 p-7 shadow-lg md:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="eyebrow">ابدئي من هنا</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
              لا تحتاجين خطة معقدة، فقط بداية واضحة اليوم.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              إذا كنتِ محتارة من أين تبدئين، فهذه الخطوات الثلاث تساعدكِ على اختيار المسار الأنسب بدون ضغط.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/booking">
                <Button className="rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">
                  احجزي جلستك الخاصة
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="rounded-full bg-transparent">
                  اختاري ما يناسبك
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {startHereSteps.map((step, index) => (
              <article key={step.title} className="rounded-[1.8rem] border border-border bg-background p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-black text-foreground">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.text}</p>
                <Link href={step.href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-accent">
                  ابدئي من هنا
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
            <div className="rounded-[1.8rem] border border-accent/30 bg-accent/10 p-5">
              <p className="inline-flex items-center gap-2 text-sm font-black text-foreground">
                <Compass className="h-4 w-4 text-accent" />
                مساحة هادئة للاختيار
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                AI يساعدكِ على اختيار البداية الأنسب عبر مسارات قصيرة وواضحة.
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-accent">
                <MessageCircleHeart className="h-4 w-4" />
                متاح أسفل الصفحة
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
