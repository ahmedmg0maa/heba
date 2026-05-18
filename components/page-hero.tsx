import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type PageHeroProps = {
  eyebrow: string
  title: string
  description: string
  ctaHref?: string
  ctaLabel?: string
}

export function PageHero({ eyebrow, title, description, ctaHref, ctaLabel }: PageHeroProps) {
  return (
    <section className="luxury-gradient pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div className="container-brand">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-9 text-muted-foreground sm:text-xl">{description}</p>
          {ctaHref && ctaLabel && (
            <Link
              href={ctaHref}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--burgundy)] px-7 py-3 text-sm font-bold text-primary-foreground shadow-xl shadow-[rgba(122,36,51,0.16)] transition hover:-translate-y-1"
            >
              {ctaLabel}
              <ArrowLeft className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
