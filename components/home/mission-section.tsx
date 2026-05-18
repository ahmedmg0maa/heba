import Image from "next/image"
import { ArrowLeft, CheckCircle2, Quote } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { brand, journeySteps } from "@/data/site"
import { SectionHeading } from "@/components/section-heading"

export function MissionSection() {
  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="container-brand grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card p-3 shadow-[0_16px_45px_rgba(23,53,65,0.1)]">
            <Image src={brand.banner} alt="هوية هبة الشريف" width={1400} height={700} className="rounded-[2rem] object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-[2rem] border border-accent/30 bg-card p-5 shadow-xl">
            <Quote className="mb-3 size-7 text-accent" />
            <p className="max-w-xs text-sm font-semibold leading-7 text-foreground">
              كل إجابة تبحثين عنها تبدأ من لحظة صدق مع ذاتك.
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            align="start"
            eyebrow="من هي هبة"
            title="مساحة آمنة لفهم النفس واستعادة الاتزان."
            description="هبة الشريف لا تقدم وصفات جاهزة، بل تفتح مساحة واعية تساعدك على رؤية ما يحدث داخلك، فهم رسائل مشاعرك، واختيار خطوات صغيرة لكنها حقيقية نحو حياة أهدأ وأعمق."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {journeySteps.map((step, index) => (
              <div key={step.title} className="rounded-[1.6rem] border border-border bg-card/80 p-5">
                <div className="mb-4 flex size-10 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
                  {index + 1}
                </div>
                <h3 className="text-lg font-black text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>

          <ul className="mt-8 grid gap-3 text-sm font-medium text-foreground/82">
            {["جلسات عميقة تحترم خصوصيتك وسرعتك", "منهج يجمع بين الوعي، الكتابة، والتطبيق العملي", "لغة هادئة ومحتوى مناسب لبراند عربي عالمي"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <Link href="/about" className="mt-8 inline-flex">
            <Button variant="outline" className="rounded-full border-2 px-7">
              اعرفي أكثر عن هبة
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
