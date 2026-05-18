import Image from "next/image"
import Link from "next/link"
import { brand } from "@/data/site"

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="العودة إلى الرئيسية">
      <div className="relative size-12 overflow-hidden rounded-2xl bg-[var(--cream)] ring-1 ring-border transition group-hover:scale-105">
        <Image src={brand.logo} alt={brand.arName} fill sizes="48px" className="object-contain p-1" priority />
      </div>
      {!compact && (
        <div className="leading-tight text-right">
          <p className="text-lg font-extrabold tracking-tight text-foreground">{brand.arName}</p>
          <p className="text-xs font-medium text-accent">{brand.shortTagline}</p>
        </div>
      )}
    </Link>
  )
}
