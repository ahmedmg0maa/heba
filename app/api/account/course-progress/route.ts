import { NextRequest, NextResponse } from "next/server"
import {
  applyProgressAction,
  buildCourseProgressDocId,
  findPaidCourseOrder,
  normalizeCourseProgressState,
  resolveCourseIdentity,
  resolveCourseLessons,
} from "@/lib/course-progress"
import { getDocument, listDocuments, setDocument, verifyFirebaseIdToken } from "@/lib/firebase/admin"

export const runtime = "nodejs"

type ProgressAction = "open" | "complete" | "uncomplete"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseBearerToken(request: NextRequest) {
  const authHeader = text(request.headers.get("authorization"))
  if (!authHeader.toLowerCase().startsWith("bearer ")) return ""
  return authHeader.slice(7).trim()
}

function parseCourseIds(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

function normalizeAction(value: unknown): ProgressAction {
  const action = text(value).toLowerCase()
  if (action === "complete" || action === "uncomplete") return action
  return "open"
}

async function verifyUser(request: NextRequest) {
  const token = parseBearerToken(request)
  if (!token) {
    return { ok: false as const, status: 401, message: "يجب تسجيل الدخول أولًا." }
  }

  const verification = await verifyFirebaseIdToken(token)
  if (!verification.ok) {
    return { ok: false as const, status: 401, message: "تعذر التحقق من جلسة الحساب." }
  }

  const userId = text(verification.decoded.uid)
  const email = text(verification.decoded.email)
  if (!userId) {
    return { ok: false as const, status: 401, message: "تعذر التحقق من هوية الحساب." }
  }

  return {
    ok: true as const,
    userId,
    email,
  }
}

async function getProgressDocument(userId: string, courseId: string) {
  const docId = buildCourseProgressDocId(userId, courseId)
  return getDocument("course_progress", docId)
}

export async function GET(request: NextRequest) {
  const user = await verifyUser(request)
  if (!user.ok) {
    return NextResponse.json({ ok: false, message: user.message }, { status: user.status })
  }

  const courseId = text(request.nextUrl.searchParams.get("courseId"))
  const rawCourseIds = text(request.nextUrl.searchParams.get("courseIds"))
  const requestedIds = courseId ? [courseId] : parseCourseIds(rawCourseIds)

  if (!requestedIds.length) {
    return NextResponse.json({ ok: true, progress: [] })
  }

  try {
    const allProgressDocs = await listDocuments("course_progress", {
      whereClauses: [{ field: "userId", value: user.userId }],
      limit: 500,
    })

    if (courseId) {
      const course = await resolveCourseIdentity(courseId)
      if (!course) {
        return NextResponse.json({ ok: false, message: "تعذر العثور على هذا الكورس." }, { status: 404 })
      }

      const paidOrder = await findPaidCourseOrder({
        userId: user.userId,
        emailCandidates: [user.email],
        resolvedCourseId: course.id,
        resolvedCourseSlug: course.slug,
      })
      if (!paidOrder.ok) {
        return NextResponse.json({ ok: false, message: "هذا الكورس متاح بعد تأكيد الدفع فقط." }, { status: 403 })
      }

      const { lessons, trackingMode } = await resolveCourseLessons(course)
      const progressDoc =
        allProgressDocs.find((item) => text(item.courseId) === course.id) || (await getProgressDocument(user.userId, course.id))
      const progress = normalizeCourseProgressState({
        userId: user.userId,
        courseId: course.id,
        lessons,
        rawProgress: progressDoc,
      })

      return NextResponse.json({
        ok: true,
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title,
        },
        lessons,
        progress,
        trackingMode,
        fallbackProtectedUrl: `/api/protected-content/course/${encodeURIComponent(course.id)}?mode=stream`,
      })
    }

    const summaries = await Promise.all(
      requestedIds.map(async (requestedCourseId) => {
        const course = await resolveCourseIdentity(requestedCourseId)
        if (!course) {
          return {
            courseId: requestedCourseId,
            progressPercent: 0,
            completedLessonsCount: 0,
            totalLessons: 0,
            lastLessonId: "",
            updatedAt: "",
          }
        }

        const { lessons } = await resolveCourseLessons(course)
        const progressDoc =
          allProgressDocs.find((item) => text(item.courseId) === course.id) || (await getProgressDocument(user.userId, course.id))
        const normalized = normalizeCourseProgressState({
          userId: user.userId,
          courseId: course.id,
          lessons,
          rawProgress: progressDoc,
        })

        return {
          courseId: course.id,
          courseTitle: course.title,
          progressPercent: normalized.progressPercent,
          completedLessonsCount: normalized.completedLessonsCount,
          totalLessons: normalized.totalLessons,
          lastLessonId: normalized.lastLessonId,
          updatedAt: normalized.updatedAt,
        }
      }),
    )

    return NextResponse.json({ ok: true, progress: summaries })
  } catch (error) {
    console.error("[course-progress:get] failed:", error)
    return NextResponse.json({ ok: false, message: "تعذر تحميل تقدم الكورس الآن." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyUser(request)
  if (!user.ok) {
    return NextResponse.json({ ok: false, message: user.message }, { status: user.status })
  }

  let body: { courseId?: string; lessonId?: string; action?: string } = {}
  try {
    body = (await request.json()) as { courseId?: string; lessonId?: string; action?: string }
  } catch {
    return NextResponse.json({ ok: false, message: "تعذر قراءة بيانات التقدم." }, { status: 400 })
  }

  const requestedCourseId = text(body.courseId)
  if (!requestedCourseId) {
    return NextResponse.json({ ok: false, message: "معرف الكورس مطلوب." }, { status: 400 })
  }

  try {
    const course = await resolveCourseIdentity(requestedCourseId)
    if (!course) {
      return NextResponse.json({ ok: false, message: "تعذر العثور على هذا الكورس." }, { status: 404 })
    }

    const paidOrder = await findPaidCourseOrder({
      userId: user.userId,
      emailCandidates: [user.email],
      resolvedCourseId: course.id,
      resolvedCourseSlug: course.slug,
    })
    if (!paidOrder.ok) {
      return NextResponse.json({ ok: false, message: "هذا الكورس متاح بعد تأكيد الدفع فقط." }, { status: 403 })
    }

    const { lessons, trackingMode } = await resolveCourseLessons(course)
    if (!lessons.length) {
      return NextResponse.json({ ok: false, message: "لا توجد دروس متاحة في هذا الكورس بعد." }, { status: 400 })
    }

    const action = normalizeAction(body.action)
    const requestedLessonId = text(body.lessonId)
    const targetLessonId =
      lessons.find((lesson) => lesson.id === requestedLessonId)?.id ||
      lessons.find((lesson) => lesson.id === requestedLessonId.toLowerCase())?.id ||
      lessons[0]?.id ||
      ""

    if (!targetLessonId) {
      return NextResponse.json({ ok: false, message: "تعذر تحديد الدرس المطلوب." }, { status: 400 })
    }

    const progressDoc = await getProgressDocument(user.userId, course.id)
    const currentProgress = normalizeCourseProgressState({
      userId: user.userId,
      courseId: course.id,
      lessons,
      rawProgress: progressDoc,
    })

    const nextProgress = applyProgressAction({
      current: currentProgress,
      action,
      lessonId: targetLessonId,
    })

    const progressDocId = buildCourseProgressDocId(user.userId, course.id)
    const write = await setDocument(
      "course_progress",
      progressDocId,
      {
        userId: user.userId,
        courseId: course.id,
        completedLessonIds: nextProgress.completedLessonIds,
        lastLessonId: nextProgress.lastLessonId,
        progressPercent: nextProgress.progressPercent,
        updatedAt: nextProgress.updatedAt,
      },
      true,
    )

    if (!write.ok) {
      return NextResponse.json({ ok: false, message: write.message || "تعذر حفظ تقدم الكورس." }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      progress: nextProgress,
      trackingMode,
    })
  } catch (error) {
    console.error("[course-progress:post] failed:", error)
    return NextResponse.json({ ok: false, message: "تعذر تحديث تقدم الكورس الآن." }, { status: 500 })
  }
}
