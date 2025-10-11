# Story: Connect Pricing API Endpoint

**Story ID:** EPIC-003-STORY-1
**Epic:** Product Pricing Calculation API Integration
**Status:** Ready for Development
**Created:** 2025-09-30
**Estimate:** 3-4 hours

---

## User Story

**As a** product configuration system
**I want** an API endpoint that connects to the existing pricing engines
**So that** the frontend can request real-time price calculations for customer product configurations

---

## Context

**What Already Exists:**

- ✅ `UnifiedPricingEngine` class in `/src/lib/pricing/unified-pricing-engine.ts`
- ✅ `BasePriceEngine` class in `/src/lib/pricing/base-price-engine.ts`
- ✅ `ModulePricingEngine` class in `/src/components/product/modules/pricing/ModulePricingEngine.ts`
- ✅ Product configuration API: `/api/products/[id]/configuration`
- ✅ All pricing formulas implemented and tested

**What's Missing:**

- ❌ API endpoint to receive configuration and return calculated price
- ❌ Request validation schema
- ❌ Response formatting for frontend consumption

---

## Acceptance Criteria

### Functional Requirements

1. **API Endpoint Creation**
   - [ ] Create POST endpoint at `/api/pricing/calculate/route.ts`
   - [ ] Endpoint accepts product configuration in request body
   - [ ] Endpoint returns calculated price + breakdown

2. **Request Processing**
   - [ ] Parse and validate incoming configuration
   - [ ] Extract: quantity, size, paper stock, add-ons, turnaround selections
   - [ ] Handle both standard and custom selections

3. **Pricing Calculation**
   - [ ] Connect to `UnifiedPricingEngine.calculatePrice()`
   - [ ] Pass configuration to pricing engine
   - [ ] Retrieve calculation result with breakdown

4. **Response Formatting**
   - [ ] Return JSON with: `{ price, breakdown, validation }`
   - [ ] Include itemized costs (base, add-ons, turnaround)
   - [ ] Return user-friendly error messages

5. **Error Handling**
   - [ ] Validate required fields (quantity, paper stock)
   - [ ] Return 400 for validation errors
   - [ ] Return 500 for calculation errors
   - [ ] Log errors with context

### Non-Functional Requirements

6. **Performance**
   - [ ] Response time < 200ms for typical configurations
   - [ ] Use pricing engine's built-in caching

7. **Validation**
   - [ ] Validate custom quantity increments (5000+ must be multiples)
   - [ ] Validate custom size increments (0.25 inch)
   - [ ] Validate module combinations

---

## Technical Implementation

### Request Schema

```typescript
interface PricingCalculationRequest {
  // Product context
  productId?: string
  categoryId?: string

  // Size (OPTIONAL module)
  sizeSelection?: 'standard' | 'custom'
  standardSizeId?: string
  customWidth?: number
  customHeight?: number

  // Quantity (REQUIRED module)
  quantitySelection: 'standard' | 'custom'
  standardQuantityId?: string
  customQuantity?: number

  // Paper Stock (OPTIONAL but common)
  paperStockId?: string
  sides?: 'single' | 'double'

  // Turnaround (OPTIONAL module)
  turnaroundId?: string

  // Add-ons (OPTIONAL module)
  selectedAddons?: Array<{
    addonId: string
    configuration?: Record<string, any>
    quantity?: number
  }>

  // Customer type
  isBroker?: boolean
  brokerCategoryDiscounts?: Array<{
    categoryId: string
    discountPercent: number
  }>
}
```

### Response Schema

```typescript
interface PricingCalculationResponse {
  success: boolean
  price: number
  breakdown: {
    basePrice: number
    addonCosts: number
    turnaroundCosts: number
    adjustments: {
      brokerDiscount?: { percentage: number; amount: number }
      taglineDiscount?: { percentage: number; amount: number }
      exactSizeMarkup?: { percentage: number; amount: number }
    }
  }
  validation: {
    isValid: boolean
    warnings: string[]
    errors: string[]
  }
  displayBreakdown: string[]
}
```

### Connection Points

**Existing Code to Use:**

1. Import `UnifiedPricingEngine` from `/src/lib/pricing/unified-pricing-engine.ts`
2. Fetch catalog data from Prisma (sizes, quantities, paper stocks, add-ons, turnarounds)
3. Call `engine.calculatePrice(request, catalog)`
4. Return formatted result

**API Route Structure:**

```typescript
// /src/app/api/pricing/calculate/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { unifiedPricingEngine } from '@/lib/pricing/unified-pricing-engine'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json()

    // 2. Fetch catalog data from database
    const catalog = await fetchCatalogData()

    // 3. Call pricing engine
    const result = unifiedPricingEngine.calculatePrice(body, catalog)

    // 4. Return formatted response
    return NextResponse.json({
      success: true,
      price: result.totals.beforeTax,
      breakdown: result,
      validation: result.validation,
    })
  } catch (error) {
    // Error handling
  }
}
```

---

## Files to Create/Modify

### Files to CREATE:

- `/src/app/api/pricing/calculate/route.ts` - Main API endpoint

### Files to UPDATE:

- `/src/lib/validation.ts` - Add Zod schema for pricing request validation

### Files to REFERENCE (no changes):

- `/src/lib/pricing/unified-pricing-engine.ts` - Existing pricing logic
- `/src/lib/prisma.ts` - Database client

---

## Testing Requirements

### Unit Tests

- [ ] Test valid configuration → returns correct price
- [ ] Test missing required fields → returns 400
- [ ] Test invalid custom quantity → returns validation error
- [ ] Test invalid custom size → returns validation error
- [ ] Test calculation error → returns 500

### Integration Tests

- [ ] Test with real database catalog data
- [ ] Test all module combinations (quantity only, quantity+size, full config)
- [ ] Test broker discount calculation
- [ ] Test add-on pricing (flat, percentage, per-unit)
- [ ] Test turnaround markup

### Performance Tests

- [ ] Measure response time for typical configuration
- [ ] Verify caching is working
- [ ] Test concurrent requests

---

## Definition of Done

- [ ] API endpoint created and functional
- [ ] Request validation implemented with Zod
- [ ] Pricing engine connected correctly
- [ ] Response format matches schema
- [ ] Error handling covers all edge cases
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Response time < 200ms verified
- [ ] Code reviewed
- [ ] Existing product configuration API still works

---

## Dependencies

**Required Before Starting:**

- Access to existing pricing engines
- Database access (Prisma client)
- Understanding of product module structure

**Blocks:**

- Story 2 (Frontend Integration) - Cannot display prices without API

---

## Notes

- Focus on **connecting** existing code, not creating new pricing logic
- The `UnifiedPricingEngine` already has all formulas implemented
- Main work is request/response handling and data transformation
- Use existing Prisma models for catalog data fetching
- Pricing engine has built-in caching - leverage it
- Keep API stateless (no session management needed)

---

## References

- Epic: `/docs/epics/product-pricing-calculation-epic.md`
- Pricing Engine: `/src/lib/pricing/unified-pricing-engine.ts`
- Pricing Formula: `/docs/pricing_formula_prompt.md`
- Product Config API: `/src/app/api/products/[id]/configuration/route.ts`
