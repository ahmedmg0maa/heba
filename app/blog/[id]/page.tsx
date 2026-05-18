import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { posts } from "@/lib/site-data"

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const post = posts.find((item) => item.id === id) ?? posts[0]
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await params
  const post = posts.find((item) => item.id === id)
  if (!post) notFound()

  return (
    <>
      <Header />
      <main dir="rtl">
        <article>
          <section className="pt-20 section-padding soft-gradient sm:pt-24">
            <div className="container-brand max-w-4xl">
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4 rotate-180" /> العودة للمقالات</Link>
              <p className="eyebrow mt-8">{post.category}</p>
              <h1 className="mt-5 text-5xl font-black leading-tight text-foreground sm:text-6xl">{post.title}</h1>
              <p className="mt-6 text-xl leading-9 text-muted-foreground">{post.excerpt}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> {post.date}</span>
                <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> {post.readTime}</span>
              </div>
            </div>
          </section>

          <section className="section-padding">
            <div className="container-brand max-w-4xl">
              <div className="prose prose-lg max-w-none rounded-[2.5rem] border border-border bg-card p-8 leading-9 text-muted-foreground shadow-xl prose-headings:text-foreground md:p-12 dark:prose-invert">
                <p>أحيانًا لا يكون المطلوب أن نعرف إجابة جديدة، بل أن نصمت بما يكفي لنسمع الإجابة التي كانت موجودة من البداية. الوعي يبدأ حين نتوقف عن الهروب من الداخل وننظر إليه بصدق ورحمة.</p>
                <h2>الوعي ليس قسوة على النفس</h2>
                <p>هناك فرق كبير بين أن تراقبي نفسك لتفهميها، وأن تراقبيها لتحاكميها. في المساحة الأولى يظهر الشفاء، وفي الثانية يزداد الضغط. لذلك تبدأ الرحلة دائمًا من نبرة السؤال: هل أسأل لأفهم أم لألوم؟</p>
                <h2>كيف نبدأ عمليًا؟</h2>
                <p>ابدئي بتسمية الشعور كما هو. لا تحاولي تجميله أو إنكاره. اكتبي: أشعر الآن بـ... ثم اسألي: ماذا يحتاج هذا الشعور؟ هذا السؤال الصغير قد يفتح بابًا كبيرًا للاتصال بالذات.</p>
                <blockquote>كل شعور لا نسمعه يتحول إلى ضجيج. وكل شعور نسمعه يتحول إلى رسالة.</blockquote>
                <p>بعدها اختاري خطوة واحدة صغيرة: راحة، محادثة صادقة، حدود أو طلب دعم. التغيير الحقيقي لا يبدأ من قرارات ضخمة، بل من أفعال صغيرة تتكرر بوعي.</p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" className="rounded-full"><Share2 className="h-4 w-4" /> مشاركة المقال</Button>
                <Link href="/booking"><Button className="rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">احجزي جلسة فهم أعمق</Button></Link>
              </div>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
