# AUDIT REPORT — Heba ElSherif Premium Platform

## Audit Scope
- Full pass across `app`, `components`, `lib`, `data`, `firestore.rules`, `storage.rules`, `package.json`, and `next.config.mjs`.
- Required keyword sweep completed for:
  - `unauthorized`
  - `غير مصرح`
  - `admin-auth`
  - `require-admin`
  - `heba_admin_session`
  - `admin_session`
  - `Firebase Storage`
  - `upload`
  - `fileUrl`
  - `accessUrl`
  - `productId`
  - `productSlug`
  - `itemId`
  - `لا توجد تقنية تمنع التصوير`
  - `mock`
  - `fake`
  - `demo`

## Routes Found
- Core pages:
  - `/`, `/about`, `/services`, `/courses`, `/books`, `/booking`, `/checkout`, `/account`, `/contact`, `/en`
- Protected account pages:
  - `/account/protected/book/[id]`
  - `/account/protected/course/[id]`
- Admin pages:
  - `/admin`, `/admin/[section]`, `/admin/bookings`, `/admin/orders`, `/admin/books`, `/admin/courses`, `/admin/messages`, `/admin/access`, `/admin/login`
- API routes:
  - `/api/catalog`
  - `/api/checkout`
  - `/api/booking`
  - `/api/contact`
  - `/api/download/[orderId]`
  - `/api/protected-content/[productType]/[productId]`
  - `/api/account/summary`
  - `/api/payments/paymob/webhook`
  - `/api/admin/login`
  - `/api/admin/logout`
  - `/api/admin/me`
  - `/api/admin/books`
  - `/api/admin/books/[id]`
  - `/api/admin/courses`
  - `/api/admin/courses/[id]`
  - `/api/admin/bookings/[id]`
  - `/api/admin/orders/[id]`
  - `/api/admin/export/bookings`
  - `/api/admin/export/orders`

## Admin Auth Files
- Source of truth helper:
  - `lib/admin-session.ts`
- Admin auth entry points using same helper:
  - `app/api/admin/login/route.ts`
  - `app/api/admin/logout/route.ts`
  - `app/api/admin/me/route.ts`
  - `app/admin/(protected)/layout.tsx`
- Admin session check route:
  - `app/admin/login/session/route.ts`

## Admin API Routes
- CRUD and actions:
  - `app/api/admin/books/route.ts`
  - `app/api/admin/books/[id]/route.ts`
  - `app/api/admin/courses/route.ts`
  - `app/api/admin/courses/[id]/route.ts`
  - `app/api/admin/bookings/[id]/route.ts`
  - `app/api/admin/orders/[id]/route.ts`
- Diagnostics/session:
  - `app/api/admin/me/route.ts`
  - `app/api/admin/login/route.ts`
  - `app/api/admin/logout/route.ts`
- Exports:
  - `app/api/admin/export/bookings/route.ts`
  - `app/api/admin/export/orders/route.ts`
- Runtime check:
  - All `/api/admin/**` routes export `runtime = "nodejs"`.

## Duplicate Routes
- Detected duplicate legacy action routes outside `/api/admin/**`:
  - `app/api/bookings/[id]/route.ts`
  - `app/api/orders/[id]/route.ts`
- Action:
  - Removed both routes to eliminate split logic and unauthorized drift.

## Checkout Flow Status
- `app/checkout/page.tsx` loads products from `/api/catalog`, creates pending orders only.
- `app/api/checkout/route.ts` now stores:
  - `productId` (canonical Firestore doc id)
  - `itemId` (canonical Firestore doc id)
  - `productSlug`
  - `productType`
  - `productTitle`
  - `amount`
  - `status = pending`
  - `userId` when available
  - normalized lowercase `email`
- No fake paid status and no fake ownership creation.

## Account Flow Status
- Client-side direct Firestore reads removed from account summary load path.
- Added server API:
  - `app/api/account/summary/route.ts`
