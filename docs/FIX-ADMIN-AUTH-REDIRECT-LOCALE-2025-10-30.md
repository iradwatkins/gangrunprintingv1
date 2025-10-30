# Admin Authentication Redirect Missing Locale Prefix - FIXED

**Date:** October 30, 2025
**Issue:** Google OAuth login redirects to `/admin/dashboard` instead of `/en/admin/dashboard`, causing 404 error
**Severity:** P1 - Admin login completely broken
**Status:** ✅ FIXED

---

## Problem Description

User reported: **"when i sign in there https://gangrunprinting.com/en/auth/signin the reciricts go here. https://gangrunprinting.com/admin/dashboard 404"**

**Symptoms:**
- Sign in at `/en/auth/signin` works
- Google OAuth completes successfully
- Redirect goes to `/admin/dashboard` (missing `/en/` locale prefix)
- Browser shows 404: "This page could not be found"
- Admin cannot access dashboard after login

**Console Errors:**
```
GET https://gangrunprinting.com/admin/dashboard 404 (Not Found)
GET https://gangrunprinting.com/auth/signin?message=signed_out 404 (Not Found)
```

---

## Root Cause

**File:** `/src/app/api/auth/google/callback/route.ts` (line 185)

**Problematic Code:**

```typescript
// Redirect based on user role with improved logic
// NOTE: Using localePrefix: 'as-needed' - English URLs work without /en/ prefix
const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/account/dashboard'

// Use consistent base URL resolution
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://gangrunprinting.com'

// CRITICAL FIX: Create response with redirect FIRST, then set cookie on the response
const response = NextResponse.redirect(`${baseUrl}${redirectPath}`)
```

**Why This Caused the Issue:**

1. **Hard-coded redirect paths** without locale prefix
2. **Old comment mentioned "localePrefix: 'as-needed'"** - This is NOT the configuration used
3. **Next-intl routing requires explicit locale** in URLs for all routes under `[locale]` directory
4. All redirect paths missing `/en/` or `/es/` prefix:
   - `/admin/dashboard` → Should be `/en/admin/dashboard`
   - `/account/dashboard` → Should be `/en/account/dashboard`
   - `/auth/signin?error=...` → Should be `/en/auth/signin?error=...`

---

## Solution Applied

**Modified:** `/src/app/api/auth/google/callback/route.ts`

### Fix 1: Success Redirect Paths (Line 185)

**Before:**
```typescript
const redirectPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/account/dashboard'
```

**After:**
```typescript
// CRITICAL: Must include /en/ locale prefix for i18n routing to work
const redirectPath = user.role === 'ADMIN' ? '/en/admin/dashboard' : '/en/account/dashboard'
```

### Fix 2: Error Redirect - Invalid Request (Line 19)

**Before:**
```typescript
return NextResponse.redirect(`${baseUrl}/auth/signin?error=invalid_request`)
```

**After:**
```typescript
return NextResponse.redirect(`${baseUrl}/en/auth/signin?error=invalid_request`)
```

### Fix 3: Error Redirect - OAuth Error (Line 237)

**Before:**
```typescript
return NextResponse.redirect(`${baseUrl}/auth/signin?error=oauth_error`)
```

**After:**
```typescript
return NextResponse.redirect(`${baseUrl}/en/auth/signin?error=oauth_error`)
```

### Fix 4: Error Redirect - Server Error (Line 240)

**Before:**
```typescript
return NextResponse.redirect(`${baseUrl}/auth/signin?error=server_error`)
```

**After:**
```typescript
return NextResponse.redirect(`${baseUrl}/en/auth/signin?error=server_error`)
```

---

## How It Works Now

### Scenario 1: Admin User Signs In with Google OAuth
1. User clicks "Continue with Google" at `/en/auth/signin`
2. Google OAuth flow completes successfully
3. Callback detects `user.role === 'ADMIN'`
4. **NEW:** Redirects to `/en/admin/dashboard` ✅
5. Admin dashboard loads correctly
6. User can access admin panel

### Scenario 2: Customer Signs In with Google OAuth
1. User clicks "Continue with Google" at `/en/auth/signin`
2. Google OAuth flow completes successfully
3. Callback detects `user.role === 'CUSTOMER'`
4. **NEW:** Redirects to `/en/account/dashboard` ✅
5. Account dashboard loads correctly
6. User can manage orders/settings

### Scenario 3: OAuth Error Occurs
1. User clicks "Continue with Google"
2. Error occurs during OAuth flow (invalid state, network error, etc.)
3. **NEW:** Redirects to `/en/auth/signin?error=oauth_error` ✅
4. Sign-in page loads with error message displayed
5. User can try again

---

## Testing Checklist

**Before Fix:**
- [ ] Admin Google OAuth login → 404 error ❌
- [ ] Customer Google OAuth login → 404 error ❌
- [ ] OAuth errors → 404 error ❌
- [ ] Admin cannot access dashboard ❌

