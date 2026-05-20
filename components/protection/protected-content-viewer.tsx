"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFirebaseClientAuth } from "@/lib/firebase/client"

type ProtectedProductType = "book" | "course"
type ContentKind = "video" | "pdf" | "file"

type AccessResponse = {
  ok: boolean
  message?: string
  productTitle?: string
  url?: string
  expiresAt?: string
  contentKind?: ContentKind
  previewable?: boolean
  openLabel?: string
  legalNoticePrimary?: string
  legalNoticeSecondary?: string
  trace?: {
    userId: string
    email: string
    generatedAt: string
  }
}

const PERSONAL_USE_NOTICE = "هذا المحتوى للاستخدام الشخصي فقط."
const WATERMARK_NOTICE = "قد تظهر علامة مائية لحماية حقوق المحتوى."

function formatNow() {
  return new Date().toLocaleString("ar-EG")
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
  const [authReady, setAuthReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState("")
  const [previewable, setPreviewable] = useState(false)
  const [contentKind, setContentKind] = useState<ContentKind>("file")
  const [expiresAt, setExpiresAt] = useState("")
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")
  const [productTitle, setProductTitle] = useState(title)
  const [openLabel, setOpenLabel] = useState("فتح الرابط")
  const [noticePrimary] = useState(PERSONAL_USE_NOTICE)
  const [noticeSecondary] = useState(WATERMARK_NOTICE)
  const [trace, setTrace] = useState<{ userId: string; email: string; generatedAt: string } | null>(null)
  const [watermarkNow, setWatermarkNow] = useState(formatNow())

  const watermarkText = useMemo(() => {
    if (!trace?.email) return watermarkNow
    return `${trace.email} • ${watermarkNow}`
  }, [trace?.email, watermarkNow])

  const fetchAccess = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    setError("")

    try {
      const idToken = await currentUser.getIdToken()
      const response = await fetch(`/api/protected-content/${productType}/${encodeURIComponent(productId)}?mode=stream`, {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
        cache: "no-store",
      })
      const result = (await response.json()) as AccessResponse
      if (!response.ok || !result.ok || !result.url) {
        throw new Error(result.message || "تعذر تحميل المحتوى المحمي الآن.")
      }

      setUrl(result.contentKind === "pdf" ? withPdfViewerParams(result.url) : result.url)
      setPreviewable(Boolean(result.previewable))
      setContentKind(result.contentKind || "file")
      setExpiresAt(result.expiresAt || "")
      setProductTitle(result.productTitle || title)
      setOpenLabel(result.openLabel || "فتح الرابط")
      setTrace(result.trace || null)
    } catch (accessError) {
      setError(accessError instanceof Error ? accessError.message : "تعذر تحميل المحتوى المحمي الآن.")
    } finally {
      setLoading(false)
    }
  }, [currentUser, productId, productType, title])

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
    const timer = setInterval(() => setWatermarkNow(formatNow()), 30_000)
    return () => clearInterval(timer)
  }, [])

  async function handleOpen() {
    if (!url) return
    window.open(url, "_blank", "noopener,noreferrer")
  }

  async function handleDownload() {
    if (!currentUser) return
    try {
      const token = await currentUser.getIdToken()
      window.location.assign(
        `/api/protected-content/${productType}/${encodeURIComponent(productId)}?mode=download&token=${encodeURIComponent(token)}`,
      )
    } catch {
      setWarning("تعذر بدء التحميل حاليًا. يرجى المحاولة مرة أخرى.")
      setTimeout(() => setWarning(""), 2500)
    }
  }

  return (
    <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm" dir="rtl">
      {warning ? (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-[13px] font-medium leading-6 text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          {warning}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          جارٍ تجهيز المحتوى المحمي...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">{error}</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">المحتوى المحمي</p>
            <h2 className="mt-1 text-xl font-black text-foreground">{productTitle}</h2>
            <div className="mt-3 rounded-xl border border-border/80 bg-muted/40 px-4 py-3">
              <p className="text-sm leading-7 text-foreground">{noticePrimary}</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{noticeSecondary}</p>
            </div>
            <p className="mt-3 inline-flex rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground">
              العلامة المائية: {watermarkText}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" className="rounded-full" onClick={handleOpen}>
              {openLabel}
              <ExternalLink className="h-4 w-4" />
            </Button>

            {productType === "book" ? (
              <Button type="button" variant="outline" className="rounded-full bg-transparent" onClick={handleDownload}>
                تحميل الكتاب
              </Button>
            ) : null}

            <span className="text-xs text-muted-foreground">
              انتهاء صلاحية الرابط الحالي: {expiresAt ? new Date(expiresAt).toLocaleTimeString("ar-EG") : "-"}
            </span>
          </div>

          {previewable ? (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
              {contentKind === "video" ? (
                <video src={url} controls className="h-[440px] w-full bg-black object-contain" />
              ) : (
                <iframe
                  src={url}
                  title={productTitle}
                  className="h-[520px] w-full bg-black"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              )}
              <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-md border border-white/20 bg-black/35 px-3 py-2 text-xs font-bold text-white/90">
                {watermarkText}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
