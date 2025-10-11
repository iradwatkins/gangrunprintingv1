# Story: Connect Frontend to Pricing API

**Story ID:** EPIC-003-STORY-2
**Epic:** Product Pricing Calculation API Integration
**Status:** Ready for Development
**Created:** 2025-09-30
**Estimate:** 4-5 hours
**Depends On:** EPIC-003-STORY-1

---

## User Story

**As a** customer configuring a product
**I want** to see the price update in real-time as I select options
**So that** I know the total cost before adding to cart

---

## Context

**What Already Exists:**

- ✅ `usePriceCalculation.ts` hook (exists but may need updates)
- ✅ `useProductConfiguration.ts` hook (manages form state)
- ✅ `ProductConfigurationForm.tsx` (collects user selections)
- ✅ `AddToCartSection.tsx` (displays price)
- ✅ Product configuration module components (Quantity, Size, Paper, etc.)

**What's Missing:**

- ❌ Connection between form state changes → API call
- ❌ Real-time price display component
- ❌ Loading/error states for pricing calculation
- ❌ Debounced API calls to prevent spam

**What Story 1 Provides:**

- ✅ API endpoint `/api/pricing/calculate` (created in Story 1)

---

## Acceptance Criteria

### Functional Requirements

1. **Hook Enhancement**
   - [ ] Update `usePriceCalculation` hook to call `/api/pricing/calculate`
   - [ ] Hook accepts product configuration state
   - [ ] Hook triggers API call when configuration changes
   - [ ] Hook returns: `{ price, breakdown, loading, error }`

2. **Debouncing**
   - [ ] Debounce API calls by 300ms
   - [ ] Only call API when user pauses selection
   - [ ] Cancel pending calls when new changes occur

3. **State Management**
   - [ ] `loading: true` during API call
   - [ ] `loading: false` when price received
   - [ ] `error` populated if API fails
   - [ ] `price` and `breakdown` updated on success

4. **Real-Time Display**
   - [ ] Create `PriceDisplay` component
   - [ ] Show loading spinner during calculation
   - [ ] Display calculated price prominently
   - [ ] Show itemized breakdown (expandable/collapsible)
   - [ ] Display error message if calculation fails

5. **Form Integration**
   - [ ] Wire `ProductConfigurationForm` to call hook
   - [ ] Pass configuration state to hook
   - [ ] Display `PriceDisplay` component in form
   - [ ] Update on any option change (quantity, size, paper, add-ons, turnaround)

### Non-Functional Requirements

6. **Performance**
   - [ ] No unnecessary re-renders
   - [ ] Debouncing prevents API spam
   - [ ] Smooth loading transitions

7. **UX**
   - [ ] Clear loading indicator
   - [ ] Error messages are user-friendly
   - [ ] Price updates are obvious to user
   - [ ] Breakdown is easily understood

---

## Technical Implementation

### Hook Updates

**Update `/src/hooks/usePriceCalculation.ts`:**

```typescript
import { useState, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface UsePriceCalculationProps {
  configuration: ProductConfiguration
  enabled?: boolean
}

interface PriceResult {
  price: number | null
  breakdown: PriceBreakdown | null
  loading: boolean
  error: string | null
}

export function usePriceCalculation({
  configuration,
  enabled = true,
}: UsePriceCalculationProps): PriceResult {
  const [price, setPrice] = useState<number | null>(null)
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced calculation function
  const calculatePrice = useDebouncedCallback(
    async (config: ProductConfiguration) => {
      if (!enabled) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        })

        if (!response.ok) {
          throw new Error('Pricing calculation failed')
        }

        const data = await response.json()
        setPrice(data.price)
        setBreakdown(data.breakdown)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setPrice(null)
        setBreakdown(null)
      } finally {
        setLoading(false)
      }
    },
    300 // 300ms debounce
  )

  // Trigger calculation when configuration changes
  useEffect(() => {
    if (configuration.quantitySelection) {
      calculatePrice(configuration)
    }
  }, [configuration, calculatePrice])

  return { price, breakdown, loading, error }
}
```

### Price Display Component

**Create `/src/components/product/PriceDisplay.tsx`:**

