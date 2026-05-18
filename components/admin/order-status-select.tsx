"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function statusLabel(status: string) {
  if (status === "paid") return "مدفوع"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

export function OrderStatusSelect({
  orderId,
  initialStatus,
}: {
  orderId: string
  initialStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus || "pending")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function updateStatus(nextStatus: "paid" | "cancelled") {
    setLoading(true)
    setMessage("")
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر التحديث.")
      setStatus(nextStatus)
      setMessage("تم الحفظ")
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر التحديث")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground">{statusLabel(status)}</p>
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          disabled={loading}
          onClick={() => updateStatus("paid")}
          className={cn(
            "h-8 rounded-full px-3 text-xs",
            status === "paid" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-primary/90 hover:text-primary-foreground",
          )}
        >
          تأكيد الدفع
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={loading}
          variant="outline"
          onClick={() => updateStatus("cancelled")}
          className={cn(
            "h-8 rounded-full px-3 text-xs",
            status === "cancelled" ? "border-destructive text-destructive" : "",
          )}
        >
          إلغاء الطلب
        </Button>
      </div>
      {message ? <span className="block text-[11px] text-muted-foreground">{message}</span> : null}
    </div>
  )
}
