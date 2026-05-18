import type { Metadata } from "next"
import Link from "next/link"
import { Mic2, Newspaper, PlayCircle } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { mediaItems } from "@/lib/site-data"

export const metadata: Metadata = {
  title: "الإعلام والفعاليات",
  description: "لقاءات، ندوات، بودكاست وظهور إعلامي لهبة الشريف.",
}

const icons = [Mic2, PlayCircle, Newspaper]

export default function MediaPage() {
  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand text-center">
            <p className="eyebrow">الإعلام والفعاليات</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-tight text-foreground sm:text-6xl">حضور هادئ ورسالة واضحة.</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-muted-foreground">مساحة لعرض اللقاءات، الندوات، البودكاست، والتعاونات الإعلامية القادمة.</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand grid gap-6 lg:grid-cols-3">
            {mediaItems.map((item, index) => {
              const Icon = icons[index % icons.length]
              return (
                <article key={item.title} className="rounded-[2rem] border border-border bg-card p-7 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
                  <Icon className="h-9 w-9 text-accent" />
                  <span className="mt-6 inline-flex rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">{item.type}</span>
                  <h2 className="mt-5 text-2xl font-black text-foreground">{item.title}</h2>
                  <p className="mt-3 text-muted-foreground">{item.outlet}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="pb-20">
          <div className="container-brand">
            <div className="rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-xl md:p-12">
              <h2 className="text-4xl font-black text-foreground">للتعاونات الإعلامية والفعاليات</h2>
              <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted-foreground">يمكن التواصل لترتيب لقاء، ورشة خاصة، أو ظهور إعلامي حول الوعي والعلاقات والاتزان.</p>
              <Link href="/contact" className="mt-7 inline-flex"><Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">تواصل للتعاون</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
