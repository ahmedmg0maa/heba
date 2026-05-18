# Notifications TODO

This project now has a notification abstraction at `lib/notifications.ts`.

Planned production integrations:

1. `booking_approved`
- Trigger point: `PATCH /api/bookings/[id]` when status becomes `approved`.
- Payload: `bookingId`, `userId`, `email`.
- Target email: booking approval and next-step instructions.

2. `order_paid`
- Trigger point: `PATCH /api/orders/[id]` when status becomes `paid`.
- Payload: `orderId`, `userId`, `email`.
- Target email: payment confirmation and activation details.

3. `account_activated`
- Suggested trigger point: Firebase Auth user creation trigger (server-side) or dedicated server registration API.
- Payload: `userId`, `email`.
- Target email: welcome + account activation confirmation.

Integration note:
- Keep actual provider integration (SES/SendGrid/Mailgun) server-side only.
- Do not send provider secrets to client code.
