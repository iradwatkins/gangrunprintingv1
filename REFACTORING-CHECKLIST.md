# GangRun Printing - Refactoring Implementation Checklist

**Start Date:** 2025-10-02
**Target Completion:** 2025-10-30 (4 weeks)
**Owner:** Development Team

---

## 🚨 IMMEDIATE ACTIONS (Today - 2 hours)

### Step 1: Regenerate Prisma Types
```bash
cd /root/websites/gangrunprinting
npx prisma generate
npm run typecheck | head -50
```
**Expected:** User.isBroker error should disappear
**If not:** Check schema.prisma lines 1388-1389

### Step 2: Create OrderStatus Mapping Utility
**File:** `/src/lib/order-status-mapping.ts`
```typescript
import { OrderStatus } from '@prisma/client'

export const legacyStatusToEnum: Record<string, OrderStatus> = {
  'PAID': 'CONFIRMATION',
  'PROCESSING': 'PRODUCTION',
  'PRINTING': 'PRODUCTION',
  'PAYMENT_FAILED': 'PAYMENT_DECLINED'
}

export function normalizeOrderStatus(status: string): OrderStatus {
  return legacyStatusToEnum[status] ?? (status as OrderStatus)
}
```

### Step 3: Quick Wins (Fix These 3 Files)
- [ ] `/src/app/admin/dashboard/page.tsx` - Replace hardcoded statuses
- [ ] `/src/app/api/cron/daily-report/route.ts` - Use OrderStatus enum
- [ ] `/src/types/order.ts` - Remove custom OrderStatus type, import from Prisma

---

## 📋 WEEK 1: CRITICAL FIXES (24-32 hours)

### Day 1-2: Database Schema Alignment (12 hours)

#### Task 1.1: Audit Product Model ✅
- [ ] List all Product properties used in code
- [ ] Compare with Prisma schema (lines 678-718)
- [ ] Decision: Add to schema OR remove from code?

**Properties to Investigate:**
```typescript
// Check if these exist in schema:
gangRunBasePrice    // Not found
minimumQuantity     // Not found
maximumQuantity     // Not found
quantityIncrement   // Not found
isDigital           // Not found
customizationOptions // Not found
weightPerUnit       // Not found
shippingClass       // Not found
taxable             // Not found
taxClassId          // Not found
metaTitle           // Not found
metaDescription     // Not found
metaKeywords        // Not found
customFields        // Not found
displayOrder        // Not found
configType          // Not found
```

#### Task 1.2: Fix Product Duplicate Route
**File:** `/src/app/api/products/[id]/duplicate/route.ts`

Option A - Remove Missing Properties:
```typescript
const duplicatedProduct = await prisma.product.create({
  data: {
    name: newName,
    slug: newSlug,
    sku: newSku,
    description: originalProduct.description,
    shortDescription: originalProduct.shortDescription,
    categoryId: originalProduct.categoryId,
    basePrice: originalProduct.basePrice,
    productionTime: originalProduct.productionTime,
    isActive: false,
    isFeatured: false,
    // REMOVED: All properties not in schema
  }
})
```

Option B - Add to Schema (if needed):
```prisma
model Product {
  // ... existing fields
  gangRunBasePrice     Float?
  minimumQuantity      Int?
  maximumQuantity      Int?
  // ... etc
}
```

Then run:
```bash
npx prisma migrate dev --name add_missing_product_fields
npx prisma generate
```

#### Task 1.3: Fix Prisma Include Naming (6 hours)
- [ ] `/src/app/api/orders/[id]/reorder/route.ts` - ProductImage → productImages
- [ ] `/src/app/api/paper-stock-sets/[id]/route.ts` - paperStockSetItems → PaperStockSetItem
- [ ] `/src/app/api/product-categories/[id]/route.ts` - Product → products

**Pattern to Follow:**
```typescript
// ✅ CORRECT - Relations are camelCase
include: {
  productImages: true,      // many-to-many relation
  productCategory: true,    // one-to-many relation
}

// ✅ CORRECT - When including through join table
include: {
  ProductImage: {           // Join table is PascalCase
    include: {
      Image: true           // Related model is PascalCase
    }
  }
}
```

### Day 3-4: OrderStatus Standardization (8 hours)

