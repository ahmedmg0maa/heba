# Heba El Sharif Website

Production-ready Next.js website with real Firebase-backed flows for:
- Account
- Bookings
- Checkout / Orders
- Admin dashboard
- Books and Courses catalogs

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill values.

Required:
- `NEXT_PUBLIC_FIREBASE_*` public web config
- `FIREBASE_SERVICE_ACCOUNT_JSON` (server admin sdk)
- `ADMIN_PASSWORD` (admin dashboard login)

Optional:
- `FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_SITE_URL`

## Security Rules

Prepared baseline rules files:
- `firestore.rules`
- `storage.rules`

These should be reviewed and deployed before go-live.

## Notification Prep

Prepared notification abstraction:
- `lib/notifications.ts`
- `docs/notifications-todo.md`

Current flow queues placeholder events for:
- booking approved
- order paid
- account activation (planned trigger)
