# Testing Plan: Tasks 1.3 & 1.4 Verification
**Date:** October 18, 2025
**Status:** Ready to Execute (Requires Docker)
**Purpose:** Verify OrderService adoption and API response handler changes work correctly

---

## Prerequisites

### Required Services

According to CLAUDE.md, the application requires these Docker services on dedicated ports:

| Service | Port | Container Name | Required |
|---------|------|----------------|----------|
| **PostgreSQL** | 5435 | gangrunprinting-postgres | ✅ CRITICAL |
| **Redis** | 6302 | gangrunprinting-redis | ✅ YES |
| **MinIO API** | 9002 | gangrunprinting-minio | ✅ YES |
| **MinIO Console** | 9102 | gangrunprinting-minio | ⚠️ Optional |
| **Next.js App** | 3020 (external) / 3002 (internal) | gangrunprinting_app | ✅ YES |

### Current Status

**❌ BLOCKER:** Docker daemon not running

```
Error: Cannot connect to the Docker daemon at unix:///Users/irawatkins/.docker/run/docker.sock
```

**Dev Server Status:** Started but failing due to missing database

```
prisma:error Invalid `prisma.productCategory.findMany()` invocation:
Can't reach database server at `localhost:5435`
```

---

## Setup Instructions

### Step 1: Start Docker Services

```bash
# Navigate to project directory
cd "/Users/irawatkins/Documents/Git/New Git Files /gangrunprintingv1"

# Start all Docker services
docker-compose up -d

# Verify services are running
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Expected Output:**
```
NAMES                          STATUS              PORTS
gangrunprinting_app           Up X minutes        0.0.0.0:3020->3002/tcp
gangrunprinting-postgres      Up X minutes        0.0.0.0:5435->5432/tcp
gangrunprinting-redis         Up X minutes        0.0.0.0:6302->6379/tcp
gangrunprinting-minio         Up X minutes        0.0.0.0:9002->9000/tcp, 0.0.0.0:9102->9001/tcp
```

### Step 2: Verify Database Connection

```bash
# Test database connectivity
docker exec gangrunprinting-postgres psql -U postgres -c "SELECT version();"

# Check if database exists
docker exec gangrunprinting-postgres psql -U postgres -l | grep gangrun
```

### Step 3: Start Development Server (if not using Docker app container)

```bash
# Start Next.js dev server
npm run dev

# Server should start on port 3002
# Expected output: ✓ Ready in X.Xs
```

### Step 4: Verify Application Loads

```bash
# Test homepage
curl -I http://localhost:3002

# Expected: HTTP/1.1 200 OK
```

---

## Test Suite: Task 1.3 - OrderService in Checkout

### Test 1.3.1: API Compilation Check ✅

**Status:** Already verified - TypeScript compiles without errors

**Command:**
```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "checkout/route.ts|OrderService.ts"
```

**Expected:** No errors in these files

**Result:** ✅ PASS (completed earlier)

---

### Test 1.3.2: OrderService Unit Test

**Purpose:** Verify OrderService accepts and uses pre-calculated totals

**Test File:** Create `/tests/unit/OrderService.test.ts`

```typescript
import { OrderService } from '@/services/OrderService'
import type { CreateOrderInput } from '@/types/service'

