"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { BookOpen, CalendarDays, ExternalLink, LogOut, ShieldCheck, UserRound, WalletCards } from "lucide-react"
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, updateDoc } from "firebase/firestore"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFirebaseClientAuth, getFirebaseClientDb, hasFirebasePublicConfig } from "@/lib/firebase/client"
import { buildWhatsAppUrl } from "@/lib/support"

type AccountProfile = {
  uid: string
  name: string
  email: string
  phone: string
  createdAt?: string
}

type UserOrder = {
  id: string
  orderNumber: string
  productType: string
  productId: string
  itemId?: string
  productSlug?: string
  productTitle: string
  amount: number
  status: string
  createdAt?: string
}

type UserBooking = {
  id: string
  customerName: string
  email: string
  phone: string
  duration: number
  amount: number
  status: string
  date?: string
  time?: string
  createdAt?: string
}

type AccountSummaryResponse = {
  ok: boolean
  message?: string
  profile?: AccountProfile
  orders?: UserOrder[]
  bookings?: UserBooking[]
  paidBooks?: UserOrder[]
  paidCourses?: UserOrder[]
}

type CourseProgressSummary = {
  courseId: string
  courseTitle?: string
  progressPercent: number
  completedLessonsCount: number
  totalLessons: number
  lastLessonId: string
  updatedAt: string
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function toNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function orderStatusLabel(status: string) {
  if (status === "paid") return "مدفوع"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

function bookingStatusLabel(status: string) {
  if (status === "approved") return "تم قبول الحجز"
  if (status === "completed") return "تمت الجلسة"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

function orderTypeLabel(type: string) {
  if (type === "course") return "كورس"
  if (type === "book") return "كتاب"
  return "منتج"
}

function resolveAccountName(user: User, profileName?: string) {
  const nameFromProfile = text(profileName)
  if (nameFromProfile) return nameFromProfile
  const authName = text(user.displayName)
  if (authName) return authName
  const email = text(user.email)
  if (email) return email
  return user.uid
}

export default function AccountPage() {
  const [authReady, setAuthReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [bookings, setBookings] = useState<UserBooking[]>([])
  const [paidBooks, setPaidBooks] = useState<UserOrder[]>([])
  const [paidCourses, setPaidCourses] = useState<UserOrder[]>([])
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, CourseProgressSummary>>({})
  const [loadingCourseProgress, setLoadingCourseProgress] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profilePhone, setProfilePhone] = useState("")

  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const supportWhatsappUrl = useMemo(() => {
    const latestOrderId = orders[0]?.id || ""
    const latestBookingId = bookings[0]?.id || ""
    const message = `مرحبًا، أحتاج مساعدة في حسابي.${latestOrderId ? ` رقم الطلب: ${latestOrderId}.` : ""}${latestBookingId ? ` رقم الحجز: ${latestBookingId}.` : ""}`
    return buildWhatsAppUrl(message)
  }, [bookings, orders])

  useEffect(() => {
    if (!hasFirebasePublicConfig()) {
      setAuthReady(true)
      return
    }

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
    async function loadSummary(user: User) {
      setLoadingData(true)
      setError("")
      try {
        const token = await user.getIdToken()
        const response = await fetch("/api/account/summary", {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const result = (await response.json()) as AccountSummaryResponse
        if (!response.ok || !result.ok) {
          throw new Error(result.message || "تعذر تحميل بيانات الحساب الآن. يرجى المحاولة لاحقًا.")
        }

        const loadedProfile: AccountProfile = {
          uid: text(result.profile?.uid) || user.uid,
          name: text(result.profile?.name) || resolveAccountName(user, result.profile?.name),
          email: text(result.profile?.email) || normalizeEmail(text(user.email)),
          phone: text(result.profile?.phone),
          createdAt: text(result.profile?.createdAt),
        }

        setProfile(loadedProfile)
        setProfilePhone(loadedProfile.phone)
        setOrders(Array.isArray(result.orders) ? result.orders : [])
        setBookings(Array.isArray(result.bookings) ? result.bookings : [])
        setPaidBooks(Array.isArray(result.paidBooks) ? result.paidBooks : [])
        setPaidCourses(Array.isArray(result.paidCourses) ? result.paidCourses : [])
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "تعذر تحميل بيانات الحساب الآن. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.",
        )
      } finally {
        setLoadingData(false)
      }
    }

    if (!currentUser) {
      setProfile(null)
      setOrders([])
      setBookings([])
      setPaidBooks([])
      setPaidCourses([])
      setCourseProgressMap({})
      setLoadingCourseProgress(false)
      setProfilePhone("")
      return
    }

    void loadSummary(currentUser)
  }, [currentUser])

  useEffect(() => {
    async function loadCourseProgress(user: User, courseIds: string[]) {
      setLoadingCourseProgress(true)
      try {
        const token = await user.getIdToken()
        const response = await fetch(`/api/account/course-progress?courseIds=${encodeURIComponent(courseIds.join(","))}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const result = (await response.json()) as { ok: boolean; progress?: CourseProgressSummary[]; message?: string }
        if (!response.ok || !result.ok) {
          throw new Error(result.message || "تعذر تحميل تقدم الكورسات الآن.")
        }

        const progressItems = Array.isArray(result.progress) ? result.progress : []
        const nextMap: Record<string, CourseProgressSummary> = {}
        for (const item of progressItems) {
          const key = text(item.courseId)
          if (!key) continue
          nextMap[key] = item
        }
        setCourseProgressMap(nextMap)
      } catch (progressError) {
        console.error("[account] failed to load course progress:", progressError)
        setCourseProgressMap({})
      } finally {
        setLoadingCourseProgress(false)
      }
    }

    if (!currentUser) return

    const courseIds = Array.from(new Set(paidCourses.map((item) => text(item.productId)).filter(Boolean)))
    if (!courseIds.length) {
      setCourseProgressMap({})
      setLoadingCourseProgress(false)
      return
    }

    void loadCourseProgress(currentUser, courseIds)
  }, [currentUser, paidCourses])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setActionLoading(true)

    const auth = getFirebaseClientAuth()
    if (!auth) {
      setActionLoading(false)
      setError("خدمة الحساب غير متاحة حاليًا.")
      return
    }

    try {
      await signInWithEmailAndPassword(auth, normalizeEmail(loginEmail), loginPassword)
      setSuccess("تم تسجيل الدخول بنجاح.")
    } catch {
      setError("تعذر تسجيل الدخول. تأكدي من البريد وكلمة المرور.")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setActionLoading(true)

    const auth = getFirebaseClientAuth()
    const db = getFirebaseClientDb()
    if (!auth || !db) {
      setActionLoading(false)
      setError("خدمة الحساب غير متاحة حاليًا.")
      return
    }

    try {
      const name = text(registerName)
      const email = normalizeEmail(registerEmail)
      const phone = text(registerPhone)
      if (!name) {
        setError("يرجى إدخال الاسم الكامل.")
        setActionLoading(false)
        return
      }
      if (!email) {
        setError("يرجى إدخال بريد إلكتروني صالح.")
        setActionLoading(false)
        return
      }

      const credential = await createUserWithEmailAndPassword(auth, email, registerPassword)
      await updateProfile(credential.user, { displayName: name })

      const now = new Date().toISOString()
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        name,
        email,
        phone,
        createdAt: now,
        updatedAt: now,
      })

      setSuccess("تم إنشاء الحساب بنجاح.")
      setRegisterPassword("")
    } catch {
      setError("تعذر إنشاء الحساب. تأكدي من صحة البيانات.")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleLogout() {
    setError("")
    setSuccess("")
    const auth = getFirebaseClientAuth()
    if (!auth) return
    await signOut(auth)
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!currentUser || !profile) return

    const db = getFirebaseClientDb()
    if (!db) {
      setError("تعذر تحديث بيانات الحساب الآن.")
      return
    }

    setActionLoading(true)
    setError("")
    setSuccess("")
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        phone: text(profilePhone),
        email: normalizeEmail(profile.email),
        updatedAt: new Date().toISOString(),
      })
      setProfile({ ...profile, phone: text(profilePhone) })
      setSuccess("تم تحديث بيانات الحساب بنجاح.")
    } catch {
      setError("تعذر تحديث بيانات الحساب.")
    } finally {
      setActionLoading(false)
    }
  }

  if (!authReady) {
    return (
      <>
        <Header />
        <main className="pt-20 section-padding sm:pt-24" dir="rtl">
          <div className="container-brand">
            <div className="rounded-[2rem] border border-border bg-card p-8 text-center text-muted-foreground">جارٍ تحميل الحساب...</div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!currentUser) {
    return (
      <>
        <Header />
        <main className="pt-20 section-padding soft-gradient sm:pt-24" dir="rtl">
          <div className="container-brand grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <section className="rounded-[2.2rem] border border-border bg-card p-6 shadow-xl md:p-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserRound className="h-7 w-7" />
              </div>
              <h1 className="mt-5 text-4xl font-black text-foreground sm:text-5xl">حسابك الشخصي</h1>
              <p className="mt-4 leading-8 text-muted-foreground">سجّلي الدخول لمتابعة حجوزاتك وطلباتك ومنتجاتك المفعّلة.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background p-4 text-center">
                  <BookOpen className="mx-auto h-6 w-6 text-accent" />
                  <p className="mt-2 text-sm font-bold text-foreground">كورساتي</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4 text-center">
                  <CalendarDays className="mx-auto h-6 w-6 text-accent" />
                  <p className="mt-2 text-sm font-bold text-foreground">حجوزاتي</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4 text-center">
                  <WalletCards className="mx-auto h-6 w-6 text-accent" />
                  <p className="mt-2 text-sm font-bold text-foreground">طلباتي</p>
                </div>
              </div>
            </section>

            <section className="rounded-[2.2rem] border border-border bg-card p-6 shadow-xl md:p-8">
              <Tabs defaultValue="login">
                <TabsList className="mb-6 grid w-full grid-cols-2 rounded-full bg-muted p-1">
                  <TabsTrigger value="login" className="rounded-full">
                    تسجيل الدخول
                  </TabsTrigger>
                  <TabsTrigger value="register" className="rounded-full">
                    إنشاء حساب
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form className="grid gap-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">البريد الإلكتروني</Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        className="h-12 rounded-2xl bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">كلمة المرور</Label>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        className="h-12 rounded-2xl bg-background"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={actionLoading}
                      className="h-12 rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90"
                    >
                      {actionLoading ? "جارٍ تسجيل الدخول..." : "دخول"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form className="grid gap-4" onSubmit={handleRegister}>
                    <div className="space-y-2">
                      <Label htmlFor="register-name">الاسم</Label>
                      <Input
                        id="register-name"
                        required
                        value={registerName}
                        onChange={(event) => setRegisterName(event.target.value)}
                        className="h-12 rounded-2xl bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">البريد الإلكتروني</Label>
                      <Input
                        id="register-email"
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(event) => setRegisterEmail(event.target.value)}
                        className="h-12 rounded-2xl bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">الهاتف</Label>
                      <Input
                        id="register-phone"
                        value={registerPhone}
                        onChange={(event) => setRegisterPhone(event.target.value)}
                        className="h-12 rounded-2xl bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">كلمة المرور</Label>
                      <Input
                        id="register-password"
                        type="password"
                        required
                        minLength={6}
                        value={registerPassword}
                        onChange={(event) => setRegisterPassword(event.target.value)}
                        className="h-12 rounded-2xl bg-background"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={actionLoading}
                      className="h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {actionLoading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 rounded-2xl border border-accent/25 bg-accent/10 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mb-2 h-5 w-5 text-accent" />
                كل بيانات الحساب مرتبطة بطلباتك وحجوزاتك الحقيقية فقط.
              </div>

              {error ? <p className="mt-4 rounded-2xl bg-destructive/10 p-3 text-sm font-bold text-destructive">{error}</p> : null}
              {success ? (
                <p className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 p-3 text-sm font-bold text-foreground">{success}</p>
              ) : null}
            </section>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="pt-20 section-padding sm:pt-24" dir="rtl">
        <div className="container-brand">
          <section className="rounded-[2.2rem] border border-border bg-card p-6 shadow-xl md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">حسابي</p>
                <h1 className="mt-3 text-4xl font-black text-foreground sm:text-5xl">
                  مرحبًا، {profile?.name || resolveAccountName(currentUser)}
                </h1>
                <p className="mt-3 text-muted-foreground">{profile?.email || normalizeEmail(text(currentUser.email))}</p>
              </div>
              <div className="flex gap-3">
                <Link href="/booking">
                  <Button className="rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">
                    احجزي جلسة
                  </Button>
                </Link>
                <Button variant="outline" className="rounded-full bg-transparent" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  خروج
                </Button>
              </div>
            </div>
          </section>

          {error ? <p className="mt-4 rounded-2xl bg-destructive/10 p-3 text-sm font-bold text-destructive">{error}</p> : null}
          {success ? (
            <p className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 p-3 text-sm font-bold text-foreground">{success}</p>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">حجوزاتي</p>
              <p className="mt-2 text-3xl font-black text-foreground latin">{bookings.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">طلباتي</p>
              <p className="mt-2 text-3xl font-black text-foreground latin">{orders.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">كورساتي</p>
              <p className="mt-2 text-3xl font-black text-foreground latin">{paidCourses.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">كتبي</p>
              <p className="mt-2 text-3xl font-black text-foreground latin">{paidBooks.length}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-[2rem] border border-border bg-card p-6">
              <h2 className="text-2xl font-black text-foreground">كورساتي</h2>
              {loadingData ? <p className="mt-4 text-muted-foreground">جارٍ التحميل...</p> : null}
              {!loadingData && paidCourses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-muted/10 mt-4">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                  <p className="text-muted-foreground font-bold">لا توجد كورسات مفعّلة في حسابكِ حالياً.</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm mx-auto leading-6">
                    استكشفي برامجنا التدريبية المتميزة وابدئي رحلة التعلم والتطور الذاتي اليوم.
                  </p>
                  <Link href="/courses" className="inline-block mt-4">
                    <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                      استكشاف الكورسات
                    </Button>
                  </Link>
                </div>
              ) : null}
              <div className="mt-4 grid gap-3">
                {paidCourses.map((item) => {
                  const progress = courseProgressMap[text(item.productId)] || null
                  const progressPercent = progress?.progressPercent ?? 0
                  const completedLessons = progress?.completedLessonsCount ?? 0
                  const totalLessons = progress?.totalLessons ?? 0

                  return (
                    <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                    <p className="font-bold text-foreground">{item.productTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {orderStatusLabel(item.status)} · {toNumber(item.amount).toLocaleString("ar-EG")} ج.م
                    </p>
                    <div className="mt-3 rounded-xl border border-border/80 bg-card px-3 py-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{loadingCourseProgress ? "جاري التحديث..." : `${completedLessons} / ${totalLessons || 0} دروس`}</span>
                        <span className="font-bold text-foreground">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="mt-2 h-1.5 rounded-full" />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/account/protected/course/${item.productId}`} className="inline-flex text-sm font-bold text-primary">
                        متابعة التعلم
                      </Link>
                      <Link href={`/courses/${item.productId}`} className="text-sm text-muted-foreground hover:text-primary">
                        تفاصيل الكورس
                      </Link>
                    </div>
                    </article>
                  )
                })}
              </div>
            </section>

            <section className="rounded-[2rem] border border-border bg-card p-6">
              <h2 className="text-2xl font-black text-foreground">كتبي</h2>
              {loadingData ? <p className="mt-4 text-muted-foreground">جارٍ التحميل...</p> : null}
              {!loadingData && paidBooks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-muted/10 mt-4">
                  <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                  <p className="text-muted-foreground font-bold">لا توجد كتب مفعّلة في حسابكِ حالياً.</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm mx-auto leading-6">
                    تصفحي مكتبتنا المميزة من الكتب الرقمية واكتشفي معارف جديدة تثري حياتكِ.
                  </p>
                  <Link href="/books" className="inline-block mt-4">
                    <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                      تصفح الكتب
                    </Button>
                  </Link>
                </div>
              ) : null}
              <div className="mt-4 grid gap-3">
                {paidBooks.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                    <p className="font-bold text-foreground">{item.productTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {orderStatusLabel(item.status)} · {toNumber(item.amount).toLocaleString("ar-EG")} ج.م
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/books/${item.productId}`} className="inline-flex text-sm font-bold text-primary">
                        عرض الكتاب
                      </Link>
                      <Link href={`/account/protected/book/${item.productId}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                        فتح الكتاب المحمي
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-8 rounded-[2rem] border border-border bg-card p-6">
            <h2 className="text-2xl font-black text-foreground">حجوزاتي</h2>
            {loadingData ? <p className="mt-4 text-muted-foreground">جارٍ التحميل...</p> : null}
            {!loadingData && bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-muted/10 mt-4">
                <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                <p className="text-muted-foreground font-bold">لا توجد حجوزات نشطة بعد.</p>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm mx-auto leading-6">
                  احجزي جلستكِ الاستشارية الأولى الآن لبدء التخطيط وتلقي الدعم والتمكين الفردي.
                </p>
                <Link href="/booking" className="inline-block mt-4">
                  <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                    حجز جلسة جديدة
                  </Button>
                </Link>
              </div>
            ) : null}
            <div className="mt-4 grid gap-3">
              {bookings.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                  <p className="font-bold text-foreground">
                    جلسة {toNumber(item.duration)} دقيقة · {toNumber(item.amount).toLocaleString("ar-EG")} ج.م
                  </p>
                  <p className="mt-2 text-xs">
                    <span className="rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">{bookingStatusLabel(item.status)}</span>
                    {item.date ? <span className="mr-2 text-muted-foreground">{item.date}</span> : null}
                    {item.time ? <span className="mr-2 text-muted-foreground">{item.time}</span> : null}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-border bg-card p-6">
            <h2 className="text-2xl font-black text-foreground">طلباتي</h2>
            {loadingData ? <p className="mt-4 text-muted-foreground">جارٍ التحميل...</p> : null}
            {!loadingData && orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-muted/10 mt-4">
                <WalletCards className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                <p className="text-muted-foreground font-bold">لا توجد طلبات شراء مسجلة.</p>
                <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm mx-auto leading-6">
                  عند شرائكِ لأحد الكتب أو الكورسات الرقمية، ستظهر تفاصيل طلباتكِ هنا لمتابعة حالة التفعيل.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link href="/books">
                    <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                      الكتب
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                      الكورسات
                    </Button>
                  </Link>
                </div>
              </div>
            ) : null}
            <div className="mt-4 grid gap-3">
              {orders.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                  <p className="font-bold text-foreground">{item.productTitle}</p>
                  <p className="mt-2 text-xs">
                    <span className="rounded-full bg-muted px-2 py-1 font-bold text-foreground">{orderTypeLabel(item.productType)}</span>
                    <span className="mr-2 rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">{orderStatusLabel(item.status)}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground latin">{toNumber(item.amount).toLocaleString("ar-EG")} ج.م</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-border bg-card p-6">
            <h2 className="text-2xl font-black text-foreground">بياناتي</h2>
            <form className="mt-4 grid gap-4 sm:max-w-md" onSubmit={handleProfileSave}>
              <div className="space-y-2">
                <Label htmlFor="account-email">البريد الإلكتروني</Label>
                <Input id="account-email" value={profile?.email || ""} disabled className="h-11 rounded-xl bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-phone">الهاتف</Label>
                <Input
                  id="account-phone"
                  value={profilePhone}
                  onChange={(event) => setProfilePhone(event.target.value)}
                  className="h-11 rounded-xl bg-background"
                />
              </div>
              <Button type="submit" disabled={actionLoading} className="h-11 rounded-full bg-primary text-primary-foreground">
                {actionLoading ? "جارٍ الحفظ..." : "حفظ البيانات"}
              </Button>
            </form>
          </section>

          <section className="mt-8 rounded-[2rem] border border-border bg-card p-6">
            <h2 className="text-2xl font-black text-foreground">الدعم</h2>
            <p className="mt-3 text-muted-foreground">إذا احتجت أي مساعدة في الطلبات أو التفعيل، فريق الدعم متاح لك.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/contact">
                <Button className="rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90">
                  تواصلي مع الدعم
                </Button>
              </Link>
              {supportWhatsappUrl ? (
                <a
                  href={supportWhatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-bold text-foreground hover:border-primary hover:text-primary"
                >
                  واتساب الدعم
                </a>
              ) : null}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
