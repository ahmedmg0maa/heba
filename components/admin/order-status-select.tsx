"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
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
  const [loadingStatus, setLoadingStatus] = useState<"paid" | "cancelled" | "">("")

  async function updateStatus(nextStatus: "paid" | "cancelled") {
    setLoadingStatus(nextStatus)
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر تحديث الطلب.")

      setStatus(nextStatus)
      toast({
        title: "تم تحديث الطلب",
        description: `الحالة الحالية: ${statusLabel(nextStatus)}`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "تعذر تحديث الطلب",
        description: error instanceof Error ? error.message : "تعذر تحديث الطلب.",
        variant: "destructive",
      })
    } finally {
      setLoadingStatus("")
    }
  }

  function isLoading(nextStatus: "paid" | "cancelled") {
    return loadingStatus === nextStatus
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground">{statusLabel(status)}</p>
      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          size="sm"
          disabled={Boolean(loadingStatus)}
          onClick={() => updateStatus("paid")}
          className={cn(
            "h-8 rounded-full px-3 text-xs",
            status === "paid"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-primary/90 hover:text-primary-foreground",
          )}
        >
          {isLoading("paid") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          تأكيد الدفع
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={Boolean(loadingStatus)}
          variant="outline"
          onClick={() => updateStatus("cancelled")}
          className={cn("h-8 rounded-full px-3 text-xs", status === "cancelled" ? "border-destructive text-destructive" : "")}
        >
          {isLoading("cancelled") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          إلغاء الطلب
        </Button>
      </div>
    </div>
  )
}
