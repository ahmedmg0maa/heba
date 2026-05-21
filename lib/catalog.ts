import { getDocument, listDocuments, type AdminRecord } from "@/lib/firebase/admin"

export type ProductStatus = "active" | "draft" | "hidden"

export type CourseProduct = {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  price: number
  coverImageUrl: string
  status: ProductStatus
  lessonsCount: number
  duration: string
  accessUrl?: string
  createdAt?: string
  updatedAt?: string
}

export type BookProduct = {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  price: number
  coverImageUrl: string
  fileUrl?: string
  status: ProductStatus
  createdAt?: string
  updatedAt?: string
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function asNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function asStatus(value: unknown): ProductStatus {
  const text = asText(value).toLowerCase()
  if (text === "draft" || text === "hidden") return text
  return "active"
}

function normalizeForPlaceholderCheck(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function isPlaceholderContent(product: {
  id: string
  slug: string
  title: string
  shortDescription: string
  description: string
}) {
  const values = [
    normalizeForPlaceholderCheck(product.id),
    normalizeForPlaceholderCheck(product.slug),
    normalizeForPlaceholderCheck(product.title),
    normalizeForPlaceholderCheck(product.shortDescription),
    normalizeForPlaceholderCheck(product.description),
  ]

  const exactPlaceholderTokens = new Set(["tt", "test", "testa", "test/testa", "testa/test"])
  if (values.some((value) => exactPlaceholderTokens.has(value))) return true

  const title = normalizeForPlaceholderCheck(product.title)
  const shortDescription = normalizeForPlaceholderCheck(product.shortDescription)
  const description = normalizeForPlaceholderCheck(product.description)

  if (title === "tt" || title === "test" || title.startsWith("test ")) return true
  if (shortDescription === "test" || shortDescription === "testa") return true
  if (description === "test" || description === "testa") return true

  return false
}

function mapCourseRecord(record: AdminRecord): CourseProduct | null {
  const id = asText(record.id)
  const slug = asText(record.slug) || id
  const title = asText(record.title)
  if (!id || !slug || !title) return null

  return {
    id,
    title,
    slug,
    description: asText(record.description),
    shortDescription: asText(record.shortDescription),
    price: asNumber(record.price),
    coverImageUrl: asText(record.coverImageUrl),
    status: asStatus(record.status),
    lessonsCount: asNumber(record.lessonsCount),
    duration: asText(record.duration),
    accessUrl: asText(record.accessUrl),
    createdAt: asText(record.createdAt),
    updatedAt: asText(record.updatedAt),
  }
}

function mapBookRecord(record: AdminRecord): BookProduct | null {
  const id = asText(record.id)
  const slug = asText(record.slug) || id
  const title = asText(record.title)
  if (!id || !slug || !title) return null

  return {
    id,
    title,
    slug,
    description: asText(record.description),
    shortDescription: asText(record.shortDescription),
    price: asNumber(record.price),
    coverImageUrl: asText(record.coverImageUrl),
    fileUrl: asText(record.fileUrl),
    status: asStatus(record.status),
    createdAt: asText(record.createdAt),
    updatedAt: asText(record.updatedAt),
  }
}

export async function listCatalogCourses(options?: { onlyActive?: boolean }) {
  const records = await listDocuments("courses", {
    orderByField: "createdAt",
    orderDirection: "desc",
    limit: 1000,
  })
  const courses = records.map(mapCourseRecord).filter(Boolean) as CourseProduct[]
  if (options?.onlyActive) return courses.filter((item) => item.status === "active" && !isPlaceholderContent(item))
  return courses
}

export async function listCatalogBooks(options?: { onlyActive?: boolean }) {
  const records = await listDocuments("books", {
    orderByField: "createdAt",
    orderDirection: "desc",
    limit: 1000,
  })
  const books = records.map(mapBookRecord).filter(Boolean) as BookProduct[]
  if (options?.onlyActive) return books.filter((item) => item.status === "active" && !isPlaceholderContent(item))
  return books
}

async function getCourseFromFirestore(slugOrId: string) {
  const byId = await getDocument("courses", slugOrId)
  const byIdMapped = byId ? mapCourseRecord(byId) : null
  if (byIdMapped) return byIdMapped

  const bySlug = await listDocuments("courses", {
    whereClauses: [{ field: "slug", value: slugOrId }],
    limit: 1,
  })
  return bySlug.length ? mapCourseRecord(bySlug[0]) : null
}

async function getBookFromFirestore(slugOrId: string) {
  const byId = await getDocument("books", slugOrId)
  const byIdMapped = byId ? mapBookRecord(byId) : null
  if (byIdMapped) return byIdMapped

  const bySlug = await listDocuments("books", {
    whereClauses: [{ field: "slug", value: slugOrId }],
    limit: 1,
  })
  return bySlug.length ? mapBookRecord(bySlug[0]) : null
}

export async function getCatalogCourseBySlug(slugOrId: string) {
  const course = await getCourseFromFirestore(slugOrId)
  if (!course || course.status !== "active") return null
  if (isPlaceholderContent(course)) return null
  return course
}

export async function getCatalogBookBySlug(slugOrId: string) {
  const book = await getBookFromFirestore(slugOrId)
  if (!book || book.status !== "active") return null
  if (isPlaceholderContent(book)) return null
  return book
}
