import Link from "next/link"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6" dir="rtl">
      <div className="max-w-lg rounded-[2rem] border border-border bg-card p-8 text-center shadow-xl">
        <SearchX className="mx-auto h-12 w-12 text-accent" />
        <p className="eyebrow mt-5">404</p>
        <h1 className="mt-3 text-4xl font-black">الصفحة غير موجودة</h1>
        <p className="mt-4 leading-8 text-muted-foreground">
          يمكنك العودة للرئيسية أو اختيار مسار مناسب من الخدمات والكورسات.
        </p>
        <Link href="/">
          <Button className="mt-7 rounded-full">العودة للرئيسية</Button>
        </Link>
      </div>
    </main>
  )
}
