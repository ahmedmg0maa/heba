import { NextResponse } from "next/server"
import { listCatalogBooks, listCatalogCourses } from "@/lib/catalog"

export const runtime = "nodejs"

export async function GET() {
  const [courses, books] = await Promise.all([
    listCatalogCourses({ onlyActive: true }),
    listCatalogBooks({ onlyActive: true }),
  ])

  const publicCourses = courses.map((course) => ({
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    shortDescription: course.shortDescription,
    price: course.price,
    coverImageUrl: course.coverImageUrl,
    status: course.status,
    lessonsCount: course.lessonsCount,
    duration: course.duration,
  }))

  const publicBooks = books.map((book) => ({
    id: book.id,
    title: book.title,
    slug: book.slug,
    description: book.description,
    shortDescription: book.shortDescription,
    price: book.price,
    coverImageUrl: book.coverImageUrl,
    status: book.status,
  }))

  return NextResponse.json({
    ok: true,
    courses: publicCourses,
    books: publicBooks,
  })
}
