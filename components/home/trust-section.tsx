import { ShieldCheck, Sparkles, Star, Users2 } from "lucide-react"

const trustItems = [
  {
    icon: ShieldCheck,
    title: "مساحة آمنة",
    text: "كل جلسة أو برنامج مبني على الخصوصية والاحتواء بدون أحكام.",
  },
  {
    icon: Star,
    title: "منهج واضح",
    text: "خطوات عملية قابلة للتطبيق بدل النصائح العامة.",
  },
  {
    icon: Users2,
    title: "رحلات حقيقية",
    text: "تجارب عملاء تؤكد أثر التحول الهادئ على الحياة اليومية.",
  },
  {
    icon: Sparkles,
    title: "تجربة Premium",
    text: "واجهة عربية راقية، بسيطة، ومريحة بصريًا على كل الأجهزة.",
  },
]

export function TrustSection() {
  return (
    <section className="section-padding bg-background" dir="rtl">
      <div className="container-brand">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">ثقة</p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
            كل تفصيلة هنا مصممة لتمنحك راحة وثقة قبل أي خطوة.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <article
              key={item.title}
              className="rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="size-6" />
              </div>
              <h3 className="mt-5 text-xl font-black text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
