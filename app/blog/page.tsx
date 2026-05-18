import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Search } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { posts } from "@/lib/site-data"

export const metadata: Metadata = {
  title: "المقالات",
  description: "مقالات هبة الشريف في الوعي بالذات، العلاقات، والاتزان النفسي.",
}

export default function BlogPage() {
  return (
    <>
      <Header />
      <main dir="rtl">
        <section className="pt-20 section-padding soft-gradient sm:pt-24">
          <div className="container-brand text-center">
            <p className="eyebrow">المقالات</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-tight text-foreground sm:text-6xl">كلمات تساعدك على رؤية الداخل بوضوح.</h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-9 text-muted-foreground">مقالات مختارة حول الوعي، المشاعر، العلاقات، والعودة إلى الذات.</p>
            <div className="relative mx-auto mt-8 max-w-xl">
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="ابحثي في المقالات..." className="h-12 rounded-full bg-card pr-12" />
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-brand grid gap-7 lg:grid-cols-3">
            {posts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.id}`} className={`group rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${index === 0 ? "lg:col-span-2" : ""}`}>
                <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">{post.category}</span>
                <h2 className="mt-6 text-3xl font-black leading-tight text-foreground group-hover:text-primary">{post.title}</h2>
                <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">{post.excerpt}</p>
                <div className="mt-7 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> {post.date}</span>
                  <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> {post.readTime}</span>
                  <span className="inline-flex items-center gap-2 font-bold text-primary">قراءة المقال <ArrowLeft className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
