import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProtectedContentViewer } from "@/components/protection/protected-content-viewer"

type PageProps = { params: Promise<{ id: string }> }

export const dynamic = "force-dynamic"

export default async function ProtectedCoursePage({ params }: PageProps) {
  const { id } = await params

  return (
    <>
      <Header />
      <main className="pt-20 section-padding sm:pt-24" dir="rtl">
        <div className="container-brand space-y-5">
          <Link href="/account" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
            <ArrowRight className="h-4 w-4" />
            العودة إلى الحساب
          </Link>
          <h1 className="text-3xl font-black text-foreground">عارض الكورس المحمي</h1>
          <ProtectedContentViewer productType="course" productId={id} title={`course-${id}`} />
        </div>
      </main>
      <Footer />
    </>
  )
}

