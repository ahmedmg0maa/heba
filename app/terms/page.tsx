import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description: "الشروط والأحكام الخاصة بخدمات ومنتجات منصة هبة الشريف.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "الشروط والأحكام | هبة الشريف",
    description: "تعرفي على ضوابط الحجز والشراء واستخدام المحتوى المدفوع.",
    url: "/terms",
  },
}

const sections = [
  {
    title: "نطاق الخدمة",
    text: "تقدم المنصة جلسات توجيه فردية ومحتوى رقمي (كتب/كورسات) لأغراض تعليمية وإرشادية. لا يُعد المحتوى بديلاً عن الاستشارات الطبية أو النفسية أو القانونية المتخصصة.",
  },
  {
    title: "الحجز وإعادة الجدولة",
    text: "يتم تأكيد المواعيد بعد مراجعة الطلب. يمكن إعادة الجدولة وفق سياسة الإخطار المسبق المعتمدة، وقد يترتب على الإلغاء المتأخر رسوم أو احتساب الجلسة.",
  },
  {
    title: "استخدام المحتوى المدفوع",
    text: "المحتوى المدفوع مخصص للاستخدام الشخصي فقط. يمنع منعًا باتًا إعادة النشر أو النسخ أو البيع أو مشاركة الوصول أو التسجيل أو التصوير أو إعادة رفع المحتوى.",
  },
  {
    title: "حماية الملكية الفكرية",
    text: "جميع المواد النصية والبصرية والتعليمية محمية بحقوق الملكية الفكرية. أي استخدام غير مصرح به يعرض الحساب للإيقاف والمساءلة القانونية.",
  },
  {
    title: "الاسترجاع والتفعيل",
    text: "سياسات الاسترجاع تعتمد على حالة الطلب وتفعيل الوصول. بعد تفعيل الوصول للمحتوى الرقمي، لا يتم الاسترجاع إلا في حالات الأعطال الفنية المثبتة التي تمنع الاستخدام بشكل كامل.",
  },
]

export default function TermsPage() {
  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand max-w-4xl text-center">
            <p className="eyebrow">Terms & Conditions</p>
            <h1 className="mt-5 text-5xl font-black leading-tight text-foreground sm:text-6xl">الشروط والأحكام</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
              قواعد الاستخدام والحجز والشراء لضمان تجربة واضحة وآمنة لكل عميلة.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand max-w-4xl space-y-5">
            {sections.map((section) => (
              <article key={section.title} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8">
                <h2 className="text-2xl font-black text-foreground">{section.title}</h2>
                <p className="mt-4 leading-8 text-muted-foreground">{section.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
