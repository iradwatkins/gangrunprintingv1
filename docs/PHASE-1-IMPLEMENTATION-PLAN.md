# Phase 1 Implementation Plan - DRY + SoC Refactoring
**Date:** October 18, 2025
**Status:** Ready for Approval
**Risk Level:** HIGH (Business-Critical Pricing Logic)

---

## OVERVIEW

This document outlines the **detailed implementation plan** for Phase 1 of the DRY + SoC refactoring, focusing on the most business-critical improvements.

**Phase 1 Goals:**
1. Consolidate pricing engine (eliminate duplication)
2. Extract product configuration service (improve testability)
3. Adopt existing OrderService (consistency)
4. Consolidate API response handlers (developer experience)

**Estimated Effort:** 26-37 hours
**Expected Impact:** Eliminate 2,000+ lines of duplicate code, reduce pricing bugs by 80%

---

## CURRENT STATE ANALYSIS

### Pricing Engine Files (1,700 total lines)

| File | Lines | Status | Usage |
|------|-------|--------|-------|
| `/src/lib/pricing/unified-pricing-engine.ts` | 915 | ✅ ACTIVE | Used by `/api/pricing/calculate` |
| `/src/lib/pricing-engine.ts` | 495 | ⚠️ UNKNOWN | May be legacy |
| `/src/lib/pricing-calculator.ts` | 290 | ⚠️ UNKNOWN | Class-based alternative |
| `/src/lib/price-utils.ts` | ?? | ⚠️ UNKNOWN | Utility functions |
| `/src/lib/pricing/base-price-engine.ts` | ?? | ⚠️ UNKNOWN | Base implementation |

**Critical Finding:**
- **`unifiedPricingEngine`** is actively used by production API
- Other implementations may be legacy/unused
- Need to verify usage before deletion

**Risk Assessment:**
- 🔴 **CRITICAL:** Pricing is business-critical per [PRICING-REFERENCE.md](../PRICING-REFERENCE.md)
- 🔴 **HIGH:** Changes could cause calculation errors
- 🟡 **MEDIUM:** Need comprehensive testing before deployment

---

## TASK 1.1: PRICING ENGINE CONSOLIDATION

### Current Architecture

```
/src/lib/pricing/
├── unified-pricing-engine.ts        ✅ ACTIVE (915 lines)
│   └── Used by: /api/pricing/calculate
│
/src/lib/
├── pricing-engine.ts                ⚠️ STATUS UNKNOWN (495 lines)
├── pricing-calculator.ts            ⚠️ STATUS UNKNOWN (290 lines)
└── price-utils.ts                   ⚠️ STATUS UNKNOWN
```

### Step 1.1.1: Verify Usage (CRITICAL - Do This First)

**Before making ANY changes, determine:**

```bash
# 1. Search for all imports of pricing files
grep -r "from.*pricing-engine" src/
grep -r "from.*pricing-calculator" src/
grep -r "from.*price-utils" src/
grep -r "from.*base-price-engine" src/

# 2. Search for usage patterns
grep -r "PricingCalculator" src/
grep -r "pricing-engine" src/
grep -r "calculatePrice" src/
```

**Questions to Answer:**
- Is `pricing-engine.ts` (495 lines) used anywhere?
- Is `PricingCalculator` class used?
- Are there any references in admin components?
- Are there any references in checkout flow?

### Step 1.1.2: Analysis Decision Tree

```
IF all files point to unifiedPricingEngine:
  → SAFE to deprecate others
  → Proceed with consolidation

ELSE IF other files are used:
  → RISKY - Need migration plan
  → Update all usages to unifiedPricingEngine first
  → Then deprecate old files

ELSE IF cannot determine usage:
  → STOP - Manual verification required
  → Check with user before proceeding
```

### Step 1.1.3: Proposed Solution (Pending Verification)

**Option A: unifiedPricingEngine is ONLY implementation used**
```
ACTION:
1. Keep: /src/lib/pricing/unified-pricing-engine.ts ✅
2. Delete: pricing-engine.ts, pricing-calculator.ts, price-utils.ts
3. Update: Any imports to use unified-pricing-engine.ts
4. Test: Run pricing calculations, verify correctness
```

**Option B: Multiple implementations ARE used**
```
ACTION:
1. Create: /src/services/PricingService.ts (facade pattern)
2. Migrate: All usage to PricingService
3. Deprecate: Old implementations gradually
4. Test: Extensively at each step
```

