import type { Metadata } from "next"
import Link from "next/link"
import { CalendarCheck2, MessageCircle, WalletCards } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { buildWhatsAppUrl } from "@/lib/support"

type PageProps = {
  searchParams: Promise<{ bookingId?: string; status?: string }>
}

export const metadata: Metadata = {
  title: "تم إرسال طلب الحجز",
  description: "تم استلام طلب الحجز بنجاح، وهو الآن قيد المراجعة حتى التأكيد النهائي.",
}

function statusLabel(status: string) {
  if (status === "approved") return "تم القبول"
  if (status === "completed") return "تمت الجلسة"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const { bookingId = "", status = "pending" } = await searchParams
  const whatsappUrl = buildWhatsAppUrl(`مرحبًا، لدي استفسار بخصوص الحجز رقم ${bookingId || "-"}.`)

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="section-padding soft-gradient pt-20 sm:pt-24">
          <div className="container-brand">
            <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-xl md:p-12">
              <CalendarCheck2 className="mx-auto h-16 w-16 text-primary" />
              <p className="eyebrow mt-6">تم استلام طلب الحجز</p>
              <h1 className="mt-3 text-4xl font-black text-foreground sm:text-5xl">تم إرسال طلبك بنجاح</h1>
              <p className="mx-auto mt-4 max-w-2xl leading-8 text-muted-foreground">
                حالة طلب الحجز حاليًا: <strong>{statusLabel(status)}</strong>. سنراجع الموعد ونتواصل معك خلال وقت قصير للتأكيد.
              </p>

              <div className="mt-8 rounded-[2rem] border border-border bg-background p-5 text-right">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">رقم الحجز</p>
                    <p className="mt-1 font-black text-foreground">{bookingId || "-"}</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs text-muted-foreground">الحالة</p>
                    <p className="mt-1 font-black text-primary">{statusLabel(status)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/account">
                  <Button className="rounded-full">
                    <WalletCards className="h-4 w-4" />
                    الذهاب إلى حسابي
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="rounded-full bg-transparent">
                    <MessageCircle className="h-4 w-4" />
                    تواصل مع الدعم
                  </Button>
                </Link>
                {whatsappUrl ? (
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="rounded-full bg-transparent">
                      دعم واتساب
                    </Button>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
