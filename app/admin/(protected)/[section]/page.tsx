import Link from "next/link"
import { ArrowRight } from "lucide-react"

const sectionLinks: Record<string, { title: string; href: string; description: string }> = {
  bookings: {
    title: "الحجوزات",
    href: "/admin/bookings",
    description: "عرض المواعيد وتحديث حالة كل حجز.",
  },
  orders: {
    title: "الطلبات",
    href: "/admin/orders",
    description: "متابعة الطلبات وتحديث حالة الدفع.",
  },
  courses: {
    title: "الكورسات",
    href: "/admin/courses",
    description: "إدارة الكورسات وتحديث الحالة والمحتوى.",
  },
  books: {
    title: "الكتب",
    href: "/admin/books",
    description: "إدارة الكتب وروابط الملفات.",
  },
  messages: {
    title: "الرسائل",
    href: "/admin/messages",
    description: "مراجعة رسائل الزوار الواردة.",
  },
}

type PageProps = { params: Promise<{ section: string }> }

export default async function AdminSectionPage({ params }: PageProps) {
  const { section } = await params
  const sectionData = sectionLinks[section]

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">{sectionData ? sectionData.title : "قسم غير متاح"}</h1>
        <p className="mt-2 text-muted-foreground">
          {sectionData ? sectionData.description : "يمكنك العودة إلى لوحة الإدارة الرئيسية."}
        </p>
      </div>
      <Link
        href={sectionData?.href || "/admin"}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition hover:border-accent hover:text-accent"
      >
        الانتقال الآن
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
