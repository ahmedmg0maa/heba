import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description: "سياسة الخصوصية الخاصة بموقع هبة الشريف.",
}

const sections = [
  {
    title: "البيانات التي نجمعها",
    text: "عند إرسال نموذج تواصل أو حجز أو شراء، قد نجمع الاسم، البريد الإلكتروني، رقم الهاتف، نوع الخدمة أو المنتج، وأي رسالة تكتبيها طواعية.",
  },
  {
    title: "كيف نستخدم البيانات؟",
    text: "نستخدم البيانات للرد على الاستفسارات، تأكيد المواعيد، تنفيذ الطلبات، إرسال تفاصيل الوصول للمنتجات الرقمية، وتحسين تجربة الموقع.",
  },
  {
    title: "الدفع والأمان",
    text: "عند تفعيل الدفع الإلكتروني، تتم معالجة بيانات البطاقة من خلال بوابة دفع خارجية معتمدة مثل Paymob أو Stripe، ولا يخزن الموقع بيانات البطاقات البنكية.",
  },
  {
    title: "المشاركة مع أطراف أخرى",
    text: "لا نبيع بياناتك ولا نشاركها لأغراض تسويقية خارجية. قد تتم مشاركة البيانات الضرورية فقط مع مزودي خدمات التشغيل مثل البريد الإلكتروني، الحجز، أو بوابات الدفع.",
  },
  {
    title: "حقوقك",
    text: "يمكنك طلب تعديل بياناتك أو حذفها أو إيقاف الرسائل التسويقية في أي وقت من خلال صفحة التواصل.",
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
              هذه السياسة توضح كيف يتم التعامل مع بيانات الزوار والعملاء داخل موقع هبة الشريف.
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
              ملاحظة: هذا نص قانوني تمهيدي قابل للتخصيص، ويفضل مراجعته مع مستشار قانوني قبل الإطلاق التجاري النهائي.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
