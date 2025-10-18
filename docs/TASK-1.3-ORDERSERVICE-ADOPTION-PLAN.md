# Task 1.3: OrderService Adoption Implementation Plan
**Date:** October 18, 2025
**Status:** In Progress
**Risk Level:** LOW
**Estimated Time:** 4-6 hours

---

## 🚨 CRITICAL DISCOVERY - CALCULATION MISMATCHES

**Status:** Analysis revealed OrderService `calculateOrderTotals()` method produces DIFFERENT results than checkout route.

**THREE CRITICAL DIFFERENCES:**
1. Tax rounding (checkout rounds, OrderService doesn't)
2. Shipping calculation (checkout: $10/$25 flat, OrderService: $9.99 + quantity-based)
3. Add-on handling (checkout excludes from subtotal, OrderService includes)

**Impact:** Using OrderService.calculateOrderTotals() would break checkout with incorrect totals.

**Solution:** Pass pre-calculated totals to OrderService instead of letting it calculate them.

**See:** [Challenge 2](#challenge-2-total-calculation-difference---critical-mismatches-found) for full details.

---

## ANALYSIS COMPLETE

### Current State

**Checkout Route:** `/src/app/api/checkout/route.ts` (261 lines)

**Responsibilities Mixed:**
1. ✅ Input validation (manual)
2. ✅ Total calculation (manual - subtotal, tax, shipping)
3. ✅ Square customer creation (external integration)
4. ✅ Square order creation (external integration)
5. ✅ Database order creation (inline Prisma)
6. ✅ N8N workflow trigger (external integration)
7. ✅ Customer email (external integration)
8. ✅ Admin email (external integration)

**OrderService Available:** `/src/services/OrderService.ts` (460+ lines)

**Methods:**
- `createOrder(input: CreateOrderInput)` - Core order creation with transaction
- `getOrderById(orderId)` - Retrieve order
- `updateOrderStatus(orderId, status)` - Status management
- `searchOrders(filters)` - Search and pagination
- `cancelOrder(orderId)` - Order cancellation

**What OrderService Handles:**
- ✅ Input validation
- ✅ Total calculation
- ✅ Database transaction management
- ✅ Order creation
- ✅ Order item creation
- ✅ Add-on creation
- ✅ Status history creation
- ✅ Logging and performance tracking

**What OrderService Does NOT Handle:**
- ❌ Square integration (customer, order, checkout)
- ❌ Email sending
- ❌ N8N workflow triggers

---

## DECISION: Hybrid Approach

**Keep in checkout route:**
- Square integration logic
- Email sending logic
- N8N workflow triggers

**Move to OrderService:**
- Order data creation (currently inline Prisma)
- Total calculation logic
- Transaction management

**Rationale:**
- OrderService is for core business logic (order data)
- Checkout route orchestrates external integrations
- Clear separation: business logic vs integration logic

---

## IMPLEMENTATION STRATEGY

### Before (261 lines)

```typescript
export async function POST(request: NextRequest) {
  // 1. Validate input
  // 2. Calculate totals (INLINE)
  // 3. Create Square customer
  // 4. Create Square order
  // 5. Create database order (INLINE PRISMA)
  // 6. Send N8N webhook
  // 7. Send customer email
  // 8. Send admin email
  return NextResponse.json(order)
}
```

### After (~80 lines)

```typescript
export async function POST(request: NextRequest) {
  // 1. Parse input
  // 2. Create Square customer
  // 3. Create Square order
  // 4. Call OrderService.createOrder() ← NEW
  // 5. Send N8N webhook
  // 6. Send customer email
  // 7. Send admin email
  return createSuccessResponse(order)
}
```

**Code Reduction:** 261 → ~80 lines (-69%)

---

## REVISED IMPLEMENTATION STRATEGY (Post-Analysis)

**Key Changes from Original Plan:**
1. ✅ Keep checkout route's total calculation logic (DO NOT use OrderService.calculateOrderTotals)
2. ✅ Pass pre-calculated totals to OrderService via CreateOrderInput
3. ✅ Modify OrderService to accept optional totals parameter

**Why This Approach:**
- Checkout route's calculation is production-proven and correct
- Changing calculation logic is HIGH RISK (could cause billing errors)
- OrderService can still calculate totals for other use cases (admin orders)
- Preserves existing business logic while adopting service pattern

---

## STEP-BY-STEP IMPLEMENTATION

### Step 0: Modify OrderService to Accept Pre-calculated Totals

**File:** `/src/services/OrderService.ts`

**Changes Required:**

1. Update `CreateOrderInput` interface:
```typescript
export interface CreateOrderInput {
  // ... existing fields
  totals?: {  // NEW - optional pre-calculated totals
    subtotal: number
    tax: number
    shipping: number
    total: number
  }
}
```

2. Modify `createOrder` method:
```typescript
// In createOrder method, replace:
const totals = await this.calculateOrderTotals(input, tx)

// With:
const totals = input.totals
  ? input.totals  // Use provided totals
  : await this.calculateOrderTotals(input, tx)  // Calculate if not provided
```

**Rationale:** This allows checkout route to pass its proven calculation while keeping OrderService flexible for other callers.

### Step 1: Extract Input Mapping Function

Create helper to map checkout data → `CreateOrderInput`:

```typescript
function mapCheckoutToOrderInput(checkoutData: any): CreateOrderInput {
  return {
    userId: checkoutData.user?.id || '',
    email: checkoutData.email,
    items: checkoutData.items.map((item: any) => ({
      productSku: item.sku || 'CUSTOM',
      productName: item.productName || item.name,
      quantity: item.quantity,
      price: item.price,
      options: item.options || {},
      addOns: item.addOns || [],
      paperStockId: item.paperStockId,
    })),
    shippingAddress: {
      name: checkoutData.name,
      address1: checkoutData.shippingAddress.address1,
      address2: checkoutData.shippingAddress.address2,
      city: checkoutData.shippingAddress.city,
      state: checkoutData.shippingAddress.state,
      zip: checkoutData.shippingAddress.zip,
    },
    billingAddress: checkoutData.billingAddress || checkoutData.shippingAddress,
    shippingMethod: checkoutData.shippingMethod,
    totals: checkoutData.totals,  // NEW - pre-calculated totals
    metadata: {
      squareCustomerId: checkoutData.squareCustomerId,
      squareOrderId: checkoutData.squareOrderId,
      landingPageSource: checkoutData.landingPageSource,
    },
  }
}
```

### Step 2: Replace Inline Order Creation

**Current (lines 111-154):**
```typescript
const order = await prisma.order.create({
  data: {
    id: orderId,
    orderNumber,
    // ... 40+ lines of order data
    OrderItem: {
      create: orderItems.map(/* ... */),
    },
    StatusHistory: {
      create: { /* ... */ },
    },
  },
  include: {
    OrderItem: true,
  },
})
```

**New (5 lines):**
```typescript
const orderService = new OrderService({
  requestId: generateRequestId(),
  userId: user?.id,
  timestamp: new Date(),
})

const orderResult = await orderService.createOrder(orderInput)

if (!orderResult.success) {
  return createErrorResponse(orderResult.error, 400)
}

const order = orderResult.data
```

### Step 3: Keep External Integrations

**Square integration stays:**
```typescript
// Create Square customer (lines 62-69)
try {
  const customerResult = await createOrUpdateSquareCustomer(email, name, phone)
  squareCustomerId = customerResult.id
} catch (error) {
  // Continue without customer ID
}
```

**N8N workflow stays:**
```typescript
// Trigger N8N workflow (lines 156-161)
try {
  await N8NWorkflows.onOrderCreated(order.id)
} catch (n8nError) {
  // Don't fail the order if N8N fails
}
```

**Emails stay:**
```typescript
// Send emails (lines 163-212)
try {
  await sendOrderConfirmationWithFiles(/* ... */)
} catch (emailError) {
  // Don't fail the order if email fails
}
```

### Step 4: Use Consistent Response Format

**Current:**
```typescript
return NextResponse.json({ order, checkoutUrl })
```

**New:**
```typescript
return createSuccessResponse({ order, checkoutUrl }, 201)
```

---

## CHALLENGES & SOLUTIONS

### Challenge 1: OrderService Requires ServiceContext

**Issue:** OrderService constructor needs context

**Solution:**
```typescript
import { generateRequestId } from '@/lib/api-response'

const orderService = new OrderService({
  requestId: generateRequestId(),
  userId: user?.id,
  userRole: user?.role,
  timestamp: new Date(),
})
```

### Challenge 2: Total Calculation Difference - CRITICAL MISMATCHES FOUND

**Issue:** OrderService calculates totals differently than checkout route

**THREE CRITICAL DIFFERENCES IDENTIFIED:**

**1. Tax Rounding:**
- Checkout: `Math.round(subtotal * 0.0825)` - rounds to nearest cent
- OrderService: `subtotal * 0.0825` - keeps decimal precision
- **Impact:** Tax amounts differ by pennies

**2. Shipping Calculation - COMPLETELY DIFFERENT:**
- Checkout: `shippingMethod === 'express' ? 2500 : 1000` ($25 or $10)
- OrderService: `baseShipping (9.99) + itemCount-based fees`
- **Impact:** Shipping costs completely wrong

**3. Add-on Handling:**
- Checkout: Add-ons NOT included in subtotal calculation
- OrderService: Add-ons ARE included in subtotal
- **Impact:** Totals mismatch if add-ons present

**Solution:** DO NOT use OrderService.calculateOrderTotals() - pass pre-calculated totals instead

**New Approach:**
```typescript
// Checkout route calculates totals (keep existing logic)
const tax = Math.round(subtotal * TAX_RATE)
const shipping = shippingMethod === 'express' ? 2500 : 1000
const total = subtotal + tax + shipping

// Pass totals to OrderService via CreateOrderInput
const orderInput: CreateOrderInput = {
  // ... other fields
  totals: { subtotal, tax, shipping, total }  // Pre-calculated
}
```

**OrderService Changes Required:**
- Modify `CreateOrderInput` interface to accept optional `totals` object
- If totals provided, use them instead of calling calculateOrderTotals()
- Keep calculateOrderTotals() for other use cases (admin orders, etc.)

### Challenge 3: Square Order ID Storage

**Issue:** Square order ID created before database order

**Current flow:**
1. Create Square customer
2. Create Square order
3. Store Square order ID in database order

**Solution:** Pass Square IDs via metadata
```typescript
const orderInput: CreateOrderInput = {
  // ... other fields
  metadata: {
    squareCustomerId,
    squareOrderId,
    landingPageSource,
  },
}
```

**Note:** OrderService needs to support metadata field

---

## TESTING REQUIREMENTS

### Unit Tests

✅ Test `mapCheckoutToOrderInput` helper:
- Valid input maps correctly
- Missing fields handled gracefully
- Add-ons mapped correctly

### Integration Tests

✅ Test complete checkout flow:
- Place order with OrderService
- Verify order created in database
- Verify totals match
- Verify Square integration still works
- Verify emails sent
- Verify N8N workflow triggered

### Regression Tests

✅ Test existing checkout functionality:
- Anonymous checkout (no user)
- Authenticated checkout (with user)
- Express shipping vs standard
- With/without billing address
- With/without add-ons

---

## ROLLBACK PLAN

If issues discovered:

**Option 1: Git Revert**
```bash
git revert <commit-hash>
git push
```

**Option 2: Feature Flag**
```typescript
const USE_ORDER_SERVICE = process.env.FEATURE_USE_ORDER_SERVICE === 'true'

if (USE_ORDER_SERVICE) {
  // New implementation
} else {
  // Old implementation (fallback)
}
```

**Option 3: Keep Old Route**
- Deploy new route to `/api/checkout-v2`
- Test thoroughly
- Switch traffic when confident
- Remove old route

---

## SUCCESS CRITERIA

Task 1.3 is successful when:

✅ Checkout route reduced from 261 → ~80 lines
✅ OrderService adopted for core order creation
✅ All external integrations still work (Square, emails, N8N)
✅ Totals calculated correctly
✅ All tests passing
✅ No errors in production logs

---

## IMPLEMENTATION TIMELINE

**Hour 1-2:** Extract mapping function, update imports
**Hour 3-4:** Replace inline order creation with OrderService
**Hour 5:** Test locally, verify totals match
**Hour 6:** Deploy to staging (if available), verify in production

**Total:** 4-6 hours

---

## NEXT STEPS

1. ✅ Analysis complete
2. ⏳ Implement changes
3. ⏳ Test locally
4. ⏳ Create completion report
5. ⏳ Deploy (user approval)

**Status:** Ready to implement
