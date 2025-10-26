# Locale Routing Fix - Status Report
**Date:** October 24, 2025
**Status:** In Progress - Blocked by React Component Error

## 🎯 Objective
Fix 404 errors on category pages caused by missing `/en/` or `/es/` locale prefixes in URLs.

## ✅ Completed Work

### 1. Configuration Alignment
**File:** `/src/lib/i18n/routing.ts`
- ✅ Simplified routing configuration
- ✅ Changed `localePrefix` to `'always'` to match middleware
- ✅ Removed complex `pathnames` configuration that was causing conflicts

```typescript
// BEFORE (Conflicting):
localePrefix: {
  mode: 'as-needed',
},
pathnames: { ... } // Complex configuration

// AFTER (Simplified):
localePrefix: 'always',
// No pathnames - using simple shared pathnames
```

### 2. Cleanup
- ✅ **Deleted** `/src/middleware.ts` (duplicate file with disabled i18n)
- ✅ **Kept** `/middleware.ts` (root level, active middleware with next-intl)

### 3. Client Component Fixes
**Files Modified:**
- ✅ `/src/components/customer/homepage-hero.tsx`
  - Moved `DEFAULT_SPECIALS` constant inside component
  - Links now accessible to locale context

- ✅ `/src/components/customer/footer.tsx`
  - Moved `footerLinks` object inside component
  - Links now accessible to locale context

**Why:** Constants outside components don't have access to locale context from `next-intl` Link component.

### 4. Server Component Fixes
**Files Modified:**
- ✅ `/src/app/[locale]/(customer)/category/[slug]/page.tsx`
  - Added `locale` to params destructuring
  - Updated breadcrumb hrefs to include `/${locale}/category/...`

- ✅ `/src/app/[locale]/(customer)/products/[slug]/page.tsx`
  - Added `locale` to params destructuring
  - Updated breadcrumb hrefs to include `/${locale}/products/...` and `/${locale}/category/...`

**Why:** Server components receive locale from route params, must manually prefix URLs.

## ❌ Current Blocker

### React Component Error
**Error Message:**
```
Element type is invalid: expected a string (for built-in components)
or a class/function (for composite components) but got: undefined.
```

**Impact:**
- Homepage returns 500 error
- Category pages return 500 error
- All routes failing to render

**Attempted Fixes:**
1. ✅ Simplified routing configuration (removed pathnames)
2. ✅ Changed localePrefix from object to string
3. ✅ Deleted duplicate middleware file
4. ⚠️ Still failing

**Possible Causes:**
1. **Component import issue** - Something importing undefined
2. **next-intl Link component** - Configuration incompatibility
3. **Circular dependency** - Build-time resolution issue
4. **Missing export** - A component is not properly exported

## 📋 Next Steps Required

### Step 1: Identify the Invalid Component
**Action:** Need to find which component has the undefined import/export

**How to Debug:**
```bash
# Enable Next.js debug mode
DEBUG=* npm run dev 2>&1 | grep -A 20 "Element type is invalid"

# Or check React DevTools in browser console
# Look for component stack trace
```

### Step 2: Possible Quick Fixes to Try

#### Option A: Revert Component Changes
If the issue is with moving constants inside components:

```bash
# Revert homepage-hero.tsx
git checkout HEAD -- src/components/customer/homepage-hero.tsx

# Revert footer.tsx
git checkout HEAD -- src/components/customer/footer.tsx

# Rebuild and test
npm run build
docker-compose build app && docker-compose up -d app
```

#### Option B: Check Link Component Import
Verify the Link component is being exported correctly:

```typescript
// File: src/lib/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
```

**Test:** Try importing Link in a simple component to verify it's not undefined.

#### Option C: Use Direct next-intl Link
Instead of custom navigation.ts, use next-intl Link directly:

```typescript
// In components
import { Link } from 'next-intl'  // Direct import

// Instead of:
import { Link } from '@/lib/i18n/navigation'  // Custom export
```

### Step 3: Alternative Approach - Manual Locale Prefix
If `next-intl` Link continues to fail, use manual locale prefixing:

```typescript
// In client components
'use client'
import { Link as NextLink } from 'next/link'
import { useLocale } from 'next-intl'

export function MyComponent() {
  const locale = useLocale()

  return (
    <NextLink href={`/${locale}/category/business-cards`}>
      Business Cards
    </NextLink>
  )
}
```

## 🔍 Diagnostic Commands

```bash
# Check if next-intl is installed correctly
npm list next-intl

# Verify routing config syntax
cat src/lib/i18n/routing.ts

# Check for circular dependencies
npx madge --circular src

# Test build locally (not in Docker)
npm run build

# Check Docker logs
docker logs gangrunprinting_app --tail 50

# Test specific route
curl -I https://gangrunprinting.com/en/category/business-cards
```

## 📊 Files Modified Summary

| File | Change | Status |
|------|--------|--------|
| `/src/lib/i18n/routing.ts` | Simplified config, `localePrefix: 'always'` | ✅ Complete |
| `/src/middleware.ts` | Deleted (duplicate) | ✅ Complete |
| `/src/components/customer/homepage-hero.tsx` | Moved DEFAULT_SPECIALS inside | ✅ Complete |
| `/src/components/customer/footer.tsx` | Moved footerLinks inside | ✅ Complete |
| `/src/app/[locale]/(customer)/category/[slug]/page.tsx` | Added locale to breadcrumbs | ✅ Complete |
| `/src/app/[locale]/(customer)/products/[slug]/page.tsx` | Added locale to breadcrumbs | ✅ Complete |

## 🎓 Lessons Learned

1. **next-intl v4 Configuration:**
   - When using `localePrefix: 'always'`, keep config simple
   - Don't mix `pathnames` with dynamic routes
   - Use string `'always'` not object `{ mode: 'always' }` for basic setup

2. **Component Context Access:**
   - Constants defined outside components don't have React context access
   - Move hardcoded links inside components for locale context

3. **Server vs Client Components:**
   - Server components get locale from params: `const { locale } = await params`
   - Client components get locale from hooks: `const locale = useLocale()`

## 📞 Support Resources

- [next-intl v4 Documentation](https://next-intl-docs.vercel.app/)
- [Next.js 15 App Router](https://nextjs.org/docs/app/building-your-application/routing)
- `/middleware.ts` - Active middleware with next-intl integration

## ⏭️ When Blocker is Resolved

Once the React component error is fixed, test these URLs:

```bash
# English routes (should return 200)
curl -I https://gangrunprinting.com/en/category/business-cards
curl -I https://gangrunprinting.com/en/category/flyers
curl -I https://gangrunprinting.com/en/category/brochures

# Spanish routes (should return 200)
curl -I https://gangrunprinting.com/es/category/business-cards
curl -I https://gangrunprinting.com/es/category/flyers

# Homepage redirect (should redirect to /en)
curl -I https://gangrunprinting.com/
```

**Expected Behavior:**
- ✅ All `/en/category/*` URLs return 200 OK
- ✅ All `/es/category/*` URLs return 200 OK
- ✅ Footer links maintain locale
- ✅ Homepage hero links maintain locale
- ✅ Breadcrumbs maintain locale
- ✅ No console errors about missing locale prefix