#### Task 1.4: Update All OrderStatus References
**Files to Fix:**
1. `/src/app/admin/dashboard/page.tsx`
   ```typescript
   // BEFORE
   status: { in: ['PAID', 'PROCESSING', 'PRINTING'] }

   // AFTER
   import { OrderStatus } from '@prisma/client'
   status: { in: [OrderStatus.CONFIRMATION, OrderStatus.PRODUCTION] }
   ```

2. `/src/app/api/cron/daily-report/route.ts`
   ```typescript
   // BEFORE
   status: { in: ['PAID', 'PROCESSING', 'PRINTING'] }

   // AFTER
   import { OrderStatus } from '@prisma/client'
   status: { in: [OrderStatus.CONFIRMATION, OrderStatus.PRODUCTION] }
   ```

3. `/src/types/order.ts`
   ```typescript
   // BEFORE (delete this)
   export type OrderStatus = 'draft' | 'pending' | ...

   // AFTER (use Prisma's)
   export type { OrderStatus } from '@prisma/client'
   ```

#### Task 1.5: Database Migration for Existing Orders
**File:** `prisma/migrations/xxxx_normalize_order_status/migration.sql`
```sql
-- Update old status values to new enum values
UPDATE "Order"
SET status = 'CONFIRMATION'
WHERE status = 'PAID';

UPDATE "Order"
SET status = 'PRODUCTION'
WHERE status IN ('PROCESSING', 'PRINTING');

UPDATE "Order"
SET status = 'PAYMENT_DECLINED'
WHERE status = 'PAYMENT_FAILED';
```

Run:
```bash
npx prisma migrate dev --name normalize_order_status
```

### Day 5: Error Handling Standardization (6 hours)

#### Task 1.6: Create Error Handler Utility
**File:** `/src/lib/api-error-handler.ts`
```typescript
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

export function handleApiError(error: unknown) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json({
      error: 'Validation failed',
      details: error.format()
    }, { status: 400 })
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json({
        error: 'Duplicate entry',
        field: error.meta?.target
      }, { status: 409 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({
        error: 'Record not found'
      }, { status: 404 })
    }
  }

  // Generic errors
  if (error instanceof Error) {
    console.error('API Error:', error.message, error.stack)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }

  // Unknown errors
  console.error('Unknown error:', error)
  return NextResponse.json({
    error: 'Unknown error occurred'
  }, { status: 500 })
}
```

#### Task 1.7: Replace Null with Undefined in API Responses
**Files to Fix:**
- `/src/app/api/images/[id]/route.ts` (5 occurrences)
- `/src/app/api/images/route.ts` (4 occurrences)

**Pattern:**
```typescript
// ❌ BEFORE
NextResponse.json({ success: true }, null)

// ✅ AFTER
NextResponse.json({ success: true })
```

### Week 1 Validation:
```bash
npm run typecheck
# Target: <500 errors (from 1,269)

npm run build
# Target: Successful build
```

---

## 📋 WEEK 2: TYPE SAFETY (32-40 hours)

### Day 6-7: Null Safety & Optional Chaining (12 hours)

#### Task 2.1: Enable Strict Null Checks Incrementally
**File:** `tsconfig.json`
```json
{
  "compilerOptions": {
    // Add these gradually
    "strictNullChecks": true,
    "strictPropertyInitialization": true
  }
}
```

Run:
```bash
npm run typecheck > null-errors.txt
# Review and fix in batches
```

#### Task 2.2: Add Optional Chaining & Nullish Coalescing
**Example Fixes:**
```typescript
// ❌ BEFORE
const price = item.currentPrice  // error: possibly undefined

// ✅ AFTER - Option 1: Optional chaining
const price = item.currentPrice ?? 0

// ✅ AFTER - Option 2: Type guard
if (item.currentPrice !== undefined) {
  const price = item.currentPrice
}
```

**Priority Files:**
- `/src/app/api/orders/[id]/reorder/route.ts:129`
- `/src/app/api/pricing/calculate-base/route.ts` (multiple locations)

### Day 8-9: Zod Validation Expansion (12 hours)

#### Task 2.3: Expand Zod to All API Routes
**Pattern:**
```typescript
import { z } from 'zod'

const requestSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  options: z.record(z.unknown()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = requestSchema.parse(body)
    // ... use validated
  } catch (error) {
    return handleApiError(error)
  }
}
```

