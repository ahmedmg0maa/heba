import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section className="pb-20" dir="rtl">
      <div className="container-brand">
        <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 shadow-xl md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="eyebrow">خطوتك التالية</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
                كل إجابة تبحثين عنها تبدأ بسؤال صادق ومساحة آمنة.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                اختاري ما يناسبكِ اليوم: جلسة فردية، كورس عملي، أو كتاب يرافقكِ بهدوء في رحلتك.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/booking">
                  <Button className="h-12 rounded-full bg-[var(--burgundy)] px-7 text-primary-foreground hover:bg-[var(--burgundy)]/90">
                    احجزي جلستك الخاصة
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="h-12 rounded-full bg-transparent px-7">
                    اختاري المسار الأنسب
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-accent/30 bg-accent/10 p-6">
              <p className="text-sm font-bold text-foreground">مساحة هادئة للاختيار</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                إن كنتِ مترددة، افتحي AI من أسفل الصفحة وسيرشدكِ مباشرةً إلى البداية الأنسب.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
