import { NextResponse } from "next/server"
import { requireAdmin, unauthorizedAdminResponse } from "@/lib/admin-session"
import { listDocuments } from "@/lib/firebase/admin"

export const runtime = "nodejs"

function csvValue(value: unknown) {
  const text = String(value ?? "")
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return unauthorizedAdminResponse(admin)
  }

  const bookings = await listDocuments("bookings", {
    orderByField: "createdAt",
    orderDirection: "desc",
    limit: 2000,
  })

  const headers = ["id", "customerName", "email", "phone", "date", "time", "duration", "amount", "status", "createdAt"]
  const lines = [
    headers.join(","),
    ...bookings.map((item) =>
      [
        item.id,
        item.customerName,
        item.email,
        item.phone,
        item.date,
        item.time,
        item.duration,
        item.amount,
        item.status,
        item.createdAt,
      ]
        .map(csvValue)
        .join(","),
    ),
  ]

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-export.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