```typescript
import { useState } from 'react'

interface PriceDisplayProps {
  price: number | null
  breakdown: PriceBreakdown | null
  loading: boolean
  error: string | null
}

export function PriceDisplay({
  price,
  breakdown,
  loading,
  error
}: PriceDisplayProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  if (loading) {
    return (
      <div className="price-display loading">
        <div className="spinner" />
        <p>Calculating price...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="price-display error">
        <p className="error-message">{error}</p>
      </div>
    )
  }

  if (price === null) {
    return (
      <div className="price-display">
        <p className="text-muted">Select options to see price</p>
      </div>
    )
  }

  return (
    <div className="price-display">
      <div className="price-main">
        <span className="price-label">Total Price:</span>
        <span className="price-value">${price.toFixed(2)}</span>
      </div>

      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="breakdown-toggle"
      >
        {showBreakdown ? 'Hide' : 'Show'} Price Breakdown
      </button>

      {showBreakdown && breakdown && (
        <div className="price-breakdown">
          <div className="breakdown-item">
            <span>Base Price:</span>
            <span>${breakdown.basePrice.toFixed(2)}</span>
          </div>
          {breakdown.addonCosts > 0 && (
            <div className="breakdown-item">
              <span>Add-ons:</span>
              <span>${breakdown.addonCosts.toFixed(2)}</span>
            </div>
          )}
          {breakdown.turnaroundCosts > 0 && (
            <div className="breakdown-item">
              <span>Turnaround:</span>
              <span>${breakdown.turnaroundCosts.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

### Form Integration

**Update `/src/components/product/ProductConfigurationForm.tsx`:**

```typescript
import { usePriceCalculation } from '@/hooks/usePriceCalculation'
import { PriceDisplay } from './PriceDisplay'

export function ProductConfigurationForm({ product }) {
  const { configuration, updateConfiguration } = useProductConfiguration()

  // Add pricing calculation
  const { price, breakdown, loading, error } = usePriceCalculation({
    configuration,
    enabled: !!configuration.quantitySelection
  })

  return (
    <form>
      {/* Existing form fields */}
      <QuantitySelector onChange={updateConfiguration} />
      <SizeSelector onChange={updateConfiguration} />
      <PaperSelector onChange={updateConfiguration} />
      <AddonsSelector onChange={updateConfiguration} />
      <TurnaroundSelector onChange={updateConfiguration} />

      {/* NEW: Price display */}
      <PriceDisplay
        price={price}
        breakdown={breakdown}
        loading={loading}
        error={error}
      />

      {/* Existing add to cart */}
      <AddToCartSection
        price={price}
        configuration={configuration}
        disabled={loading || error !== null}
      />
    </form>
  )
}
```

---

## Files to Create/Modify

### Files to CREATE:

- `/src/components/product/PriceDisplay.tsx` - Real-time price display component

### Files to UPDATE:

- `/src/hooks/usePriceCalculation.ts` - Add API integration
- `/src/components/product/ProductConfigurationForm.tsx` - Wire up pricing display
- `/src/components/product/AddToCartSection.tsx` - Accept price from hook (minor update)

### Dependencies to ADD:

- `use-debounce` package (if not already installed)

---

## Testing Requirements

### Unit Tests

- [ ] Test `usePriceCalculation` hook with mock API
- [ ] Test debouncing behavior
- [ ] Test loading states
- [ ] Test error handling
- [ ] Test `PriceDisplay` component rendering

### Integration Tests

- [ ] Test configuration change → API call → price update
- [ ] Test rapid changes → only last call executes
- [ ] Test error from API → error displayed
- [ ] Test loading → success flow
- [ ] Test all module combinations update price

### E2E Tests (defer to Story 3)

- Covered in Story 3

---

## Definition of Done

- [ ] `usePriceCalculation` hook updated and working
- [ ] API calls are debounced correctly
- [ ] `PriceDisplay` component created and styled
- [ ] `ProductConfigurationForm` displays real-time prices
- [ ] Loading states work correctly
- [ ] Error states display user-friendly messages
- [ ] Price breakdown is clear and accurate
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] No performance regressions
- [ ] Code reviewed
- [ ] Existing product configuration still works

---

## Dependencies

**Required Before Starting:**

- Story 1 must be complete (API endpoint available)
- Access to existing hooks and components

**Blocks:**

- Story 3 (Cart Integration) - Needs price data from this story

---

## Notes

- Focus on **connecting** existing components, not rebuilding them
- The form already collects configuration - just add price display
- Use existing `useProductConfiguration` hook for state
- Keep price display visually prominent
- Ensure mobile responsiveness
- Consider accessibility (loading announcements, error messages)

---

## UX Considerations

**Loading State:**

- Show subtle spinner
- Don't block form interaction
- Keep previous price visible during recalculation

**Error State:**

- Display friendly message: "Unable to calculate price. Please try again."
- Disable "Add to Cart" button
- Provide way to retry

**Success State:**

- Highlight price change with subtle animation
- Make breakdown optional (collapsed by default)
- Show "per unit" price if quantity > 1

---

## References

- Epic: `/docs/epics/product-pricing-calculation-epic.md`
- Story 1: `/docs/stories/story-epic-003-1-pricing-api-endpoint.md`
- Existing Hook: `/src/hooks/usePriceCalculation.ts`
- Existing Form: `/src/components/product/ProductConfigurationForm.tsx`
