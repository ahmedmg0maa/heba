import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { FieldValue, getFirestore, type Firestore, type WhereFilterOp } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

type StoreDocument = Record<string, unknown>
export type AdminRecord = { id: string } & StoreDocument

type WhereClause = {
  field: string
  op?: WhereFilterOp
  value: unknown
}

type ListOptions = {
  limit?: number
  orderByField?: string
  orderDirection?: "asc" | "desc"
  whereClauses?: WhereClause[]
}

type WriteResult = {
  ok: boolean
  error?: string
  message?: string
}

type AddDocumentResult = WriteResult & {
  id: string
  record?: AdminRecord
}

export const FIREBASE_NOT_CONFIGURED_ERROR = "FIREBASE_NOT_CONFIGURED"
export const FIREBASE_INVALID_CREDENTIALS_ERROR = "FIREBASE_INVALID_CREDENTIALS"
export const FIREBASE_NOT_CONFIGURED_MESSAGE =
  "إعدادات Firebase Admin غير مكتملة. يرجى ضبط FIREBASE_SERVICE_ACCOUNT_JSON على الخادم."
export const FIREBASE_INVALID_CREDENTIALS_MESSAGE =
  "تعذر قراءة بيانات Firebase Admin. تأكد من صحة قيمة FIREBASE_SERVICE_ACCOUNT_JSON."

let cachedDb: Firestore | null = null
let cachedApp: App | null = null
let cachedServiceAccount: Parameters<typeof cert>[0] | null | undefined

function getServiceAccount() {
  if (cachedServiceAccount !== undefined) return cachedServiceAccount

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (!raw) {
    cachedServiceAccount = null
    return cachedServiceAccount
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const projectId =
      (typeof parsed.project_id === "string" && parsed.project_id.trim()) ||
      (typeof parsed.projectId === "string" && parsed.projectId.trim()) ||
      ""
    const clientEmail =
      (typeof parsed.client_email === "string" && parsed.client_email.trim()) ||
      (typeof parsed.clientEmail === "string" && parsed.clientEmail.trim()) ||
      ""
    const privateKeySource =
      (typeof parsed.private_key === "string" && parsed.private_key.trim()) ||
      (typeof parsed.privateKey === "string" && parsed.privateKey.trim()) ||
      ""
    const privateKey = privateKeySource.replace(/\\n/g, "\n")

    if (!projectId || !clientEmail || !privateKey) {
      cachedServiceAccount = null
      return cachedServiceAccount
    }

    cachedServiceAccount = {
      projectId,
      clientEmail,
      privateKey,
    }

    return cachedServiceAccount
  } catch (error) {
    console.error("Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", error)
    cachedServiceAccount = null
    return cachedServiceAccount
  }
}

export function isFirebaseConfigured() {
  return Boolean(getServiceAccount())
}

export function getFirebaseSetupErrorMessage() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (!raw) return FIREBASE_NOT_CONFIGURED_MESSAGE
  if (!getServiceAccount()) return FIREBASE_INVALID_CREDENTIALS_MESSAGE
  return null
}

function getAdminApp() {
  if (cachedApp) return cachedApp

  const serviceAccount = getServiceAccount()
  if (!serviceAccount) return null

  cachedApp = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) })
  return cachedApp
}

function getDb() {
  if (cachedDb) return cachedDb

  const app = getAdminApp()
  if (!app) return null

  cachedDb = getFirestore(app)
  return cachedDb
}

function nowISO() {
  return new Date().toISOString()
}

function toSerializable(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map((item) => toSerializable(item))
  if (typeof value !== "object") return value

  const maybeTimestamp = value as { toDate?: () => Date }
  if (typeof maybeTimestamp.toDate === "function") {
    return maybeTimestamp.toDate().toISOString()
  }

  const entries = Object.entries(value as Record<string, unknown>)
  return Object.fromEntries(entries.map(([key, nested]) => [key, toSerializable(nested)]))
}

function notConfiguredResult(): WriteResult {
  const setupMessage = getFirebaseSetupErrorMessage()
  const isInvalid = setupMessage === FIREBASE_INVALID_CREDENTIALS_MESSAGE
  return {
    ok: false,
    error: isInvalid ? FIREBASE_INVALID_CREDENTIALS_ERROR : FIREBASE_NOT_CONFIGURED_ERROR,
    message: setupMessage || FIREBASE_NOT_CONFIGURED_MESSAGE,
  }
}

export function getFirebaseAdminErrorMessage(error?: string) {
  if (error === FIREBASE_NOT_CONFIGURED_ERROR) return FIREBASE_NOT_CONFIGURED_MESSAGE
  if (error === FIREBASE_INVALID_CREDENTIALS_ERROR) return FIREBASE_INVALID_CREDENTIALS_MESSAGE
  return null
}

export async function verifyFirebaseIdToken(idToken: string) {
  const app = getAdminApp()
  if (!app) {
    return {
      ok: false as const,
      error: FIREBASE_NOT_CONFIGURED_ERROR,
      message: getFirebaseSetupErrorMessage() || FIREBASE_NOT_CONFIGURED_MESSAGE,
    }
  }

  try {
    const decoded = await getAuth(app).verifyIdToken(idToken)
    return { ok: true as const, decoded }
  } catch (error) {
    console.error("Failed to verify Firebase ID token:", error)
    return { ok: false as const, error: "INVALID_AUTH_TOKEN", message: "رمز التحقق غير صالح." }
  }
}

