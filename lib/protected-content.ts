import { createHash } from "node:crypto"
import type { NextRequest } from "next/server"
import { extractGoogleDriveFileId } from "@/lib/google-drive"
import {
  FieldValue,
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
  resolvedProductId: string
  resolvedProductSlug: string
  productTitle: string
  resourceUrl: string
  signedUrl: string
  contentKind: "video" | "pdf" | "file"
  previewable: boolean
  openLabel: string
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

type ResolvedProduct = {
  id: string
  slug: string
  title: string
  resourceUrl: string
}

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

function isDevelopment() {
  return process.env.NODE_ENV !== "production"
}

function logBookAccessDebug(details: {
  userId: string
  requestedBookParam: string
  resolvedBookId: string
  matchingPaidOrderFound: boolean
}) {
  if (!isDevelopment()) return
  console.debug("[protected-book-access]", details)
}

function normalizeDriveResourceUrl(url: string, mode: "download" | "stream") {
  const fileId = extractGoogleDriveFileId(url)
  if (!fileId) return { normalizedUrl: url, previewable: false }

  if (mode === "download") {
    return {
      normalizedUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      previewable: false,
    }
  }

  return {
    normalizedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    previewable: true,
  }
}

async function resolveProduct(productType: ProtectedProductType, requestedParam: string): Promise<ResolvedProduct | null> {
  const collectionName = productType === "book" ? "books" : "courses"
  const resourceField = productType === "book" ? "fileUrl" : "accessUrl"
  const normalizedParam = text(requestedParam)
  if (!normalizedParam) return null

  const byId = await getDocument(collectionName, normalizedParam)
  if (byId) {
    return {
      id: text(byId.id),
      slug: text(byId.slug) || text(byId.id),
      title: text(byId.title) || text(byId.slug) || text(byId.id),
      resourceUrl: text(byId[resourceField]),
    }
  }

  const bySlug = await listDocuments(collectionName, {
    whereClauses: [{ field: "slug", value: normalizedParam }],
    limit: 1,
  })
  if (!bySlug.length) return null

  const item = bySlug[0]
  return {
    id: text(item.id),
    slug: text(item.slug) || text(item.id),
    title: text(item.title) || text(item.slug) || text(item.id),
    resourceUrl: text(item[resourceField]),
  }
}

async function listPaidOrdersByIdentity(userId: string, emailCandidates: string[]) {
  const whereByUser = [
    { field: "status", value: "paid" },
    { field: "userId", value: userId },
  ]

  const emailQueries = Array.from(new Set(emailCandidates.map((item) => item.trim()).filter(Boolean))).map((email) =>
    listDocuments("orders", {
      whereClauses: [
        { field: "status", value: "paid" },
        { field: "email", value: email },
      ],
      orderByField: "createdAt",
      orderDirection: "desc",
      limit: 100,
    }),
  )

  const [ordersByUser, ...ordersByEmailGroups] = await Promise.all([
    listDocuments("orders", { whereClauses: whereByUser, orderByField: "createdAt", orderDirection: "desc", limit: 100 }),
    ...emailQueries,
  ])
  const ordersByEmail = ordersByEmailGroups.flat()

  const merged = [...ordersByUser, ...ordersByEmail]
  const unique = new Map<string, (typeof merged)[number]>()
  for (const order of merged) unique.set(String(order.id), order)
  return Array.from(unique.values())
}

function matchesPaidOwnership(options: {
  order: Record<string, unknown>
  productType: ProtectedProductType
  resolvedProductId: string
  resolvedSlug: string
}) {
  const { order, productType, resolvedProductId, resolvedSlug } = options
  const orderStatus = text(order.status).toLowerCase()
  const orderType = text(order.productType).toLowerCase()
  if (orderStatus !== "paid") return false
  if (orderType !== productType) return false

  const orderProductId = text(order.productId)
  const orderProductSlug = text(order.productSlug)
  const orderItemId = text(order.itemId)

  if (productType === "book") {
    return (
      orderProductId === resolvedProductId ||
      (resolvedSlug && orderProductId === resolvedSlug) ||
      (resolvedSlug && orderProductSlug === resolvedSlug) ||
      orderItemId === resolvedProductId
    )
  }

  return orderProductId === resolvedProductId
}

async function findPaidOrderForProduct(options: {
  productType: ProtectedProductType
  userId: string
  emails: string[]
  resolvedProductId: string
  resolvedSlug: string
}) {
  const { productType, userId, emails, resolvedProductId, resolvedSlug } = options
  const paidOrders = await listPaidOrdersByIdentity(userId, emails)
  const matching = paidOrders.filter((order) =>
    matchesPaidOwnership({
      order,
      productType,
      resolvedProductId,
      resolvedSlug,
    }),
  )

  matching.sort((a, b) => {
    const aDate = parseDate(a.createdAt)?.getTime() || 0
    const bDate = parseDate(b.createdAt)?.getTime() || 0
    return bDate - aDate
  })

  return matching[0] || null
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
  action: "stream" | "download"
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
    reason = "",
    suspicious = false,
    deviceHash = "",
  } = options
  const ip = getClientIp(request)
  const userAgent = text(request.headers.get("user-agent"))
  const required = {
    userId: text(userId),
    email: normalizeEmail(email),
    productId: text(productId),
    productType: text(productType).toLowerCase(),
    action: text(action).toLowerCase(),
    userAgent,
  }

  if (!required.userId || !required.email || !required.productId || !required.productType || !required.action || !required.userAgent) {
    console.warn("[protected_access_logs] skipped write: missing required fields", {
      userId: required.userId,
      email: required.email,
      productId: required.productId,
      productType: required.productType,
      action: required.action,
      userAgentPresent: Boolean(required.userAgent),
    })
    return
  }

  if (required.productType !== "book" && required.productType !== "course") {
    console.warn("[protected_access_logs] skipped write: invalid productType", {
      userId: required.userId,
      productId: required.productId,
      productType: required.productType,
    })
    return
  }

  if (required.action !== "stream" && required.action !== "download") {
    console.warn("[protected_access_logs] skipped write: invalid action", {
      userId: required.userId,
      productId: required.productId,
      action: required.action,
    })
    return
  }

  const payload: Record<string, unknown> = {
    userId: required.userId,
    email: required.email,
    productId: required.productId,
    productType: required.productType,
    orderId: text(orderId),
    action: required.action,
    timestamp: FieldValue.serverTimestamp(),
    userAgent: required.userAgent,
    deviceHash: text(deviceHash),
    reason: text(reason),
    suspicious: Boolean(suspicious),
    allowed: true,
  }
  if (ip) payload.ip = ip

  if (Object.keys(payload).length === 0) {
    console.warn("[protected_access_logs] prevented empty payload write")
    return
  }

  const write = await addDocument("protected_access_logs", payload)
  if (!write.ok || !write.id) {
    console.warn("[protected_access_logs] write failed", {
      userId: required.userId,
      productId: required.productId,
      action: required.action,
      error: write.error || "UNKNOWN",
      message: write.message || "",
    })
  }
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
  const rawEmail = text(authResult.decoded.email || "")
  const email = normalizeEmail(rawEmail)
  if (!userId) {
    return { ok: false, status: 401, message: "لا يمكن التحقق من هوية المستخدم." }
  }

  const requestedProductParam = text(productId)
  if (!requestedProductParam) {
    return { ok: false, status: 400, message: "معرّف المحتوى غير صالح." }
  }

  const resolvedProduct = await resolveProduct(productType, requestedProductParam)
  if (!resolvedProduct) {
    if (productType === "book") {
      logBookAccessDebug({
        userId,
        requestedBookParam: requestedProductParam,
        resolvedBookId: "",
        matchingPaidOrderFound: false,
      })
    }
    return { ok: false, status: 404, message: "تعذر العثور على هذا المحتوى." }
  }

  const resolvedProductId = text(resolvedProduct.id)
  const resolvedProductSlug = text(resolvedProduct.slug)
  if (!resolvedProductId) {
    return { ok: false, status: 404, message: "تعذر العثور على هذا المحتوى." }
  }

  const order = await findPaidOrderForProduct({
    productType,
    userId,
    emails: [rawEmail, email],
    resolvedProductId,
    resolvedSlug: resolvedProductSlug,
  })

  if (!order) {
    if (productType === "book") {
      logBookAccessDebug({
        userId,
        requestedBookParam: requestedProductParam,
        resolvedBookId: resolvedProductId,
        matchingPaidOrderFound: false,
      })
    }
    return { ok: false, status: 403, message: "هذا المحتوى متاح بعد تأكيد الدفع وتفعيل الوصول." }
  }

  const deviceHash = getDeviceFingerprintHash(request)
  const sessionRisk = await evaluateSessionRisk({
    userId,
    email,
    productId: resolvedProductId,
    productType,
    deviceHash,
  })

  if (!sessionRisk.ok) {
    return { ok: false, status: 429, message: sessionRisk.message }
  }

  const resourceUrl = text(resolvedProduct.resourceUrl)
  if (!resourceUrl) {
    return { ok: false, status: 404, message: "تم تأكيد وصولك، وسيتم تفعيل رابط الكتاب قريبًا. يمكنك التواصل مع الدعم للمساعدة." }
  }

  const bucket = getFirebaseStorageBucket()
  const objectPath = parseFirebaseStoragePath(resourceUrl, bucket?.name || null)
  let signedUrl = ""
  let previewable = false

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
      const kind = detectContentKind(resourceUrl)
      previewable = mode === "stream" && (kind === "pdf" || kind === "video")
    } catch (error) {
      console.error("Failed to generate signed URL:", error)
      return { ok: false, status: 500, message: "تعذر إنشاء رابط آمن للمحتوى الآن." }
    }
  } else if (/^https:\/\//i.test(resourceUrl)) {
    const driveNormalized = normalizeDriveResourceUrl(resourceUrl, mode)
    signedUrl = driveNormalized.normalizedUrl
    previewable = mode === "stream" && (driveNormalized.previewable || detectContentKind(resourceUrl) === "pdf")
  } else {
    return { ok: false, status: 503, message: "تم تأكيد وصولك، وسيتم تفعيل رابط الكتاب قريبًا. يمكنك التواصل مع الدعم للمساعدة." }
  }

  const recentAccessCount = await countRecentAccesses(userId, productType, resolvedProductId)
  const suspicious = recentAccessCount >= RECENT_ACCESS_LIMIT_PER_HOUR

  await logProtectedAccess({
    request,
    userId,
    email,
    productId: resolvedProductId,
    productType,
    orderId: String(order.id),
    action: mode === "download" ? "download" : "stream",
    reason: signedUrl === resourceUrl ? "external_source" : "signed_url",
    suspicious,
    deviceHash,
  })

  const contentKind = detectContentKind(resourceUrl)
  const openLabel =
    productType === "book" ? (previewable ? "عرض الكتاب" : "فتح الرابط الآمن") : "فتح المحتوى"

  return {
    ok: true,
    status: 200,
    resolvedProductId,
    resolvedProductSlug,
    productTitle: resolvedProduct.title,
    resourceUrl,
    signedUrl,
    contentKind,
    previewable,
    openLabel,
    expiresAt: new Date(Date.now() + SIGNED_URL_TTL_MS).toISOString(),
    user: { userId, email },
    ownership: { orderId: String(order.id) },
  }
}
