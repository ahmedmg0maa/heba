"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFirebaseClientAuth } from "@/lib/firebase/client"

type ProtectedProductType = "book" | "course"
type ContentKind = "video" | "pdf" | "file"

type AccessResponse = {
  ok: boolean
  message?: string
  url?: string
  expiresAt?: string
  contentKind?: ContentKind
  legalNotice?: string
  trace?: {
    userId: string
    email: string
    generatedAt: string
  }
}

const watermarkPositions = [
  "top-3 left-3",
  "top-3 right-3",
  "bottom-3 left-3",
  "bottom-3 right-3",
  "top-1/2 left-6 -translate-y-1/2",
  "top-1/2 right-6 -translate-y-1/2",
]

function formatNow() {
  return new Date().toLocaleString("ar-EG")
}

function isBlockedShortcut(event: KeyboardEvent) {
  const key = event.key.toLowerCase()
  const withCtrl = event.ctrlKey || event.metaKey
  if (key === "f12") return true
  if (withCtrl && (key === "s" || key === "p" || key === "u")) return true
  if (event.ctrlKey && event.shiftKey && key === "i") return true
  return false
}

function withPdfViewerParams(url: string) {
  if (!url.toLowerCase().includes(".pdf")) return url
  const separator = url.includes("#") ? "&" : "#"
  return `${url}${separator}toolbar=0&navpanes=0&scrollbar=1`
}

