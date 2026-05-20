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
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFirebaseClientAuth, getFirebaseClientDb, hasFirebasePublicConfig } from "@/lib/firebase/client"
import { buildWhatsAppUrl } from "@/lib/support"

type AccountUser = {
  uid: string
  name: string
  email: string
  phone: string
  createdAt?: string
}

type UserOrder = {
  id: string
  orderNumber?: string
  productType: "course" | "book" | string
  productId: string
  productSlug?: string
  itemId?: string
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

function toISODate(value: unknown) {
  if (!value) return ""
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate() as Date
    return Number.isNaN(date.getTime()) ? "" : date.toISOString()
  }
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? "" : d.toISOString()
}

function toNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function resolveAccountName(user: User, storedName?: unknown) {
  const fromDoc = typeof storedName === "string" ? storedName.trim() : ""
  if (fromDoc) return fromDoc

  const fromAuth = typeof user.displayName === "string" ? user.displayName.trim() : ""
  if (fromAuth) return fromAuth

  const fromEmail = typeof user.email === "string" ? user.email.trim() : ""
  if (fromEmail) return fromEmail

  return user.uid
}

function bookingStatusLabel(status: string) {
  if (status === "approved") return "تم قبول الحجز"
  if (status === "completed") return "تمت الجلسة"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

function orderStatusLabel(status: string) {
  if (status === "paid") return "مدفوع"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

function orderTypeLabel(type: string) {
  if (type === "course") return "كورس"
  if (type === "book") return "كتاب"
  return "منتج"
}

function sortByCreatedAtDesc<T extends { createdAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => toISODate(b.createdAt).localeCompare(toISODate(a.createdAt)))
}

function mergeById<T extends { id: string }>(first: T[], second: T[]) {
  const map = new Map<string, T>()
  for (const item of [...first, ...second]) map.set(item.id, item)
  return Array.from(map.values())
}

function resolvePaidBookId(order: UserOrder, keyToBookId: Record<string, string>) {
  const itemId = String(order.itemId || "").trim()
  if (itemId) return itemId

  const productId = String(order.productId || "").trim()
  if (productId && keyToBookId[productId]) return keyToBookId[productId]
  if (productId) return productId

  const productSlug = String(order.productSlug || "").trim()
  if (productSlug && keyToBookId[productSlug]) return keyToBookId[productSlug]
  if (productSlug) return productSlug

  return ""
}

function mapOrdersFromSnapshot(snapshot: Awaited<ReturnType<typeof getDocs>>) {
  return snapshot.docs.map((item) => {
    const data = item.data() as Record<string, unknown>
    return {
      id: item.id,
      orderNumber: String(data.orderNumber || ""),
      productType: String(data.productType || "").toLowerCase(),
      productId: String(data.productId || "").trim(),
      productSlug: String(data.productSlug || "").trim(),
      itemId: String(data.itemId || "").trim(),
      productTitle: String(data.productTitle || ""),
      amount: toNumber(data.amount),
      status: String(data.status || "pending").toLowerCase(),
      createdAt: toISODate(data.createdAt),
    } as UserOrder
  })
}

function mapBookingsFromSnapshot(snapshot: Awaited<ReturnType<typeof getDocs>>) {
  return snapshot.docs.map((item) => {
    const data = item.data() as Record<string, unknown>
    return {
      id: item.id,
      customerName: String(data.customerName || ""),
      email: String(data.email || ""),
      phone: String(data.phone || ""),
      duration: toNumber(data.duration) || 60,
      amount: toNumber(data.amount),
      status: String(data.status || "pending").toLowerCase(),
      date: String(data.date || ""),
      time: String(data.time || ""),
      createdAt: toISODate(data.createdAt),
    } as UserBooking
  })
}

export default function AccountPage() {
  const [authReady, setAuthReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AccountUser | null>(null)
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [bookings, setBookings] = useState<UserBooking[]>([])
  const [bookLookup, setBookLookup] = useState<Record<string, string>>({})
  const [loadingData, setLoadingData] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [profilePhone, setProfilePhone] = useState("")

  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  const paidOrders = useMemo(() => orders.filter((item) => item.status === "paid"), [orders])
  const paidCourses = useMemo(() => paidOrders.filter((item) => item.productType === "course"), [paidOrders])
  const paidBooks = useMemo(() => paidOrders.filter((item) => item.productType === "book"), [paidOrders])
  const supportWhatsappUrl = useMemo(() => {
    const latestOrderId = orders[0]?.id || ""
    const latestBookingId = bookings[0]?.id || ""
    const message = `مرحبًا، أحتاج مساعدة في حسابي.${latestOrderId ? ` رقم الطلب: ${latestOrderId}.` : ""}${latestBookingId ? ` رقم الحجز: ${latestBookingId}.` : ""}`
    return buildWhatsAppUrl(message)
  }, [bookings, orders])

  useEffect(() => {
    let cancelled = false

    async function loadBookLookup() {
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" })
        const result = await response.json()
        if (!response.ok || !result?.ok || !Array.isArray(result.books)) return

        const lookup: Record<string, string> = {}
        for (const rawBook of result.books as Array<Record<string, unknown>>) {
          const id = String(rawBook.id || "").trim()
          const slug = String(rawBook.slug || "").trim()
          if (!id) continue
          lookup[id] = id
          if (slug) lookup[slug] = id
        }

        if (!cancelled) setBookLookup(lookup)
      } catch {
        if (!cancelled) setBookLookup({})
      }
    }

    void loadBookLookup()

    return () => {
      cancelled = true
    }
  }, [])

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
    async function loadAccountData(user: User) {
      const db = getFirebaseClientDb()
      if (!db) {
        setProfile(null)
        setOrders([])
        setBookings([])
        return
      }

      setLoadingData(true)
      setError("")
      try {
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        const baseProfile: AccountUser = {
          uid: user.uid,
          name: resolveAccountName(user),
          email: user.email || "",
          phone: "",
          createdAt: new Date().toISOString(),
        }

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            name: baseProfile.name,
            email: baseProfile.email,
            phone: "",
            createdAt: baseProfile.createdAt,
            updatedAt: baseProfile.createdAt,
          })
          setProfile(baseProfile)
          setProfilePhone("")
        } else {
          const data = userSnap.data() as Record<string, unknown>
          const loaded: AccountUser = {
            uid: user.uid,
            name: resolveAccountName(user, data.name),
            email: String(data.email || user.email || ""),
            phone: String(data.phone || ""),
            createdAt: toISODate(data.createdAt),
          }
          setProfile(loaded)
          setProfilePhone(loaded.phone)
        }

        const [ordersByUserResult, ordersByEmailResult, bookingsByUserResult, bookingsByEmailResult] = await Promise.allSettled([
          getDocs(query(collection(db, "orders"), where("userId", "==", user.uid))),
          user.email ? getDocs(query(collection(db, "orders"), where("email", "==", user.email))) : Promise.resolve(null),
          getDocs(query(collection(db, "bookings"), where("userId", "==", user.uid))),
          user.email ? getDocs(query(collection(db, "bookings"), where("email", "==", user.email))) : Promise.resolve(null),
        ])

        const ordersByUser =
          ordersByUserResult.status === "fulfilled" ? mapOrdersFromSnapshot(ordersByUserResult.value) : []
        const ordersByEmail =
          ordersByEmailResult.status === "fulfilled" && ordersByEmailResult.value
            ? mapOrdersFromSnapshot(ordersByEmailResult.value)
            : []
        const mergedOrders = sortByCreatedAtDesc(mergeById(ordersByUser, ordersByEmail))
        setOrders(mergedOrders)

        const bookingsByUser =
          bookingsByUserResult.status === "fulfilled" ? mapBookingsFromSnapshot(bookingsByUserResult.value) : []
        const bookingsByEmail =
          bookingsByEmailResult.status === "fulfilled" && bookingsByEmailResult.value
            ? mapBookingsFromSnapshot(bookingsByEmailResult.value)
            : []
        const mergedBookings = sortByCreatedAtDesc(mergeById(bookingsByUser, bookingsByEmail))
        setBookings(mergedBookings)

      } catch {
        setError("تعذر تحميل بيانات الحساب حاليًا.")
      } finally {
        setLoadingData(false)
      }
    }

    if (!currentUser) {
      setProfile(null)
      setOrders([])
      setBookings([])
      return
    }

    void loadAccountData(currentUser)
  }, [currentUser])

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
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword)
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
      const name = registerName.trim()
      if (!name) {
        setError("يرجى إدخال الاسم الكامل.")
        setActionLoading(false)
        return
      }

      const credential = await createUserWithEmailAndPassword(auth, registerEmail.trim(), registerPassword)
      await updateProfile(credential.user, { displayName: name })

      const now = new Date().toISOString()
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        name,
        email: registerEmail.trim(),
        phone: registerPhone.trim(),
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
      setError("خدمة الحساب غير متاحة حاليًا.")
      return
    }

    setActionLoading(true)
    setError("")
    setSuccess("")
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        phone: profilePhone.trim(),
        updatedAt: new Date().toISOString(),
      })
      setProfile({ ...profile, phone: profilePhone.trim() })
      setSuccess("تم تحديث بيانات الحساب بنجاح.")
    } catch {
      setError("تعذر تحديث بيانات الحساب.")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBookDownload(orderId: string) {
    if (!currentUser) return
    setError("")

    try {
      setDownloadingOrderId(orderId)
      const token = await currentUser.getIdToken()
      globalThis.location.assign(`/api/download/${encodeURIComponent(orderId)}?token=${encodeURIComponent(token)}`)
    } catch {
      setError("تعذر بدء تحميل الكتاب الآن. يرجى المحاولة مرة أخرى.")
    } finally {
      setDownloadingOrderId(null)
    }
  }

  if (!authReady) {
    return (
      <>
        <Header />
        <main className="pt-20 section-padding sm:pt-24" dir="rtl">
          <div className="container-brand">
            <div className="rounded-[2rem] border border-border bg-card p-8 text-center text-muted-foreground">جاري تحميل الحساب...</div>
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
                      {actionLoading ? "جاري تسجيل الدخول..." : "دخول"}
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
                      {actionLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
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
                <p className="mt-3 text-muted-foreground">{profile?.email}</p>
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
              <p className="text-sm text-muted-foreground">كورسات مفعّلة</p>
              <p className="mt-2 text-3xl font-black text-foreground latin">{paidCourses.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">كتب مفعّلة</p>
              <p className="mt-2 text-3xl font-black text-foreground latin">{paidBooks.length}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-[2rem] border border-border bg-card p-6">
              <h2 className="text-2xl font-black text-foreground">كورساتي</h2>
              {loadingData ? <p className="mt-4 text-muted-foreground">جاري التحميل...</p> : null}
              {!loadingData && paidCourses.length === 0 ? <p className="mt-4 text-muted-foreground">لا توجد كورسات مفعّلة بعد.</p> : null}
              <div className="mt-4 grid gap-3">
                {paidCourses.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                      <p className="font-bold text-foreground">{item.productTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {orderStatusLabel(item.status)} · {item.amount.toLocaleString("ar-EG")} EGP
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/account/protected/course/${item.productId}`} className="inline-flex text-sm font-bold text-primary">
                          عرض الكورس
                        </Link>
                        <Link href={`/courses/${item.productId}`} className="text-sm text-muted-foreground hover:text-primary">
                          تفاصيل الكورس
                        </Link>
                      </div>
                    </article>
                  ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-border bg-card p-6">
              <h2 className="text-2xl font-black text-foreground">كتبي</h2>
              {loadingData ? <p className="mt-4 text-muted-foreground">جاري التحميل...</p> : null}
              {!loadingData && paidBooks.length === 0 ? <p className="mt-4 text-muted-foreground">لا توجد كتب مفعّلة بعد.</p> : null}
              <div className="mt-4 grid gap-3">
                {paidBooks.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                      <p className="font-bold text-foreground">{item.productTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {orderStatusLabel(item.status)} · {item.amount.toLocaleString("ar-EG")} EGP
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/books/${resolvePaidBookId(item, bookLookup) || item.productId}`} className="inline-flex text-sm font-bold text-primary">
                          عرض الكتاب
                        </Link>
                        <Link href={`/account/protected/book/${resolvePaidBookId(item, bookLookup) || item.productId}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary">
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
            {loadingData ? <p className="mt-4 text-muted-foreground">جاري التحميل...</p> : null}
            {!loadingData && bookings.length === 0 ? <p className="mt-4 text-muted-foreground">لا توجد حجوزات بعد.</p> : null}
            <div className="mt-4 grid gap-3">
              {bookings.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                  <p className="font-bold text-foreground">
                    جلسة {item.duration} دقيقة · {item.amount.toLocaleString("ar-EG")} EGP
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
            {loadingData ? <p className="mt-4 text-muted-foreground">جاري التحميل...</p> : null}
            {!loadingData && orders.length === 0 ? <p className="mt-4 text-muted-foreground">لا توجد طلبات بعد.</p> : null}
            <div className="mt-4 grid gap-3">
              {orders.map((item) => (
                <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                  <p className="font-bold text-foreground">{item.productTitle}</p>
                  <p className="mt-2 text-xs">
                    <span className="rounded-full bg-muted px-2 py-1 font-bold text-foreground">{orderTypeLabel(item.productType)}</span>
                    <span className="mr-2 rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">{orderStatusLabel(item.status)}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground latin">{item.amount.toLocaleString("ar-EG")} EGP</p>
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
                {actionLoading ? "جاري الحفظ..." : "حفظ البيانات"}
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
