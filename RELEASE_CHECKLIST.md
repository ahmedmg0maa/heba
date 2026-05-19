# RELEASE CHECKLIST — Heba ElSherif Premium Platform

## 1) What Was Fixed
- Unified admin auth/session to one source: `lib/admin-session.ts`.
- Removed duplicate admin auth flow usage from routes/components and standardized on `requireAdmin()`.
- Admin cookie unified to `heba_admin_session` with path `/` and consistent secure/httpOnly settings.
- Added admin debug route: `/api/admin/me`.
- Ensured all `/api/admin/**` routes run on Node runtime (`export const runtime = "nodejs"`).
- Fixed admin write actions to use same auth (bookings/orders/books/courses).
- Added protected CSV export routes:
  - `/api/admin/export/bookings`
  - `/api/admin/export/orders`
- Kept Google Drive links as primary admin content input and normalized links server-side.
- Added payment abstraction `lib/payments.ts` and safe Paymob webhook placeholder:
  - `app/api/payments/paymob/webhook/route.ts`
  - No automatic paid marking without verified signature + full mapping.
- Added optional analytics abstraction `lib/analytics.ts` (safe no-op when not configured).
- Added optional support helper `lib/support.ts` and WhatsApp CTA behavior (hidden when env missing).
- Added/updated policy pages:
  - `/terms`
  - `/privacy`
  - `/refund-policy`
- Updated Firestore/Storage rules for production-oriented server-side write model.

## 2) Required Vercel Settings
- Framework Preset: `Next.js`
- Build Command: `pnpm run build`
- Install Command: `pnpm install`
- Output Directory: *(empty / default)*
- Node.js: `20` or `22`

## 3) Required Environment Variables
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_SITE_URL`

## 4) Optional Environment Variables
- `FIREBASE_STORAGE_BUCKET` *(optional for Storage-backed signed links/uploads)*
- `PAYMOB_API_KEY`
- `PAYMOB_INTEGRATION_ID`
- `PAYMOB_IFRAME_ID`
- `PAYMOB_HMAC_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ADMIN_NOTIFY_EMAIL`
- `NEXT_PUBLIC_SUPPORT_WHATSAPP`
- `NEXT_PUBLIC_ANALYTICS_ENDPOINT`
- `ANALYTICS_ENDPOINT`
- `OPENAI_API_KEY`

## 5) Manual Test Checklist
1. Admin login from `/admin/login`.
2. Open `/api/admin/me` and confirm:
   - `authenticated: true`
   - `cookieExists: true`
   - `cookieName: "heba_admin_session"`
3. Add book.
4. Edit book.
5. Delete book.
6. Add course.
7. Edit course.
8. Delete course.
9. Create booking.
10. Approve/cancel/complete booking from admin.
11. Create order.
12. Mark order paid / cancel order from admin.
13. Verify customer account shows paid access.
14. Verify protected content works only after paid ownership validation.
15. Verify Google Drive links resolve and access works after activation.

## 6) Known External Setup Needed
- Paymob keys + webhook setup (if enabling gateway mode).
- Resend API key + sender identity/domain setup (if enabling email).
- Google Drive sharing permissions per admin help text.
- Deploy Firebase rules:
  - `firestore.rules`
  - `storage.rules`

## 7) Quality Gate Commands
- `pnpm install`
- `pnpm run lint`
- `pnpm run build`

If `lint` script is unavailable in a future branch, record that explicitly and continue build verification.
