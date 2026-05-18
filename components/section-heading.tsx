import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: "center" | "start"
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-right", className)}>
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
      <h2 className="text-3xl font-black leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>}
    </div>
  )
}
