'use client'

export const dynamic = 'force-dynamic'
import { useEffect, useMemo, useState } from 'react'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import BrandOrnament from '@/components/brand/BrandOrnament'
import PremiumEmptyState from '@/components/ui/PremiumEmptyState'
import PremiumSkeleton from '@/components/ui/PremiumSkeleton'
import { db } from '@/lib/firebase/client'
import { useAuth } from '@/hooks/useAuth'
import { formatArabicDate, formatEGP, getOrderStatusClass, getOrderStatusLabel } from '@/lib/utils/formatters'
import type { Order } from '@/types'

interface OrderWithProductTitle extends Order {
  productTitle: string
}

export default function DashboardOrdersPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderWithProductTitle[]>([])

  useEffect(() => {
    const userId = user?.uid
    if (!userId) return

    async function loadOrders() {
      setLoading(true)
      const ordersSnap = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId)))
      const userOrders = ordersSnap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })) as Order[]

      const ordersWithTitles = await Promise.all(
        userOrders.map(async (order) => {
          const collectionName = order.productType === 'course' ? 'courses' : 'books'
          const productSnap = await getDoc(doc(db, collectionName, order.productId))

          return {
            ...order,
            productTitle: productSnap.exists() ? String(productSnap.data().title || 'منتج غير محدد') : 'منتج غير متاح',
          }
        }),
      )

      ordersWithTitles.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt))
      setOrders(ordersWithTitles)
      setLoading(false)
    }

    loadOrders().catch((error) => {
      console.error('Dashboard orders error:', error)
      setLoading(false)
    })
  }, [user?.uid])

  const summary = useMemo(() => {
    return {
      total: orders.length,
      paid: orders.filter((order) => order.status === 'paid').length,
      pending: orders.filter((order) => order.status === 'pending' || order.status === 'payment_submitted').length,
      amount: orders.filter((order) => order.status === 'paid').reduce((sum, order) => sum + Number(order.amount || 0), 0),
    }
  }, [orders])

  if (loading) {
    return (
      <div className="space-y-4">
        <PremiumSkeleton className="h-56" />
        <PremiumSkeleton className="h-28" />
        <PremiumSkeleton className="h-28" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <PremiumEmptyState
        icon="◇"
        title="لا توجد طلبات بعد"
        description="أي طلب شراء كورس أو كتاب سيظهر هنا مع حالة الدفع وفتح الوصول."
        actionLabel="استكشفي المنتجات"
        actionHref="/courses"
      />
    )
  }

  return (
    <div className="space-y-8">
      <section className="premium-glow-border rounded-[2.5rem] border border-sand bg-ivory/90 p-6 shadow-premium backdrop-blur-sm lg:p-8">
        <BrandOrnament className="mb-5" />
        <p className="mini-label mb-3">طلباتي</p>
        <h2 className="text-4xl font-black leading-tight text-petrol md:text-5xl">سجل الشراء والوصول</h2>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-warm-gray">
          تابعي حالة كل طلب، طريقة الدفع، ومتى يتم فتح المحتوى داخل حسابك.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-4">
          <SummaryPill label="كل الطلبات" value={summary.total} />
          <SummaryPill label="مدفوع" value={summary.paid} />
          <SummaryPill label="قيد المراجعة" value={summary.pending} />
          <SummaryPill label="إجمالي مؤكد" value={formatEGP(summary.amount)} wide />
        </div>
      </section>

      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-[2rem] border border-sand bg-ivory/90 p-6 shadow-soft backdrop-blur-sm">
            <div className="grid gap-5 lg:grid-cols-[1fr_240px] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${getOrderStatusClass(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                  <span className="rounded-full border border-petrol/15 bg-petrol/10 px-3 py-1 text-xs font-black text-petrol">
                    {order.productType === 'course' ? 'كورس' : 'كتاب'}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-black text-charcoal">{order.productTitle}</h3>
                <p className="mt-2 text-sm leading-7 text-warm-gray">تاريخ الطلب: {formatArabicDate(order.createdAt)}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {order.paymentMethod ? <DetailItem label="طريقة الدفع" value={getPaymentLabel(order.paymentMethod)} /> : null}
                  {order.paymentReference ? <DetailItem label="مرجع الدفع" value={order.paymentReference} /> : null}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-sand bg-cream/70 p-5 text-center">
                <p className="text-xs font-black text-warm-gray">الإجمالي</p>
                <p className="mt-2 text-2xl font-black text-petrol latin-numerals">{formatEGP(order.amount)}</p>
                {order.discountAmount ? <p className="mt-2 text-xs font-bold text-gold">خصم: {formatEGP(order.discountAmount)}</p> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function SummaryPill({ label, value, wide = false }: { label: string; value: number | string; wide?: boolean }) {
  return (
    <div className="rounded-[1.5rem] border border-sand bg-cream/70 p-4 text-center">
      <strong className={`block font-black text-petrol latin-numerals ${wide ? 'text-xl' : 'text-3xl'}`}>{value}</strong>
      <span className="mt-1 block text-xs font-black text-warm-gray">{label}</span>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-sand bg-cream/70 px-4 py-3">
      <p className="text-xs font-black text-warm-gray">{label}</p>
      <p className="mt-1 break-words text-sm font-black text-petrol latin-numerals">{value}</p>
    </div>
  )
}

function getPaymentLabel(method: string) {
  const labels: Record<string, string> = {
    instapay: 'InstaPay',
    vodafone_cash: 'Vodafone Cash',
    bank_transfer: 'تحويل بنكي',
    manual: 'تأكيد يدوي',
  }
  return labels[method] || method
}

function getMillis(value: Order['createdAt']) {
  if (value instanceof Date) return value.getTime()
  if (value && typeof value === 'object' && 'toDate' in value) return value.toDate().getTime()
  return 0
}
