import { NextResponse } from "next/server"
import { addDocument, getFirebaseAdminErrorMessage } from "@/lib/firebase/admin"

export const runtime = "nodejs"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = text(body.name)
    const email = text(body.email)
    const phone = text(body.phone)
    const subject = text(body.subject)
    const message = text(body.message)

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, message: "برجاء إدخال الاسم والبريد والرسالة." }, { status: 400 })
    }

    const saved = await addDocument("messages", {
      name,
      email,
      phone,
      subject,
      message,
      status: "new",
    })

    if (!saved.ok || !saved.id) {
      return NextResponse.json(
        {
          ok: false,
          message: getFirebaseAdminErrorMessage(saved.error) || "تعذر إرسال الرسالة حاليًا. يرجى المحاولة مرة أخرى.",
        },
        { status: 503 },
      )
    }

    return NextResponse.json({ ok: true, messageId: saved.id })
  } catch {
    return NextResponse.json({ ok: false, message: "تعذر إرسال الرسالة." }, { status: 400 })
  }
}
