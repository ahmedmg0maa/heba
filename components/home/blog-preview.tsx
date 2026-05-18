import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { posts } from "@/lib/site-data"

export function BlogPreview() {
  return (
    <section className="section-padding" dir="rtl">
      <div className="container-brand">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">المقالات</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-foreground sm:text-5xl">
              قراءة هادئة تفتح نافذة جديدة للوعي
            </h2>
          </div>
          <Link href="/blog"><Button variant="outline" className="rounded-full">كل المقالات <ArrowLeft className="h-4 w-4" /></Button></Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group rounded-[2rem] border border-border bg-card p-6 shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">{post.category}</span>
              <h3 className="mt-6 text-2xl font-extrabold leading-tight text-foreground group-hover:text-primary">{post.title}</h3>
              <p className="mt-4 leading-7 text-muted-foreground">{post.excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{post.date}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
