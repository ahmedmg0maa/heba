"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

type BookRecord = {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  price: number
  coverImageUrl: string
  fileUrl?: string
  status: "active" | "draft" | "hidden"
}

type FormState = {
  id: string
  title: string
  slug: string
  shortDescription: string
  description: string
  price: string
  coverImageUrl: string
  fileUrl: string
  status: "active" | "draft" | "hidden"
}

const initialForm: FormState = {
  id: "",
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  coverImageUrl: "",
  fileUrl: "",
  status: "active",
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function toNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function BooksManager() {
  const [items, setItems] = useState<BookRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const isEditing = useMemo(() => Boolean(editingId), [editingId])

  async function loadBooks() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/books", {
        cache: "no-store",
        credentials: "include",
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر تحميل الكتب.")
      setItems(Array.isArray(data.books) ? data.books : [])
    } catch (error) {
      setItems([])
      toast({
        title: "تعذر تحميل الكتب",
        description: error instanceof Error ? error.message : "تعذر تحميل الكتب.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBooks()
  }, [])

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
      coverImageUrl: text(form.coverImageUrl),
      fileUrl: text(form.fileUrl),
      status: form.status,
    }

    if (!payload.title) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال عنوان الكتاب.",
        variant: "destructive",
      })
      setSaving(false)
      return
    }

    try {
      const endpoint = isEditing ? `/api/admin/books/${encodeURIComponent(editingId || "")}` : "/api/admin/books"
      const method = isEditing ? "PATCH" : "POST"
      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر حفظ بيانات الكتاب.")

      toast({
        title: isEditing ? "تم تحديث الكتاب" : "تمت إضافة الكتاب",
        description: "تم حفظ البيانات بنجاح.",
      })

      setForm(initialForm)
      setEditingId(null)
      await loadBooks()
    } catch (error) {
      toast({
        title: "تعذر حفظ الكتاب",
        description: error instanceof Error ? error.message : "تعذر حفظ بيانات الكتاب.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function startEdit(item: BookRecord) {
    setEditingId(item.id)
    setForm({
      id: item.id,
      title: item.title || "",
      slug: item.slug || item.id,
      shortDescription: item.shortDescription || "",
      description: item.description || "",
      price: String(item.price ?? ""),
      coverImageUrl: item.coverImageUrl || "",
      fileUrl: item.fileUrl || "",
      status: item.status || "active",
    })
  }

  async function changeStatus(id: string, status: "active" | "draft" | "hidden") {
    try {
      const response = await fetch(`/api/admin/books/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر تحديث الحالة.")
      toast({ title: "تم تحديث الحالة" })
      await loadBooks()
    } catch (error) {
      toast({
        title: "تعذر تحديث الحالة",
        description: error instanceof Error ? error.message : "تعذر تحديث الحالة.",
        variant: "destructive",
      })
    }
  }

  async function removeBook(id: string) {
    if (!globalThis.confirm("هل تريد حذف هذا الكتاب؟")) return

    try {
      const response = await fetch(`/api/admin/books/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || "تعذر حذف الكتاب.")
      toast({ title: "تم حذف الكتاب" })
      if (editingId === id) {
        setEditingId(null)
        setForm(initialForm)
      }
      await loadBooks()
    } catch (error) {
      toast({
        title: "تعذر حذف الكتاب",
        description: error instanceof Error ? error.message : "تعذر حذف الكتاب.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-3xl font-black text-foreground">إدارة الكتب</h1>
        <p className="mt-2 text-muted-foreground">إضافة وتعديل وحذف الكتب وإدارة روابط Google Drive بدون الاعتماد على Firebase Storage.</p>
      </section>

      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-black text-foreground">{isEditing ? "تعديل كتاب" : "إضافة كتاب جديد"}</h2>
        <form className="mt-5 grid gap-4" onSubmit={submitForm}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="book-id">المعرف</Label>
              <Input
                id="book-id"
                value={form.id}
                onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
                placeholder="book-id"
                disabled={isEditing}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-slug">Slug</Label>
              <Input
                id="book-slug"
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="book-id"
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-title">العنوان</Label>
            <Input
              id="book-title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-short">الوصف المختصر</Label>
            <Input
              id="book-short"
              value={form.shortDescription}
              onChange={(event) => setForm((prev) => ({ ...prev, shortDescription: event.target.value }))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-description">الوصف الكامل</Label>
            <Textarea
              id="book-description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-24 w-full"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="book-price">السعر</Label>
              <Input
                id="book-price"
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as FormState["status"] }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="draft">draft</SelectItem>
                  <SelectItem value="hidden">hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-image">رابط صورة الغلاف</Label>
            <Input
              id="book-image"
              value={form.coverImageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-file">رابط ملف الكتاب من Google Drive</Label>
            <Input
              id="book-file"
              value={form.fileUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, fileUrl: event.target.value }))}
              placeholder="https://drive.google.com/file/d/FILE_ID/view"
              className="w-full"
            />
            <p className="rounded-xl border border-border bg-secondary/25 p-3 text-xs leading-6 text-muted-foreground break-words">
              ارفعي الملف على Google Drive، ثم اجعلي المشاركة: أي شخص لديه الرابط يمكنه العرض، وبعدها ضعي الرابط هنا.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving} className="rounded-full">
              {saving ? "جارٍ الحفظ..." : isEditing ? "حفظ التعديلات" : "إضافة الكتاب"}
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
        <h2 className="text-2xl font-black text-foreground">الكتب الحالية</h2>
        {loading ? <p className="mt-4 text-muted-foreground">جارٍ التحميل...</p> : null}
        {!loading && items.length === 0 ? <p className="mt-4 text-muted-foreground">لا توجد كتب بعد.</p> : null}

        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground break-words">
                    {item.slug} · {toNumber(item.price).toLocaleString("ar-EG")} EGP · {item.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" className="rounded-full" onClick={() => startEdit(item)}>
                    تعديل
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="rounded-full bg-transparent" onClick={() => changeStatus(item.id, "active")}>
                    تفعيل
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="rounded-full bg-transparent" onClick={() => changeStatus(item.id, "draft")}>
                    Draft
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="rounded-full bg-transparent" onClick={() => changeStatus(item.id, "hidden")}>
                    إخفاء
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="rounded-full bg-transparent text-destructive" onClick={() => removeBook(item.id)}>
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
