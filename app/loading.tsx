import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-foreground" dir="rtl">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-xl">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
        <p className="mt-3 text-sm font-bold text-accent">هبة الشريف</p>
      </div>
    </div>
  )
}
