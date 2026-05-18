import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BadgeCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { brand, stats } from "@/lib/site-data"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden luxury-gradient pt-16 sm:pt-20 lg:pt-24" dir="rtl">
      <div className="container-brand relative grid min-h-[78vh] items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-card/85 px-4 py-2 text-xs font-bold text-accent shadow-sm backdrop-blur">
            <Sparkles className="size-4" />
            رحلة وعي تعيدكِ إلى ذاتك
          </div>

          <h1 className="max-w-[760px] text-4xl font-black leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            مساحة هادئة
            <span className="mt-2 block text-primary">لفهم نفسك بعمق واتزان</span>
          </h1>

          <p className="mt-8 max-w-[660px] text-base leading-8 text-muted-foreground sm:text-lg">
            مع هبة الشريف، تبدأ رحلتكِ من سؤال صادق، ثم خطوات عملية صغيرة، حتى تتحول الحيرة إلى وضوح والضغط إلى
            سلام.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/booking?service=coaching">
              <Button className="h-12 rounded-full bg-[var(--burgundy)] px-8 text-sm font-bold text-primary-foreground shadow-lg transition-colors hover:bg-[var(--burgundy)]/92">
                احجزي جلستك
                <ArrowRight className="mr-2 size-4" />
              </Button>
            </Link>

            <Link href="/courses">
              <Button
                variant="outline"
                className="h-12 rounded-full border border-border bg-card/82 px-8 text-sm font-bold transition-all duration-300 hover:bg-secondary/60"
              >
                اكتشفي البرامج
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-border bg-card/85 p-4 text-center shadow-sm"
              >
                <p className="text-[1.35rem] font-black tracking-tight text-primary">{item.value}</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[430px] lg:max-w-[500px]">
          <div className="absolute -right-5 -top-5 size-20 rounded-full bg-primary/8 blur-lg" />
          <div className="relative overflow-hidden rounded-[2.8rem] border border-border bg-card/86 p-4 shadow-[0_16px_45px_rgba(23,50,60,0.1)] backdrop-blur-md">
            <div className="relative aspect-[4/4.8] overflow-hidden rounded-[2.2rem] bg-[#ede5d8] dark:bg-[rgba(255,248,238,0.11)]">
              <Image src="/images/logo-heba.webp" alt={brand.name} fill priority className="object-contain p-10" />
            </div>

            <div className="absolute bottom-5 right-5 max-w-[220px] rounded-[26px] border border-border bg-background/86 p-4 text-right shadow-lg backdrop-blur-md">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-primary">
                <BadgeCheck className="size-4 text-accent" />
                تجربة شخصية راقية
              </div>

              <p className="text-[11px] leading-5 text-muted-foreground">
                جلسات وبرامج عملية تساعدكِ على فهم ذاتك واختيار خطوات مناسبة لواقعك.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