**Files to Add Validation:**
- [ ] `/src/app/api/orders/[id]/status/route.ts`
- [ ] `/src/app/api/admin/customers/[id]/broker-discounts/route.ts`
- [ ] All `/src/app/api/products/` routes

#### Task 2.4: Fix ZodError Handling
**Files to Fix:**
- `/src/app/api/admin/customers/[id]/broker-discounts/route.ts:96`

```typescript
// ❌ BEFORE
if (error instanceof ZodError) {
  return NextResponse.json({
    error: error.errors  // Property doesn't exist
  })
}

// ✅ AFTER
if (error instanceof ZodError) {
  return NextResponse.json({
    error: 'Validation failed',
    details: error.format()
  }, { status: 400 })
}
```

### Day 10: Type-Safe Prisma Queries (8 hours)

#### Task 2.5: Create Prisma Query Builders
**File:** `/src/lib/prisma-queries.ts`
```typescript
import { Prisma } from '@prisma/client'

export const productWithRelations = {
  include: {
    productImages: {
      include: { Image: true }
    },
    productCategory: true,
    productPaperStocks: {
      include: { PaperStock: true }
    },
    productQuantities: {
      include: { StandardQuantity: true }
    },
    productSizes: {
      include: { StandardSize: true }
    }
  }
} satisfies Prisma.ProductInclude

export const orderWithRelations = {
  include: {
    User: true,
    OrderItem: {
      include: {
        OrderItemAddOn: {
          include: { AddOn: true }
        }
      }
    },
    StatusHistory: true
  }
} satisfies Prisma.OrderInclude
```

Usage:
```typescript
import { productWithRelations } from '@/lib/prisma-queries'

const product = await prisma.product.findUnique({
  where: { id },
  ...productWithRelations  // Type-safe!
})
```

### Week 2 Validation:
```bash
npm run typecheck
# Target: <100 errors (from ~500)

npm run lint
# Target: <1000 warnings (from 2,310)
```

---

## 📋 WEEK 3: ARCHITECTURE (20-24 hours)

### Day 11-12: Structured Logging (12 hours)

#### Task 3.1: Implement Logger Service
**File:** `/src/lib/logger.ts`
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMeta {
  userId?: string
  orderId?: string
  productId?: string
  [key: string]: unknown
}

class Logger {
  private redactKeys = ['password', 'token', 'apiKey', 'secret']

  private redact(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) return obj

    const redacted = { ...obj as Record<string, unknown> }
    for (const key of this.redactKeys) {
      if (key in redacted) {
        redacted[key] = '[REDACTED]'
      }
    }
    return redacted
  }

  log(level: LogLevel, message: string, meta?: LogMeta) {
    const timestamp = new Date().toISOString()
    const redactedMeta = this.redact(meta)

    if (process.env.NODE_ENV === 'production') {
      // Send to logging service (implement later)
      // sendToSentry({ level, message, meta: redactedMeta })
    }

    const logData = { timestamp, level, message, ...redactedMeta }

    switch (level) {
      case 'error':
        console.error(JSON.stringify(logData))
        break
      case 'warn':
        console.warn(JSON.stringify(logData))
        break
      case 'info':
        console.info(JSON.stringify(logData))
        break
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(JSON.stringify(logData))
        }
        break
    }
  }

  debug(message: string, meta?: LogMeta) {
    this.log('debug', message, meta)
  }

  info(message: string, meta?: LogMeta) {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: LogMeta) {
    this.log('warn', message, meta)
  }

  error(message: string, meta?: LogMeta) {
    this.log('error', message, meta)
  }
}

