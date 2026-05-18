import { NextResponse } from "next/server"

export const runtime = "nodejs"

type Action = { label: string; href: string; tone?: "primary" | "secondary" | "soft" }

const GUIDE_LABEL = "مساعد إرشادي"

function clean(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word))
}

function actionsFor(text: string): Action[] {
  if (containsAny(text, ["حجز", "جلسة", "موعد"])) {
    return [
      { label: "احجزي جلستك الخاصة", href: "/booking", tone: "primary" },
      { label: "الأسعار", href: "/booking", tone: "soft" },
    ]
  }

  if (containsAny(text, ["كتاب", "كتب"])) {
    return [
      { label: "كل الكتب", href: "/books", tone: "primary" },
      { label: "الذهاب للحساب", href: "/account", tone: "secondary" },
    ]
  }

  if (containsAny(text, ["كورس", "برنامج", "تعلم"])) {
    return [
      { label: "كل الكورسات", href: "/courses", tone: "primary" },
      { label: "الذهاب للحساب", href: "/account", tone: "secondary" },
    ]
  }

  return [
    { label: "استكشفي الخدمات", href: "/services", tone: "primary" },
    { label: "احجزي جلسة", href: "/booking", tone: "secondary" },
  ]
}

function guideReplyFor(text: string) {
  if (containsAny(text, ["حجز", "جلسة", "موعد"])) {
    return "اختاري المدة والموعد المناسبين، وستظهر لكِ المواعيد المتاحة مباشرة داخل صفحة الحجز."
  }
  if (containsAny(text, ["كتاب", "كتب"])) {
    return "تصفحي قسم الكتب المتاحة حاليًا، وبعد الدفع وتفعيل الطلب سيظهر التحميل داخل حسابك."
  }
  if (containsAny(text, ["كورس", "برنامج", "تعلم"])) {
    return "تصفحي الكورسات النشطة، وبعد تفعيل الطلب المدفوع سيظهر رابط الدخول داخل حسابك."
  }
  if (containsAny(text, ["سعر", "تكلفة"])) {
    return "أسعار الجلسات: 60 دقيقة — 1200 ج.م، و90 دقيقة — 1500 ج.م."
  }
  return "اختاري المسار الأقرب لاحتياجك، وسنوجّهك مباشرة للصفحة المناسبة."
}

async function generateWithOpenAI(text: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini"
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "أنتِ مساعدة عربية هادئة للمنصة. قدمي إجابة موجزة ودافئة، وابتعدي عن الادعاءات غير المؤكدة.",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "input_text", text }],
        },
      ],
      max_output_tokens: 220,
    }),
  })

  if (!response.ok) return null
  const payload = (await response.json()) as { output_text?: string }
  const outputText = clean(payload.output_text, 600)
  if (!outputText) return null
  return outputText
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: string }
    const text = clean(body.text)
    if (!text) {
      return NextResponse.json({ ok: false, message: "يرجى كتابة سؤالك أولًا." }, { status: 400 })
    }

    const aiReply = await generateWithOpenAI(text).catch(() => null)
    if (aiReply) {
      return NextResponse.json({
        ok: true,
        mode: "ai",
        assistantLabel: "مساعد ذكي",
        reply: aiReply,
        suggestedActions: actionsFor(text),
      })
    }

    return NextResponse.json({
      ok: true,
      mode: "guide",
      assistantLabel: GUIDE_LABEL,
      reply: guideReplyFor(text),
      suggestedActions: actionsFor(text),
    })
  } catch {
    return NextResponse.json({ ok: false, message: "تعذر تشغيل المساعد الآن." }, { status: 500 })
  }
}
