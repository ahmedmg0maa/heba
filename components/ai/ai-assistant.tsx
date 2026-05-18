"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarCheck, ChevronRight, RotateCcw, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

type AssistantAction = { label: string; href: string; variant?: "primary" | "secondary" | "soft" }
type AssistantOption = { label: string; next: string }
type AssistantStep = {
  id: string
  title: string
  answer: string
  options?: AssistantOption[]
  actions?: AssistantAction[]
}

const steps: Record<string, AssistantStep> = {
  start: {
    id: "start",
    title: "المساعد الإرشادي",
    answer: "اختاري المسار المناسب، وسأوجهك مباشرة للصفحة المطلوبة.",
    options: [
      { label: "أريد حجز جلسة خاصة", next: "booking" },
      { label: "أريد كورس مناسب", next: "courses" },
      { label: "أريد كتابًا مناسبًا", next: "books" },
      { label: "أريد معرفة الأسعار", next: "pricing" },
    ],
  },
  booking: {
    id: "booking",
    title: "الحجز",
    answer: "يمكنكِ اختيار المدة واليوم والوقت المتاح ثم إرسال الطلب مباشرة.",
    actions: [{ label: "احجزي جلستك الخاصة", href: "/booking", variant: "primary" }],
  },
  courses: {
    id: "courses",
    title: "الكورسات",
    answer: "تصفحي الكورسات المتاحة، والمنتج المدفوع فقط سيظهر في حسابك.",
    actions: [
      { label: "كل الكورسات", href: "/courses", variant: "primary" },
      { label: "الذهاب للحساب", href: "/account", variant: "secondary" },
    ],
  },
  books: {
    id: "books",
    title: "الكتب",
    answer: "بعد الدفع واعتماد الطلب، يظهر التحميل داخل حسابك عند توفر الملف.",
    actions: [
      { label: "كل الكتب", href: "/books", variant: "primary" },
      { label: "الذهاب للحساب", href: "/account", variant: "secondary" },
    ],
  },
  pricing: {
    id: "pricing",
    title: "الأسعار",
    answer: "جلسة 60 دقيقة: 1200 ج.م\nجلسة 90 دقيقة: 1500 ج.م",
    actions: [{ label: "الانتقال إلى الحجز", href: "/booking", variant: "primary" }],
  },
}

function actionClass(variant: AssistantAction["variant"]) {
  if (variant === "primary") return "bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90"
  if (variant === "secondary") return "bg-primary text-primary-foreground hover:bg-primary/90"
  return "border border-border bg-card text-foreground hover:border-accent hover:text-accent"
}

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [stepId, setStepId] = useState("start")
  const [history, setHistory] = useState<string[]>([])

  const step = useMemo(() => steps[stepId] || steps.start, [stepId])
  const canGoBack = history.length > 0

  function goTo(next: string) {
    setHistory((current) => [...current, stepId])
    setStepId(next)
  }

  function goBack() {
    setHistory((current) => {
      const copy = [...current]
      const previous = copy.pop()
      setStepId(previous || "start")
      return copy
    })
  }

  function reset() {
    setHistory([])
    setStepId("start")
  }

  return (
    <div className="fixed bottom-4 left-4 z-[70]" dir="rtl">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 text-right shadow-lg transition hover:-translate-y-0.5"
          aria-label="فتح المساعد الإرشادي"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground">
            ؟
          </span>
          <span className="hidden sm:block">
            <span className="block text-xs font-black text-foreground">المساعد الإرشادي</span>
            <span className="block text-[10px] font-semibold text-muted-foreground">خيارات مباشرة بدون ذكاء اصطناعي</span>
          </span>
        </button>
      ) : (
        <section className="flex h-[min(460px,calc(100vh-32px))] w-[min(330px,calc(100vw-20px))] flex-col overflow-hidden rounded-[1.35rem] border border-border bg-card/95 shadow-xl">
          <header className="bg-primary px-3.5 py-2.5 text-primary-foreground">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-black sm:text-sm">المساعد الإرشادي</h2>
                <p className="text-[11px] text-primary-foreground/85">توجيه سريع وليس دردشة ذكاء اصطناعي مباشر</p>
              </div>
              <div className="flex items-center gap-1.5">
                {canGoBack ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex size-7 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                    aria-label="رجوع"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-7 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                  aria-label="إغلاق"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="rounded-[1rem] border border-border bg-background p-3.5">
              <p className="inline-flex items-center gap-2 text-xs font-black text-primary">
                <Sparkles className="size-3.5" />
                {step.title}
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground">{step.answer}</p>
            </div>

            {step.options?.length ? (
              <div className="mt-4 grid gap-2">
                {step.options.map((option) => (
                  <button
                    key={`${step.id}-${option.next}-${option.label}`}
                    type="button"
                    onClick={() => goTo(option.next)}
                    className="flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-right text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
                  >
                    <span>{option.label}</span>
                    <ArrowLeft className="size-4" />
                  </button>
                ))}
              </div>
            ) : null}

            {step.actions?.length ? (
              <div className="mt-4 grid gap-2">
                {step.actions.map((action) => (
                  <Link
                    key={`${action.href}-${action.label}`}
                    href={action.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-black transition",
                      actionClass(action.variant),
                    )}
                  >
                    {action.label}
                    <ArrowLeft className="size-3.5" />
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <footer className="border-t border-border bg-secondary/35 p-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-black text-foreground transition hover:bg-secondary/80"
              >
                <RotateCcw className="size-4" />
                ابدئي من جديد
              </button>
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--burgundy)] px-4 py-2 text-xs font-black text-primary-foreground transition hover:bg-[var(--burgundy)]/90"
              >
                <CalendarCheck className="size-4" />
                احجزي جلسة
              </Link>
            </div>
          </footer>
        </section>
      )}
    </div>
  )
}
