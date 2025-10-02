# Story: Connect Pricing to Cart & End-to-End Testing

**Story ID:** EPIC-003-STORY-3
**Epic:** Product Pricing Calculation API Integration
**Status:** Ready for Development
**Created:** 2025-09-30
**Estimate:** 2-3 hours
**Depends On:** EPIC-003-STORY-1, EPIC-003-STORY-2

---

## User Story

**As a** customer
**I want** the calculated price to persist through the cart and checkout
**So that** I'm charged the correct amount I saw on the product page

---

## Context

**What Already Exists:**
- ✅ `CartService.ts` - Cart management logic
- ✅ `AddToCartSection.tsx` - Add to cart button component
- ✅ Cart storage (localStorage or database)
- ✅ Checkout flow

**What's Missing:**
- ❌ Passing calculated price to cart
- ❌ Storing price breakdown with cart item
- ❌ E2E tests for complete pricing flow

**What Stories 1 & 2 Provide:**
- ✅ API endpoint that calculates price (Story 1)
- ✅ Real-time price display in product form (Story 2)

---

## Acceptance Criteria

### Functional Requirements

1. **Cart Integration**
   - [ ] `AddToCartSection` receives calculated price from hook
   - [ ] Cart item includes calculated price
   - [ ] Cart item includes full configuration details
   - [ ] Cart item includes price breakdown
   - [ ] "Add to Cart" disabled when price unavailable

2. **Price Persistence**
   - [ ] Price persists in cart across page refreshes
   - [ ] Price displays correctly in cart view
   - [ ] Price carries through to checkout
   - [ ] Price matches what customer saw on product page

3. **Cart Service Updates**
   - [ ] Update `CartService.addItem()` to accept calculated price
   - [ ] Store price breakdown with cart item
   - [ ] Validate price exists before adding to cart

4. **Existing Functionality**
   - [ ] Existing cart operations still work
   - [ ] Cart quantity updates work
   - [ ] Cart item removal works
   - [ ] Checkout process unaffected (except now has correct price)

### Testing Requirements

5. **E2E Test Coverage**
   - [ ] Test: Configure product → See price → Add to cart → Price in cart
   - [ ] Test: Change quantity → Price updates → Add to cart → Correct price
   - [ ] Test: Select add-ons → Price increases → Add to cart → Correct total
   - [ ] Test: Custom quantity → Price calculates → Add to cart → Persists
   - [ ] Test: Multiple products → Different prices → All in cart correctly
   - [ ] Test: Price breakdown → Matches in cart

6. **Edge Cases**
   - [ ] Test: Add to cart with loading price → Button disabled
   - [ ] Test: Add to cart with error → Button disabled
   - [ ] Test: Rapid config changes → Final price correct
   - [ ] Test: All module combinations (quantity only, full config, etc.)

---

## Technical Implementation

### AddToCartSection Update

**Update `/src/components/product/AddToCartSection.tsx`:**

```typescript
import { usePriceCalculation } from '@/hooks/usePriceCalculation'
import { useCartService } from '@/hooks/useCartService'

interface AddToCartSectionProps {
  product: Product
  configuration: ProductConfiguration
}

export function AddToCartSection({
  product,
  configuration
}: AddToCartSectionProps) {
  const { price, breakdown, loading, error } = usePriceCalculation({
    configuration,
    enabled: true
  })

  const { addItem } = useCartService()

  const handleAddToCart = async () => {
    if (!price || !configuration.quantitySelection) {
      return
    }

    await addItem({
      productId: product.id,
      productName: product.name,
      configuration,
      calculatedPrice: price,
      priceBreakdown: breakdown,
      quantity: 1 // Cart quantity (different from product quantity)
    })
  }

  const isDisabled = loading || error !== null || price === null

  return (
    <div className="add-to-cart-section">
      {price !== null && (
        <div className="price-summary">
          <span className="label">Total:</span>
          <span className="price">${price.toFixed(2)}</span>
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className="btn-add-to-cart"
      >
        {loading ? 'Calculating...' : 'Add to Cart'}
      </button>

      {error && (
        <p className="error-message">
          Unable to calculate price. Please try again.
        </p>
      )}
    </div>
  )
}
```

### CartService Update

**Update `/src/services/CartService.ts`:**