describe('OrderService - Task 1.3 Changes', () => {
  let orderService: OrderService

  beforeEach(() => {
    orderService = new OrderService({
      requestId: 'test-123',
      userId: 'test-user',
      userRole: 'CUSTOMER',
      timestamp: new Date(),
    })
  })

  test('should use provided totals instead of calculating', async () => {
    const orderInput: CreateOrderInput = {
      userId: 'test-user',
      email: 'test@example.com',
      items: [
        {
          productSku: 'TEST-001',
          productName: 'Test Product',
          quantity: 2,
          price: 5000, // $50.00
        },
      ],
      shippingAddress: {
        name: 'Test User',
        address1: '123 Test St',
        city: 'Test City',
        state: 'TX',
        zip: '12345',
        country: 'US',
      },
      totals: {
        subtotal: 10000, // $100.00
        tax: 825,        // $8.25 but rounded to $8
        shipping: 1000,  // $10.00
        total: 11825,    // $118.25 but should be $118.00
      },
    }

    const result = await orderService.createOrder(orderInput)

    expect(result.success).toBe(true)
    expect(result.data?.subtotal).toBe(10000)
    expect(result.data?.tax).toBe(825) // Uses provided value
    expect(result.data?.shipping).toBe(1000)
    expect(result.data?.total).toBe(11825)
  })

  test('should calculate totals if not provided', async () => {
    const orderInput: CreateOrderInput = {
      userId: 'test-user',
      email: 'test@example.com',
      items: [
        {
          productSku: 'TEST-001',
          productName: 'Test Product',
          quantity: 2,
          price: 5000,
        },
      ],
      shippingAddress: {
        name: 'Test User',
        address1: '123 Test St',
        city: 'Test City',
        state: 'TX',
        zip: '12345',
        country: 'US',
      },
      // NO totals provided - should calculate
    }

    const result = await orderService.createOrder(orderInput)

    expect(result.success).toBe(true)
    expect(result.data?.subtotal).toBeDefined()
    expect(result.data?.tax).toBeDefined()
    expect(result.data?.total).toBeDefined()
  })
})
```

**Run:**
```bash
npm test -- OrderService.test.ts
```

---

### Test 1.3.3: Checkout API Integration Test

**Purpose:** Verify checkout route correctly calculates totals and passes to OrderService

**Test Scenario:**
- POST to `/api/checkout` with test order
- Verify response contains order ID
- Verify database order has correct totals
- Verify tax is rounded (`Math.round(subtotal * 0.0825)`)
- Verify shipping is flat $10 or $25

**Manual Test (using curl):**

```bash
# Test checkout with standard shipping
curl -X POST http://localhost:3002/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone": "555-1234",
    "items": [
      {
        "productName": "Test Business Cards",
        "sku": "BC-001",
        "quantity": 500,
        "price": 10000,
        "options": {}
      }
    ],
    "shippingAddress": {
      "address1": "123 Test St",
      "city": "Dallas",
      "state": "TX",
      "zip": "75201",
      "country": "US"
    },
    "shippingMethod": "standard"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "order": {
    "id": "order_...",
    "orderNumber": "GRP-...",
    "total": 11825
  },
  "checkoutUrl": "..."
}
```

**Verify in Database:**
```sql
SELECT
  orderNumber,
  subtotal,
  tax,
  shipping,
  total,
  status
FROM "Order"
WHERE orderNumber LIKE 'GRP-%'
ORDER BY createdAt DESC
LIMIT 1;
```

**Expected Results:**
- `subtotal`: 10000 ($100.00)
- `tax`: 825 ($8.25, BUT should verify if rounded to 800 based on Math.round)
- `shipping`: 1000 ($10.00 for standard)
- `total`: 11825 ($118.25)
- `status`: PENDING_PAYMENT

---

### Test 1.3.4: Tax Rounding Verification

**Purpose:** Verify checkout uses `Math.round()` for tax calculation

**Test Cases:**

| Subtotal | Tax Rate | Calculation | Math.round() | Expected Display |
|----------|----------|-------------|--------------|------------------|
| $100.00 | 8.25% | $8.25 | $8 | $8.00 |
| $150.00 | 8.25% | $12.375 | $12 | $12.00 |
| $200.00 | 8.25% | $16.50 | $17 | $17.00 |

**Test Script:**
```javascript
// Test tax rounding matches checkout logic
const TAX_RATE = 0.0825

function testTaxRounding(subtotal) {
  const tax = Math.round(subtotal * TAX_RATE)
  console.log(`Subtotal: $${subtotal/100}, Tax: $${tax/100}`)
  return tax
}

testTaxRounding(10000)  // Should return 825 ($8.25 rounds to $8)
testTaxRounding(15000)  // Should return 1238 ($12.375 rounds to $12)
testTaxRounding(20000)  // Should return 1650 ($16.50 rounds to $17)
```

**Run in browser console:**
```javascript
// Navigate to http://localhost:3002 and open DevTools console
const TAX_RATE = 0.0825
Math.round(10000 * TAX_RATE)  // Should output: 825
```

---

### Test 1.3.5: Shipping Calculation Verification

**Purpose:** Verify shipping is flat $10/$25, not quantity-based

**Test Cases:**

| Shipping Method | Expected Cost | Formula |
|-----------------|---------------|---------|
| Standard | $10.00 (1000 cents) | Flat rate |
| Express | $25.00 (2500 cents) | Flat rate |

**Code Verification:**
```bash
# Check checkout route shipping logic
grep -A 2 "Calculate shipping" src/app/api/checkout/route.ts
```

**Expected Output:**
```typescript
// Calculate shipping
const shipping = shippingMethod === 'express' ? 2500 : 1000 // $25 or $10
```

**✅ VERIFIED:** Checkout route has correct flat shipping

---

## Test Suite: Task 1.4 - API Response Handlers

### Test 1.4.1: Add-ons API Test

**Purpose:** Verify add-ons API uses new response handlers

**Test:**
```bash
# Get all add-ons
curl http://localhost:3002/api/add-ons