export function ProtectedContentViewer({
  productType,
  productId,
  title,
}: {
  productType: ProtectedProductType
  productId: string
  title: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState("")
  const [contentKind, setContentKind] = useState<ContentKind>("file")
  const [expiresAt, setExpiresAt] = useState("")
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")
  const [legalNotice, setLegalNotice] = useState(
    "هذا المحتوى مخصص للاستخدام الشخصي فقط. أي تصوير أو تسجيل أو إعادة نشر يعرض الحساب للإيقاف والمساءلة القانونية.",
  )
  const [trace, setTrace] = useState<{ userId: string; email: string; generatedAt: string } | null>(null)
  const [watermarkPosition, setWatermarkPosition] = useState(0)
  const [watermarkNow, setWatermarkNow] = useState(formatNow())

  const watermarkText = useMemo(() => {
    if (!trace) return `Guest • ${watermarkNow}`
    return `${trace.email} • ${trace.userId} • ${watermarkNow}`
  }, [trace, watermarkNow])

  const raiseWarning = useCallback((message: string) => {
    setWarning(message)
    const timeout = setTimeout(() => setWarning(""), 2800)
    return () => clearTimeout(timeout)
  }, [])

  const fetchAccess = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    setError("")
    try {
      const idToken = await currentUser.getIdToken()
      const response = await fetch(`/api/protected-content/${productType}/${encodeURIComponent(productId)}?mode=stream`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
        cache: "no-store",
      })
      const result = (await response.json()) as AccessResponse
      if (!response.ok || !result.ok || !result.url) {
        throw new Error(result.message || "تعذر تحميل المحتوى المحمي الآن.")
      }

      setUrl(result.contentKind === "pdf" ? withPdfViewerParams(result.url) : result.url)
      setContentKind(result.contentKind || "file")
      setExpiresAt(result.expiresAt || "")
      setLegalNotice(result.legalNotice || legalNotice)
      setTrace(result.trace || null)
    } catch (accessError) {
      setError(accessError instanceof Error ? accessError.message : "تعذر تحميل المحتوى المحمي الآن.")
    } finally {
      setLoading(false)
    }
  }, [currentUser, legalNotice, productId, productType])

  useEffect(() => {
    const auth = getFirebaseClientAuth()
    if (!auth) {
      setAuthReady(true)
      return
    }

    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setAuthReady(true)
    })
  }, [])

  useEffect(() => {
    if (!authReady) return
    if (!currentUser) {
      setLoading(false)
      setError("يجب تسجيل الدخول للوصول إلى المحتوى المدفوع.")
      return
    }
    void fetchAccess()
  }, [authReady, currentUser, fetchAccess])

  useEffect(() => {
    if (!expiresAt || !currentUser) return
    const expireMs = new Date(expiresAt).getTime()
    if (!Number.isFinite(expireMs)) return
    const refreshIn = Math.max(15_000, expireMs - Date.now() - 45_000)
    const timeout = setTimeout(() => void fetchAccess(), refreshIn)
    return () => clearTimeout(timeout)
  }, [currentUser, expiresAt, fetchAccess])

  useEffect(() => {
    const stampTimer = setInterval(() => setWatermarkNow(formatNow()), 30_000)
    const moveTimer = setInterval(() => {
      setWatermarkPosition((prev) => (prev + 1) % watermarkPositions.length)
    }, 8_000)
    return () => {
      clearInterval(stampTimer)
      clearInterval(moveTimer)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isBlockedShortcut(event)) return
      event.preventDefault()
      raiseWarning("تم تعطيل هذا الاختصار لحماية المحتوى المدفوع.")
    }

    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
        raiseWarning("تم إيقاف الفيديو مؤقتًا عند مغادرة الصفحة لحماية المحتوى.")
      }
    }

    const onContextMenu = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) return
      event.preventDefault()
      raiseWarning("النقر بالزر الأيمن معطل في وضع حماية المحتوى.")
    }

    window.addEventListener("keydown", onKeyDown)
    document.addEventListener("visibilitychange", onVisibilityChange)
    document.addEventListener("contextmenu", onContextMenu)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      document.removeEventListener("contextmenu", onContextMenu)
    }
  }, [raiseWarning])

  useEffect(() => {
    let devtoolsTriggeredAt = 0
    const timer = setInterval(() => {
      if (!videoRef.current) return
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth)
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight)
      const likelyDevtools = widthDiff > 240 || heightDiff > 240
      if (!likelyDevtools) return
      const now = Date.now()
      if (now - devtoolsTriggeredAt < 20_000) return
      devtoolsTriggeredAt = now
      if (!videoRef.current.paused) {
        videoRef.current.pause()
      }
      raiseWarning("تم إيقاف الفيديو مؤقتًا عند رصد تغيّر واجهة غير اعتيادي.")
    }, 5000)

    return () => clearInterval(timer)
  }, [raiseWarning])

  async function handleDownload() {
    if (!currentUser) return
    try {
      const token = await currentUser.getIdToken()
      window.location.assign(`/api/protected-content/${productType}/${encodeURIComponent(productId)}?mode=download&token=${encodeURIComponent(token)}`)
    } catch {
      raiseWarning("تعذر بدء التحميل حاليًا. يرجى المحاولة مرة أخرى.")
    }
  }

  return (
    <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm" dir="rtl">
      <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-3 text-sm leading-7 text-foreground">
        <p className="font-bold text-destructive">{legalNotice}</p>
        <p className="mt-2 text-muted-foreground">
          لا توجد تقنية تمنع التصوير أو التسجيل بنسبة 100%. يتم الاعتماد على ضبط الوصول + العلامة المائية + سجل التتبع.
        </p>
      </div>

      {warning ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          {warning}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          جاري تجهيز المحتوى المحمي...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="relative min-h-[440px] overflow-hidden rounded-2xl border border-border bg-black select-none"
            onContextMenu={(event) => event.preventDefault()}
          >
            {contentKind === "video" ? (
              <video
                ref={videoRef}
                src={url}
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                className="h-[440px] w-full bg-black object-contain"
                onContextMenu={(event) => event.preventDefault()}
              />
            ) : (
              <iframe
                src={url}
                title={title}
                className="h-[520px] w-full bg-black"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )}

            <div
              className={`pointer-events-none absolute z-20 rounded-md border border-white/20 bg-black/30 px-3 py-2 text-xs font-bold text-white/90 transition-all duration-700 ${watermarkPositions[watermarkPosition]}`}
            >
              {watermarkText}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" className="rounded-full" onClick={handleDownload}>
              تنزيل نسخة للوصول الشخصي
            </Button>
            <span className="text-xs text-muted-foreground">انتهاء صلاحية الرابط الحالي: {expiresAt ? new Date(expiresAt).toLocaleTimeString("ar-EG") : "-"}</span>
          </div>

          <div className="rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
            <p className="font-bold text-foreground">سياسات الحماية المفعلة</p>
            <p className="mt-1">تعطيل النقر الأيمن، تقليل الاختصارات الشائعة للنسخ/الحفظ، علامة مائية متحركة، وتسجيل وصول.</p>
          </div>
        </div>
      )}
    </section>
  )
}