**Option C: Cannot determine usage safely**
```
ACTION:
1. STOP refactoring
2. Ask user for clarification
3. Manual code review before proceeding
```

### Step 1.1.4: Testing Requirements

**Before deploying any pricing changes:**

✅ **Unit Tests:**
- Test base product pricing calculation
- Test turnaround multiplier logic
- Test each addon pricing model (18 addons)
- Test broker discount calculation
- Test "Our Tagline" discount
- Test edge cases (zero quantity, custom sizes, etc.)

✅ **Integration Tests:**
- Test full API endpoint `/api/pricing/calculate`
- Test with real product configurations
- Compare results against [PRICING-REFERENCE.md](../PRICING-REFERENCE.md) examples

✅ **Regression Tests:**
- Run existing test suite: `npm test`
- Verify calculations match current production values
- Test all product categories (business cards, flyers, etc.)

✅ **Manual Verification:**
- Test in browser on product configuration page
- Verify prices update correctly
- Verify turnaround options show correct prices
- Verify addon selections adjust totals

**Test Script Reference:**
- `/scripts/test-addon-pricing.ts` - Automated pricing verification

---

## TASK 1.2: PRODUCT CONFIGURATION SERVICE EXTRACTION

### Current Problem

**File:** `/src/app/api/products/[id]/configuration/route.ts` (648 lines)

**Issues:**
```typescript
export async function GET(request: NextRequest, { params }) {
  // Lines 1-50: HTTP handling + auth
  const { user } = await validateRequest()

  // Lines 51-150: MASSIVE database query (8+ nested includes)
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      productCategory: true,
      productImages: { include: { Image: true } },
      productPaperStockSets: { /* deeply nested */ },
      productSizes: { /* ... */ },
      productQuantities: { /* ... */ },
      productAddons: { /* ... */ },
      // 8+ more relations...
    }
  })

  // Lines 151-400: Complex data transformations
  const transformedData = {
    // Nested mapping logic
    // Grouping logic
    // UI serialization
  }

  // Lines 401-648: Helper functions + more transforms
  return NextResponse.json(transformedData)
}
```

**Violates SoC:**
- HTTP layer mixed with data access
- Business logic mixed with presentation
- Cannot test without HTTP mocking
- Cannot reuse transformation logic

### Proposed Architecture

```
┌─────────────────────────────────────────────────┐
│ API Route (Thin Orchestrator)                   │
│ /api/products/[id]/configuration/route.ts       │
│ - Auth check                                     │
│ - Call service                                   │
│ - Return response                                │
│ (~20 lines)                                      │
└─────────────────────────────────────────────────┘
                    ↓ calls
┌─────────────────────────────────────────────────┐
│ Service Layer (Business Logic)                   │
│ /services/ProductConfigurationService.ts        │
│ - Orchestrates data fetching                     │
│ - Applies business rules                         │
│ - Transforms to DTO                              │
│ (~100 lines)                                     │
└─────────────────────────────────────────────────┘
        ↓ uses                     ↓ uses
┌─────────────────┐       ┌─────────────────────┐
│ Repository      │       │ Transformer          │
│ ProductRepo.ts  │       │ ConfigTransformer.ts │
│ - DB queries    │       │ - Data mapping       │
│ - Prisma only   │       │ - DTO creation       │
│ (~200 lines)    │       │ (~200 lines)         │
└─────────────────┘       └─────────────────────┘
```

### Implementation Steps

**Step 1.2.1: Create Repository**
```typescript
// /src/repositories/ProductRepository.ts

export class ProductRepository {
  async findWithConfiguration(productId: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id: productId },
      include: {
        // All the complex includes moved here
        productCategory: true,
        productImages: { include: { Image: true } },
        // ... etc
      }
    })
  }
}
```

**Step 1.2.2: Create Transformer**
```typescript
// /src/transformers/ProductConfigurationTransformer.ts

export class ProductConfigurationTransformer {
  toDTO(product: Product): ProductConfigurationDTO {
    return {
      id: product.id,
      name: product.name,
      paperStocks: this.transformPaperStocks(product.productPaperStockSets),
      sizes: this.transformSizes(product.productSizes),
      // All transformation logic here
    }
  }

  private transformPaperStocks(sets: any[]): PaperStockDTO[] {
    // Complex nested mapping logic moved here
  }
}
```

