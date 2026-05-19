import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "سياسة الاسترجاع",
  description: "سياسة الاسترجاع والاستبدال للحجوزات والمحتوى الرقمي في منصة هبة الشريف.",
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    title: "سياسة الاسترجاع | هبة الشريف",
    description: "تعرفي على ضوابط الاسترجاع للحجوزات والكتب والكورسات الرقمية.",
    url: "/refund-policy",
  },
}

const sections = [
  {
    title: "المنتجات الرقمية (كتب وكورسات)",
    text: "قبل تفعيل الوصول: يمكن مراجعة طلب الاسترجاع خلال فترة معقولة. بعد تفعيل الوصول أو فتح الرابط المخصص للمحتوى المدفوع: لا يتم الاسترجاع إلا في حالات الأعطال الفنية المثبتة التي تمنع الاستخدام بشكل كامل.",
  },
  {
    title: "الجلسات الفردية",
    text: "يمكن إعادة جدولة الجلسة عند الإخطار المسبق بوقت كافٍ. في حالة عدم الحضور أو الإلغاء المتأخر قد تُطبق رسوم أو يتم احتساب الجلسة وفق سياسة التشغيل المعتمدة.",
  },
  {
    title: "الدفعات قيد المراجعة",
    text: "إذا كانت حالة الطلب «قيد المراجعة» ولم يتم التفعيل بعد، فيمكن طلب الإلغاء أو التعديل قبل اعتماد الطلب النهائي.",
  },
  {
    title: "آلية طلب الاسترجاع",
    text: "يرجى التواصل عبر صفحة التواصل أو واتساب الدعم مع ذكر رقم الطلب أو الحجز، وسبب الطلب، وأي تفاصيل داعمة للمراجعة.",
  },
]

export default function RefundPolicyPage() {
  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand max-w-4xl text-center">
            <p className="eyebrow">Refund Policy</p>
            <h1 className="mt-5 text-5xl font-black leading-tight text-foreground sm:text-6xl">سياسة الاسترجاع</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
              نلتزم بالوضوح والإنصاف في معالجة طلبات الاسترجاع بما يراعي طبيعة المحتوى الرقمي والخدمات الفردية.
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