function resolveStorageBucketName() {
  const fromPrivate = process.env.FIREBASE_STORAGE_BUCKET?.trim()
  if (fromPrivate) return fromPrivate

  const fromPublic = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim()
  if (fromPublic) return fromPublic

  const serviceAccount = getServiceAccount()
  const projectIdValue =
    (serviceAccount as { projectId?: unknown; project_id?: unknown } | null)?.projectId ??
    (serviceAccount as { projectId?: unknown; project_id?: unknown } | null)?.project_id
  const projectId = typeof projectIdValue === "string" ? projectIdValue.trim() : ""
  if (projectId) return `${projectId}.appspot.com`

  return ""
}

export function getFirebaseStorageBucket() {
  const app = getAdminApp()
  if (!app) return null

  const bucketName = resolveStorageBucketName()
  if (!bucketName) return null

  try {
    return getStorage(app).bucket(bucketName)
  } catch (error) {
    console.error("Failed to initialize Firebase Storage bucket:", error)
    return null
  }
}

export async function addDocument(collectionName: string, data: StoreDocument): Promise<AddDocumentResult> {
  const db = getDb()
  if (!db) {
    return { ...notConfiguredResult(), id: "" }
  }

  const now = nowISO()
  const record = {
    ...data,
    createdAt: typeof data.createdAt === "string" ? data.createdAt : now,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : now,
  }

  try {
    const ref = await db.collection(collectionName).add(record)
    return { ok: true, id: ref.id, record: { id: ref.id, ...record } as AdminRecord }
  } catch (error) {
    console.error(`Failed to add ${collectionName} document:`, error)
    return { ok: false, id: "", error: "WRITE_FAILED", message: "تعذر حفظ البيانات." }
  }
}

export async function listDocuments(collectionName: string, options?: ListOptions): Promise<AdminRecord[]> {
  const db = getDb()
  if (!db) return []

  try {
    let ref: FirebaseFirestore.Query = db.collection(collectionName)

    for (const clause of options?.whereClauses || []) {
      ref = ref.where(clause.field, clause.op || "==", clause.value)
    }

    if (options?.orderByField) {
      ref = ref.orderBy(options.orderByField, options.orderDirection || "desc")
    }

    if (typeof options?.limit === "number") {
      ref = ref.limit(options.limit)
    }

    const snapshot = await ref.get()
    return snapshot.docs.map((item) => ({
      id: item.id,
      ...(toSerializable(item.data()) as StoreDocument),
    })) as AdminRecord[]
  } catch (error) {
    console.error(`Failed to list ${collectionName} documents:`, error)
    return []
  }
}

export async function getDocument(collectionName: string, id: string): Promise<AdminRecord | null> {
  const db = getDb()
  if (!db) return null

  try {
    const snapshot = await db.collection(collectionName).doc(id).get()
    if (!snapshot.exists) return null
    return { id: snapshot.id, ...(toSerializable(snapshot.data()) as StoreDocument) }
  } catch (error) {
    console.error(`Failed to get ${collectionName}/${id}:`, error)
    return null
  }
}

export async function updateDocument(collectionName: string, id: string, data: StoreDocument): Promise<WriteResult> {
  const db = getDb()
  if (!db) return notConfiguredResult()

  const payload = { ...data, updatedAt: FieldValue.serverTimestamp() }
  try {
    await db.collection(collectionName).doc(id).update(payload)
    return { ok: true }
  } catch (error) {
    console.error(`Failed to update ${collectionName}/${id}:`, error)
    return { ok: false, error: "UPDATE_FAILED", message: "تعذر تحديث البيانات." }
  }
}

export async function setDocument(
  collectionName: string,
  id: string,
  data: StoreDocument,
  merge = true,
): Promise<WriteResult> {
  const db = getDb()
  if (!db) return notConfiguredResult()

  const payload: StoreDocument = {
    ...data,
    updatedAt: nowISO(),
  }

  if (!merge) {
    payload.createdAt =
      typeof data.createdAt === "string" && data.createdAt.trim().length > 0 ? data.createdAt : nowISO()
  }

  try {
    await db.collection(collectionName).doc(id).set(payload, { merge })
    return { ok: true }
  } catch (error) {
    console.error(`Failed to set ${collectionName}/${id}:`, error)
    return { ok: false, error: "SET_FAILED", message: "تعذر حفظ البيانات." }
  }
}

export async function deleteDocument(collectionName: string, id: string): Promise<WriteResult> {
  const db = getDb()
  if (!db) return notConfiguredResult()

  try {
    await db.collection(collectionName).doc(id).delete()
    return { ok: true }
  } catch (error) {
    console.error(`Failed to delete ${collectionName}/${id}:`, error)
    return { ok: false, error: "DELETE_FAILED", message: "تعذر حذف البيانات." }
  }
}

function toMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim())
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return hour * 60 + minute
}

export async function listBookingsForDate(dateKey: string) {
  const records = await listDocuments("bookings", {
    whereClauses: [{ field: "date", value: dateKey.slice(0, 10) }],
    limit: 400,
  })

  return records
    .map((item) => {
      const time = String(item.time || "")
      const minutes = toMinutes(time)
      return {
        date: String(item.date || dateKey.slice(0, 10)),
        time,
        startMinutes: minutes,
        duration: Number(item.duration || 60),
        status: item.status ? String(item.status) : undefined,
      }
    })
    .filter((item) => item.startMinutes !== null)
}

export { FieldValue }
