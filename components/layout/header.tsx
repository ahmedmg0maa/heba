"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Menu, UserRound, X } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { navItems } from "@/data/site"
import { cn } from "@/lib/utils"

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-border/65 bg-background/90 backdrop-blur-md" dir="rtl">
      <div className="container-brand">
        <nav className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 lg:h-[4.5rem]">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card/85 text-foreground lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
            aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <div className="hidden items-center gap-1 justify-self-center lg:flex">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/80 hover:bg-secondary/70 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="justify-self-start">
            <BrandLogo compact />
          </div>

          <div className="flex items-center gap-2 justify-self-end">
            <div className="hidden items-center gap-2 sm:flex">
              <ThemeToggle />
              <Link href="/account" aria-label="حسابي">
                <Button variant="outline" size="icon" className="size-10 rounded-full bg-card/85">
                  <UserRound className="size-4" />
                </Button>
              </Link>
            </div>
            <Link href="/booking" className="hidden sm:inline-flex">
              <Button className="h-11 rounded-full bg-[var(--burgundy)] px-6 text-primary-foreground shadow-lg hover:bg-[var(--burgundy)]/90">
                احجزي جلستك
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      {isOpen ? (
        <div className="animate-in fade-in-0 slide-in-from-top-1 border-t border-border/65 bg-background/95 px-4 py-4 duration-200 lg:hidden">
          <div className="container-brand px-0">
            <div className="grid gap-2 rounded-[1.3rem] border border-border bg-card/85 p-3 shadow-sm">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/85 hover:bg-secondary/70 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}

              <div className="mt-1 grid grid-cols-3 gap-2">
                <ThemeToggle />
                <Link href="/account">
                  <Button variant="outline" className="h-11 w-full rounded-full bg-transparent">
                    حسابي
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button className="h-11 w-full rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">
                    احجزي الآن
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
