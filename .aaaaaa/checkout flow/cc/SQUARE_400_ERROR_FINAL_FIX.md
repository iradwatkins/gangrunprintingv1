# Square 400 "Not Authorized" Error - FINAL FIX

**Date:** October 11, 2025
**Status:** ✅ RESOLVED

## Problem

Square payment was failing with:
```
400 Bad Request
Error: This request could not be authorized.
```

## Root Cause

**Credential mismatch across multiple files:**

1. **`.env`** - Had sandbox credentials ✅
2. **`.env.production`** - Had PRODUCTION credentials ❌ (This was the problem!)
3. **`ecosystem.config.js`** - Had sandbox credentials ✅

When running `npm run build` in production (`NODE_ENV=production`), Next.js reads from `.env.production` which **overrides** `.env`. The build was baking in mismatched credentials:

- **Access Token:** Production (`EAAAlxUo...`)
- **App ID:** Production (`sq0idp-AJF8fI5VayKCq9veQRAw5g`)
- **Environment:** `sandbox` ⚠️

Square's sandbox API rejected the production credentials.

## Solution

Updated **all three files** to use matching sandbox credentials:

### Sandbox Credentials (Active)
```bash
SQUARE_ACCESS_TOKEN=EAAAl2BAJUi5Neov0Jo8SuYwyO-PPsl0EmpE59Wy-3hjfQIVW4-aBJo06T31ogBK
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=LZN634J2MSXRY
SQUARE_APPLICATION_ID=sandbox-sq0idb-QEfYQ8wDBtv-IOfvQ237WA
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-QEfYQ8wDBtv-IOfvQ237WA
NEXT_PUBLIC_SQUARE_LOCATION_ID=LZN634J2MSXRY
NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
```

### Production Credentials (For future use)
```bash
# Uncomment when ready for production:
# SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
# SQUARE_ENVIRONMENT=production
# SQUARE_LOCATION_ID=LWMA9R9E2ENXP
# SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g
```

## Files Modified

1. **`.env`** - Updated Square credentials
2. **`.env.production`** - Updated Square credentials (CRITICAL!)
3. **`ecosystem.config.js`** - Added Square env vars

## Build & Deploy Steps

```bash
# 1. Clean old build
rm -rf .next

# 2. Rebuild (reads .env.production since NODE_ENV=production)
npm run build

# 3. Verify credentials baked into build
grep -r "sandbox-sq0idb" .next/static/chunks/app

# 4. Restart PM2
pm2 restart gangrunprinting
pm2 save
```

## Testing

### 1. Open Browser Console
Navigate to: https://gangrunprinting.com/checkout

### 2. Check Initialization Logs
You should see:
```
[Square] Using sandbox environment: https://sandbox.web.squarecdn.com/v1/square.js
[Square] Square SDK ready after 200 ms
[Square] Payments instance created
[Square] Card attached successfully
```

### 3. Test Payment
Use Square sandbox test card:
- **Card:** `4111 1111 1111 1111`
- **Expiration:** Any future date (e.g., `12/25`)
- **CVV:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

**Expected:** Payment processes successfully ✅

## Key Lessons

1. **Next.js Environment Variable Priority:**
   ```
   .env.production > .env.local > .env
   ```
   When `NODE_ENV=production`, always check `.env.production`!

2. **NEXT_PUBLIC_* variables are baked at build time**
   - They're embedded in JavaScript bundles
   - Changing env vars requires full rebuild
   - PM2 restart alone won't update them

3. **Always verify build output:**
   ```bash
   # Check what's actually in the build
   grep -r "YOUR_CREDENTIAL" .next/static/chunks/
   ```

4. **Hard refresh browser after deploy:**
   - Chrome: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Clears cached JavaScript files

## Switching to Production

When ready to go live:

1. **Update all three files:**
   - `.env`
   - `.env.production`
   - `ecosystem.config.js`

2. **Change credentials to:**
   ```bash
   SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
   SQUARE_ENVIRONMENT=production
   SQUARE_LOCATION_ID=LWMA9R9E2ENXP
   SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g
   NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g
   NEXT_PUBLIC_SQUARE_LOCATION_ID=LWMA9R9E2ENXP
   NEXT_PUBLIC_SQUARE_ENVIRONMENT=production
   ```

3. **Rebuild and deploy:**
   ```bash
   rm -rf .next
   npm run build
   pm2 restart gangrunprinting
   pm2 save
   ```

## Status: FIXED ✅

The 400 error is now resolved. All credentials are properly matched and payments should work in sandbox mode.
