"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SessionResponse = {
  ok?: boolean
  configured?: boolean
  authenticated?: boolean
  reason?: string
  errors?: string[]
}

type LoginResponse = {
  ok?: boolean
  message?: string
}

const SESSION_CHECK_TIMEOUT_MS = 7000
const GENERIC_LOGIN_ERROR = "تعذر تسجيل الدخول. تأكدي من كلمة المرور ثم حاولي مرة أخرى."
const SESSION_CHECK_ERROR = "تعذر التحقق من الجلسة الحالية. تأكدي من الاتصال وحاولي مرة أخرى."
const SESSION_CHECK_TIMEOUT_ERROR = "استغرق التحقق من الجلسة وقتًا أطول من المتوقع. حاولي مرة أخرى."
const SESSION_INVALID_ERROR = "بيانات الجلسة غير صالحة. تم تجاهلها وعرض نموذج الدخول."

const BROKEN_SESSION_REASONS = new Set(["invalid_format", "invalid_signature", "invalid_payload", "expired", "issued_in_future"])

function isSessionResponse(value: unknown): value is SessionResponse {
  if (!value || typeof value !== "object") return false
  const session = value as Record<string, unknown>
  if (typeof session.authenticated !== "boolean") return false
  if (typeof session.configured !== "boolean") return false

  if ("errors" in session) {
    if (!Array.isArray(session.errors)) return false
    if (session.errors.some((entry) => typeof entry !== "string")) return false
  }

  return true
}

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const querySetup = searchParams.get("setup") === "1"

  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [setupMode, setSetupMode] = useState(false)
  const [configErrors, setConfigErrors] = useState<string[]>([])

  const sessionCheckInFlightRef = useRef(false)
  const sessionCheckAbortRef = useRef<AbortController | null>(null)
  const redirectFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasSessionRedirectedRef = useRef(false)

  const setupMessage = useMemo(() => {
    if (!setupMode) return ""
    if (configErrors.length > 0) return configErrors[0]
    return "لوحة الإدارة غير مفعلة بالكامل. تحققي من متغيرات البيئة."
  }, [configErrors, setupMode])

  const clearRedirectFallbackTimeout = useCallback(() => {
    if (!redirectFallbackTimeoutRef.current) return
    clearTimeout(redirectFallbackTimeoutRef.current)
    redirectFallbackTimeoutRef.current = null
  }, [])

  const redirectToAdmin = useCallback(
    (source: "session" | "login") => {
      if (source === "session" && hasSessionRedirectedRef.current) return
      if (source === "session") hasSessionRedirectedRef.current = true

      clearRedirectFallbackTimeout()
      setIsRedirecting(true)
      redirectFallbackTimeoutRef.current = setTimeout(() => {
        setIsRedirecting(false)
      }, SESSION_CHECK_TIMEOUT_MS)
      router.replace("/admin")
      router.refresh()
    },
    [clearRedirectFallbackTimeout, router],
  )

  useEffect(() => {
    return () => {
      clearRedirectFallbackTimeout()
      if (sessionCheckAbortRef.current) {
        sessionCheckAbortRef.current.abort()
        sessionCheckAbortRef.current = null
      }
    }
  }, [clearRedirectFallbackTimeout])

  useEffect(() => {
    let cancelled = false
    setSetupMode(querySetup)

    if (sessionCheckInFlightRef.current) return
    sessionCheckInFlightRef.current = true

    async function clearSessionCookie() {
      try {
        await fetch("/api/admin/logout", {
          method: "POST",
          cache: "no-store",
          credentials: "include",
        })
      } catch {
        // Ignore cleanup failures and continue rendering the login form.
      }
    }

    async function checkSession() {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), SESSION_CHECK_TIMEOUT_MS)
      sessionCheckAbortRef.current = controller

      setCheckingSession(true)
      setError("")

      try {
        const response = await fetch("/admin/login/session", {
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        })

        let payload: unknown = null
        try {
          payload = await response.json()
        } catch {
          payload = null
        }
        if (cancelled) return

        if (!response.ok) {
          setError(SESSION_CHECK_ERROR)
          setConfigErrors([])
          setSetupMode(querySetup)
          setIsRedirecting(false)
          return
        }

        if (!isSessionResponse(payload)) {
          void clearSessionCookie()
          setError(SESSION_INVALID_ERROR)
          setConfigErrors([])
          setSetupMode(querySetup)
          setIsRedirecting(false)
          return
        }

        const result = payload
        const errors = Array.isArray(result.errors) ? result.errors.filter(Boolean) : []
        setConfigErrors(errors)
        setSetupMode(querySetup || !result.configured || errors.length > 0)

        if (result.authenticated === true) {
          setError("")
          redirectToAdmin("session")
          return
        }

        if (result.reason && BROKEN_SESSION_REASONS.has(result.reason)) {
          void clearSessionCookie()
        }
        setIsRedirecting(false)
      } catch (requestError) {
        if (cancelled) return
        const aborted =
          (requestError instanceof DOMException && requestError.name === "AbortError") ||
          (requestError instanceof Error && requestError.name === "AbortError") ||
          controller.signal.aborted

        setError(aborted ? SESSION_CHECK_TIMEOUT_ERROR : SESSION_CHECK_ERROR)
        setConfigErrors([])
        setSetupMode(querySetup)
        setIsRedirecting(false)
      } finally {
        clearTimeout(timeoutId)
        if (sessionCheckAbortRef.current === controller) {
          sessionCheckAbortRef.current = null
        }
        sessionCheckInFlightRef.current = false
        if (!cancelled) {
          setCheckingSession(false)
        }
      }
    }

    void checkSession()
    return () => {
      cancelled = true
      if (sessionCheckAbortRef.current) {
        sessionCheckAbortRef.current.abort()
        sessionCheckAbortRef.current = null
      }
      sessionCheckInFlightRef.current = false
    }
  }, [querySetup, redirectToAdmin])

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

      let result: LoginResponse = {}
      try {
        result = (await response.json()) as LoginResponse
      } catch {
        // Keep fallback message.
      }

      if (!response.ok || !result.ok) {
        throw new Error(result.message || GENERIC_LOGIN_ERROR)
      }

      redirectToAdmin("login")
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : GENERIC_LOGIN_ERROR)
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

          {checkingSession || isRedirecting ? (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-border bg-background p-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isRedirecting ? "جارِ التحويل إلى لوحة الإدارة..." : "جارِ التحقق من الجلسة..."}
            </div>
          ) : null}

          {setupMode ? (
            <div className="mb-5 rounded-2xl border border-accent/30 bg-accent/10 p-3 text-sm text-foreground">{setupMessage}</div>
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
                  disabled={checkingSession || isRedirecting || loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || checkingSession || isRedirecting}
              className="h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "جارِ الدخول..." : "دخول"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
