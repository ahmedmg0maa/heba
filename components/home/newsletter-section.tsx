import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  return (
    <section className="pb-20" dir="rtl">
      <div className="container-brand">
        <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 shadow-xl md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="eyebrow">ابدئي الرحلة</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
                كل إجابة تبحثين عنها تبدأ بسؤال صادق.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                اشتركي في رسائل الوعي الهادئة، أو انتقلي مباشرة لحجز جلسة أو اختيار برنامج مناسب.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/booking">
                  <Button className="h-12 rounded-full bg-[var(--burgundy)] px-7 text-primary-foreground hover:bg-[var(--burgundy)]/90">
                    احجزي جلسة
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" className="h-12 rounded-full px-7">
                    شاهدي الكورسات
                  </Button>
                </Link>
              </div>
            </div>
            <form className="rounded-[2rem] bg-secondary/50 p-5">
              <label className="mb-3 block text-sm font-bold text-foreground">رسالة أسبوعية قصيرة</label>
              <div className="flex gap-2">
                <Input type="email" placeholder="البريد الإلكتروني" className="h-12 rounded-full bg-secondary/55" />
                <Button type="button" size="icon" className="h-12 w-12 rounded-full bg-primary text-primary-foreground">
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                لن نرسل أي رسائل مزعجة. فقط محتوى مختار بعناية.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