export const logger = new Logger()
```

#### Task 3.2: Replace Console Statements (335 occurrences)
**Automated Script:** `/scripts/replace-console.sh`
```bash
#!/bin/bash
# Replace console.log with logger.info
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/console\.log(/logger.info(/g' {} +

# Replace console.error with logger.error
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/console\.error(/logger.error(/g' {} +

# Replace console.warn with logger.warn
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/console\.warn(/logger.warn(/g' {} +

# Replace console.debug with logger.debug
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i 's/console\.debug(/logger.debug(/g' {} +
```

**Manual Review Required:**
- Check each replacement for context
- Add proper metadata to logger calls
- Remove debug logs not needed in production

### Day 13-14: Complete Service Layer (12 hours)

#### Task 3.3: Complete UserService
**File:** `/src/services/UserService.ts`
```typescript
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export class UserService {
  async getUserById(id: string) {
    // Try cache first
    const cached = await redis.get(`user:${id}`)
    if (cached) return JSON.parse(cached)

    // Fetch from database
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
        customerJourney: true
      }
    })

    if (user) {
      // Cache for 5 minutes
      await redis.setex(`user:${id}`, 300, JSON.stringify(user))
    }

    return user
  }

  async updateBrokerStatus(userId: string, isBroker: boolean, discounts?: Record<string, number>) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        isBroker,
        brokerDiscounts: discounts ?? null
      }
    })
  }

  async getUserOrders(userId: string, options?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    return prisma.order.findMany({
      where: {
        userId,
        ...(options?.status && { status: options.status })
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0
    })
  }
}

export const userService = new UserService()
```

#### Task 3.4: Create VendorService
**File:** `/src/services/VendorService.ts`
```typescript
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export class VendorService {
  async assignVendor(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true }
    })

    if (!order) throw new Error('Order not found')

    // Logic to select best vendor
    const vendor = await this.selectBestVendor(order)

    await prisma.order.update({
      where: { id: orderId },
      data: { vendorId: vendor.id }
    })

    logger.info('Vendor assigned to order', {
      orderId,
      vendorId: vendor.id
    })

    return vendor
  }

  private async selectBestVendor(order: any) {
    // Implement vendor selection logic
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true }
    })

    // For now, return first active vendor
    return vendors[0]
  }

  async notifyVendor(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { Vendor: true }
    })

    if (!order?.Vendor) throw new Error('No vendor assigned')

    // Send notification via N8N webhook
    // Implementation here...

    await prisma.order.update({
      where: { id: orderId },
      data: { vendorNotifiedAt: new Date() }
    })
  }
}

export const vendorService = new VendorService()
```

#### Task 3.5: Extract PricingService
**File:** `/src/services/PricingService.ts`
```typescript
import { prisma } from '@/lib/prisma'

export class PricingService {
  async calculateProductPrice(params: {
    productId: string
    quantity: number
    sizeId: string
    paperStockId: string
    addons: string[]
  }) {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: {
        productPaperStocks: true,
        productSizes: { include: { StandardSize: true } }
      }
    })

    if (!product) throw new Error('Product not found')

    // Base price calculation
    let price = product.basePrice

    // Size multiplier
    const size = product.productSizes.find(s => s.standardSizeId === params.sizeId)
    if (size) {
      // Apply size-based pricing
    }

    // Paper stock cost
    const paperStock = product.productPaperStocks.find(p => p.paperStockId === params.paperStockId)
    if (paperStock) {
      price += paperStock.additionalCost
    }

    // Addon costs
    // ... implement addon pricing

    return {
      basePrice: product.basePrice,
      totalPrice: price,
      breakdown: {
        base: product.basePrice,
        size: 0,
        paper: paperStock?.additionalCost ?? 0,
        addons: 0
      }
    }
  }

  async applyBrokerDiscount(userId: string, price: number, categoryId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user?.isBroker || !user.brokerDiscounts) {
      return price
    }

    const discounts = user.brokerDiscounts as Record<string, number>
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) return price

    const discountPercent = discounts[category.name] ?? 0
    return price * (1 - discountPercent / 100)
  }
}

export const pricingService = new PricingService()
```

### Week 3 Validation:
```bash
npm run typecheck
# Target: <50 errors

npm run lint
# Target: <500 warnings

npm run build
# Target: Successful build, no warnings
```

---

## 📋 WEEK 4: POLISH (8-12 hours)

### Day 15-16: Code Quality (8 hours)

#### Task 4.1: Auto-Fix ESLint
```bash
npm run lint -- --fix
git diff --stat
# Review changes before committing
```

#### Task 4.2: Configure ESLint for Better DX
**File:** `.eslintrc.json`
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "no-console": ["warn", {
      "allow": ["warn", "error"]
    }],
    "react/jsx-sort-props": ["warn", {
      "callbacksLast": true,
      "shorthandFirst": true,
      "reservedFirst": true
    }]
  }
}
```

