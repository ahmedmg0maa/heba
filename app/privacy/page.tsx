import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "سياسة الخصوصية الخاصة بمنصة هبة الشريف وطريقة التعامل مع بيانات العملاء.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "سياسة الخصوصية | هبة الشريف",
    description: "كيف نجمع البيانات ونستخدمها ونحميها داخل المنصة.",
    url: "/privacy",
  },
}

const sections = [
  {
    title: "ما البيانات التي نجمعها؟",
    text: "قد نجمع بيانات مثل الاسم والبريد الإلكتروني والهاتف ومعلومات الطلب أو الحجز عند الإرسال الطوعي للنماذج أو الشراء.",
  },
  {
    title: "كيف نستخدم البيانات؟",
    text: "نستخدم البيانات لتأكيد الطلبات والحجوزات، تفعيل الوصول للمحتوى المدفوع، تقديم الدعم، وتحسين جودة الخدمة.",
  },
  {
    title: "المعالجة والدفع",
    text: "في حالة تفعيل بوابات دفع خارجية (مثل Paymob) تتم معالجة بيانات الدفع عبر مزود الدفع مباشرة. لا يتم حفظ بيانات البطاقات البنكية داخل المنصة.",
  },
  {
    title: "مشاركة البيانات",
    text: "لا يتم بيع البيانات. قد تتم مشاركة الحد الأدنى الضروري فقط مع مزودي تشغيل موثوقين (مثل البريد الإلكتروني أو البنية السحابية) لتقديم الخدمة.",
  },
  {
    title: "حقوق المستخدم",
    text: "يمكنك طلب تحديث أو حذف بياناتك أو الاستفسار عن أي معالجة للبيانات عبر قنوات التواصل الرسمية.",
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand max-w-4xl text-center">
            <p className="eyebrow">Privacy Policy</p>
            <h1 className="mt-5 text-5xl font-black leading-tight text-foreground sm:text-6xl">سياسة الخصوصية</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-9 text-muted-foreground">
              هذه السياسة توضح كيفية جمع واستخدام وحماية بيانات الزوار والعملاء.
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
