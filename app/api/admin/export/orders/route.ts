import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-session"
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
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const orders = await listDocuments("orders", {
    orderByField: "createdAt",
    orderDirection: "desc",
    limit: 5000,
  })

  const headers = ["id", "customerName", "email", "productId", "productType", "amount", "status", "createdAt"]
  const lines = [
    headers.join(","),
    ...orders.map((item) =>
      [item.id, item.customerName, item.email, item.productId, item.productType, item.amount, item.status, item.createdAt]
        .map(csvValue)
        .join(","),
    ),
  ]

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-export.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
