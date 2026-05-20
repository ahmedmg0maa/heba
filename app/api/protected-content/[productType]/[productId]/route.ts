import { NextRequest, NextResponse } from "next/server"
import { getFirebaseSetupErrorMessage, isFirebaseConfigured } from "@/lib/firebase/admin"
import { resolveProtectedContentAccess, type ProtectedProductType } from "@/lib/protected-content"

type RouteContext = {
  params: Promise<{ productType: string; productId: string }>
}

export const runtime = "nodejs"

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function parseToken(request: NextRequest) {
  const authHeader = text(request.headers.get("authorization"))
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim()
  }
  return text(request.nextUrl.searchParams.get("token"))
}

function firebaseConfigResponse() {
  return NextResponse.json(
    {
      ok: false,
      message:
        getFirebaseSetupErrorMessage() ||
        "تعذر تنفيذ طلب المحتوى الآن. إعدادات Firebase Admin غير مكتملة (FIREBASE_SERVICE_ACCOUNT_JSON).",
    },
    { status: 503 },
  )
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isFirebaseConfigured()) return firebaseConfigResponse()

  const { productType, productId } = await context.params
  const normalizedType = text(productType).toLowerCase() as ProtectedProductType

  if (normalizedType !== "book" && normalizedType !== "course") {
    return NextResponse.json({ ok: false, message: "نوع المحتوى غير مدعوم." }, { status: 400 })
  }

  const mode = text(request.nextUrl.searchParams.get("mode")).toLowerCase() === "download" ? "download" : "stream"
  const token = parseToken(request)
  const resolved = await resolveProtectedContentAccess({
    request,
    idToken: token,
    productType: normalizedType,
    productId,
    mode,
  })

  if (!resolved.ok) {
    return NextResponse.json({ ok: false, message: resolved.message }, { status: resolved.status })
  }

  if (mode === "download") {
    return NextResponse.redirect(resolved.signedUrl, { status: 302 })
  }

  return NextResponse.json({
    ok: true,
    productType: normalizedType,
    productId: resolved.resolvedProductId,
    requestedProductId: productId,
    productTitle: resolved.productTitle,
    url: resolved.signedUrl,
    expiresAt: resolved.expiresAt,
    contentKind: resolved.contentKind,
    previewable: resolved.previewable,
    openLabel: resolved.openLabel,
    legalNoticePrimary:
      "هذا المحتوى مخصص لاستخدامك الشخصي فقط. يُمنع تصويره أو تسجيله أو مشاركته أو إعادة نشره بأي شكل.",
    legalNoticeSecondary:
      "حفاظًا على حقوق الملكية، قد تظهر علامة مائية مرتبطة بحسابك أثناء عرض المحتوى.",
    trace: {
      userId: resolved.user.userId,
      email: resolved.user.email,
      generatedAt: new Date().toISOString(),
    },
  })
}
