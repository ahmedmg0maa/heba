"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function statusLabel(status: string) {
  if (status === "approved") return "تم القبول"
  if (status === "completed") return "تمت الجلسة"
  if (status === "cancelled") return "ملغي"
  return "قيد المراجعة"
}

export function BookingStatusSelect({
  bookingId,
  initialStatus,
}: {
  bookingId: string
  initialStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus || "pending")
  const [loadingStatus, setLoadingStatus] = useState<"approved" | "cancelled" | "completed" | "">("")

  async function updateStatus(nextStatus: "approved" | "cancelled" | "completed") {
    setLoadingStatus(nextStatus)
    try {
      const response = await fetch(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })

      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر تحديث الحجز.")

      setStatus(nextStatus)
      toast({
        title: "تم تحديث الحجز",
        description: `الحالة الحالية: ${statusLabel(nextStatus)}`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "تعذر تحديث الحجز",
        description: error instanceof Error ? error.message : "تعذر تحديث الحجز.",
        variant: "destructive",
      })
    } finally {
      setLoadingStatus("")
    }
  }

  function isLoading(nextStatus: "approved" | "cancelled" | "completed") {
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
          onClick={() => updateStatus("approved")}
          className={cn(
            "h-8 rounded-full px-3 text-xs",
            status === "approved"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-primary/90 hover:text-primary-foreground",
          )}
        >
          {isLoading("approved") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          قبول الحجز
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={Boolean(loadingStatus)}
          onClick={() => updateStatus("cancelled")}
          variant="outline"
          className={cn("h-8 rounded-full px-3 text-xs", status === "cancelled" ? "border-destructive text-destructive" : "")}
        >
          {isLoading("cancelled") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          إلغاء الحجز
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={Boolean(loadingStatus) || status !== "approved"}
          onClick={() => updateStatus("completed")}
          variant="outline"
          className={cn("h-8 rounded-full px-3 text-xs", status === "completed" ? "border-accent text-accent" : "")}
        >
          {isLoading("completed") ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          تمت الجلسة
        </Button>
      </div>
    </div>
  )
}
