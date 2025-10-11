# Product Pricing Calculation API Integration - Brownfield Enhancement

**Epic ID:** EPIC-003
**Status:** Draft
**Created:** 2025-09-30
**Owner:** Product Management

---

## Epic Goal

Connect the existing pricing calculation engines to the product configuration frontend, enabling real-time price updates as customers select product options (quantity, size, paper stock, add-ons, turnaround time).

---

## Epic Description

### Existing System Context

**Current relevant functionality:**

- Three complete pricing engines exist:
  - `base-price-engine.ts` - Core formula implementation
  - `unified-pricing-engine.ts` - Comprehensive pricing with add-ons
  - `ModulePricingEngine.ts` - Modular architecture with caching
- Modular product configuration system with 6 modules:
  - Quantity (REQUIRED)
  - Size (OPTIONAL)
  - Paper Stock (OPTIONAL)
  - Add-ons (OPTIONAL)
  - Turnaround (OPTIONAL)
  - Images (OPTIONAL)
- Product configuration form collects user selections
- Pricing formula: `((Base Paper Price × Sides Multiplier) × Size × Quantity)` + add-ons + turnaround markup

**Technology stack:**

- Next.js 15 with App Router
- TypeScript
- PostgreSQL + Prisma ORM
- React with Server/Client Components
- Existing hooks: `useProductConfiguration.ts`, `usePriceCalculation.ts`

**Integration points:**

- `/api/products/[id]/configuration` - Fetches product config options
- `ProductConfigurationForm.tsx` - Main customer-facing form
- `AddToCartSection.tsx` - Displays final price
- Cart system for checkout

### Enhancement Details

**What's being added/changed:**

1. New API endpoint `/api/pricing/calculate` to accept configuration and return calculated price
2. Frontend hook enhancement to call pricing API on option changes
3. Real-time price display component in product configuration
4. Cart integration to pass calculated price + breakdown

**How it integrates:**

- API endpoint uses existing `UnifiedPricingEngine` class
- Frontend hooks call API via fetch
- Product form triggers price calculation on any option change
- Price breakdown shows itemized costs (base + add-ons + turnaround)

**Success criteria:**

- Real-time price updates within 200ms of option selection
- Accurate pricing matching all existing formulas
- Price breakdown visible to customer
- Cart receives correct calculated price
- No impact on existing product configuration functionality

---

## Stories

### Story 1: Create Pricing Calculation API Endpoint

Create `/api/pricing/calculate/route.ts` that accepts product configuration (quantity, size, paper, add-ons, turnaround) and returns calculated price using `UnifiedPricingEngine`. Include validation, error handling, and price breakdown in response.

**Acceptance Criteria:**

- POST endpoint accepts configuration JSON
- Returns calculated price + breakdown
- Handles all module combinations
- Validates required fields
- Returns appropriate error codes (400, 500)
- Response time < 200ms

**Technical Details:**

- Use `UnifiedPricingEngine` from `/src/lib/pricing/unified-pricing-engine.ts`
- Request body validation with Zod schema
- Error handling with try-catch
- Response format: `{ price, breakdown, validation }`

**Files to Create/Modify:**

- `/src/app/api/pricing/calculate/route.ts` (NEW)
- `/src/lib/validation.ts` (UPDATE - add pricing request schema)

---

### Story 2: Frontend Pricing Integration & Real-Time Display

Enhance or create `usePriceCalculation` hook to call pricing API on configuration changes. Wire up `ProductConfigurationForm.tsx` to trigger calculations. Display real-time price and breakdown to user.

**Acceptance Criteria:**

- Price updates automatically when options change
- Loading state during calculation
- Error handling for failed calculations
- Price breakdown displays itemized costs
- Debounced API calls (300ms delay to prevent spam)
- Display loading spinner during calculation
- Show error message if calculation fails

**Technical Details:**

- Update `/src/hooks/usePriceCalculation.ts` to call API
- Use `useDebouncedCallback` for option changes
- Add loading/error states
- Create `PriceDisplay` component for breakdown
- Wire into `ProductConfigurationForm.tsx`

**Files to Create/Modify:**

- `/src/hooks/usePriceCalculation.ts` (UPDATE)
- `/src/components/product/PriceDisplay.tsx` (NEW)
- `/src/components/product/ProductConfigurationForm.tsx` (UPDATE)

---

### Story 3: Cart Integration & End-to-End Testing

Integrate calculated price into cart system. Pass final price + configuration details to cart. Test complete flow from product page → cart → checkout.

**Acceptance Criteria:**

- Cart receives calculated price from API
- Cart item includes all selected options
- Price persists through checkout
- Existing cart functionality unaffected
- E2E test covers pricing calculation flow
- All edge cases tested (custom quantities, optional modules)

**Technical Details:**

- Update `AddToCartSection.tsx` to use calculated price
- Modify cart service to store price breakdown
- Create E2E tests with Playwright/Cypress
- Test all module combinations

**Files to Create/Modify:**

- `/src/components/product/AddToCartSection.tsx` (UPDATE)
- `/src/services/CartService.ts` (UPDATE)
- `/tests/e2e/pricing-calculation.test.ts` (NEW)

---

## Compatibility Requirements

- ✅ Existing APIs remain unchanged (new endpoint only)
- ✅ Database schema changes are backward compatible (none required)
- ✅ UI changes follow existing patterns (React hooks + Server Components)
- ✅ Performance impact is minimal (caching in pricing engine)

---

## Risk Mitigation

**Primary Risk:** Pricing calculation errors leading to incorrect customer charges

**Mitigation:**

- Use existing tested pricing engines (no new formula logic)
- Comprehensive unit tests for API endpoint
- Validation at API layer before calculation
- Price breakdown transparency for customer verification

**Rollback Plan:**

- New API endpoint can be disabled via feature flag
- Frontend can fall back to static pricing display
- No database migrations required (easy rollback)

---

## Definition of Done

- ✅ All 3 stories completed with acceptance criteria met
- ✅ Existing product configuration functionality verified through testing
- ✅ Integration points (API, form, cart) working correctly
- ✅ Price calculation accuracy validated against test cases
- ✅ No regression in existing product pages or checkout flow
- ✅ Documentation updated
- ✅ E2E tests passing

---

## Dependencies

**Technical Dependencies:**

- Existing pricing engines: `base-price-engine.ts`, `unified-pricing-engine.ts`, `ModulePricingEngine.ts`
- Product configuration API: `/api/products/[id]/configuration`
- Existing hooks: `useProductConfiguration.ts`

**Team Dependencies:**

- None (single developer can complete)

---

## Timeline Estimate

- Story 1: 3-4 hours
- Story 2: 4-5 hours
- Story 3: 2-3 hours
- **Total: 9-12 hours (1.5-2 days)**

---

## Story Manager Handoff

Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing system running **Next.js 15, TypeScript, Prisma, PostgreSQL**
- Integration points:
  - `/api/products/[id]/configuration` (product config API)
  - `ProductConfigurationForm.tsx` (customer form)
  - `AddToCartSection.tsx` (price display)
  - Existing pricing engines in `/src/lib/pricing/`

- Existing patterns to follow:
  - Next.js App Router API routes
  - React Server/Client Component separation
  - Custom hooks for data fetching
  - Prisma for database queries

- Critical compatibility requirements:
  - Must use existing `UnifiedPricingEngine` class
  - Cannot modify product configuration data structure
  - Must support all 6 product modules (some optional)
  - Real-time calculation without blocking UI

- Each story must include verification that existing functionality remains intact

The epic should maintain system integrity while delivering **real-time product pricing calculation for customers**.