```typescript
interface CartItem {
  id: string
  productId: string
  productName: string
  configuration: ProductConfiguration
  calculatedPrice: number // NEW: Store calculated price
  priceBreakdown?: PriceBreakdown // NEW: Store breakdown
  quantity: number // Cart quantity (how many of this config)
  addedAt: Date
}

export class CartService {
  async addItem(item: Omit<CartItem, 'id' | 'addedAt'>): Promise<void> {
    // Validate calculated price exists
    if (!item.calculatedPrice || item.calculatedPrice <= 0) {
      throw new Error('Invalid calculated price')
    }

    const cartItem: CartItem = {
      id: generateId(),
      ...item,
      addedAt: new Date()
    }

    // Existing cart storage logic
    await this.saveCartItem(cartItem)
  }

  // Existing methods remain unchanged
  async getItems(): Promise<CartItem[]> { /* ... */ }
  async removeItem(id: string): Promise<void> { /* ... */ }
  async updateQuantity(id: string, quantity: number): Promise<void> { /* ... */ }
  async clearCart(): Promise<void> { /* ... */ }
}
```

### E2E Tests

**Create `/tests/e2e/pricing-calculation-flow.test.ts`:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('Product Pricing Calculation Flow', () => {
  test('should calculate price and add to cart', async ({ page }) => {
    // Navigate to product page
    await page.goto('/products/business-cards-test')

    // Select quantity
    await page.selectOption('[data-testid="quantity-selector"]', '500')

    // Wait for price calculation
    await page.waitForSelector('[data-testid="calculated-price"]')

    // Verify price is displayed
    const price = await page.textContent('[data-testid="calculated-price"]')
    expect(price).toContain('$')

    // Extract price value
    const priceValue = parseFloat(price!.replace('$', ''))

    // Add to cart
    await page.click('[data-testid="add-to-cart"]')

    // Navigate to cart
    await page.goto('/cart')

    // Verify price in cart matches
    const cartPrice = await page.textContent('[data-testid="cart-item-price"]')
    const cartPriceValue = parseFloat(cartPrice!.replace('$', ''))

    expect(cartPriceValue).toBe(priceValue)
  })

  test('should update price when configuration changes', async ({ page }) => {
    await page.goto('/products/business-cards-test')

    // Select initial quantity
    await page.selectOption('[data-testid="quantity-selector"]', '250')
    await page.waitForSelector('[data-testid="calculated-price"]')

    const initialPrice = await page.textContent('[data-testid="calculated-price"]')

    // Change quantity
    await page.selectOption('[data-testid="quantity-selector"]', '1000')
    await page.waitForTimeout(400) // Wait for debounce

    const updatedPrice = await page.textContent('[data-testid="calculated-price"]')

    // Price should be different (higher for more quantity)
    expect(updatedPrice).not.toBe(initialPrice)
  })

  test('should handle add-ons in price calculation', async ({ page }) => {
    await page.goto('/products/business-cards-test')

    // Select base configuration
    await page.selectOption('[data-testid="quantity-selector"]', '500')
    await page.waitForSelector('[data-testid="calculated-price"]')

    const basePrice = await page.textContent('[data-testid="calculated-price"]')
    const basePriceValue = parseFloat(basePrice!.replace('$', ''))

    // Select add-on
    await page.check('[data-testid="addon-rounded-corners"]')
    await page.waitForTimeout(400)

    const priceWithAddon = await page.textContent('[data-testid="calculated-price"]')
    const priceWithAddonValue = parseFloat(priceWithAddon!.replace('$', ''))

    // Price should increase
    expect(priceWithAddonValue).toBeGreaterThan(basePriceValue)
  })

  test('should disable add to cart during price calculation', async ({ page }) => {
    await page.goto('/products/business-cards-test')

    // Button should be disabled initially
    const addToCartButton = page.locator('[data-testid="add-to-cart"]')
    await expect(addToCartButton).toBeDisabled()

    // Select quantity
    await page.selectOption('[data-testid="quantity-selector"]', '500')

    // Wait for price
    await page.waitForSelector('[data-testid="calculated-price"]')

    // Button should now be enabled
    await expect(addToCartButton).toBeEnabled()
  })

  test('should persist price through checkout', async ({ page }) => {
    // Add item to cart
    await page.goto('/products/business-cards-test')
    await page.selectOption('[data-testid="quantity-selector"]', '500')
    await page.waitForSelector('[data-testid="calculated-price"]')

    const productPrice = await page.textContent('[data-testid="calculated-price"]')
    const productPriceValue = parseFloat(productPrice!.replace('$', ''))

    await page.click('[data-testid="add-to-cart"]')

    // Go to checkout
    await page.goto('/checkout')

    // Verify price in checkout
    const checkoutPrice = await page.textContent('[data-testid="order-total"]')
    const checkoutPriceValue = parseFloat(checkoutPrice!.replace('$', ''))

    expect(checkoutPriceValue).toBe(productPriceValue)
  })
})
```

---

## Files to Create/Modify

### Files to UPDATE:
- `/src/components/product/AddToCartSection.tsx` - Accept calculated price
- `/src/services/CartService.ts` - Store calculated price with cart item

### Files to CREATE:
- `/tests/e2e/pricing-calculation-flow.test.ts` - E2E tests

### Files to REFERENCE (no changes):
- `/src/hooks/usePriceCalculation.ts` - Get price from this hook
- Cart display components - Should automatically show new price field

---

## Testing Requirements

### Unit Tests
- [ ] Test `CartService.addItem()` with calculated price
- [ ] Test `CartService.addItem()` validation (rejects invalid price)
- [ ] Test cart item includes all required fields

### Integration Tests
- [ ] Test adding item to cart with calculated price
- [ ] Test cart retrieval includes calculated price
- [ ] Test cart total calculation uses calculated prices

### E2E Tests (Primary Focus)
- [ ] Complete flow: Product → Cart → Checkout
- [ ] Price updates on configuration changes
- [ ] Add-ons affect price correctly
- [ ] Multiple products in cart
- [ ] Price persistence across refresh
- [ ] All module combinations work

### Regression Tests
- [ ] Existing cart functionality works
- [ ] Quantity updates in cart work
- [ ] Item removal works
- [ ] Cart totals calculate correctly
- [ ] Checkout process works

---

## Definition of Done

- [ ] `AddToCartSection` passes calculated price to cart
- [ ] `CartService` stores calculated price
- [ ] Cart displays calculated price correctly
- [ ] Price persists through checkout
- [ ] All E2E tests written and passing
- [ ] All regression tests passing
- [ ] No breaking changes to cart functionality
- [ ] Code reviewed
- [ ] Documentation updated

---

## Dependencies

**Required Before Starting:**
- Story 1 complete (API endpoint)
- Story 2 complete (Frontend price display)

**Blocks:**
- Nothing (final story in epic)

---

## Notes

- Focus on **connecting** cart to calculated price, not rebuilding cart
- Existing cart logic should remain unchanged
- Main work is passing price data through the flow
- E2E tests are critical - this validates the entire epic
- Test with production data (real products)
- Ensure price breakdown is available in cart (for customer service)

---

## Edge Cases to Test

1. **Rapid Configuration Changes:**
   - User quickly changes multiple options
   - Only final price should be in cart

2. **Partial Configuration:**
   - Required modules only (quantity)
   - All optional modules
   - Mix of required + some optional

3. **Custom Values:**
   - Custom quantity (>5000)
   - Custom size
   - Both custom quantity and size

4. **Add-ons:**
   - No add-ons
   - Single add-on
   - Multiple add-ons
   - Add-ons with configuration

5. **Turnaround:**
   - Standard turnaround
   - Rush turnaround
   - No turnaround selected

6. **Multiple Cart Items:**
   - Same product, different configs
   - Different products
   - Mix of simple and complex configs

---

## Success Metrics

- [ ] E2E test suite runs successfully
- [ ] Price accuracy: 100% match between product page and checkout
- [ ] Cart integration: No errors in console
- [ ] Performance: Add to cart < 100ms
- [ ] Zero regressions in existing cart functionality

---

## References

- Epic: `/docs/epics/product-pricing-calculation-epic.md`
- Story 1: `/docs/stories/story-epic-003-1-pricing-api-endpoint.md`
- Story 2: `/docs/stories/story-epic-003-2-frontend-integration.md`
- Cart Service: `/src/services/CartService.ts`
- Add to Cart: `/src/components/product/AddToCartSection.tsx`
