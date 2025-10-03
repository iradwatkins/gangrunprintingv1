# Priority Fixes - Quick Reference Guide

**Last Updated:** 2025-10-02
**For:** GangRun Printing Refactoring

---

## 🔥 TOP 10 FILES - FIX FIRST (Priority Order)

### 1. ⚡ IMMEDIATE - Product Duplication (BROKEN)
**File:** `/root/websites/gangrunprinting/src/app/api/products/[id]/duplicate/route.ts`

**Lines 80-99:** Remove missing Product properties
```typescript
// CURRENT (BROKEN):
gangRunBasePrice: originalProduct.gangRunBasePrice,  // ❌ Property doesn't exist
minimumQuantity: originalProduct.minimumQuantity,    // ❌ Property doesn't exist
// ... 14 more missing properties

// FIX - Remove all these lines:
// Lines to DELETE: 80, 82-99
```

**Quick Fix:**
```bash
# Edit file and keep only these properties:
- name, slug, sku
- description, shortDescription
- categoryId, basePrice
- productionTime
- isActive, isFeatured
- setupFee, rushAvailable, rushDays, rushFee
```

---

### 2. ⚡ IMMEDIATE - Admin Dashboard (DATA NOT SHOWING)
**File:** `/root/websites/gangrunprinting/src/app/admin/dashboard/page.tsx`

**Line 88:** Invalid OrderStatus values
```typescript
// CURRENT (BROKEN):
status: { in: ['PAID', 'PROCESSING', 'PRINTING'] }  // ❌ Not in enum

// FIX:
import { OrderStatus } from '@prisma/client'
status: {
  in: [
    OrderStatus.CONFIRMATION,  // was 'PAID'
    OrderStatus.PRODUCTION     // was 'PROCESSING' and 'PRINTING'
  ]
}
```

**Line 97:** Same issue
```typescript
// CURRENT (BROKEN):
status: { in: ['PAID', 'PROCESSING', 'PRINTING'] }

// FIX: Same as above
```

---

### 3. ⚡ IMMEDIATE - Order Reorder (BROKEN)
**File:** `/root/websites/gangrunprinting/src/app/api/orders/[id]/reorder/route.ts`

**Line 74:** Wrong Prisma include name
```typescript
// CURRENT (BROKEN):
include: {
  ProductImage: true,  // ❌ Should be productImages (camelCase)
}

// FIX:
include: {
  productImages: {
    include: { Image: true }
  },
}
```

**Line 106:** Accessing wrong property
```typescript
// CURRENT (BROKEN):
const images = product.ProductImage  // ❌ Doesn't exist

// FIX:
const images = product.productImages  // ✅ Correct
```

**Line 129:** Undefined access
```typescript
// CURRENT (BROKEN):
const price = item.currentPrice  // ❌ Possibly undefined

// FIX:
const price = item.currentPrice ?? item.basePrice ?? 0  // ✅ Safe
```

---

### 4. 🔴 CRITICAL - Paper Stock Sets
**File:** `/root/websites/gangrunprinting/src/app/api/paper-stock-sets/[id]/route.ts`

**Line 29:** Wrong include property
```typescript
// CURRENT (BROKEN):
include: {
  paperStockSetItems: true,  // ❌ Should be PascalCase
}

// FIX:
include: {
  PaperStockSetItem: {
    include: { PaperStock: true }
  },
}
```

**Lines 148, 197, 206:** Same issue - repeat fix above

---

### 5. 🔴 CRITICAL - Daily Report Cron
**File:** `/root/websites/gangrunprinting/src/app/api/cron/daily-report/route.ts`

**Line 58:** Invalid OrderStatus
```typescript
// CURRENT (BROKEN):
status: { in: ['PAID', 'PROCESSING', 'PRINTING'] }

// FIX:
import { OrderStatus } from '@prisma/client'
status: { in: [OrderStatus.CONFIRMATION, OrderStatus.PRODUCTION] }
```

**Line 130:** Invalid status value
```typescript
// CURRENT (BROKEN):
status: 'PAYMENT_FAILED'  // ❌ Should be PAYMENT_DECLINED

// FIX:
status: OrderStatus.PAYMENT_DECLINED  // ✅ Correct enum value
```

---

### 6. 🔴 CRITICAL - Broker Discounts
**File:** `/root/websites/gangrunprinting/src/app/api/admin/customers/[id]/broker-discounts/route.ts`

**Line 96:** Wrong ZodError property
```typescript
// CURRENT (BROKEN):
if (error instanceof ZodError) {
  return NextResponse.json({
    error: error.errors  // ❌ Use .format() instead
  })
}

// FIX:
if (error instanceof ZodError) {
  return NextResponse.json({
    error: 'Validation failed',
    details: error.format()
  }, { status: 400 })
}
```

