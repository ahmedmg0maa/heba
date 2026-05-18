import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CalendarHeart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "English Version",
  description: "English landing page for Heba El Sharif.",
}

export default function EnglishPage() {
  return (
    <main className="min-h-screen bg-background text-foreground" dir="ltr">
      <section className="luxury-gradient relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[1.5rem] border border-border bg-card/75 p-4 backdrop-blur-md">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/images/heba-logo.webp"
              alt="Heba El Sharif"
              width={56}
              height={56}
              className="h-12 w-12 object-contain"
            />
            <span>
              <span className="block text-lg font-bold">Heba El Sharif</span>
              <span className="text-sm text-accent">A journey of awareness back to yourself</span>
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-bold hover:border-accent hover:text-accent"
          >
            العربية
          </Link>
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-12 py-16 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Awareness · Balance · Choice
            </div>
            <p className="latin mb-4 text-sm font-bold uppercase tracking-[0.35em] text-accent">Heba El Sharif</p>
            <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              A journey of awareness
              <span className="block text-primary">back to yourself.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
              Certified life coach, self-awareness mentor, writer and novelist. Heba helps you understand your
              emotions, identify repeated patterns, and build a life with more clarity, peace and inner alignment.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/booking">
                <Button className="h-12 rounded-full bg-[var(--burgundy)] px-8 text-primary-foreground hover:bg-[var(--burgundy)]/90">
                  <CalendarHeart className="h-5 w-5" />
                  Book a Session
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="h-12 rounded-full px-8">
                  Explore Programs
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

            <div className="rounded-[2.5rem] border border-border bg-card/75 p-5 shadow-xl backdrop-blur-md">
            <Image
              src="/images/heba-banner.jpeg"
              alt="Heba El Sharif brand"
              width={1600}
              height={600}
              className="rounded-[2rem] object-cover"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["1:1 Coaching", "Courses", "Books & Workshops"].map((item) => (
                <div key={item} className="rounded-2xl bg-background p-4 text-center text-sm font-bold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
