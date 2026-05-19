import { createHash } from "node:crypto"
import type { NextRequest } from "next/server"
import {
  addDocument,
  getDocument,
  getFirebaseStorageBucket,
  listDocuments,
  setDocument,
  verifyFirebaseIdToken,
} from "@/lib/firebase/admin"

export type ProtectedProductType = "book" | "course"

const MAX_ACTIVE_DEVICES_PER_PRODUCT = 2
const ACTIVE_SESSION_WINDOW_MS = 45 * 60 * 1000
const SIGNED_URL_TTL_MS = 5 * 60 * 1000
const RECENT_ACCESS_LIMIT_PER_HOUR = 30

type ResolveOptions = {
  request: NextRequest
  idToken: string
  productId: string
  productType: ProtectedProductType
  mode: "download" | "stream"
}

type AccessDenied = {
  ok: false
  status: number
  message: string
}

type AccessGranted = {
  ok: true
  status: number
  resourceUrl: string
  signedUrl: string
  contentKind: "video" | "pdf" | "file"
  expiresAt: string
  user: {
    userId: string
    email: string
  }
  ownership: {
    orderId: string
  }
}

export type ProtectedContentResult = AccessDenied | AccessGranted

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function parseDate(value: unknown) {
  const raw = text(value)
  if (!raw) return null
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

function detectContentKind(url: string): "video" | "pdf" | "file" {
  const lowered = url.toLowerCase()
  if (
    lowered.includes(".m3u8") ||
    lowered.includes(".mp4") ||
    lowered.includes(".webm") ||
    lowered.includes(".mov") ||
    lowered.includes("youtube.com") ||
    lowered.includes("youtu.be") ||
    lowered.includes("vimeo.com")
  ) {
    return "video"
  }
  if (lowered.includes(".pdf")) return "pdf"
  return "file"
}

function getClientIp(request: NextRequest) {
  const forwardedFor = text(request.headers.get("x-forwarded-for"))
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || ""
  return text(request.headers.get("x-real-ip"))
}

function getDeviceFingerprintHash(request: NextRequest) {
  const parts = [
    text(request.headers.get("user-agent")),
    text(request.headers.get("accept-language")),
    text(request.headers.get("sec-ch-ua-platform")),
    text(request.headers.get("sec-ch-ua")),
  ]
  return createHash("sha256").update(parts.join("|")).digest("hex")
}

function parseFirebaseStoragePath(url: string, bucketName?: string | null) {
  if (!url) return null

  if (url.startsWith("gs://")) {
    const withoutPrefix = url.slice(5)
    const slashIndex = withoutPrefix.indexOf("/")
    if (slashIndex < 1) return null
    const bucket = withoutPrefix.slice(0, slashIndex)
    const objectPath = withoutPrefix.slice(slashIndex + 1)
    if (bucketName && bucketName !== bucket) return null
    return objectPath
  }

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    const path = parsed.pathname

    if (host === "firebasestorage.googleapis.com") {
      const match = /^\/v0\/b\/([^/]+)\/o\/(.+)$/.exec(path)
      if (!match) return null
      const bucket = decodeURIComponent(match[1] || "")
      const objectPath = decodeURIComponent(match[2] || "")
      if (!bucket || !objectPath) return null
      if (bucketName && bucketName !== bucket) return null
      return objectPath
    }

    if (host === "storage.googleapis.com") {
      const parts = path.split("/").filter(Boolean)
      if (parts.length < 2) return null
      const [bucket, ...rest] = parts
      if (!bucket || rest.length === 0) return null
      if (bucketName && bucketName !== bucket) return null
      return decodeURIComponent(rest.join("/"))
    }

    return null
  } catch {
    return null
  }
}

async function findPaidOrder(productType: ProtectedProductType, productId: string, userId: string, email: string) {
  const whereByUser = [
    { field: "productType", value: productType },
    { field: "productId", value: productId },
    { field: "status", value: "paid" },
    { field: "userId", value: userId },
  ]
  const whereByEmail = email
    ? [
        { field: "productType", value: productType },
        { field: "productId", value: productId },
        { field: "status", value: "paid" },
        { field: "email", value: email },
      ]
    : []

  const [ordersByUser, ordersByEmail] = await Promise.all([
    listDocuments("orders", { whereClauses: whereByUser, orderByField: "createdAt", orderDirection: "desc", limit: 50 }),
    whereByEmail.length
      ? listDocuments("orders", { whereClauses: whereByEmail, orderByField: "createdAt", orderDirection: "desc", limit: 50 })
      : Promise.resolve([]),
  ])

  const merged = [...ordersByUser, ...ordersByEmail]
  if (!merged.length) return null
  const unique = new Map<string, (typeof merged)[number]>()
  for (const item of merged) unique.set(String(item.id), item)
  const orders = Array.from(unique.values())
  orders.sort((a, b) => {
    const aDate = parseDate(a.createdAt)?.getTime() || 0
    const bDate = parseDate(b.createdAt)?.getTime() || 0
    return bDate - aDate
  })
  return orders[0] || null
}

