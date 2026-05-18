import Link from "next/link"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ProductCardProps = {
  title: string
  subtitle: string
  description: string
  meta: string
  price: string
  badge?: string
  href: string
  features?: string[]
  featured?: boolean
}

export function ProductCard({ title, subtitle, description, meta, price, badge, href, features = [], featured }: ProductCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-[2rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(23,53,65,0.12)]",
        featured ? "border-accent bg-primary text-primary-foreground" : "border-border bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {badge && (
            <span className={cn("mb-4 inline-flex rounded-full px-3 py-1 text-xs font-bold", featured ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground")}>
              {badge}
            </span>
          )}
          <h3 className="text-2xl font-black leading-tight">{title}</h3>
          <p className={cn("mt-2 text-sm font-semibold", featured ? "text-primary-foreground/75" : "text-accent")}>{subtitle}</p>
        </div>
        <p className="rounded-full border border-current/20 px-3 py-1 text-xs font-bold">{meta}</p>
      </div>

      <p className={cn("mt-5 flex-1 text-sm leading-7", featured ? "text-primary-foreground/78" : "text-muted-foreground")}>{description}</p>

      {features.length > 0 && (
        <ul className="mt-5 grid gap-2">
          {features.slice(0, 4).map((feature) => (
            <li key={feature} className={cn("flex items-center gap-2 text-sm", featured ? "text-primary-foreground/86" : "text-foreground/80")}>
              <CheckCircle2 className="size-4 text-accent" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-current/10 pt-5">
        <p className="text-xl font-black">{price}</p>
        <Link href={href}>
          <Button variant={featured ? "secondary" : "default"} className="rounded-full">
            التفاصيل
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
      </div>
    </article>
  )
}
