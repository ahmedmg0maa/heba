"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { brand } from "@/lib/site-data"

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok || !result.ok) throw new Error(result.message || "تعذر إرسال الرسالة.")
      setSent(true)
    } catch (contactError) {
      setError(contactError instanceof Error ? contactError.message : "حدث خطأ غير متوقع.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand text-center">
            <p className="eyebrow">تواصل</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight text-foreground sm:text-5xl lg:text-6xl">
              اكتبي لنا... وسنرد عليكِ بما يناسب رحلتك.
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              للاستفسار عن الجلسات، الورش، التعاونات الإعلامية، أو البرامج الخاصة.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="grid gap-4">
              {[
                { icon: Mail, label: "البريد", value: brand.email },
                { icon: Phone, label: "واتساب", value: brand.whatsapp },
                { icon: MapPin, label: "المكان", value: brand.location },
              ].map((item) => (
                <div key={item.label} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                  <item.icon className="h-7 w-7 text-accent" />
                  <p className="mt-5 text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-2 break-words text-xl font-bold text-foreground">{item.value}</p>
                </div>
              ))}
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-xl transition hover:-translate-y-1"
              >
                <MessageCircle className="h-7 w-7 text-accent" />
                <p className="mt-5 text-xl font-black">تواصل سريع عبر واتساب</p>
                <p className="mt-2 text-sm text-primary-foreground/75">يفتح في نافذة جديدة</p>
              </a>
            </div>

            <div className="rounded-[2.5rem] border border-border bg-card p-6 shadow-xl md:p-8">
              {sent ? (
                <div className="py-16 text-center">
                  <Send className="mx-auto h-14 w-14 text-primary" />
                  <h2 className="mt-6 text-3xl font-black text-foreground">تم إرسال الرسالة</h2>
                  <p className="mx-auto mt-4 max-w-md leading-8 text-muted-foreground">
                    استلمنا رسالتك بنجاح وسيتم الرد في أقرب وقت.
                  </p>
                  <Button className="mt-8 rounded-full" onClick={() => setSent(false)}>
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form className="grid gap-5" onSubmit={handleSubmit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم</Label>
                      <Input id="name" name="name" required className="h-12 rounded-2xl bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد</Label>
                      <Input id="email" name="email" type="email" required className="h-12 rounded-2xl bg-background" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">الهاتف (اختياري)</Label>
                    <Input id="phone" name="phone" className="h-12 rounded-2xl bg-background" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">الموضوع</Label>
                    <Input id="subject" name="subject" required className="h-12 rounded-2xl bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">الرسالة</Label>
                    <Textarea id="message" name="message" required className="min-h-40 rounded-2xl bg-background" />
                  </div>
                  {error && (
                    <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">
                      {error}
                    </p>
                  )}
                  <Button
                    disabled={isSubmitting}
                    type="submit"
                    className="h-12 rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90"
                  >
                    {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"} <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