async function evaluateSessionRisk(options: {
  userId: string
  email: string
  productId: string
  productType: ProtectedProductType
  deviceHash: string
}) {
  const { userId, email, productId, productType, deviceHash } = options
  const sessionId = `${userId}_${productType}_${productId}_${deviceHash.slice(0, 16)}`
  const now = Date.now()

  const sessions = await listDocuments("protected_active_sessions", {
    whereClauses: [
      { field: "userId", value: userId },
      { field: "productType", value: productType },
      { field: "productId", value: productId },
    ],
    orderByField: "lastSeenAt",
    orderDirection: "desc",
    limit: 100,
  })

  const activeSessions = sessions.filter((item) => {
    const lastSeen = parseDate(item.lastSeenAt)?.getTime() || 0
    return lastSeen > 0 && now - lastSeen <= ACTIVE_SESSION_WINDOW_MS
  })

  const activeDevices = new Set(activeSessions.map((item) => text(item.deviceHash)).filter(Boolean))
  const alreadyActiveOnThisDevice = activeDevices.has(deviceHash)

  if (!alreadyActiveOnThisDevice && activeDevices.size >= MAX_ACTIVE_DEVICES_PER_PRODUCT) {
    return {
      ok: false as const,
      message: "تم تجاوز الحد المسموح للأجهزة النشطة لهذا المحتوى. أغلقي جلسة أخرى ثم حاولي مجددًا.",
      sessionId,
      activeDevices: activeDevices.size,
    }
  }

  await setDocument(
    "protected_active_sessions",
    sessionId,
    {
      userId,
      email,
      productId,
      productType,
      deviceHash,
      active: true,
      lastSeenAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ACTIVE_SESSION_WINDOW_MS).toISOString(),
    },
    true,
  )

  return {
    ok: true as const,
    sessionId,
    activeDevices: Math.max(activeDevices.size, alreadyActiveOnThisDevice ? activeDevices.size : activeDevices.size + 1),
  }
}

async function logProtectedAccess(options: {
  request: NextRequest
  userId: string
  email: string
  productId: string
  productType: ProtectedProductType
  orderId: string
  action: "stream" | "download" | "deny"
  allowed: boolean
  reason?: string
  suspicious?: boolean
  deviceHash?: string
}) {
  const {
    request,
    userId,
    email,
    productId,
    productType,
    orderId,
    action,
    allowed,
    reason = "",
    suspicious = false,
    deviceHash = "",
  } = options
  const ip = getClientIp(request)
  const userAgent = text(request.headers.get("user-agent"))
  const nowIso = new Date().toISOString()
  await addDocument("protected_access_logs", {
    userId,
    email,
    productId,
    productType,
    orderId,
    action,
    timestamp: nowIso,
    ip,
    userAgent,
    deviceHash,
    allowed,
    reason,
    suspicious,
    createdAt: nowIso,
    updatedAt: nowIso,
  })
}

async function countRecentAccesses(userId: string, productType: ProtectedProductType, productId: string) {
  const entries = await listDocuments("protected_access_logs", {
    whereClauses: [
      { field: "userId", value: userId },
      { field: "productType", value: productType },
      { field: "productId", value: productId },
    ],
    orderByField: "timestamp",
    orderDirection: "desc",
    limit: 120,
  })

  const threshold = Date.now() - 60 * 60 * 1000
  return entries.filter((entry) => {
    const ts = parseDate(entry.timestamp)?.getTime() || 0
    return ts >= threshold
  }).length
}

