# RELEASE CHECKLIST — Heba ElSherif Premium Platform

## Admin Manual Tests
1. Login admin.
2. Visit `/api/admin/me`.
3. Confirm `authenticated: true`.
4. Add book with Google Drive `fileUrl`.
5. Edit book.
6. Add course with Google Drive `accessUrl`.
7. Edit course.
8. Create booking from public form.
9. Approve booking.
10. Complete booking.
11. Create order from checkout.
12. Mark order paid.
13. Export bookings CSV.
14. Export orders CSV.

## Customer Manual Tests
1. Register/login user.
2. Create book order.
3. Before paid: account shows pending, protected page denies access.
4. Admin marks order paid.
5. Account shows book under `كتبي`.
6. Protected book opens Google Drive preview/open button.
7. Create course order.
8. Admin marks paid.
9. Account shows course under `كورساتي`.
10. Protected course opens content/access link.

## English Manual Tests
1. Visit `/en`.
2. Confirm it has full visible content.
3. Confirm buttons/links work.

## Build Verification
1. `pnpm install`
2. `pnpm run lint`
3. `pnpm run build`

Note:
- In this sandbox, `pnpm` execution is blocked from fetching pinned package-manager runtime over network after pinning `packageManager`. Equivalent verification was executed with:
  - `npm.cmd run lint` (pass)
  - `npm.cmd run build` (pass)

## Vercel Verification
- Redeploy without build cache.
- Verify production routes:
  - `/`
  - `/en`
  - `/account`
  - `/account/protected/book/[id]`
  - `/account/protected/course/[id]`
  - `/admin`
  - `/api/admin/me`
  - `/api/account/summary`
  - `/api/protected-content/[productType]/[productId]`

## Required Vercel Settings
- Framework Preset: `Next.js`
- Build Command: `pnpm run build`
- Install Command: `pnpm install`
- Output Directory: empty/default
- Node.js: `20` or `22`
