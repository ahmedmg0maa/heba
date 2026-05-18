import type { MetadataRoute } from "next"
import { posts } from "@/lib/site-data"
import { listCatalogBooks, listCatalogCourses } from "@/lib/catalog"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://hebaelsharif.com").replace(/\/$/, "")
  const now = new Date()
  const [courses, books] = await Promise.all([
    listCatalogCourses({ onlyActive: true }),
    listCatalogBooks({ onlyActive: true }),
  ])

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/courses",
    "/books",
    "/blog",
    "/booking",
    "/checkout",
    "/checkout/success",
    "/checkout/failed",
    "/contact",
    "/testimonials",
    "/media",
    "/privacy",
    "/terms",
    "/en",
  ]

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.75,
    })),
    ...courses.map((course) => ({
      url: `${baseUrl}/courses/${course.slug || course.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...books.map((book) => ({
      url: `${baseUrl}/books/${book.slug || book.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.78,
    })),
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
