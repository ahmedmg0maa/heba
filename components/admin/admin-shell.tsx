"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, Calendar, Eye, Home, Layers3, LogOut, Menu, MessageSquare, ShoppingCart, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "لوحة التحكم", href: "/admin", icon: Home },
  { name: "الحجوزات", href: "/admin/bookings", icon: Calendar },
  { name: "الطلبات", href: "/admin/orders", icon: ShoppingCart },
  { name: "الكورسات", href: "/admin/courses", icon: Layers3 },
  { name: "الكتب", href: "/admin/books", icon: BookOpen },
  { name: "سجل الوصول", href: "/admin/access-logs", icon: Eye },
  { name: "الرسائل", href: "/admin/messages", icon: MessageSquare },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {open ? (
        <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur lg:hidden" onClick={() => setOpen(false)} />
      ) : null}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-72 border-l border-border bg-card transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <Link href="/admin" className="text-xl font-black text-primary">
              إدارة هبة الشريف
            </Link>
            <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="إغلاق القائمة">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" /> {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold">لوحة الفريق</p>
                <p className="text-xs text-muted-foreground">إدارة الحجوزات والطلبات والمنتجات</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-2xl text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" /> خروج
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pr-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/85 px-4 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="فتح القائمة">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="flex-1 text-lg font-bold">
            {navigation.find((item) => pathname === item.href)?.name ?? "لوحة التحكم"}
          </h1>
          <Link href="/" className="text-sm font-bold text-muted-foreground hover:text-primary">
            عرض الموقع
          </Link>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
