import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, CalendarHeart, Mail, MessageCircleHeart, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Heba El Sharif | Premium Awareness Platform",
  description:
    "A calm premium space for 1:1 coaching, practical programs, and digital books by Heba El Sharif.",
}

const navItems = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Courses", href: "#courses" },
  { label: "Books", href: "#books" },
  { label: "Contact", href: "#contact" },
]

export default function EnglishPage() {
  return (
    <main className="min-h-screen bg-background text-foreground" dir="ltr">
      <section className="luxury-gradient relative overflow-hidden px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[1.8rem] border border-border bg-card/85 px-5 py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/images/heba-logo.webp" alt="Heba El Sharif" width={56} height={56} className="h-12 w-12 object-contain" />
              <div>
                <p className="text-lg font-black">Heba El Sharif</p>
                <p className="text-xs text-accent">A journey of awareness back to yourself</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary hover:text-foreground">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" className="rounded-full bg-transparent">العربية</Button>
              </Link>
              <Link href="/booking">
                <Button className="rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">Book Session</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 py-16 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Awareness · Balance · Choice
            </div>
            <h1 className="text-5xl font-black leading-tight sm:text-6xl">
              Premium support for your
              <span className="block text-primary">inner clarity.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Heba El Sharif is a certified life coach and writer helping women move from emotional overwhelm to
              grounded decisions through practical, compassionate guidance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/booking">
                <Button className="h-12 rounded-full bg-[var(--burgundy)] px-7 text-primary-foreground hover:bg-[var(--burgundy)]/90">
                  <CalendarHeart className="h-5 w-5" />
                  Start With 1:1 Coaching
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline" className="h-12 rounded-full px-7">
                  Browse Courses (Arabic)
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card/80 p-5 shadow-xl backdrop-blur-md">
            <Image
              src="/images/heba-banner.jpeg"
              alt="Heba El Sharif"
              width={1600}
              height={900}
              className="rounded-[1.4rem] object-cover"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-background p-3 text-center text-sm font-bold">1:1 Coaching</div>
              <div className="rounded-xl bg-background p-3 text-center text-sm font-bold">Programs</div>
              <div className="rounded-xl bg-background p-3 text-center text-sm font-bold">Digital Books</div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section-padding">
        <div className="container-brand">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <p className="eyebrow">About Heba</p>
            <h2 className="mt-4 text-4xl font-black">A calm, practical approach to personal growth</h2>
            <p className="mt-4 max-w-4xl leading-8 text-muted-foreground">
              Heba combines reflective awareness with actionable steps. Every session, course, and book is designed to
              help you understand your patterns, regulate your emotions, and choose aligned actions in real life.
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="section-padding pt-0">
        <div className="container-brand grid gap-6 md:grid-cols-3">
          <article className="rounded-[1.6rem] border border-border bg-card p-6">
            <MessageCircleHeart className="h-8 w-8 text-accent" />
            <h3 className="mt-4 text-2xl font-black">1:1 Coaching</h3>
            <p className="mt-3 leading-7 text-muted-foreground">Private sessions focused on emotional clarity, boundaries, and life direction.</p>
          </article>
          <article className="rounded-[1.6rem] border border-border bg-card p-6">
            <Sparkles className="h-8 w-8 text-accent" />
            <h3 className="mt-4 text-2xl font-black">Practical Programs</h3>
            <p className="mt-3 leading-7 text-muted-foreground">Step-by-step learning journeys built around implementation, not just theory.</p>
          </article>
          <article className="rounded-[1.6rem] border border-border bg-card p-6">
            <BookOpen className="h-8 w-8 text-accent" />
            <h3 className="mt-4 text-2xl font-black">Books & Guides</h3>
            <p className="mt-3 leading-7 text-muted-foreground">Curated digital resources to support your personal development between sessions.</p>
          </article>
        </div>
      </section>

      <section id="courses" className="section-padding pt-0">
        <div className="container-brand">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <h2 className="text-3xl font-black">Courses</h2>
            <p className="mt-3 max-w-3xl leading-8 text-muted-foreground">
              Full course pages are currently in Arabic. You can still explore active programs and purchase securely.
            </p>
            <Link href="/courses" className="mt-6 inline-flex">
              <Button className="rounded-full">Open Courses (Arabic)</Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="books" className="section-padding pt-0">
        <div className="container-brand">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <h2 className="text-3xl font-black">Books</h2>
            <p className="mt-3 max-w-3xl leading-8 text-muted-foreground">
              Digital books are available through your account after payment confirmation and access activation.
            </p>
            <Link href="/books" className="mt-6 inline-flex">
              <Button className="rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">
                Open Books (Arabic)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="container-brand grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <p className="eyebrow">Coaching CTA</p>
            <h3 className="mt-3 text-3xl font-black">Ready for a focused conversation?</h3>
            <p className="mt-3 leading-8 text-muted-foreground">
              Book a private session to discuss your current challenge and receive a practical next-step plan.
            </p>
            <Link href="/booking" className="mt-6 inline-flex">
              <Button className="rounded-full">Book Now</Button>
            </Link>
          </div>
          <div id="contact" className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <p className="eyebrow">Contact CTA</p>
            <h3 className="mt-3 text-3xl font-black">Need help choosing the right path?</h3>
            <p className="mt-3 leading-8 text-muted-foreground">
              Reach out for support with bookings, orders, and finding the right course or book for your goals.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact">
                <Button className="rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="rounded-full bg-transparent">
                  Switch to Arabic
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-4 py-8 text-sm sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Heba El Sharif. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="/" className="text-muted-foreground hover:text-primary">Arabic Site</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
