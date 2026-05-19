import { randomUUID } from "node:crypto"
import { extname } from "node:path"
import { NextResponse } from "next/server"
import { getFirebaseStorageBucket, isFirebaseConfigured } from "@/lib/firebase/admin"
import { requireAdmin } from "@/lib/require-admin"

export const runtime = "nodejs"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06ff\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function extensionFrom(file: File) {
  const fileExt = extname(file.name || "").replace(".", "").trim().toLowerCase()
  if (fileExt) return fileExt

  if (file.type === "application/pdf") return "pdf"
  if (file.type.startsWith("image/")) return file.type.split("/")[1] || "jpg"
  return "bin"
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, message: "غير مصرح." }, { status: 401 })
  }

  if (!isFirebaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "تعذر تنفيذ الرفع الآن. إعدادات Firebase Admin غير مكتملة (FIREBASE_SERVICE_ACCOUNT_JSON).",
      },
      { status: 503 },
    )
  }

  const bucket = getFirebaseStorageBucket()
  if (!bucket) {
    return NextResponse.json(
      {
        ok: false,
        message: "تعذر تنفيذ الرفع الآن. إعدادات Firebase Storage غير مكتملة.",
      },
      { status: 503 },
    )
  }

  try {
    const formData = await request.formData()
    const fileField = formData.get("file")
    const folder = sanitizePathSegment(text(formData.get("folder")) || "misc")
    const entityId = sanitizePathSegment(text(formData.get("entityId")) || "general")

    if (!(fileField instanceof File)) {
      return NextResponse.json({ ok: false, message: "يرجى اختيار ملف صالح." }, { status: 400 })
    }

    if (fileField.size <= 0) {
      return NextResponse.json({ ok: false, message: "الملف فارغ." }, { status: 400 })
    }

    const arrayBuffer = await fileField.arrayBuffer()
    const bytes = Buffer.from(arrayBuffer)
    const ext = extensionFrom(fileField)
    const safeName = sanitizePathSegment(fileField.name.replace(/\.[^/.]+$/, "")) || "file"
    const objectPath = `${folder}/${entityId}/${Date.now()}-${safeName}.${ext}`
    const token = randomUUID()

    await bucket.file(objectPath).save(bytes, {
      resumable: false,
      metadata: {
        contentType: fileField.type || "application/octet-stream",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    })

    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`
    return NextResponse.json({
      ok: true,
      url: fileUrl,
      path: objectPath,
      contentType: fileField.type || "application/octet-stream",
      size: fileField.size,
      bucket: bucket.name,
    })
  } catch (error) {
    console.error("Failed to upload file to Firebase Storage:", error)
    return NextResponse.json({ ok: false, message: "تعذر رفع الملف الآن. يرجى المحاولة مرة أخرى." }, { status: 500 })
  }
}