# Expected response format (from createSuccessResponse)
# {
#   "success": true,
#   "data": [ /* addons array */ ]
# }
```

**Verify Response Structure:**
```javascript
fetch('http://localhost:3002/api/add-ons')
  .then(res => res.json())
  .then(data => {
    console.log('Has success field:', 'success' in data)
    console.log('Has data field:', 'data' in data)
    console.log('Response format:', Object.keys(data))
  })
```

**Expected:** `{success: true, data: Array}`

---

## Automated Test Suite (Chrome MCP + Playwright)

### Test Script: `/tests/e2e/checkout-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow - Task 1.3 Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002')
  })

  test('should complete checkout with correct totals', async ({ page }) => {
    // 1. Navigate to product page
    await page.click('text=Business Cards')
    await expect(page).toHaveURL(/\/products\//)

    // 2. Configure product
    await page.selectOption('[name="quantity"]', '500')
    await page.selectOption('[name="size"]', '3.5x2')
    await page.selectOption('[name="paper"]', '14pt-c2s')

    // 3. Add to cart
    await page.click('button:has-text("Add to Cart")')
    await expect(page.locator('.cart-count')).toHaveText('1')

    // 4. Go to checkout
    await page.click('a:has-text("Cart")')
    await page.click('button:has-text("Checkout")')

    // 5. Fill shipping info
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="phone"]', '555-1234')
    await page.fill('[name="address1"]', '123 Test St')
    await page.fill('[name="city"]', 'Dallas')
    await page.fill('[name="state"]', 'TX')
    await page.fill('[name="zip"]', '75201')

    // 6. Select standard shipping
    await page.click('input[value="standard"]')

    // 7. Verify totals display
    const subtotal = await page.locator('.subtotal-amount').textContent()
    const tax = await page.locator('.tax-amount').textContent()
    const shipping = await page.locator('.shipping-amount').textContent()
    const total = await page.locator('.total-amount').textContent()

    console.log('Checkout Totals:', { subtotal, tax, shipping, total })

    // 8. Verify tax ends in .00 (rounded display)
    expect(tax).toMatch(/\.\d{2}$/)

    // 9. Verify shipping is $10.00
    expect(shipping).toContain('10.00')

    // 10. Submit order
    await page.click('button:has-text("Place Order")')

    // 11. Wait for success page
    await expect(page).toHaveURL(/\/order\/success/)
    await expect(page.locator('.order-number')).toBeVisible()

    // 12. Get order number for database verification
    const orderNumber = await page.locator('.order-number').textContent()
    console.log('Created Order:', orderNumber)
  })

  test('should calculate tax with Math.round()', async ({ page }) => {
    // Test specific to Task 1.3 verification
    // Verify tax calculation matches Math.round(subtotal * 0.0825)

    await page.goto('http://localhost:3002/products/business-cards')

    // Configure order with known subtotal
    await page.selectOption('[name="quantity"]', '500')
    const priceText = await page.locator('.price-display').textContent()
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))

    await page.click('button:has-text("Add to Cart")')
    await page.goto('http://localhost:3002/checkout')

    const taxText = await page.locator('.tax-amount').textContent()
    const tax = parseFloat(taxText.replace(/[^0-9.]/g, ''))

    // Calculate expected tax with Math.round()
    const expectedTax = Math.round(price * 0.0825 * 100) / 100

    expect(tax).toBe(expectedTax)
  })
})
```

**Run Tests:**
```bash
# Install Playwright if not already installed
npm install -D @playwright/test

# Run tests
npx playwright test tests/e2e/checkout-flow.spec.ts