- Summary API behavior:
  - Requires Firebase ID token in `Authorization: Bearer ...`
  - Verifies token with Firebase Admin
  - Loads profile/orders/bookings by `userId` and email variants
  - Normalizes email and returns:
    - `profile`
    - `orders`
    - `bookings`
    - `paidBooks`
    - `paidCourses`
- `/account` now uses this API and links paid items via canonical IDs:
  - `/account/protected/book/{bookId}`
  - `/account/protected/course/{courseId}`

## Protected Content Flow Status
- Core logic rebuilt in:
  - `lib/protected-content.ts`
- Fixed ownership compatibility for both books and courses:
  - Matches paid orders by `productId`, `itemId`, `productSlug`, slug/id compatibility.
- Index-safe query strategy:
  - Queries orders/sessions/logs by single field and filters in memory.
  - Avoids multi-field `where + orderBy` for entitlement checks.
- Access behavior:
  - Paid + missing link message:
    - `تم تأكيد وصولك، وسيتم تفعيل رابط المحتوى قريبًا. يمكنك التواصل مع الدعم للمساعدة.`
  - Unpaid message:
    - `هذا المحتوى متاح بعد تأكيد الدفع وتفعيل الوصول.`
- Logs:
  - Uses only `protected_access_logs`.
  - Logging failures do not block paid access.

## Google Drive Flow Status
- Helper upgraded:
  - `lib/google-drive.ts`
- Supported links:
  - `https://drive.google.com/file/d/FILE_ID/view`
  - `https://drive.google.com/open?id=FILE_ID`
  - `https://drive.google.com/uc?id=FILE_ID`
  - Drive folder links for courses
- Normalization behavior:
  - Cover image -> `uc?export=view&id=...`
  - Preview -> `file/d/.../preview`
  - Download/open -> `uc?export=download&id=...`
- Admin UI now fully Google Drive oriented for books/courses.
- Removed admin upload API route:
  - `app/api/admin/uploads/route.ts` deleted (no Firebase Storage requirement in product CRUD flow).

## English Page Status
- `/en` rebuilt as a full landing page:
  - Header/nav
  - Hero
  - About
  - Services
  - Courses section
  - Books section
  - Coaching CTA
  - Contact CTA
  - Footer
  - Arabic switch links
  - Responsive layout and non-placeholder content

## Firebase Rules Status
- `firestore.rules` updated:
  - Users can read/write own profile.
  - Users can read own orders/bookings by uid or normalized email.
  - Public read for active books/courses metadata only.
  - Product/order/booking writes are server-only from client perspective.
  - `protected_access_logs` and `protected_active_sessions` are server-only.
- `storage.rules` kept private:
  - `allow read, write: if false;`

## Build/Lint Status
- `npm.cmd run lint`: PASS
- `npm.cmd run build`: PASS
- `pnpm.cmd` note:
  - After adding `packageManager: pnpm@9.15.4`, local sandbox blocked fetching pinned pnpm runtime from npm registry, so direct `pnpm.cmd` execution was network-blocked in this environment.

## Exact Issues Fixed
- Added `packageManager: pnpm@9.15.4` and removed `package-lock.json` to reduce npm/pnpm drift.
- Removed duplicate legacy admin action APIs outside `/api/admin/**`.
- Removed `/api/admin/uploads` dependency path from production flow.
- Added `/api/account/summary` with Firebase Admin token verification.
- Migrated `/account` data loading to server summary API.
- Normalized checkout email storage to lowercase.
- Normalized booking email storage to lowercase.
- Rebuilt protected access checks for reliable paid detection across legacy order key variants.
- Removed index-sensitive multi-field order/session/access queries from entitlement path.
- Replaced protected-content messaging with required customer-safe copy.
- Rebuilt `components/protection/protected-content-viewer.tsx` with watermark visibility and secure open/download behavior.
- Rebuilt `/api/protected-content/[productType]/[productId]` route with explicit legal notice payload.
- Rebuilt admin books/courses managers with clear Google Drive-only instructions and robust form states.
- Rebuilt `/en` from limited hero into complete English landing page.
- Updated orders CSV export to include richer operational fields.
- Updated TypeScript include paths to remove stale `.next-build` type artifacts causing route validation failures.
