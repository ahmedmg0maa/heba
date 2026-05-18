import { NextResponse } from "next/server"
import { listCatalogBooks, listCatalogCourses } from "@/lib/catalog"

export const runtime = "nodejs"

export async function GET() {
  const [courses, books] = await Promise.all([
    listCatalogCourses({ onlyActive: true }),
    listCatalogBooks({ onlyActive: true }),
  ])

  return NextResponse.json({
    ok: true,
    courses,
    books,
  })
}
