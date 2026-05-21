import "server-only"
import { getAdminSessionConfig, getAdminSessionSetupErrors } from "@/lib/admin-session"

type EnvItemStatus = {
  key: string
  configured: boolean
  required: boolean
  message?: string
}

type FirebaseServiceAccountValidation = {
  configured: boolean
  valid: boolean
  message?: string
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function validateFirebaseServiceAccountJson(): FirebaseServiceAccountValidation {
  const raw = text(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  if (!raw) {
    return {
      configured: false,
      valid: false,
      message: "المتغير FIREBASE_SERVICE_ACCOUNT_JSON غير مضبوط.",
    }
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const projectId = text(parsed.project_id ?? parsed.projectId)
    const clientEmail = text(parsed.client_email ?? parsed.clientEmail)
    const privateKey = text(parsed.private_key ?? parsed.privateKey).replace(/\\n/g, "\n")
    if (!projectId || !clientEmail || !privateKey) {
      return {
        configured: true,
        valid: false,
        message:
          "قيمة FIREBASE_SERVICE_ACCOUNT_JSON موجودة لكن ناقصة حقول أساسية (project_id, client_email, private_key).",
      }
    }
    return { configured: true, valid: true }
  } catch {
    return {
      configured: true,
      valid: false,
      message: "قيمة FIREBASE_SERVICE_ACCOUNT_JSON ليست JSON صالح.",
    }
  }
}

function publicFirebaseItems(): EnvItemStatus[] {
  const requiredKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ] as const

  const optionalKeys = ["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"] as const

  return [
    ...requiredKeys.map((key) => ({
      key,
      required: true,
      configured: Boolean(text(process.env[key])),
      message: Boolean(text(process.env[key])) ? undefined : `المتغير ${key} غير مضبوط.`,
    })),
    ...optionalKeys.map((key) => ({
      key,
      required: false,
      configured: Boolean(text(process.env[key])),
      message: undefined,
    })),
  ]
}

export type AdminEnvValidationReport = {
  configured: boolean
  errors: string[]
  session: {
    adminPasswordConfigured: boolean
    sessionSecretConfigured: boolean
  }
  firebaseServiceAccount: FirebaseServiceAccountValidation
  firebasePublic: {
    configured: boolean
    items: EnvItemStatus[]
  }
}

export function validateAdminEnv(): AdminEnvValidationReport {
  const sessionConfig = getAdminSessionConfig()
  const serviceAccount = validateFirebaseServiceAccountJson()
  const firebasePublic = publicFirebaseItems()
  const sessionErrors = getAdminSessionSetupErrors()
  const publicErrors = firebasePublic.filter((item) => item.required && !item.configured).map((item) => item.message || "")
  const firebaseErrors = serviceAccount.valid ? [] : [serviceAccount.message || "تعذر التحقق من إعدادات Firebase Admin."]

  const errors = [...sessionErrors, ...firebaseErrors, ...publicErrors].filter(Boolean)

  return {
    configured: errors.length === 0,
    errors,
    session: sessionConfig,
    firebaseServiceAccount: serviceAccount,
    firebasePublic: {
      configured: publicErrors.length === 0,
      items: firebasePublic,
    },
  }
}