---

### 7. 🟠 HIGH - User Orders Page
**File:** `/root/websites/gangrunprinting/src/app/account/orders/page.tsx`

**Line 88:** Property exists but types not regenerated
```typescript
// CURRENT (ERROR):
const discount = user.isBroker  // ❌ TypeScript doesn't recognize

// FIX:
# Run this command first:
npx prisma generate

# Then code will work (property exists in schema line 1388)
```

---

### 8. 🟠 HIGH - Image API Routes
**File:** `/root/websites/gangrunprinting/src/app/api/images/[id]/route.ts`

**Line 110:** Null instead of undefined
```typescript
// CURRENT (BROKEN):
NextResponse.json({ success: true }, null)  // ❌ Type error

// FIX:
NextResponse.json({ success: true })  // ✅ Omit second param
```

**Line 112:** Unknown error type
```typescript
// CURRENT (BROKEN):
catch (error) {
  console.log(error.message)  // ❌ error is unknown
}

// FIX:
catch (error) {
  if (error instanceof Error) {
    console.error(error.message)
  }
}
```

**File:** `/root/websites/gangrunprinting/src/app/api/images/route.ts`
**Lines 126, 154, 158, 266, 277:** Same issues - apply fixes above

---

### 9. 🟠 HIGH - Product Configuration
**File:** `/root/websites/gangrunprinting/src/app/api/products/[id]/configuration/route.ts`

**Line 346:** Type inference failure
```typescript
// CURRENT (BROKEN):
const sizes: Size[] = transformSizeGroup(sizeGroup)
// Error: Size[] not assignable due to nullable width/height

// FIX - Option 1: Add type guards
function transformSizeGroup(group: any): Size[] {
  return group.values.split(',').map((value: string) => {
    const [width, height] = value.split('x').map(Number)
    return {
      id: `size_${value}`,
      name: value,
      displayName: `${width}″ × ${height}″`,
      width: width ?? 0,  // ✅ Provide default
      height: height ?? 0, // ✅ Provide default
      squareInches: (width ?? 0) * (height ?? 0),
      priceMultiplier: 1.0,
      isDefault: false
    }
  })
}

// FIX - Option 2: Use Prisma types
import type { StandardSize } from '@prisma/client'
const sizes: StandardSize[] = await prisma.standardSize.findMany(...)
```

**Lines 582-584:** Array type mismatches
```typescript
// CURRENT (BROKEN):
addonSets: [],  // Type: never[]
addons: [],     // Type: never[]
designAddons: [], // Type: never[]

// FIX: Explicitly type arrays
addonSets: [] as StandardizedAddonSet[],
addons: [] as StandardizedAddon[],
designAddons: [] as StandardizedAddon[],
```

---

### 10. 🟠 HIGH - Custom OrderStatus Type Conflict
**File:** `/root/websites/gangrunprinting/src/types/order.ts`

**Lines 54-64:** Custom type conflicts with Prisma
```typescript
// CURRENT (CONFLICT):
export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'processing'
  // ... custom values

// FIX - DELETE THIS TYPE, use Prisma's:
export type { OrderStatus } from '@prisma/client'
```

---

## 🛠️ BATCH FIXES - Apply to Multiple Files

### Fix Pattern 1: OrderStatus Enum
**Apply to these files:**
- `/src/app/admin/dashboard/page.tsx` (lines 88, 97)
- `/src/app/api/cron/daily-report/route.ts` (lines 58, 130)

**Search & Replace:**
```typescript
// Find: 'PAID'
// Replace with: OrderStatus.CONFIRMATION

// Find: 'PROCESSING'
// Replace with: OrderStatus.PRODUCTION

// Find: 'PRINTING'
// Replace with: OrderStatus.PRODUCTION

// Find: 'PAYMENT_FAILED'
// Replace with: OrderStatus.PAYMENT_DECLINED
```

---

### Fix Pattern 2: Prisma Include Naming
**Apply to these files:**
- `/src/app/api/orders/[id]/reorder/route.ts` (line 74)
- `/src/app/api/paper-stock-sets/[id]/route.ts` (lines 29, 148, 197)
- `/src/app/api/product-categories/[id]/route.ts` (line 22)

**Rule:**
- Relations (many-to-many) = camelCase: `productImages`, `orderItems`
- Join tables = PascalCase: `ProductImage`, `OrderItem`

---

### Fix Pattern 3: Null to Undefined
**Apply to these files:**
- `/src/app/api/images/[id]/route.ts` (line 110)
- `/src/app/api/images/route.ts` (lines 126, 154, 158, 266)

