import { getDocument, listDocuments, type AdminRecord } from "@/lib/firebase/admin"

export type CourseLesson = {
  id: string
  courseId: string
  title: string
  description?: string
  videoUrl?: string
  contentUrl?: string
  duration?: string
  order: number
  isPreview?: boolean
}

export type CourseProgressState = {
  userId: string
  courseId: string
  completedLessonIds: string[]
  lastLessonId: string
  progressPercent: number
  completedLessonsCount: number
  totalLessons: number
  updatedAt: string
}

export type CourseProgressTrackingMode = "structured_lessons" | "opened_course"

export type CourseIdentity = {
  id: string
  slug: string
  title: string
  accessUrl: string
  lessonsCount: number
  raw: AdminRecord
}

type PaidOrderMatch = {
  ok: boolean
  orderId: string
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function numberValue(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function booleanValue(value: unknown) {
  return value === true
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function asIso(value: unknown) {
  const raw = text(value)
  if (!raw) return ""
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString()
}

export function buildCourseProgressDocId(userId: string, courseId: string) {
  return `${text(userId)}__${text(courseId)}`
}

export function calculateProgressPercent(totalLessons: number, completedLessons: number) {
  if (totalLessons <= 0) return 0
  const raw = Math.round((completedLessons / totalLessons) * 100)
  return Math.max(0, Math.min(100, raw))
}

function lessonFromArray(courseId: string, lesson: unknown, index: number): CourseLesson | null {
  if (!lesson || typeof lesson !== "object") return null
  const raw = lesson as Record<string, unknown>
  const id = text(raw.id) || `${courseId}-lesson-${index + 1}`
  const title = text(raw.title) || `الدرس ${index + 1}`
  const contentUrl = text(raw.contentUrl) || text(raw.videoUrl)
  return {
    id,
    courseId,
    title,
    description: text(raw.description),
    videoUrl: text(raw.videoUrl),
    contentUrl,
    duration: text(raw.duration),
    order: numberValue(raw.order) || index + 1,
    isPreview: booleanValue(raw.isPreview),
  }
}

function lessonFromDocument(courseId: string, record: AdminRecord, index: number): CourseLesson | null {
  const id = text(record.id)
  const title = text(record.title)
  if (!id || !title) return null
  return {
    id,
    courseId,
    title,
    description: text(record.description),
    videoUrl: text(record.videoUrl),
    contentUrl: text(record.contentUrl) || text(record.videoUrl),
    duration: text(record.duration),
    order: numberValue(record.order) || index + 1,
    isPreview: booleanValue(record.isPreview),
  }
}

function sortLessons(lessons: CourseLesson[]) {
  return [...lessons].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return a.title.localeCompare(b.title, "ar")
  })
}

export async function resolveCourseIdentity(courseIdOrSlug: string): Promise<CourseIdentity | null> {
  const normalized = text(courseIdOrSlug)
  if (!normalized) return null

  const byId = await getDocument("courses", normalized)
  if (byId) {
    return {
      id: text(byId.id),
      slug: text(byId.slug) || text(byId.id),
      title: text(byId.title) || text(byId.id),
      accessUrl: text(byId.accessUrl),
      lessonsCount: numberValue(byId.lessonsCount),
      raw: byId,
    }
  }

  const bySlug = await listDocuments("courses", {
    whereClauses: [{ field: "slug", value: normalized }],
    limit: 1,
  })
  if (!bySlug.length) return null

  const item = bySlug[0]
  return {
    id: text(item.id),
    slug: text(item.slug) || text(item.id),
    title: text(item.title) || text(item.id),
    accessUrl: text(item.accessUrl),
    lessonsCount: numberValue(item.lessonsCount),
    raw: item,
  }
}

export async function resolveCourseLessons(
  course: CourseIdentity,
): Promise<{ lessons: CourseLesson[]; trackingMode: CourseProgressTrackingMode }> {
  const courseId = text(course.id)
  if (!courseId) return { lessons: [], trackingMode: "opened_course" }

  const fromCollectionRaw = await listDocuments("course_lessons", {
    whereClauses: [{ field: "courseId", value: courseId }],
    limit: 500,
  })
  const fromCollection = fromCollectionRaw
    .map((record, index) => lessonFromDocument(courseId, record, index))
    .filter(Boolean) as CourseLesson[]

  if (fromCollection.length > 0) {
    return { lessons: sortLessons(fromCollection), trackingMode: "structured_lessons" }
  }

  const rawLessons = Array.isArray(course.raw.lessons) ? course.raw.lessons : []
  const fromArray = rawLessons
    .map((lesson, index) => lessonFromArray(courseId, lesson, index))
    .filter(Boolean) as CourseLesson[]

  if (fromArray.length > 0) {
    return { lessons: sortLessons(fromArray), trackingMode: "structured_lessons" }
  }

  if (course.accessUrl) {
    const fallbackLesson: CourseLesson = {
      id: `${courseId}-opened`,
      courseId,
      title: "محتوى الكورس",
      description: "متابعة المحتوى الكامل للكورس.",
      contentUrl: course.accessUrl,
      order: 1,
      isPreview: false,
    }
    return { lessons: [fallbackLesson], trackingMode: "opened_course" }
  }

  return { lessons: [], trackingMode: "opened_course" }
}

function sanitizeCompletedLessonIds(completedLessonIds: unknown, lessons: CourseLesson[]) {
  const allowed = new Set(lessons.map((lesson) => lesson.id))
  const ids = Array.isArray(completedLessonIds) ? completedLessonIds.map((id) => text(id)).filter(Boolean) : []
  return Array.from(new Set(ids.filter((id) => allowed.has(id))))
}

export function normalizeCourseProgressState(options: {
  userId: string
  courseId: string
  lessons: CourseLesson[]
  rawProgress?: AdminRecord | null
}): CourseProgressState {
  const { userId, courseId, lessons, rawProgress } = options
  const completedLessonIds = sanitizeCompletedLessonIds(rawProgress?.completedLessonIds, lessons)
  const completedLessonsCount = completedLessonIds.length
  const totalLessons = lessons.length
  const progressPercent = calculateProgressPercent(totalLessons, completedLessonsCount)
  const lastLessonId = text(rawProgress?.lastLessonId)
  const updatedAt = asIso(rawProgress?.updatedAt) || new Date().toISOString()

  return {
    userId,
    courseId,
    completedLessonIds,
    lastLessonId,
    progressPercent,
    completedLessonsCount,
    totalLessons,
    updatedAt,
  }
}

export function applyProgressAction(options: {
  current: CourseProgressState
  action: "open" | "complete" | "uncomplete"
  lessonId: string
}): CourseProgressState {
  const { current, action, lessonId } = options
  const normalizedLessonId = text(lessonId)
  if (!normalizedLessonId) return current

  const completedSet = new Set(current.completedLessonIds)
  let nextLastLessonId = current.lastLessonId

  if (action === "open") {
    completedSet.add(normalizedLessonId)
    nextLastLessonId = normalizedLessonId
  } else if (action === "complete") {
    completedSet.add(normalizedLessonId)
    nextLastLessonId = normalizedLessonId
  } else if (action === "uncomplete") {
    completedSet.delete(normalizedLessonId)
    if (nextLastLessonId === normalizedLessonId) {
      nextLastLessonId = ""
    }
  }

  const completedLessonIds = Array.from(completedSet)
  const completedLessonsCount = completedLessonIds.length
  const progressPercent = calculateProgressPercent(current.totalLessons, completedLessonsCount)

  return {
    ...current,
    completedLessonIds,
    completedLessonsCount,
    progressPercent,
    lastLessonId: nextLastLessonId,
    updatedAt: new Date().toISOString(),
  }
}

function matchesPaidCourseOrder(options: {
  order: AdminRecord
  resolvedCourseId: string
  resolvedCourseSlug: string
}) {
  const { order, resolvedCourseId, resolvedCourseSlug } = options
  const status = text(order.status).toLowerCase()
  const productType = text(order.productType).toLowerCase()
  if (status !== "paid" || productType !== "course") return false

  const accepted = new Set([resolvedCourseId.toLowerCase(), resolvedCourseSlug.toLowerCase()].filter(Boolean))
  const candidateValues = [text(order.productId), text(order.itemId), text(order.productSlug)]
    .map((value) => value.toLowerCase())
    .filter(Boolean)

  return candidateValues.some((value) => accepted.has(value))
}

export async function findPaidCourseOrder(options: {
  userId: string
  emailCandidates: string[]
  resolvedCourseId: string
  resolvedCourseSlug: string
}): Promise<PaidOrderMatch> {
  const { userId, emailCandidates, resolvedCourseId, resolvedCourseSlug } = options
  const normalizedEmails = Array.from(
    new Set(
      emailCandidates
        .map((item) => text(item))
        .filter(Boolean)
        .flatMap((item) => {
          const lowered = normalizeEmail(item)
          return lowered === item ? [item] : [item, lowered]
        }),
    ),
  )

  const byEmailPromises = normalizedEmails.map((email) =>
    listDocuments("orders", {
      whereClauses: [{ field: "email", value: email }],
      limit: 500,
    }),
  )

  const [ordersByUser, ...ordersByEmails] = await Promise.all([
    listDocuments("orders", {
      whereClauses: [{ field: "userId", value: userId }],
      limit: 500,
    }),
    ...byEmailPromises,
  ])

  const merged = [...ordersByUser, ...ordersByEmails.flat()]
  const deduped = new Map<string, AdminRecord>()
  for (const order of merged) deduped.set(text(order.id), order)

  const paidMatchingOrders = Array.from(deduped.values()).filter((order) =>
    matchesPaidCourseOrder({
      order,
      resolvedCourseId,
      resolvedCourseSlug,
    }),
  )

  paidMatchingOrders.sort((a, b) => {
    const aDate = new Date(asIso(a.createdAt) || 0).getTime()
    const bDate = new Date(asIso(b.createdAt) || 0).getTime()
    return bDate - aDate
  })

  if (!paidMatchingOrders.length) return { ok: false, orderId: "" }
  return { ok: true, orderId: text(paidMatchingOrders[0]?.id) }
}