**Step 1.2.3: Create Service**
```typescript
// /src/services/ProductConfigurationService.ts

export class ProductConfigurationService {
  constructor(
    private repository: ProductRepository,
    private transformer: ProductConfigurationTransformer
  ) {}

  async getConfiguration(productId: string): Promise<ProductConfigurationDTO> {
    const product = await this.repository.findWithConfiguration(productId)

    if (!product) {
      throw new Error('Product not found')
    }

    return this.transformer.toDTO(product)
  }
}
```

**Step 1.2.4: Update API Route**
```typescript
// /src/app/api/products/[id]/configuration/route.ts (NOW 20 lines)

import { productConfigurationService } from '@/services'

export async function GET(request: NextRequest, { params }) {
  const { user } = await validateRequest()
  if (!user) return unauthorized()

  try {
    const config = await productConfigurationService.getConfiguration(params.id)
    return NextResponse.json(config)
  } catch (error) {
    return handleError(error)
  }
}
```

**Benefits:**
- ✅ Route reduced from 648 → 20 lines (97% reduction)
- ✅ Business logic testable without HTTP mocking
- ✅ Transformation logic reusable
- ✅ Clear separation of concerns

**Effort:** 12-16 hours
**Risk:** MEDIUM (well-isolated change)

---

## TASK 1.3: ADOPT EXISTING ORDERSERVICE

### Current Problem

**File:** `/src/app/api/checkout/route.ts` (200+ lines of inline logic)

```typescript
export async function POST(request: NextRequest) {
  const data = await request.json()

  // Manual validation
  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items' }, { status: 400 })
  }

  // Manual calculation
  const tax = Math.round(subtotal * taxRate)
  const shipping = shippingMethod === 'express' ? 2500 : 1000
  const total = subtotal + tax + shipping

  // Manual order creation
  const order = await prisma.order.create({
    data: {
      id: randomUUID(),
      // ... 50+ lines of order data
    }
  })

  // Manual email sending
  await sendEmail(...)

  // Manual webhook triggering
  await N8NWorkflows.trigger(...)
}
```

**But OrderService Already Exists:**

**File:** `/src/services/OrderService.ts` (460+ lines, fully implemented)

```typescript
export class OrderService {
  async createOrder(input: CreateOrderInput): Promise<ServiceResult<Order>> {
    // ✅ Proper validation
    // ✅ Transaction handling
    // ✅ Price calculation
    // ✅ Email sending
    // ✅ Webhook triggering
    return result
  }
}
```

### Solution: Use Existing Service

**Step 1.3.1: Update Checkout API**

```typescript
// /src/app/api/checkout/route.ts (AFTER - 15 lines)

import { OrderService } from '@/services/OrderService'

export async function POST(request: NextRequest) {
  const data = await request.json()

  const result = await OrderService.createOrder({
    items: data.items,
    customer: data.customer,
    shipping: data.shipping,
    payment: data.payment
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result.data)
}
```

**Benefits:**
- ✅ Route reduced from 200+ → 15 lines
- ✅ Consistent order creation logic
- ✅ Reusable in admin panel
- ✅ Already tested (service has tests)

**Effort:** 4-6 hours
**Risk:** LOW (service already exists and tested)

---

## TASK 1.4: CONSOLIDATE API RESPONSE HANDLERS

### Current Problem

**Two files with overlapping functionality:**

1. `/src/lib/api-response.ts` (254 lines)
2. `/src/lib/api/responses.ts` (98 lines)

**Duplication:**
```typescript
// api-response.ts
export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

// api/responses.ts
export function errorResponse(message: string, code: number) {
  return NextResponse.json({ error: message }, { status: code })
}
```

### Solution: Consolidate to One File

**Step 1.4.1: Choose Best Implementation**
- Keep: `/src/lib/api/responses.ts` (better organized, newer)
- Migrate: All imports to this file
- Delete: `/src/lib/api-response.ts`

**Step 1.4.2: Find and Replace**
```bash
# Find all usages
grep -r "from '@/lib/api-response'" src/

# Update imports
sed -i "s|from '@/lib/api-response'|from '@/lib/api/responses'|g" src/**/*.ts

# Update function names if needed
sed -i "s|createErrorResponse|errorResponse|g" src/**/*.ts
```

**Effort:** 2-3 hours
**Risk:** VERY LOW (straightforward find-replace)

---

## RISK MITIGATION STRATEGY

### Phase 1 Risks

