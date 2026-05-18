import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, ReceiptText, WalletCards } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { getDocument } from "@/lib/firebase/admin"

export const metadata: Metadata = {
  title: "تم إرسال الطلب",
  description: "تم إنشاء الطلب بنجاح وهو الآن قيد المراجعة لحين تأكيد الدفع.",
}

type PageProps = {
  searchParams: Promise<{ orderId?: string }>
}

function mapStatus(status: string) {
  if (status === "paid") return "مدفوع"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams
  const order = orderId ? await getDocument("orders", orderId) : null
  const statusLabel = mapStatus(String(order?.status || "pending"))

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand">
            <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-xl md:p-12">
              <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
              <p className="eyebrow mt-6">تم استلام الطلب</p>
              <h1 className="mt-3 text-4xl font-black text-foreground sm:text-5xl">تم إرسال الطلب بنجاح وهو قيد المراجعة.</h1>
              <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted-foreground">
                حالة الطلب الحالية: <strong>{statusLabel}</strong>. سيتم اعتماد المنتج بعد تأكيد الدفع.
              </p>

              <div className="mt-8 rounded-[2rem] border border-border bg-background p-5 text-right">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">رقم الطلب</p>
                    <p className="mt-1 font-black text-foreground">{String(order?.orderNumber || orderId || "-")}</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">حالة الطلب</p>
                    <p className="mt-1 font-black text-primary">{statusLabel}</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">المنتج</p>
                    <p className="mt-1 font-bold text-foreground">{String(order?.productTitle || "-")}</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">الإجمالي</p>
                    <p className="mt-1 font-bold text-foreground latin">{String(order?.amount || "-")} EGP</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/account">
                  <Button className="rounded-full">
                    <ReceiptText className="h-4 w-4" />
                    الذهاب إلى حسابي
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" className="rounded-full bg-transparent">
                    <WalletCards className="h-4 w-4" />
                    متابعة التصفح
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
