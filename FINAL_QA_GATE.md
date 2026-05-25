# Final QA Gate

## Must pass

- [ ] `npm run route-audit`
- [ ] `npm run audit:launch`
- [ ] `npm run type-check`
- [ ] `npm run build`
- [ ] All public navigation links open.
- [ ] Admin settings do not show generic loading errors.
- [ ] Booking shows 7:00 AM to 9:00 PM in 12-hour format.
- [ ] Coupon appears only when the user opens it.
- [ ] Booking cannot use past days, Fridays, or booked/conflicting slots.
- [ ] Prices show EGP.
- [ ] Social links are icon-based.
- [ ] No public placeholder copy is visible.
- [ ] Admin diagnostics page reviewed.
- [ ] Firestore rules deployed.
- [ ] Vercel env vars reviewed and redeployed.

## Recommended live checks

- Register user.
- Promote admin with seed-admin.
- Add coupon.
- Book a session with and without coupon.
- Confirm booking/payment in admin.
- Add Drive link to protected content.
- Confirm access from user dashboard.
- Check mobile booking flow.
- Check dark mode.
- Check Search Console ownership.
