# Antigravity Handoff — Groove Hub Release Audit 2026-10-05

Use this exact project as the release candidate.

## Mandatory deployment

Deploy the source to the existing Render Groove Hub service:
`https://syncra-qui2.onrender.com/`

Do not claim deployment success until the live URL and health check are actually verified.

## Changes in this release

- Fixed mobile Buyer/Provider mode switching.
- Removed optimistic fake mode switching.
- Removed broken unused `app_test.js`.
- Standardized password reset to 8+ characters and deprecated the insecure direct reset endpoint.
- Removed fake UPI payment confirmation and `upi_verified` bypass.
- Payment verification requires real Razorpay HMAC validation and matching order metadata.
- Webhook verification requires a configured webhook secret.
- Replaced credentialed wildcard CORS with explicit configurable origins.
- Preserved Ads & Services as a separate top-level category.
- Preserved Beginner/Intermediate/Pro sample limits of 3/2/1.

## Deployment environment requirements

Required production secrets/configuration include:
- `SECRET_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `GOOGLE_CLIENT_ID` if Google sign-in is enabled
- `CORS_ORIGINS` if additional trusted origins are required

Never commit real secrets into source control.

## Live acceptance

After deployment, test on a real phone:
- Provider → Buyer → refresh → Buyer
- Buyer → Provider → refresh → Provider
- Login/logout
- Registration/email verification
- Ads & Services browsing
- Video Editor browsing
- Provider profession onboarding
- Package creation
- 3/2/1 free-sample enforcement across duplicate packages
- Free-sample job handoff
- Paid Razorpay test payment
- Invalid payment signature rejection
- Booking/job status flow
- Upload/download authorization
- Chat authorization
- Admin authorization

If any check fails, inspect Render logs and fix the underlying source. Do not hide the error with frontend fallbacks.
