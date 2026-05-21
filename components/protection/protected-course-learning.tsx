"use client"

import { useEffect, useMemo, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { CheckCircle2, Circle, ExternalLink, Loader2, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getFirebaseClientAuth } from "@/lib/firebase/client"

type CourseLesson = {
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

type CourseProgress = {
  userId: string
  courseId: string
  completedLessonIds: string[]
  lastLessonId: string
  progressPercent: number
  completedLessonsCount: number
  totalLessons: number
  updatedAt: string
}

type LearningPayload = {
  ok: boolean
  message?: string
  course?: { id: string; slug: string; title: string }
  lessons?: CourseLesson[]
  progress?: CourseProgress
  trackingMode?: "structured_lessons" | "opened_course"
  fallbackProtectedUrl?: string
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export function ProtectedCourseLearning({ courseId }: { courseId: string }) {
  const [authReady, setAuthReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<LearningPayload | null>(null)
  const [activeLessonId, setActiveLessonId] = useState("")

  const lessons = useMemo(() => data?.lessons || [], [data?.lessons])
  const progress = data?.progress
  const completedSet = useMemo(() => new Set(progress?.completedLessonIds || []), [progress?.completedLessonIds])
  const activeLesson = useMemo(() => lessons.find((lesson) => lesson.id === activeLessonId) || lessons[0] || null, [activeLessonId, lessons])

  useEffect(() => {
    const auth = getFirebaseClientAuth()
    if (!auth) {
      setAuthReady(true)
      return
    }
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setAuthReady(true)
    })
  }, [])

  useEffect(() => {
    async function loadLearning() {
      if (!currentUser) return
      setLoading(true)
      setError("")
      try {
        const token = await currentUser.getIdToken()
        const response = await fetch(`/api/account/course-progress?courseId=${encodeURIComponent(courseId)}`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const result = (await response.json()) as LearningPayload
        if (!response.ok || !result.ok) {
          throw new Error(result.message || "تعذر تحميل رحلة التعلم الآن.")
        }

        setData(result)
        const nextActiveLessonId = text(result.progress?.lastLessonId) || text(result.lessons?.[0]?.id)
        setActiveLessonId(nextActiveLessonId)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "تعذر تحميل رحلة التعلم الآن.")
      } finally {
        setLoading(false)
      }
    }

    if (!authReady) return
    if (!currentUser) {
      setLoading(false)
      setError("يجب تسجيل الدخول للوصول إلى محتوى الكورس.")
      return
    }

    void loadLearning()
  }, [authReady, courseId, currentUser])

  async function updateProgress(action: "open" | "complete" | "uncomplete", lessonId: string) {
    if (!currentUser || !lessonId) return
    setSaving(true)
    try {
      const token = await currentUser.getIdToken()
      const response = await fetch("/api/account/course-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          action,
        }),
      })
      const result = (await response.json()) as { ok: boolean; message?: string; progress?: CourseProgress }
      if (!response.ok || !result.ok || !result.progress) {
        throw new Error(result.message || "تعذر تحديث تقدم الكورس.")
      }

      setData((previous) => {
        if (!previous) return previous
        return {
          ...previous,
          progress: result.progress,
        }
      })
    } catch (progressError) {
      setError(progressError instanceof Error ? progressError.message : "تعذر تحديث تقدم الكورس.")
    } finally {
      setSaving(false)
    }
  }

  async function handleOpenLesson() {
    if (!activeLesson) return

    const directUrl = text(activeLesson.contentUrl) || text(activeLesson.videoUrl)
    if (directUrl) {
      window.open(directUrl, "_blank", "noopener,noreferrer")
    } else if (data?.fallbackProtectedUrl && currentUser) {
      const token = await currentUser.getIdToken()
      const url = `${data.fallbackProtectedUrl}&token=${encodeURIComponent(token)}`
      window.open(url, "_blank", "noopener,noreferrer")
    }

    await updateProgress("open", activeLesson.id)
  }

  async function handleSelectLesson(lessonId: string) {
    setActiveLessonId(lessonId)
    await updateProgress("open", lessonId)
  }

  async function handleToggleComplete() {
    if (!activeLesson) return
    const isCompleted = completedSet.has(activeLesson.id)
    await updateProgress(isCompleted ? "uncomplete" : "complete", activeLesson.id)
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-border bg-card p-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          جاري تحميل رحلة التعلم...
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="rounded-[2rem] border border-destructive/30 bg-destructive/10 p-4 text-sm font-bold text-destructive">{error}</div>
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">تقدمك في الكورس</p>
        <h2 className="mt-2 text-2xl font-black text-foreground">{data?.course?.title || "الكورس"}</h2>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {progress?.completedLessonsCount || 0} / {progress?.totalLessons || 0} دروس مكتملة
          </span>
          <span className="font-bold text-foreground">{progress?.progressPercent || 0}%</span>
        </div>
        <Progress value={progress?.progressPercent || 0} className="mt-3 h-2 rounded-full" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="rounded-[2rem] border border-border bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-foreground">الدروس</p>
          <div className="space-y-2">
            {lessons.map((lesson) => {
              const isActive = activeLesson?.id === lesson.id
              const isCompleted = completedSet.has(lesson.id)
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => void handleSelectLesson(lesson.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-right transition",
                    isActive ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{lesson.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{lesson.duration || "مرن"}</p>
                    </div>
                    {isCompleted ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          {activeLesson ? (
            <>
              <p className="text-sm text-muted-foreground">الدرس الحالي</p>
              <h3 className="mt-2 text-2xl font-black text-foreground">{activeLesson.title}</h3>
              {activeLesson.description ? <p className="mt-3 leading-8 text-muted-foreground">{activeLesson.description}</p> : null}
              <p className="mt-3 text-sm text-muted-foreground">المدة: {activeLesson.duration || "مرنة"}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => void handleOpenLesson()}
                  disabled={saving}
                  className="rounded-full bg-[var(--burgundy)] text-primary-foreground hover:bg-[var(--burgundy)]/90"
                >
                  <PlayCircle className="h-4 w-4" />
                  متابعة الدرس
                </Button>
                <Button type="button" variant="outline" onClick={() => void handleToggleComplete()} disabled={saving} className="rounded-full bg-transparent">
                  {completedSet.has(activeLesson.id) ? "إلغاء الاكتمال" : "تحديد كمكتمل"}
                </Button>
                {data?.fallbackProtectedUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => void handleOpenLesson()}
                    disabled={saving}
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                    فتح المحتوى الكامل
                  </Button>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">لا توجد دروس متاحة لهذا الكورس حاليًا.</p>
          )}
        </div>
      </div>
    </section>
  )
}
