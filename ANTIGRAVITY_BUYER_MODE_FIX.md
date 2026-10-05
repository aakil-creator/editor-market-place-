# Groove Hub — Buyer Mode Mobile Fix

## Problem traced
The mobile Buyer/Provider switch uses `POST /api/user/switch-role` from `toggleUserMode()`.
The previous implementation had two problems:

1. The backend attempted to create a Profile row during role switching even though mode switching does not require a Profile. A profile/schema/database problem could therefore break a simple mode switch.
2. The frontend caught any API failure and then performed an optimistic local switch anyway. This could hide the real server error and leave the phone showing Buyer Mode while the server still had Provider Mode.
3. The static app/service-worker version identifiers were not bumped, allowing mobile/PWA clients to retain an older JavaScript build after deployment.

## Changes made
- `/api/user/switch-role` now only accepts BUYER or PROVIDER.
- Role change is atomic: set enum -> commit -> refresh.
- Profile creation/check was removed from this endpoint.
- Database failures are rolled back and returned as a real HTTP 500 instead of being reported as success.
- Successful response now returns a complete user payload and a fresh JWT.
- Frontend no longer performs a fake/optimistic switch when the API fails.
- Frontend displays the actual API error message instead.
- `app.js` cache-buster bumped to `20261005-ads-services-v2`.
- Service worker cache bumped from v5 to v6 and registration query from v7 to v8.

## Verification performed
- `python -m py_compile backend/app/main.py backend/app/schemas.py backend/app/security.py` — PASS
- `node --check backend/app/static/app.js` — PASS
- `node --check backend/app/static/sw.js` — PASS

## Deployment requirement
Deploy this exact source to the same Render service used by Groove Hub, then test on a real phone:
1. Login as a provider.
2. Open profile/menu.
3. Tap `Switch to Buyer Mode`.
4. Confirm Buyer Mode appears.
5. Refresh the page/app.
6. Confirm it remains Buyer Mode.
7. Switch back to Provider Mode and confirm it persists after refresh.

Do not claim the live issue is fixed until those live checks succeed and Render logs show no `[SWITCH_ROLE ERROR]` entries.