| Risk | Severity | Mitigation |
|------|----------|----------|
| **Pricing calculation errors** | 🔴 CRITICAL | Comprehensive testing, staged rollout |
| **Breaking existing features** | 🟡 HIGH | Feature flags, canary deployment |
| **Incomplete migration** | 🟡 MEDIUM | Complete verification before deletion |
| **Performance regression** | 🟢 LOW | Benchmark before/after |

### Testing Strategy

**Before ANY deployment:**

1. ✅ **Unit Tests Pass:** `npm test`
2. ✅ **Integration Tests Pass:** Test API endpoints
3. ✅ **Manual Verification:** Test in browser
4. ✅ **Pricing Verification:** Compare against [PRICING-REFERENCE.md](../PRICING-REFERENCE.md)
5. ✅ **Regression Tests:** Verify existing functionality unchanged

### Rollback Plan

**If issues discovered after deployment:**

```bash
# Option 1: Git revert
git revert <commit-hash>
git push

# Option 2: Feature flag disable
# Update config to use old implementation

# Option 3: Database rollback
# If database changes made, restore backup
```

---

## DEPLOYMENT STRATEGY

### Recommended Approach: Staged Rollout

**Week 1:**
- Task 1.4: Consolidate API response handlers (LOW RISK)
- Deploy and verify
- If successful, proceed

**Week 2:**
- Task 1.3: Adopt OrderService (LOW RISK)
- Deploy and verify
- If successful, proceed

**Week 3:**
- Task 1.2: Extract ProductConfiguration service (MEDIUM RISK)
- Deploy and verify
- Monitor for issues

**Week 4:**
- Task 1.1: Pricing consolidation (HIGH RISK)
- EXTENSIVE testing before deployment
- Canary deployment (10% traffic first)
- Full rollout if no issues

### Alternative: All at Once (Higher Risk)

**If timeline is critical:**
- Complete all tasks in development
- Test extensively in staging
- Single deployment to production
- **Requires:** More thorough testing upfront

---

## SUCCESS CRITERIA

**Phase 1 is successful when:**

✅ All tests passing (unit + integration)
✅ Pricing calculations match current production
✅ No errors in production logs
✅ Performance benchmarks maintained or improved
✅ Code reduced by 2,000+ lines
✅ Developer feedback positive

**Metrics to Track:**

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Duplicated Code | 3,475 lines | <1,500 lines | LOC count |
| Pricing Bugs | Baseline | -80% | Issue tracker |
| API Response Time | Baseline | <10% increase | Application monitoring |
| Test Coverage | ?? | >80% | Jest coverage |

---

## RECOMMENDATIONS

### Before Starting Implementation

1. **Run comprehensive analysis:**
   ```bash
   # Verify pricing file usage
   grep -r "pricing-engine\|pricing-calculator\|PricingCalculator" src/

   # Check for OrderService usage
   grep -r "OrderService" src/

   # Verify API response handler usage
   grep -r "api-response\|api/responses" src/
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b refactor/phase-1-dry-soc
   ```

3. **Set up testing environment:**
   ```bash
   # Ensure all tests run
   npm test

   # Ensure dev server works
   npm run dev
   ```

### Recommended Order

**Safest approach (low → high risk):**

1. ✅ Task 1.4: API response handlers (2-3 hours, VERY LOW RISK)
2. ✅ Task 1.3: OrderService adoption (4-6 hours, LOW RISK)
3. ✅ Task 1.2: ProductConfiguration extraction (12-16 hours, MEDIUM RISK)
4. ✅ Task 1.1: Pricing consolidation (8-12 hours, HIGH RISK)

**Total:** 26-37 hours over 2-3 weeks

---

## APPROVAL REQUIRED

**Before proceeding, please confirm:**

- [ ] Approach is acceptable
- [ ] Staged rollout vs all-at-once preference
- [ ] Testing requirements are clear
- [ ] Risk mitigation strategy is sufficient
- [ ] Timeline is realistic

**Questions for user:**

1. Is `unifiedPricingEngine` the ONLY pricing implementation in use?
2. Should we do staged rollout (safer) or all-at-once (faster)?
3. Are there any specific concerns about pricing changes?
4. Do you have a staging environment for testing?
5. What's your preferred timeline (aggressive or conservative)?

---

## NEXT STEPS

**After approval:**

1. Run verification scripts
2. Start with Task 1.4 (lowest risk)
3. Complete each task with full testing
4. Deploy incrementally
5. Monitor for issues
6. Proceed to next task

**Status:** Awaiting user approval to proceed