**Search & Replace:**
```typescript
// Find: NextResponse.json(*, null)
// Replace: NextResponse.json(*)

// Or just remove the second parameter
```

---

### Fix Pattern 4: Unknown Error Handling
**Apply to these files:**
- `/src/app/api/paper-stocks/[id]/route.ts` (lines 66, 70, 111)
- `/src/app/api/paper-stocks/route.ts` (line 142)
- `/src/app/api/product-categories/route.ts` (lines 75, 76)
- `/src/app/api/images/[id]/route.ts` (line 112)

**Template:**
```typescript
catch (error) {
  if (error instanceof Error) {
    console.error(error.message, error.stack)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
  console.error('Unknown error:', error)
  return NextResponse.json({
    error: 'Unknown error'
  }, { status: 500 })
}
```

---

## 📋 STEP-BY-STEP FIX ORDER

### Step 1: Regenerate Types (5 minutes)
```bash
cd /root/websites/gangrunprinting
npx prisma generate
npm run typecheck | head -30
# User.isBroker error should be gone ✅
```

### Step 2: Fix Product Duplicate (30 minutes)
Edit: `/src/app/api/products/[id]/duplicate/route.ts`
- Remove lines 80, 82-99 (missing properties)
- Keep only properties that exist in schema
- Test product duplication in admin

### Step 3: Fix Dashboard (15 minutes)
Edit: `/src/app/admin/dashboard/page.tsx`
- Add: `import { OrderStatus } from '@prisma/client'`
- Replace hardcoded statuses on lines 88, 97
- Test admin dashboard loads

### Step 4: Fix Order Reorder (30 minutes)
Edit: `/src/app/api/orders/[id]/reorder/route.ts`
- Fix include on line 74: `ProductImage` → `productImages`
- Fix access on line 106: `ProductImage` → `productImages`
- Add null check on line 129: `?? item.basePrice ?? 0`
- Test order reorder functionality

### Step 5: Fix Paper Stock Sets (20 minutes)
Edit: `/src/app/api/paper-stock-sets/[id]/route.ts`
- Fix includes on lines 29, 148, 197
- Fix property access on line 206
- Test paper stock set management

### Step 6: Fix Daily Report (10 minutes)
Edit: `/src/app/api/cron/daily-report/route.ts`
- Fix OrderStatus on lines 58, 130
- Test cron job (or check logs)

### Step 7: Fix Broker Discounts (10 minutes)
Edit: `/src/app/api/admin/customers/[id]/broker-discounts/route.ts`
- Fix ZodError handling on line 96
- Test broker discount assignment

### Step 8: Batch Fix Images API (30 minutes)
Edit: `/src/app/api/images/[id]/route.ts` & `/src/app/api/images/route.ts`
- Remove null parameters
- Add error type guards
- Test image upload/delete

### Step 9: Fix Product Configuration (45 minutes)
Edit: `/src/app/api/products/[id]/configuration/route.ts`
- Fix size transformation type safety
- Fix array type declarations
- Test product configuration page

### Step 10: Fix OrderStatus Type (5 minutes)
Edit: `/src/types/order.ts`
- Delete custom OrderStatus type
- Import from Prisma: `export type { OrderStatus } from '@prisma/client'`
- Search codebase for any imports from this file

---

## 🧪 VALIDATION COMMANDS

After each fix:
```bash
# Check types
npm run typecheck | grep "error TS" | wc -l

# Check linting
npm run lint | grep "warning" | wc -l

# Build to ensure no runtime issues
npm run build
```

---

## 🚨 ROLLBACK PLAN

If a fix breaks something:
```bash
# See what changed
git diff src/app/api/products/[id]/duplicate/route.ts

# Revert specific file
git checkout HEAD -- src/app/api/products/[id]/duplicate/route.ts

# Or revert all changes
git reset --hard HEAD
```

---

## 📊 PROGRESS TRACKER

### Priority 1 (Fix Today):
- [ ] Product Duplicate (30 min)
- [ ] Admin Dashboard (15 min)
- [ ] Order Reorder (30 min)

### Priority 2 (Fix This Week):
- [ ] Paper Stock Sets (20 min)
- [ ] Daily Report (10 min)
- [ ] Broker Discounts (10 min)
- [ ] Images API (30 min)
- [ ] Product Configuration (45 min)
- [ ] OrderStatus Type (5 min)

**Total Time to Fix Top 10:** ~3.5 hours

---

## 💡 TIPS

1. **Always test after each fix** - Don't batch commit
2. **Use git stash** if you need to pause mid-fix
3. **Take screenshots** of before/after for documentation
4. **Update tests** if they exist for the fixed code
5. **Check related files** - fixes might break dependent code

---

**Created:** 2025-10-02
**Last Updated:** 2025-10-02
