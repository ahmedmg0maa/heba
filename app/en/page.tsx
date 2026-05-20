import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpen, Layers3, MessageCircleHeart } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Heba El Sharif | English Introduction",
  description: "A brief English introduction to Heba El Sharif and her Arabic-first platform.",
}

export default function EnglishPage() {
  return (
    <main className="min-h-screen bg-background text-foreground" dir="ltr">
      <header className="border-b border-border bg-card/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/images/heba-logo.webp" alt="Heba El Sharif" width={52} height={52} className="h-11 w-11 object-contain" />
            <div>
              <p className="text-lg font-black">Heba El Sharif</p>
              <p className="text-xs text-muted-foreground">Arabic-first awareness platform</p>
            </div>
          </Link>
          <Link href="/">
            <Button variant="outline" className="rounded-full bg-transparent">
              Arabic
            </Button>
          </Link>
        </div>
      </header>

      <section className="soft-gradient px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div>
            <p className="eyebrow">English Introduction</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight sm:text-6xl">
              A calm, premium space for practical inner growth.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              Heba El Sharif offers coaching, programs, and digital resources that help women build emotional clarity,
              grounded choices, and lasting balance in real life.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-5 py-4 text-sm leading-7 text-muted-foreground">
            This is an Arabic-first platform. English content is provided as a brief introduction.
          </div>
        </div>
      </section>

      <section id="about" className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <h2 className="text-3xl font-black">About Heba</h2>
          <p className="mt-4 max-w-4xl leading-8 text-muted-foreground">
            Heba is a certified life coach and writer. Her approach combines emotional awareness with practical,
            step-by-step action so growth can be felt in daily decisions, relationships, and self-trust.
          </p>
        </div>
      </section>

      <section id="overview" className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-5 md:grid-cols-3">
          <article className="rounded-[1.6rem] border border-border bg-card p-6 shadow-sm">
            <MessageCircleHeart className="h-7 w-7 text-accent" />
            <h3 className="mt-4 text-xl font-black">Services</h3>
            <p className="mt-2 leading-7 text-muted-foreground">
              1:1 coaching sessions focused on clarity, boundaries, and aligned action.
            </p>
          </article>
          <article className="rounded-[1.6rem] border border-border bg-card p-6 shadow-sm">
            <Layers3 className="h-7 w-7 text-accent" />
            <h3 className="mt-4 text-xl font-black">Courses</h3>
            <p className="mt-2 leading-7 text-muted-foreground">
              Structured Arabic programs that turn insight into practical implementation.
            </p>
          </article>
          <article className="rounded-[1.6rem] border border-border bg-card p-6 shadow-sm">
            <BookOpen className="h-7 w-7 text-accent" />
            <h3 className="mt-4 text-xl font-black">Books</h3>
            <p className="mt-2 leading-7 text-muted-foreground">
              Digital books and guides designed to support continued reflection and progress.
            </p>
          </article>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm">
          <h2 className="text-3xl font-black">Continue on the Arabic Platform</h2>
          <p className="mx-auto mt-3 max-w-3xl leading-8 text-muted-foreground">
            For full content, active catalog details, and the complete experience, continue in Arabic.
          </p>
          <Link href="/" className="mt-6 inline-flex">
            <Button className="h-12 rounded-full bg-[var(--burgundy)] px-7 text-primary-foreground hover:bg-[var(--burgundy)]/90">
              Continue in Arabic
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-4 py-8 text-sm sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>(c) {new Date().getFullYear()} Heba El Sharif. All rights reserved.</p>
          <div className="flex gap-4 text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link href="/" className="hover:text-primary">
              Arabic Site
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
