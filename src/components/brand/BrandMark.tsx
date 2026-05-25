import Link from 'next/link'
import { BRAND } from '@/constants/design'

type BrandMarkSize = 'sm' | 'md' | 'lg'

interface BrandMarkProps {
  href?: string
  size?: BrandMarkSize
  showText?: boolean
  className?: string
}

const sizes: Record<BrandMarkSize, { mark: string; title: string; subtitle: string }> = {
  sm: { mark: 'h-10 w-10 text-lg', title: 'text-base', subtitle: 'text-[9px]' },
  md: { mark: 'h-12 w-12 text-xl', title: 'text-xl', subtitle: 'text-[10px]' },
  lg: { mark: 'h-16 w-16 text-3xl', title: 'text-3xl', subtitle: 'text-xs' },
}

function Mark({ size = 'md' }: { size?: BrandMarkSize }) {
  return (
    <span
      className={`brand-mark-gradient relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/30 text-ivory shadow-soft ${sizes[size].mark}`}
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,.38),transparent_38%)]" />
      <span className="relative font-black leading-none">هـ</span>
      <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
    </span>
  )
}

export default function BrandMark({ href = '/', size = 'md', showText = true, className = '' }: BrandMarkProps) {
  const content = (
    <span className={`group inline-flex items-center gap-3 ${className}`}>
      <Mark size={size} />
      {showText ? (
        <span className="min-w-0">
          <span className={`block font-black leading-none text-charcoal transition group-hover:text-petrol ${sizes[size].title}`}>
            {BRAND.arName}
          </span>
          <span className={`mt-1 block font-bold tracking-[0.22em] text-warm-gray ${sizes[size].subtitle}`}>
            HEBA ELSHERIF
          </span>
        </span>
      ) : null}
    </span>
  )

  if (!href) return content

  return (
    <Link href={href} aria-label="العودة إلى الرئيسية">
      {content}
    </Link>
  )
}
