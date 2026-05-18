import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Award, BookOpen, Compass, Feather, Heart, Sparkles } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { brand, values } from "@/lib/site-data"

export const metadata: Metadata = {
  title: "من هي هبة الشريف",
  description: "تعرفي على رسالة هبة الشريف، فلسفتها في الوعي بالذات، ورحلتها ككاتبة ولايف كوتش معتمدة.",
}

const timeline = [
  { year: "البداية", title: "سؤال الوعي الأول", text: "بدأت الرحلة من فضول حقيقي لفهم النفس، العلاقات، والأنماط التي تجعل الإنسان يكرر نفس الألم." },
  { year: "التكوين", title: "دراسة ومنهجية", text: "دمجت هبة بين أدوات الكوتشنج المعتمدة، الكتابة التأملية، وفهم الإنسان في سياقه النفسي والروحي." },
  { year: "الأثر", title: "نقطة وعي", text: "تحولت الرسالة إلى مساحة للنساء والرجال الباحثين عن وضوح، سلام، واختيار واعٍ." },
]

export default function AboutPage() {
  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="relative overflow-hidden pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div>
              <p className="eyebrow">من هي هبة؟</p>
              <h1 className="mt-5 text-5xl font-black leading-tight text-foreground sm:text-6xl lg:text-7xl">
                لايف كوتش وكاتبة ترافقك في رحلة فهم النفس بعمق.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-9 text-muted-foreground">{brand.shortBio}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/booking"><Button className="rounded-full bg-[var(--burgundy)] px-7 text-primary-foreground hover:bg-[var(--burgundy)]/90">ابدئي بجلسة</Button></Link>
                <Link href="/courses"><Button variant="outline" className="rounded-full px-7">شاهدي البرامج</Button></Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-5 rounded-[3rem] border border-accent/30" />
            <div className="relative rounded-[2.5rem] border border-border bg-card p-6 shadow-xl">
                <Image src="/images/logo-heba.webp" alt="هبة الشريف" width={640} height={640} className="mx-auto h-72 w-72 object-contain" />
                <div className="rounded-[2rem] bg-secondary/60 p-6 text-center">
                  <p className="text-2xl font-black text-foreground">{brand.name}</p>
                  <p className="mt-2 text-accent">{brand.promise}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand grid gap-8 lg:grid-cols-3">
            {timeline.map((item, index) => (
              <div key={item.title} className="rounded-[2rem] border border-border bg-card p-7 shadow-sm">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground latin">{index + 1}</span>
                <p className="mt-6 text-sm font-bold text-accent">{item.year}</p>
                <h2 className="mt-2 text-2xl font-extrabold text-foreground">{item.title}</h2>
                <p className="mt-4 leading-8 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-padding bg-secondary/40">
          <div className="container-brand">
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">رسالتها</p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
                أن يصبح الوعي طريقًا رحيمًا لاختيارات أكثر صدقًا.
              </h2>
              <p className="mt-6 text-lg leading-9 text-muted-foreground">
                هبة لا تقدم وعودًا جاهزة، بل تفتح أسئلة عميقة وتضع أدوات عملية تساعدك على فهم ما يحدث داخلك، والتصرف من مكان أكثر اتزانًا.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="rounded-[2rem] border border-border bg-card p-6 text-center shadow-sm">
                  <value.icon className="mx-auto h-9 w-9 text-accent" />
                  <h3 className="mt-5 text-xl font-bold text-foreground">{value.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand grid gap-6 lg:grid-cols-4">
            {[
              { icon: Award, title: "منهجية معتمدة", text: "أسئلة كوتشنج عميقة تقود إلى وضوح لا إلى نصائح سطحية." },
              { icon: BookOpen, title: "كتابة وروح", text: "لغة ناعمة تترجم ما يصعب قوله وتعيد ترتيب الداخل." },
              { icon: Heart, title: "أمان واحتواء", text: "مساحة تسمح بالصدق دون خوف من الحكم أو التقليل." },
              { icon: Compass, title: "اتجاه عملي", text: "كل جلسة أو برنامج ينتهي بخطوة يمكن تطبيقها." },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                <item.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-5 text-xl font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-20">
          <div className="container-brand">
            <div className="rounded-[2.5rem] bg-primary p-8 text-primary-foreground shadow-xl md:p-12">
              <Feather className="h-10 w-10 text-accent" />
              <h2 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">“كل إجابة تبحثين عنها موجودة داخلك… الوعي يساعدك فقط أن تسمعيها.”</h2>
              <div className="mt-8"><Link href="/booking"><Button variant="secondary" className="rounded-full px-7">احجزي مساحة آمنة</Button></Link></div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
