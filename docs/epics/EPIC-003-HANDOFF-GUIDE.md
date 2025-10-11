# EPIC-003 Development Handoff Guide

**Epic:** Product Pricing Calculation API Integration
**Status:** Ready for Development
**Created:** 2025-09-30
**Estimated Timeline:** 9-12 hours (1.5-2 days)

---

## 📋 Epic Overview

Connect existing pricing calculation engines to the product configuration frontend, enabling real-time price updates as customers select product options.

**Key Insight:** All pricing logic already exists - this epic is about **connecting** components, not building from scratch.

---

## 📚 Documentation Locations

### Epic Documentation

- **Epic Overview:** `/docs/epics/product-pricing-calculation-epic.md`
- **This Handoff Guide:** `/docs/epics/EPIC-003-HANDOFF-GUIDE.md`

### Story Documentation

1. **Story 1 - API Endpoint:** `/docs/stories/story-epic-003-1-pricing-api-endpoint.md`
2. **Story 2 - Frontend Integration:** `/docs/stories/story-epic-003-2-frontend-integration.md`
3. **Story 3 - Cart & Testing:** `/docs/stories/story-epic-003-3-cart-integration-testing.md`

---

## 🎯 Development Sequence

### Story 1: Create Pricing Calculation API Endpoint

**Estimate:** 3-4 hours

**What to Build:**

- API endpoint at `/api/pricing/calculate/route.ts`
- Request validation with Zod
- Connect to `UnifiedPricingEngine`
- Return formatted price + breakdown

**Key Files:**

- CREATE: `/src/app/api/pricing/calculate/route.ts`
- UPDATE: `/src/lib/validation.ts`
- REFERENCE: `/src/lib/pricing/unified-pricing-engine.ts`

**Acceptance Criteria:**

- ✅ POST endpoint accepts configuration JSON
- ✅ Returns calculated price + breakdown
- ✅ Validates required fields
- ✅ Response time < 200ms
- ✅ Error handling (400, 500)

**Start Here:** `/docs/stories/story-epic-003-1-pricing-api-endpoint.md`

---

### Story 2: Frontend Pricing Integration & Real-Time Display

**Estimate:** 4-5 hours
**Depends On:** Story 1 complete

**What to Build:**

- Update `usePriceCalculation` hook to call API
- Create `PriceDisplay` component
- Wire form to show real-time prices
- Add debouncing + loading/error states

**Key Files:**

- CREATE: `/src/components/product/PriceDisplay.tsx`
- UPDATE: `/src/hooks/usePriceCalculation.ts`
- UPDATE: `/src/components/product/ProductConfigurationForm.tsx`

**Acceptance Criteria:**

- ✅ Price updates when options change
- ✅ Debounced API calls (300ms)
- ✅ Loading/error states
- ✅ Price breakdown visible
- ✅ Smooth UX

**Start Here:** `/docs/stories/story-epic-003-2-frontend-integration.md`

---

### Story 3: Cart Integration & End-to-End Testing

**Estimate:** 2-3 hours
**Depends On:** Stories 1 & 2 complete

**What to Build:**

- Pass calculated price to cart
- Store price with cart item
- Create E2E test suite
- Verify complete flow

**Key Files:**

- UPDATE: `/src/components/product/AddToCartSection.tsx`
- UPDATE: `/src/services/CartService.ts`
- CREATE: `/tests/e2e/pricing-calculation-flow.test.ts`

**Acceptance Criteria:**

- ✅ Cart receives calculated price
- ✅ Price persists through checkout
- ✅ E2E tests pass
- ✅ No cart regressions

**Start Here:** `/docs/stories/story-epic-003-3-cart-integration-testing.md`

---

## 🔑 Key Technical Context

### What Already Exists (Don't Rebuild!)

**Pricing Engines:**

- ✅ `/src/lib/pricing/base-price-engine.ts` - Core formula
- ✅ `/src/lib/pricing/unified-pricing-engine.ts` - Full calculation
- ✅ `/src/components/product/modules/pricing/ModulePricingEngine.ts` - Modular

**Product System:**

- ✅ 6 Product Modules (Quantity, Size, Paper, Addons, Turnaround, Images)
- ✅ Product configuration API: `/api/products/[id]/configuration`
- ✅ Form components collect user selections
- ✅ Cart system stores items

**Hooks & Components:**

- ✅ `useProductConfiguration.ts` - Form state management
- ✅ `usePriceCalculation.ts` - Exists but needs API integration
- ✅ `ProductConfigurationForm.tsx` - Main customer form
- ✅ `AddToCartSection.tsx` - Add to cart button

### What's Missing (Build This!)

**API Layer:**

- ❌ Endpoint to receive config → return price
- ❌ Request validation
- ❌ Response formatting

**Frontend:**

- ❌ Hook calling API on changes
- ❌ Real-time price display component
- ❌ Debouncing + loading states

**Integration:**

- ❌ Cart receiving calculated price
- ❌ E2E test coverage

---

## 🏗️ Architecture Decisions

### Use `UnifiedPricingEngine`

**Why:** Most comprehensive, handles all module combinations

**Location:** `/src/lib/pricing/unified-pricing-engine.ts`

**Usage:**

