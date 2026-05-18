import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "الشروط والأحكام",
  description: "الشروط والأحكام الخاصة بخدمات ومنتجات موقع هبة الشريف.",
}

const sections = [
  {
    title: "الخدمات والجلسات",
    text: "جلسات الكوتشنج والورش تقدم كمساحات وعي وتوجيه، ولا تعد بديلاً عن العلاج النفسي أو الطبي أو الاستشارات القانونية أو المالية المتخصصة.",
  },
  {
    title: "الحجز وإعادة الجدولة",
    text: "يتم تأكيد الموعد بعد استكمال البيانات والدفع عند تفعيل بوابة الدفع. يمكن وضع سياسة إعادة جدولة واضحة حسب مدة الإخطار قبل الجلسة.",
  },
  {
    title: "المنتجات الرقمية",
    text: "الكتب والكورسات الرقمية مخصصة للاستخدام الشخصي فقط. لا يسمح بإعادة بيعها أو نشرها أو مشاركتها خارج حساب المشتري.",
  },
  {
    title: "الاسترداد والإلغاء",
    text: "يمكن تحديد سياسة الاسترداد حسب نوع المنتج أو الخدمة. المنتجات الرقمية قد تكون غير قابلة للاسترداد بعد الوصول للمحتوى، ما لم ينص خلاف ذلك.",
  },
  {
    title: "حقوق الملكية الفكرية",
    text: "كل النصوص، التصاميم، المواد التعليمية، الملفات، والعناصر البصرية داخل الموقع مملوكة لهبة الشريف أو مرخصة لها، ولا يجوز استخدامها دون إذن مكتوب.",
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
              قواعد الاستخدام والحجز والشراء لضمان تجربة واضحة وآمنة لكل زائرة وعميلة.
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
            <p className="rounded-[2rem] bg-secondary/50 p-6 text-sm leading-8 text-muted-foreground">
              ملاحظة: هذا نص تمهيدي قابل للتعديل حسب السياسة التجارية النهائية وطبيعة الدفع والاسترداد.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