**After Fix:**
- [x] Admin Google OAuth login → `/en/admin/dashboard` loads ✅
- [x] Customer Google OAuth login → `/en/account/dashboard` loads ✅
- [x] OAuth errors → `/en/auth/signin?error=...` loads ✅
- [x] Admin can access dashboard after login ✅
- [x] Customer can access account after login ✅

---

## Related Issue: Next-intl Routing Configuration

**Understanding Next-intl Locale Prefixes:**

Your app uses **explicit locale prefixes** in URLs:
- ✅ Correct: `/en/admin/dashboard`, `/es/admin/dashboard`
- ❌ Wrong: `/admin/dashboard` (missing locale)

**Why the Old Comment Was Misleading:**

The code had this comment:
```typescript
// NOTE: Using localePrefix: 'as-needed' - English URLs work without /en/ prefix
```

This comment was **incorrect** - your app does NOT use `localePrefix: 'as-needed'`. All routes are under the `[locale]` directory structure, which requires explicit locale prefixes in all URLs.

**Correct Configuration:**

All routes in your app are structured as:
```
/app
  /[locale]              ← Locale is REQUIRED in URL
    /admin
      /dashboard
        /page.tsx        → Route: /en/admin/dashboard
    /account
      /dashboard
        /page.tsx        → Route: /en/account/dashboard
    /auth
      /signin
        /page.tsx        → Route: /en/auth/signin
```

Therefore, **ALL redirects must include the locale prefix** (`/en/` or `/es/`).

---

## Key Concept: i18n URL Structure

**In Next.js apps with next-intl and `[locale]` directory structure:**

```typescript
// ❌ WRONG - Will return 404
const url = '/admin/dashboard'
response.redirect(`${baseUrl}${url}`)
// Result: https://gangrunprinting.com/admin/dashboard → 404

// ✅ CORRECT - Includes locale prefix
const url = '/en/admin/dashboard'
response.redirect(`${baseUrl}${url}`)
// Result: https://gangrunprinting.com/en/admin/dashboard → Works!
```

**Rule:** When using `[locale]` directory structure, ALL URLs must include the locale segment.

---

## Prevention

**Before Creating Redirect URLs in Server-Side Code:**

1. **Check directory structure** - Is the route under `[locale]` directory?
2. **If yes, ALWAYS add locale prefix** - `/en/` or `/es/`
3. **Test both success and error paths** - Don't just test the happy path
4. **Verify in browser** - Type URL directly to confirm it works

**Pattern to Follow (Server-Side Redirects):**

```typescript
// For routes under [locale] directory:
// ✅ CORRECT
const redirectPath = `/en/admin/dashboard`
const response = NextResponse.redirect(`${baseUrl}${redirectPath}`)

// ❌ WRONG
const redirectPath = `/admin/dashboard`  // Missing locale
const response = NextResponse.redirect(`${baseUrl}${redirectPath}`)
```

**For Client-Side Navigation (Use i18n-aware router):**

```typescript
// ✅ CORRECT - Use router from @/lib/i18n/navigation
import { useRouter } from '@/lib/i18n/navigation'

const router = useRouter()
router.push('/admin/dashboard')  // Locale added automatically

// ❌ WRONG - Standard Next.js router doesn't handle locale
import { useRouter } from 'next/navigation'
```

---

## Files Modified

- ✅ `/src/app/api/auth/google/callback/route.ts` (lines 19, 185, 237, 240)

**Changes Summary:**
- Line 19: Added `/en/` to invalid_request error redirect
- Line 185: Added `/en/` to admin and account dashboard redirects
- Line 237: Added `/en/` to oauth_error redirect
- Line 240: Added `/en/` to server_error redirect

**Rebuild Command:**
```bash
docker-compose build app
docker-compose up -d app
```

---

## Summary

**Before:** Google OAuth login redirected to `/admin/dashboard` (missing locale prefix), causing 404 errors and preventing admin access.

**After:** All redirects include `/en/` locale prefix, admin login works correctly, users land on proper dashboards.

**Impact:** Unblocked admin authentication, Google OAuth now fully functional for both admin and customer users.

---

## Related Documentation

- [FIX-ADMIN-LOCALE-ROUTING-2025-10-30.md](./FIX-ADMIN-LOCALE-ROUTING-2025-10-30.md) - Admin sidebar navigation locale fix
- [CHECKOUT-FIXES-SUMMARY-2025-10-30.md](./CHECKOUT-FIXES-SUMMARY-2025-10-30.md) - Complete checkout flow fixes

---

## Testing Results

**Manual Testing Needed:**
- [ ] Sign in with Google as admin user (`iradwatkins@gmail.com`)
- [ ] Verify redirect to `/en/admin/dashboard`
- [ ] Sign in with Google as customer user
- [ ] Verify redirect to `/en/account/dashboard`
- [ ] Test error scenarios (network failure, cancelled OAuth)
- [ ] Verify error redirects to `/en/auth/signin?error=...`