#### Task 4.3: Remove Unused Code
**Script:** `/scripts/find-unused.sh`
```bash
#!/bin/bash
# Find unused exports (requires depcheck)
npx depcheck

# Find unused imports (requires ts-unused-exports)
npx ts-unused-exports tsconfig.json
```

Manually review and remove:
- [ ] Unused imports
- [ ] Dead code
- [ ] Commented-out code
- [ ] Backup files in src/

### Day 17-18: Developer Experience (4 hours)

#### Task 4.4: Add Pre-commit Hooks
**File:** `.husky/pre-commit`
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Type check staged files
npm run typecheck

# Lint staged files
npx lint-staged

# Run tests (when available)
# npm run test
```

**File:** `.lintstagedrc.json`
```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

Install:
```bash
npm install -D husky lint-staged
npx husky install
```

#### Task 4.5: Update Documentation
**File:** `/docs/DEVELOPMENT.md`
```markdown
# Development Guide

## Type Safety
- Always run `npx prisma generate` after schema changes
- Use OrderStatus enum from Prisma, not custom types
- Enable strict null checks in your editor

## Common Patterns
### API Error Handling
```typescript
import { handleApiError } from '@/lib/api-error-handler'

try {
  // ... logic
} catch (error) {
  return handleApiError(error)
}
```

### Logging
```typescript
import { logger } from '@/lib/logger'

logger.info('User created order', { userId, orderId })
logger.error('Payment failed', { error, orderId })
```

### Service Layer
```typescript
import { productService } from '@/services/ProductService'

const product = await productService.getById(id)
```
```

### Week 4 Validation:
```bash
npm run typecheck
# Target: 0 errors ✅

npm run lint
# Target: <50 warnings ✅

npm run build
# Target: Clean build ✅

git status
# Target: No uncommitted changes ✅
```

---

## 🎯 Final Validation Checklist

### Pre-Deployment Checks:
- [ ] TypeScript errors: 0
- [ ] ESLint warnings: <50
- [ ] All tests passing (when implemented)
- [ ] Build successful with no warnings
- [ ] All console statements replaced with logger
- [ ] No unused imports or variables
- [ ] Git history clean and squashed
- [ ] Documentation updated

### Runtime Checks:
- [ ] Product creation works
- [ ] Order placement works
- [ ] Pricing calculations correct
- [ ] Broker discounts apply correctly
- [ ] Order status transitions work
- [ ] Admin dashboard displays data
- [ ] File uploads work
- [ ] Payment processing works
- [ ] Email notifications sent

### Performance Checks:
- [ ] Page load times <3s
- [ ] API response times <500ms
- [ ] Database queries optimized
- [ ] Redis caching works
- [ ] No memory leaks

---

## 📊 Progress Tracking

### Week 1 Progress: ☐
- [ ] Prisma types regenerated
- [ ] OrderStatus mapping created
- [ ] Product schema aligned
- [ ] Prisma includes fixed
- [ ] Error handler implemented

### Week 2 Progress: ☐
- [ ] Strict null checks enabled
- [ ] Zod validation expanded
- [ ] Type-safe Prisma queries
- [ ] ZodError handling fixed

### Week 3 Progress: ☐
- [ ] Logger implemented
- [ ] Console statements replaced
- [ ] UserService completed
- [ ] VendorService created
- [ ] PricingService extracted

### Week 4 Progress: ☐
- [ ] ESLint auto-fixed
- [ ] Unused code removed
- [ ] Pre-commit hooks added
- [ ] Documentation updated

---

## 🚀 Quick Commands Reference

```bash
# Daily development
npm run dev                 # Start dev server
npm run typecheck          # Check types
npm run lint               # Check linting
npm run lint -- --fix      # Auto-fix linting

# Database
npx prisma generate        # Regenerate types
npx prisma migrate dev     # Run migrations
npx prisma studio          # Open Prisma Studio

# Build & Deploy
npm run build              # Production build
npm run start              # Start production

# Testing (when added)
npm run test               # Run tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

---

**Last Updated:** 2025-10-02
**Next Review:** End of Week 1