```typescript
import { unifiedPricingEngine } from '@/lib/pricing/unified-pricing-engine'

const result = unifiedPricingEngine.calculatePrice(request, catalog)
// Returns: { totals, breakdown, validation, ... }
```

### Debounce API Calls

**Why:** Prevent spam from rapid option changes

**Pattern:** 300ms debounce using `use-debounce`

### Store Price with Cart Item

**Why:** Price at time of selection must persist

**Data:** Store both `calculatedPrice` and `priceBreakdown`

---

## ⚠️ Critical Compatibility Requirements

### DO NOT Break These

1. **Product Configuration API**
   - Existing `/api/products/[id]/configuration` must work
   - Don't modify product data structure

2. **Cart Functionality**
   - All existing cart operations must continue working
   - Only ADD price field, don't change existing fields

3. **Pricing Formulas**
   - Use existing engines exactly as-is
   - Don't create new pricing logic

4. **Module System**
   - Support all 6 modules (some optional)
   - Handle module combinations correctly

---

## 🧪 Testing Strategy

### Story 1: API Endpoint

- Unit tests for endpoint logic
- Integration tests with database
- Performance tests (< 200ms)

### Story 2: Frontend

- Unit tests for hook and component
- Integration tests for form → API flow
- Visual regression tests

### Story 3: Complete Flow

- E2E tests: Product → Cart → Checkout
- All module combinations
- Edge cases (custom values, add-ons, etc.)
- Regression tests for existing functionality

---

## 📊 Success Metrics

**Functional:**

- ✅ Real-time price updates within 200ms
- ✅ 100% price accuracy (matches formulas)
- ✅ All module combinations supported
- ✅ Price persists through checkout

**Technical:**

- ✅ All tests passing
- ✅ No console errors
- ✅ No performance regressions
- ✅ Zero breaking changes to existing features

**User Experience:**

- ✅ Clear loading indicators
- ✅ Helpful error messages
- ✅ Smooth transitions
- ✅ Price breakdown understandable

---

## 🚀 Getting Started

### For @dev Agent:

**Step 1:** Read the epic overview

```
Read: /docs/epics/product-pricing-calculation-epic.md
```

**Step 2:** Start with Story 1

```
Read: /docs/stories/story-epic-003-1-pricing-api-endpoint.md
Implement: /src/app/api/pricing/calculate/route.ts
```

**Step 3:** Proceed sequentially through stories

- Complete Story 1 → Test → Move to Story 2
- Complete Story 2 → Test → Move to Story 3
- Complete Story 3 → Test → Epic done!

### For @sm (Story Manager):

All stories are already created and detailed. Stories are ready for immediate development.

---

## 📖 Reference Documentation

### Pricing Formula

- **Location:** `/docs/pricing_formula_prompt.md`
- **Formula:** `((Base Paper Price × Sides Multiplier) × Size × Quantity)` + add-ons + turnaround

### Existing Code Reference

- **Pricing Engines:** `/src/lib/pricing/`
- **Product Modules:** `/src/components/product/modules/`
- **Configuration API:** `/src/app/api/products/[id]/configuration/route.ts`
- **Hooks:** `/src/hooks/`

### Architecture Docs

- **Module System:** `/docs/documentations/bmad_fix_gangrun_printing.md`
- **Tech Stack:** `/CLAUDE.md`

---

## 💡 Implementation Tips

### Story 1: API Endpoint

- Copy catalog fetch logic from `/api/products/[id]/configuration/route.ts`
- Use Zod for validation (follow existing patterns)
- Log errors with context for debugging
- Return descriptive error messages

### Story 2: Frontend

- Use `useDebouncedCallback` from `use-debounce` package
- Keep previous price visible during loading
- Make price breakdown expandable (collapsed by default)
- Add test IDs for E2E tests: `data-testid="calculated-price"`

### Story 3: Cart

- Minimal changes to cart - just add price fields
- Verify existing cart tests still pass
- Focus on E2E test coverage
- Test with real product data

---

## ❓ Questions? Issues?

### During Development:

**Question About Pricing Formula?**
→ Check `/docs/pricing_formula_prompt.md`
→ Review existing engines in `/src/lib/pricing/`

**Question About Modules?**
→ Check `/docs/documentations/bmad_fix_gangrun_printing.md`
→ Look at `/src/components/product/modules/`

**Question About Cart?**
→ Review `/src/services/CartService.ts`
→ Check existing cart components

**Stuck on Something?**
→ Each story has detailed technical implementation section
→ Look at existing similar code for patterns
→ All reference files listed in story docs

---

## ✅ Definition of Done (Epic Complete)

When all these are true, the epic is done:

- [ ] All 3 stories completed
- [ ] All acceptance criteria met
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code reviewed
- [ ] No regressions in existing functionality
- [ ] Documentation updated
- [ ] Real-time pricing working in production
- [ ] Cart receives correct prices
- [ ] Checkout shows correct amounts
- [ ] Performance targets met (< 200ms)

---

## 🎉 Ready to Start!

**Epic Status:** ✅ Ready for Development
**Next Action:** Begin Story 1 implementation
**First File:** `/src/app/api/pricing/calculate/route.ts`

All planning complete. All components identified. All stories written.

**Time to connect everything and ship! 🚀**
