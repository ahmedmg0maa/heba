"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

type CourseRecord = {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  price: number
  coverImageUrl: string
  status: "active" | "draft" | "hidden"
  lessonsCount: number
  duration: string
  accessUrl?: string
}

type FormState = {
  id: string
  title: string
  slug: string
  shortDescription: string
  description: string
  price: string
  lessonsCount: string
  duration: string
  coverImageUrl: string
  accessUrl: string
  status: "active" | "draft" | "hidden"
}

const initialForm: FormState = {
  id: "",
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  lessonsCount: "",
  duration: "",
  coverImageUrl: "",
  accessUrl: "",
  status: "active",
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function toNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function statusLabel(status: "active" | "draft" | "hidden") {
  if (status === "active") return "نشط"
  if (status === "draft") return "مسودة"
  return "مخفي"
}

export function CoursesManager() {
  const router = useRouter()
  const [items, setItems] = useState<CourseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const isEditing = useMemo(() => Boolean(editingId), [editingId])

  const loadCourses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/courses?limit=200", {
        cache: "no-store",
        credentials: "include",
      })
      if (response.status === 401) {
        router.replace("/admin/login")
        router.refresh()
        return
      }
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر تحميل الكورسات.")
      setItems(Array.isArray(data.courses) ? data.courses : [])
    } catch (error) {
      setItems([])
      toast({
        title: "تعذر تحميل الكورسات",
        description: error instanceof Error ? error.message : "تعذر تحميل الكورسات.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  async function submitForm(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)

    const payload = {
      id: toSlug(form.id || form.slug || form.title),
      title: text(form.title),
      slug: toSlug(form.slug || form.id || form.title),
      shortDescription: text(form.shortDescription),
      description: text(form.description),
      price: Number(form.price || 0),
      lessonsCount: Number(form.lessonsCount || 0),
      duration: text(form.duration),
      coverImageUrl: text(form.coverImageUrl),
      accessUrl: text(form.accessUrl),
      status: form.status,
    }

    if (!payload.title) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال عنوان الكورس.",
        variant: "destructive",
      })
      setSaving(false)
      return
    }

    try {
      const endpoint = isEditing ? `/api/admin/courses/${encodeURIComponent(editingId || "")}` : "/api/admin/courses"
      const method = isEditing ? "PATCH" : "POST"
      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر حفظ بيانات الكورس.")

      toast({
        title: isEditing ? "تم تحديث الكورس" : "تمت إضافة الكورس",
        description: "تم حفظ البيانات بنجاح.",
      })

      setForm(initialForm)
      setEditingId(null)
      await loadCourses()
    } catch (error) {
      toast({
        title: "تعذر حفظ الكورس",
        description: error instanceof Error ? error.message : "تعذر حفظ بيانات الكورس.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item: CourseRecord) {
    setEditingId(item.id)
    setForm({
      id: item.id,
      title: item.title || "",
      slug: item.slug || item.id,
      shortDescription: item.shortDescription || "",
      description: item.description || "",
      price: String(item.price ?? ""),
      lessonsCount: String(item.lessonsCount ?? ""),
      duration: item.duration || "",
      coverImageUrl: item.coverImageUrl || "",
      accessUrl: item.accessUrl || "",
      status: item.status || "active",
    })
  }

  async function changeStatus(id: string, status: "active" | "draft" | "hidden") {
    try {
      const response = await fetch(`/api/admin/courses/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر تحديث الحالة.")
      toast({ title: "تم تحديث الحالة" })
      await loadCourses()
    } catch (error) {
      toast({
        title: "تعذر تحديث الحالة",
        description: error instanceof Error ? error.message : "تعذر تحديث الحالة.",
        variant: "destructive",
      })
    }
  }

  async function removeCourse(id: string) {
    if (!globalThis.confirm("هل تريد حذف هذا الكورس؟")) return

    try {
      const response = await fetch(`/api/admin/courses/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر حذف الكورس.")
      toast({ title: "تم حذف الكورس" })
      if (editingId === id) {
        setEditingId(null)
        setForm(initialForm)
      }
      await loadCourses()
    } catch (error) {
      toast({
        title: "تعذر حذف الكورس",
        description: error instanceof Error ? error.message : "تعذر حذف الكورس.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">إدارة الكورسات</h1>
        <p className="mt-2 text-muted-foreground">إضافة وتعديل وحذف الكورسات وروابط المحتوى عبر جوجل درايف أو أي منصة خارجية.</p>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-black text-foreground">{isEditing ? "تعديل كورس" : "إضافة كورس جديد"}</h2>
        <form className="mt-5 grid gap-4" onSubmit={submitForm}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course-id">المعرف</Label>
              <Input
                id="course-id"
                value={form.id}
                onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
                placeholder="course-id"
                disabled={isEditing}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-slug">Slug</Label>
              <Input
                id="course-slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="course-id"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-title">العنوان</Label>
            <Input
              id="course-title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-short">الوصف المختصر</Label>
            <Input
              id="course-short"
              value={form.shortDescription}
              onChange={(event) => setForm((prev) => ({ ...prev, shortDescription: event.target.value }))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-description">الوصف الكامل</Label>
            <Textarea
              id="course-description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-24 w-full"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="course-price">السعر</Label>
              <Input
                id="course-price"
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-lessons">عدد الدروس</Label>
              <Input
                id="course-lessons"
                type="number"
                min={0}
                value={form.lessonsCount}
                onChange={(event) => setForm((prev) => ({ ...prev, lessonsCount: event.target.value }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-duration">المدة</Label>
              <Input
                id="course-duration"
                value={form.duration}
                onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))}
                placeholder="6 أسابيع"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-image">رابط صورة الغلاف</Label>
            <Input
              id="course-image"
              value={form.coverImageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-access">رابط محتوى الكورس من جوجل درايف أو منصة خارجية</Label>
            <Input
              id="course-access"
              value={form.accessUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, accessUrl: event.target.value }))}
              placeholder="https://drive.google.com/drive/folders/FOLDER_ID"
              className="w-full"
            />
            <p className="text-xs leading-6 text-muted-foreground break-words">رابط دخول الكورس يظهر للمستخدم بعد تأكيد الدفع.</p>
            <p className="rounded-xl border border-border bg-secondary/25 p-3 text-xs leading-6 text-muted-foreground break-words">
              ارفعي الملف على جوجل درايف، ثم اجعلي المشاركة: أي شخص لديه الرابط يمكنه العرض، وبعدها ضعي الرابط هنا.
            </p>
          </div>

          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as FormState["status"] }))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="hidden">مخفي</SelectItem>
                </SelectContent>
              </Select>
            </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving} className="rounded-full">
              {saving ? "جارٍ الحفظ..." : isEditing ? "حفظ التعديلات" : "إضافة الكورس"}
            </Button>
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-full bg-transparent"
                onClick={() => {
                  setEditingId(null)
                  setForm(initialForm)
                }}
              >
                إلغاء التعديل
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-black text-foreground">الكورسات الحالية</h2>
        {loading ? <p className="mt-4 text-muted-foreground">جارٍ التحميل...</p> : null}
        {!loading && items.length === 0 ? <p className="mt-4 text-muted-foreground">لا توجد كورسات بعد.</p> : null}

        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground break-words">
                    {item.slug} · {toNumber(item.price).toLocaleString("ar-EG")} ج.م · {statusLabel(item.status)}
                  </p>
                  {item.accessUrl ? (
                    <p className="mt-1 max-w-full break-all text-[11px] leading-5 text-muted-foreground">{item.accessUrl}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" className="rounded-full" onClick={() => startEdit(item)}>
                    تعديل
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="rounded-full bg-transparent" onClick={() => changeStatus(item.id, "active")}>
                    تفعيل
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="rounded-full bg-transparent" onClick={() => changeStatus(item.id, "draft")}>
                    مسودة
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="rounded-full bg-transparent" onClick={() => changeStatus(item.id, "hidden")}>
                    إخفاء
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full bg-transparent text-destructive"
                    onClick={() => removeCourse(item.id)}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
