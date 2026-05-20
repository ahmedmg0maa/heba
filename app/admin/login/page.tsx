"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [setupMode, setSetupMode] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const querySetup = searchParams.get("setup") === "1"
    setSetupMode(querySetup)

    async function checkSession() {
      try {
        const response = await fetch("/admin/login/session", {
          cache: "no-store",
          credentials: "include",
        })
        const result = await response.json()
        if (!result.configured) setSetupMode(true)
        if (result.authenticated) {
          setError("")
          window.location.href = "/admin"
          return
        }
      } catch {
        // keep login form visible on network errors
      }
    }

    void checkSession()
  }, [searchParams])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      let result: { ok?: boolean; message?: string } = {}
      try {
        result = (await response.json()) as { ok?: boolean; message?: string }
      } catch {
        // keep result empty and use fallback error
      }
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "تعذر تسجيل الدخول. تأكدي من كلمة المرور ثم حاولي مرة أخرى.")
      }
      setError("")
      window.location.href = "/admin"
      return
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "تعذر تسجيل الدخول. تأكدي من كلمة المرور ثم حاولي مرة أخرى.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-black text-primary">
            هبة الشريف
          </Link>
          <p className="mt-2 text-muted-foreground">لوحة الإدارة</p>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-xl sm:p-8">
          <h1 className="mb-6 text-center text-2xl font-black text-foreground">دخول الإدارة</h1>

          {setupMode ? (
            <div className="mb-5 rounded-2xl border border-accent/30 bg-accent/10 p-3 text-sm text-foreground">
              لم يتم تفعيل لوحة الإدارة بعد.
            </div>
          ) : null}

          {error ? (
            <div className="mb-5 flex gap-2 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (error) setError("")
                  }}
                  className="h-12 rounded-2xl bg-background pr-10"
                  placeholder="أدخلي كلمة مرور الإدارة"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "جارٍ الدخول..." : "دخول"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