export async function resolveProtectedContentAccess(options: ResolveOptions): Promise<ProtectedContentResult> {
  const { request, idToken, productId, productType, mode } = options
  if (!idToken) {
    return { ok: false, status: 401, message: "يجب تسجيل الدخول أولًا." }
  }

  const authResult = await verifyFirebaseIdToken(idToken)
  if (!authResult.ok) {
    return { ok: false, status: 401, message: "جلسة المستخدم غير صالحة." }
  }

  const userId = text(authResult.decoded.uid)
  const email = normalizeEmail(text(authResult.decoded.email || ""))
  if (!userId) {
    return { ok: false, status: 401, message: "لا يمكن التحقق من هوية المستخدم." }
  }

  const normalizedProductId = text(productId)
  if (!normalizedProductId) {
    return { ok: false, status: 400, message: "معرّف المحتوى غير صالح." }
  }

  const order = await findPaidOrder(productType, normalizedProductId, userId, email)
  if (!order) {
    await logProtectedAccess({
      request,
      userId,
      email,
      productId: normalizedProductId,
      productType,
      orderId: "",
      action: "deny",
      allowed: false,
      reason: "no_paid_ownership",
      suspicious: true,
    })
    return { ok: false, status: 403, message: "هذا المحتوى متاح فقط بعد الدفع وتفعيل الطلب." }
  }

  const deviceHash = getDeviceFingerprintHash(request)
  const sessionRisk = await evaluateSessionRisk({
    userId,
    email,
    productId: normalizedProductId,
    productType,
    deviceHash,
  })

  if (!sessionRisk.ok) {
    await logProtectedAccess({
      request,
      userId,
      email,
      productId: normalizedProductId,
      productType,
      orderId: String(order.id),
      action: "deny",
      allowed: false,
      reason: "device_limit_reached",
      suspicious: true,
      deviceHash,
    })
    return { ok: false, status: 429, message: sessionRisk.message }
  }

  const collectionName = productType === "book" ? "books" : "courses"
  const product = await getDocument(collectionName, normalizedProductId)
  if (!product) {
    await logProtectedAccess({
      request,
      userId,
      email,
      productId: normalizedProductId,
      productType,
      orderId: String(order.id),
      action: "deny",
      allowed: false,
      reason: "product_not_found",
      suspicious: true,
      deviceHash,
    })
    return { ok: false, status: 404, message: "تعذر العثور على هذا المحتوى." }
  }

  const resourceUrl = text(productType === "book" ? product.fileUrl : product.accessUrl)
  if (!resourceUrl) {
    await logProtectedAccess({
      request,
      userId,
      email,
      productId: normalizedProductId,
      productType,
      orderId: String(order.id),
      action: "deny",
      allowed: false,
      reason: "missing_resource_url",
      suspicious: true,
      deviceHash,
    })
    return { ok: false, status: 404, message: "سيتم تفعيل الوصول قريبًا، ويمكنك التواصل مع الدعم." }
  }

  const bucket = getFirebaseStorageBucket()
  const objectPath = parseFirebaseStoragePath(resourceUrl, bucket?.name || null)
  let signedUrl = ""

  if (bucket && objectPath) {
    try {
      const expiresAtMs = Date.now() + SIGNED_URL_TTL_MS
      const [url] = await bucket.file(objectPath).getSignedUrl({
        action: "read",
        expires: expiresAtMs,
        version: "v4",
        responseDisposition: mode === "download" ? "attachment" : "inline",
      })
      signedUrl = url
    } catch (error) {
      console.error("Failed to generate signed URL:", error)
      return { ok: false, status: 500, message: "تعذر إنشاء رابط آمن للمحتوى الآن." }
    }
  } else if (productType === "course" && /^https:\/\//i.test(resourceUrl)) {
    signedUrl = resourceUrl
  } else {
    await logProtectedAccess({
      request,
      userId,
      email,
      productId: normalizedProductId,
      productType,
      orderId: String(order.id),
      action: "deny",
      allowed: false,
      reason: "insecure_or_unrecognized_storage_url",
      suspicious: true,
      deviceHash,
    })
    return { ok: false, status: 503, message: "سيتم تفعيل الوصول قريبًا، ويمكنك التواصل مع الدعم." }
  }

  const recentAccessCount = await countRecentAccesses(userId, productType, normalizedProductId)
  const suspicious = recentAccessCount >= RECENT_ACCESS_LIMIT_PER_HOUR

  await logProtectedAccess({
    request,
    userId,
    email,
    productId: normalizedProductId,
    productType,
    orderId: String(order.id),
    action: mode === "download" ? "download" : "stream",
    allowed: true,
    reason: signedUrl === resourceUrl ? "external_source" : "signed_url",
    suspicious,
    deviceHash,
  })

  return {
    ok: true,
    status: 200,
    resourceUrl,
    signedUrl,
    contentKind: detectContentKind(resourceUrl),
    expiresAt: new Date(Date.now() + SIGNED_URL_TTL_MS).toISOString(),
    user: { userId, email },
    ownership: { orderId: String(order.id) },
  }
}
