"use client"

import type { FormEvent } from "react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { ArrowRight, CreditCard, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getFirebaseClientAuth } from "@/lib/firebase/client"

type Product = {
  id: string
  type: "course" | "book"
  title: string
  subtitle: string
  description: string
  price: number
  meta: string
}

function makeKey(product: Product) {
  return `${product.type}:${product.id}`
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentMethod, setPaymentMethod] = useState("manual")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productKey, setProductKey] = useState("")

  const selectedProduct = useMemo(
    () => products.find((product) => makeKey(product) === productKey) ?? products[0],
    [productKey, products],
  )

  useEffect(() => {
    const auth = getFirebaseClientAuth()
    if (!auth) return
    return onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null)
    })
  }, [])

  useEffect(() => {
    async function loadProducts() {
      setProductsLoading(true)
      setError("")

      try {
        const response = await fetch("/api/catalog", { cache: "no-store" })
        const result = await response.json()
        if (!response.ok || !result.ok) {
          throw new Error(result.message || "تعذر تحميل المنتجات.")
        }

        const loaded: Product[] = [
          ...(Array.isArray(result.courses)
            ? result.courses.map((course: Record<string, unknown>) => ({
                id: String(course.id || ""),
                type: "course" as const,
                title: String(course.title || ""),
                subtitle: String(course.shortDescription || ""),
                description: String(course.description || ""),
                price: Number(course.price || 0),
                meta: `${String(course.duration || "")}${
                  course.lessonsCount ? ` · ${String(course.lessonsCount)} درس` : ""
                }`,
              }))
            : []),
          ...(Array.isArray(result.books)
            ? result.books.map((book: Record<string, unknown>) => ({
                id: String(book.id || ""),
                type: "book" as const,
                title: String(book.title || ""),
                subtitle: String(book.shortDescription || ""),
                description: String(book.description || ""),
                price: Number(book.price || 0),
                meta: "كتاب رقمي",
              }))
            : []),
        ].filter((item) => item.id && item.title && item.price > 0)

        setProducts(loaded)

        if (loaded.length > 0) {
          const id = searchParams.get("id")
          const type = searchParams.get("type")
          const matched = loaded.find((product) => product.id === id && product.type === type)
          setProductKey(makeKey(matched || loaded[0]))
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "تعذر تحميل المنتجات.")
        setProducts([])
      } finally {
        setProductsLoading(false)
      }
    }

    void loadProducts()
  }, [searchParams])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedProduct) return

    setError("")
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      productId: selectedProduct.id,
      productType: selectedProduct.type,
      productTitle: selectedProduct.title,
      amount: selectedProduct.price,
      customerName: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      paymentMethod,
      userId,
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.message || "تعذر إتمام الطلب.")
      router.push(`/checkout/success?orderId=${encodeURIComponent(result.orderId)}`)
    } catch (checkoutError) {
      const message = checkoutError instanceof Error ? checkoutError.message : "حدث خطأ غير متوقع."
      setError(message)
      router.push(`/checkout/failed?reason=${encodeURIComponent(message)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <aside className="rounded-[2.5rem] border border-border bg-card p-6 shadow-xl md:p-8">
              <Link
                href={selectedProduct?.type === "course" ? "/courses" : "/books"}
                className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"
              >
                <ArrowRight className="h-4 w-4" /> العودة إلى المنتجات
              </Link>

              <div className="rounded-[2rem] bg-primary p-6 text-primary-foreground">
                <Sparkles className="h-8 w-8 text-accent" />
                <p className="mt-8 text-sm font-bold text-primary-foreground/70">ملخص الطلب</p>
                <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{selectedProduct?.title || ""}</h1>
                <p className="mt-3 leading-7 text-primary-foreground/78">{selectedProduct?.subtitle || ""}</p>
              </div>

              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-muted p-4">
                  <span>النوع</span>
                  <strong className="text-foreground">
                    {selectedProduct?.type === "course" ? "كورس / برنامج" : "كتاب / ملف رقمي"}
                  </strong>
                </div>
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-muted p-4">
                  <span>التفاصيل</span>
                  <strong className="text-right text-foreground">{selectedProduct?.meta || "-"}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/10 p-4">
                  <span className="font-bold text-foreground">الإجمالي</span>
                  <strong className="latin text-3xl text-primary">
                    {selectedProduct?.price?.toLocaleString("en-US") || "0"} EGP
                  </strong>
                </div>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" /> سيتم مراجعة الطلب واعتماده خلال وقت قصير.
                </p>
                <p className="flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-accent" /> بياناتك محمية وتستخدم فقط لإتمام الطلب.
                </p>
              </div>
            </aside>

            <section className="rounded-[2.5rem] border border-border bg-card p-6 shadow-xl md:p-8">
              {productsLoading ? (
                <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
              ) : products.length === 0 ? (
                <p className="text-muted-foreground">لا توجد منتجات متاحة للشراء الآن.</p>
              ) : (
                <form className="grid gap-5" onSubmit={handleSubmit}>
                  <div>
                    <p className="eyebrow">الدفع</p>
                    <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">أكملي بيانات الطلب</h2>
                    <p className="mt-3 leading-8 text-muted-foreground">
                      بعد إرسال الطلب ستظهر حالته في حسابك كـ قيد المراجعة حتى اعتماد الدفع.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>اختيار المنتج</Label>
                    <Select value={productKey} onValueChange={setProductKey}>
                      <SelectTrigger className="h-12 rounded-2xl bg-background">
                        <SelectValue placeholder="اختاري المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={makeKey(product)} value={makeKey(product)}>
                            {product.title} — {product.price.toLocaleString("en-US")} ج.م
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <Input id="name" name="name" required className="h-12 rounded-2xl bg-background" placeholder="اكتبي اسمك" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف / واتساب</Label>
                      <Input id="phone" name="phone" required className="h-12 rounded-2xl bg-background" placeholder="+20..." />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="h-12 rounded-2xl bg-background"
                      placeholder="name@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>طريقة الدفع</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="h-12 rounded-2xl bg-background">
                        <SelectValue placeholder="اختاري طريقة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">تحويل أو تأكيد يدوي</SelectItem>
                        <SelectItem value="paymob">Paymob</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {error ? (
                    <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">
                      {error}
                    </p>
                  ) : null}

                  <Button
                    disabled={isSubmitting || !selectedProduct}
                    type="submit"
                    className="h-12 rounded-full bg-[var(--burgundy)] text-base text-primary-foreground hover:bg-[var(--burgundy)]/90"
                  >
                    <CreditCard className="h-5 w-5" />
                    {isSubmitting ? "جاري إرسال الطلب..." : "إرسال الطلب"}
                  </Button>
                </form>
              )}
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
