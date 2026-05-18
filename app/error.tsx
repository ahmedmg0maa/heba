"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6" dir="rtl">
      <div className="max-w-lg rounded-[2rem] border border-border bg-card p-8 text-center shadow-xl">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <p className="eyebrow mt-5">حدث خطأ</p>
        <h1 className="mt-3 text-4xl font-black">تعذر عرض الصفحة</h1>
        <p className="mt-4 leading-8 text-muted-foreground">جرّبي إعادة المحاولة أو العودة بعد قليل.</p>
        <Button className="mt-7 rounded-full" onClick={reset}>
          إعادة المحاولة
        </Button>
      </div>
    </main>
  )
}
