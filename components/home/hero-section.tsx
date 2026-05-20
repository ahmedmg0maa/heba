import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { brand, stats } from "@/lib/site-data"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden luxury-gradient pt-14 sm:pt-20 lg:pt-24" dir="rtl">
      <div className="container-brand relative grid min-h-[78vh] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-card/85 px-4 py-2 text-xs font-bold text-accent shadow-sm backdrop-blur">
            <Sparkles className="size-4" />
            رحلة وعي تعيدكِ إلى ذاتك
          </div>

          <h1 className="max-w-[760px] text-4xl font-black leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            مساحتكِ الهادئة
            <span className="mt-2 block text-primary">لفهم نفسكِ بعمق واتزان</span>
          </h1>

          <p className="mt-7 max-w-[660px] text-base leading-8 text-muted-foreground sm:text-lg">
            مع هبة الشريف، تبدأ رحلتكِ من سؤال صادق، ثم خطوات عملية صغيرة تساعدكِ على تحويل الحيرة إلى وضوح،
            والتشتت إلى سلام داخلي ثابت.
          </p>

          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link href="/booking?service=coaching" className="sm:inline-flex">
              <Button className="touch-target h-12 w-full rounded-full bg-[var(--burgundy)] px-7 text-primary-foreground hover:bg-[var(--burgundy)]/92 sm:w-auto">
                احجزي جلستك
                <ArrowLeft className="size-4" />
              </Button>
            </Link>

            <Link href="/books" className="sm:inline-flex">
              <Button variant="outline" className="touch-target h-12 w-full rounded-full border border-border bg-card/82 px-7 sm:w-auto">
                تصفحي الكتب
              </Button>
            </Link>

            <Link href="/services" className="sm:inline-flex">
              <Button variant="ghost" className="touch-target h-12 w-full rounded-full border border-transparent bg-secondary/50 px-7 sm:w-auto">
                ابدئي رحلتك
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="luxury-panel p-4 text-center">
                <p className="text-[1.35rem] font-black tracking-tight text-primary">{item.value}</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[430px] lg:max-w-[500px]">
          <div className="absolute -right-5 -top-5 size-20 rounded-full bg-primary/8 blur-lg" />
          <div className="luxury-panel relative p-4">
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
