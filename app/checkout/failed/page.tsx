import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"

type PageProps = {
  searchParams: Promise<{ reason?: string }>
}

export const metadata: Metadata = {
  title: "تعذر إتمام الطلب",
  description: "لم يكتمل إرسال الطلب. يمكنك المحاولة مرة أخرى أو التواصل مع فريق الدعم.",
}

export default async function CheckoutFailedPage({ searchParams }: PageProps) {
  const { reason } = await searchParams
  const message = reason ? decodeURIComponent(reason) : "تعذر إتمام عملية الشراء. يمكنكِ إعادة المحاولة بسهولة."

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand">
            <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-border bg-card p-8 text-center shadow-xl md:p-12">
              <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
              <p className="eyebrow mt-6">لم يكتمل الطلب</p>
              <h1 className="mt-3 text-4xl font-black text-foreground sm:text-5xl">حدثت مشكلة أثناء الإرسال</h1>
              <p className="mx-auto mt-4 max-w-xl leading-8 text-muted-foreground">{message}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/checkout">
                  <Button className="rounded-full">
                    إعادة المحاولة
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="rounded-full bg-transparent">
                    تواصلي معنا
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