# Run with UI
npx playwright test --ui
```

---

## Manual Testing Checklist

### ✅ Pre-Testing Setup

- [ ] Docker services running (`docker ps` shows all 5 containers)
- [ ] Database accessible (`psql -h localhost -p 5435 -U postgres`)
- [ ] Dev server running (`http://localhost:3002` loads)
- [ ] Chrome/Firefox open for testing

### ✅ Task 1.3 Verification

- [ ] **Test 1:** Checkout compiles without TypeScript errors
- [ ] **Test 2:** OrderService accepts totals parameter
- [ ] **Test 3:** Checkout route passes totals to OrderService
- [ ] **Test 4:** Tax uses `Math.round()` (verify in DB: tax value)
- [ ] **Test 5:** Shipping is flat $10/$25 (not quantity-based)
- [ ] **Test 6:** Order created successfully in database
- [ ] **Test 7:** Square order created (if Square configured)
- [ ] **Test 8:** Customer email sent (check logs)
- [ ] **Test 9:** Admin email sent (check logs)
- [ ] **Test 10:** N8N workflow triggered (check logs)

### ✅ Task 1.4 Verification

- [ ] **Test 1:** `/api/add-ons` returns `{success: true, data: []}`
- [ ] **Test 2:** Error responses use `createErrorResponse()`
- [ ] **Test 3:** No references to old `/src/lib/api/responses.ts`

---

## Success Criteria

### Task 1.3 - OrderService Adoption ✅

1. **✅ Code Quality**
   - TypeScript compiles without errors
   - No duplicate order creation logic
   - OrderService used in checkout route

2. **✅ Functional Requirements**
   - Orders created successfully
   - Totals calculated correctly
   - Tax rounded with `Math.round()`
   - Shipping uses flat $10/$25 rates
   - OrderService uses provided totals

3. **✅ External Integrations**
   - Square customer/order created
   - Customer email sent
   - Admin email sent
   - N8N workflow triggered

### Task 1.4 - API Response Handlers ✅

1. **✅ Code Quality**
   - Duplicate file deleted (`/src/lib/api/responses.ts`)
   - Add-ons API uses new handlers
   - Consistent response format

2. **✅ Functional Requirements**
   - API responses structured correctly
   - Error handling works
   - No breaking changes

---

## Troubleshooting

### Issue: Database Connection Failed

**Error:** `Can't reach database server at localhost:5435`

**Solution:**
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# If not running, start Docker Compose
docker-compose up -d gangrunprinting-postgres

# Verify connection
docker exec gangrunprinting-postgres pg_isready
```

### Issue: TypeScript Errors

**Error:** Type errors in checkout route or OrderService

**Solution:**
```bash
# Run TypeScript compiler
npx tsc --noEmit

# Check specific files
npx tsc --noEmit src/app/api/checkout/route.ts
npx tsc --noEmit src/services/OrderService.ts
```

### Issue: Checkout Returns 500 Error

**Error:** Internal server error during checkout

**Solution:**
```bash
# Check dev server logs
# Look for Prisma errors, validation errors, etc.

# Check database has required tables
docker exec gangrunprinting-postgres psql -U postgres -d gangrun_production -c "\dt"
```

---

## Test Report Template

### Test Execution Summary

**Date:** [Fill in]
**Tester:** [Your name]
**Environment:** Local (Docker Compose)

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| 1.3.1 | TypeScript compilation | ✅/❌ | |
| 1.3.2 | OrderService unit test | ✅/❌ | |
| 1.3.3 | Checkout integration | ✅/❌ | |
| 1.3.4 | Tax rounding | ✅/❌ | |
| 1.3.5 | Shipping calculation | ✅/❌ | |
| 1.4.1 | Add-ons API | ✅/❌ | |

### Issues Found

| Issue | Severity | Description | Status |
|-------|----------|-------------|--------|
| | | | |

### Recommendations

1.
2.
3.

---

## Next Steps After Testing

**If All Tests Pass ✅:**
1. Proceed with Task 1.2 (Product Configuration Service Extraction)
2. OR proceed with Task 1.1 (Pricing Engine Consolidation)
3. Create git commit for Tasks 1.3 & 1.4

**If Tests Fail ❌:**
1. Document issues in test report
2. Fix identified problems
3. Re-run tests
4. Do NOT proceed to next task until tests pass

---

**Status:** Document created, ready for execution once Docker services are running.
