# Payment Testing Guide
## Complete Test Suite for Square Card & Cash App Pay

**Created:** 2025-10-18
**Status:** Test suite ready for execution
**Test Coverage:** Square Credit Card + Cash App Pay payments

---

## 📋 Test Suite Overview

### What We're Testing

**Payment Methods:**
1. ✅ Square Credit/Debit Card
2. ✅ Cash App Pay

**Test Iterations:**
- 3 iterations per payment method
- 2 testing frameworks (Playwright + Chrome DevTools MCP)
- **Total:** 12 automated test runs

**Test Verification:**
- ✅ Payment forms load correctly
- ✅ Payment processing succeeds
- ✅ Orders created in database
- ✅ Products appear in customer orders
- ✅ Admin receives order notifications
- ✅ Order confirmation displays correctly

---

## 📂 Test Files Created

### 1. Test Utilities
**File:** `tests/helpers/payment-test-helpers.ts`
- Shared helper functions for all tests
- Database query utilities
- Screenshot capture
- Test result tracking
- Square test card configurations

### 2. Playwright Tests
**Files:**
- `tests/payment-square-card.spec.ts` - Square Card (3 iterations)
- `tests/payment-cashapp.spec.ts` - Cash App Pay (3 iterations)

**Technology:** Playwright Test Framework
**Browser:** Chromium
**Target:** Production website (https://gangrunprinting.com)

### 3. Chrome DevTools MCP Tests
**Files:**
- `test-square-card-chrome-devtools.js` - Square Card (3 iterations)
- `test-cashapp-chrome-devtools.js` - Cash App Pay (3 iterations)

**Technology:** Claude MCP chrome-devtools integration
**Browser:** Chrome (via MCP)
**Target:** Production website

### 4. Reporting & Cleanup
**Files:**
- `generate-payment-test-report.js` - Consolidate results & generate report
- `cleanup-test-orders.ts` - Remove test orders from database

---

## 🚀 How to Run Tests

### Option 1: Playwright Tests (Production)

**Update configuration to test against production:**

Edit `playwright.config.ts` and change:
```typescript
baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'https://gangrunprinting.com',
```

And update `webServer` to not start local dev server:
```typescript
webServer: undefined, // Don't start local server
```

**Run tests:**
```bash
# Square Credit Card test (3 iterations)
npx playwright test tests/payment-square-card.spec.ts --project=chromium --headed

# Cash App Pay test (3 iterations)
npx playwright test tests/payment-cashapp.spec.ts --project=chromium --headed

# Run both tests
npx playwright test tests/payment-*.spec.ts --project=chromium
```

**View results:**
```bash
# Open Playwright HTML report
npx playwright show-report
```

---

### Option 2: Chrome DevTools MCP Tests

**These tests are designed to be executed by Claude using MCP chrome-devtools tools.**

The test files contain detailed instructions for Claude to:
1. Navigate to product pages
2. Fill forms using `mcp__chrome-devtools__fill()`
3. Click buttons using `mcp__chrome-devtools__click()`
4. Take snapshots using `mcp__chrome-devtools__take_snapshot()`
5. Verify payments in database

**To run:**
Ask Claude to execute the Chrome DevTools tests:
- "Claude, run test-square-card-chrome-devtools.js using your MCP tools"
- "Claude, run test-cashapp-chrome-devtools.js using your MCP tools"

---

## 📊 Generate Test Report

After running tests, generate a comprehensive report:

```bash
# Generate markdown report with database query
node generate-payment-test-report.js
```

**Output:**
- `test-results/payment-test-report.md` - Comprehensive markdown report
- `test-results/payment-test-results.json` - JSON data export

**Report includes:**
- Total orders created
- Payment method breakdown
- Order status distribution
- Individual order details
- Success/failure statistics
- Screenshots references

---

## 🗑️ Cleanup Test Data

After testing, remove test orders from database:

```bash
# View test orders (safe preview)
npx tsx cleanup-test-orders.ts

# Delete test orders (requires --force)
npx tsx cleanup-test-orders.ts --force
```

**Test customer emails:**
- `payment-test@gangrunprinting.com`
- `chrome-test@gangrunprinting.com`
- `cashapp-test@gangrunprinting.com`

All orders with these emails will be removed.

---

## 🧪 Test Configuration

### Test Customer Information
```typescript
{
  name: 'Payment Test Customer',
  email: 'payment-test@gangrunprinting.com',
  phone: '(555) 123-4567'
}
```

### Test Shipping Address
```typescript
{
  street: '123 Test Street',
  city: 'Chicago',
  state: 'IL',
  zipCode: '60601',
  country: 'US'
}
```

### Square Test Cards (Sandbox)
```typescript
{
  visa: {
    number: '4111 1111 1111 1111',
    expiry: '12/25',
    cvv: '123'
  },
  mastercard: {
    number: '5555 5555 5555 4444',
    expiry: '12/25',
    cvv: '123'
  }
}
```

### Test Product
- **URL:** `/products/4x6-flyers-9pt-card-stock`
- **Product:** 4x6 Flyers (9pt Card Stock)
- **Quantity:** 500 pieces
- **Estimated Total:** ~$50-100 (with shipping)

---

## ✅ Success Criteria

### Payment Processing
- [ ] Payment forms load without errors
- [ ] Square SDK initializes correctly
- [ ] Test cards are accepted
- [ ] Payment API returns success
- [ ] Square Payment IDs are generated

### Order Creation
- [ ] Orders exist in database
- [ ] Order numbers are generated (format: GRP-XXXXX-XXXX)
- [ ] Order items match cart contents
- [ ] Totals are calculated correctly
- [ ] Payment method is recorded
- [ ] Square Payment ID is stored

### Customer Experience
- [ ] Order confirmation page displays
- [ ] Order number is visible
- [ ] Payment status shows "Paid" or "Confirmed"
- [ ] No console errors
- [ ] No broken links

### Admin Experience
- [ ] Admin receives email notification
- [ ] Order appears in `/admin/orders` dashboard
- [ ] Order details are accurate
- [ ] Payment information is complete

---

## 🔍 Verification Steps

### 1. Check Database for Orders

```bash
# SSH into production server
ssh root@72.60.28.175

# Connect to database
docker exec -it gangrunprinting-postgres psql -U postgres -d gangrun_production

# Query test orders
SELECT
  "orderNumber",
  email,
  status,
  "paymentMethod",
  "squarePaymentId",
  total,
  "createdAt"
FROM "Order"
WHERE email IN (
  'payment-test@gangrunprinting.com',
  'chrome-test@gangrunprinting.com',
  'cashapp-test@gangrunprinting.com'
)
ORDER BY "createdAt" DESC;
```

### 2. Check Admin Dashboard

Navigate to: `https://gangrunprinting.com/admin/orders`

**Verify:**
- Test orders appear in list
- Order details are complete
- Payment status is correct
- Customer information is accurate

### 3. Check Email Notifications

**Admin email:** `iradwatkins@gmail.com`

Look for emails with subject:
- "New Order: GRP-XXXXX-XXXX"
- Order confirmation emails

---

## 📈 Expected Test Results

### Square Credit Card Tests

**Expected:** 6/6 pass (3 Playwright + 3 Chrome DevTools)

**Each test should:**
1. Load product page successfully
2. Add product to cart
3. Navigate to checkout
4. Fill shipping information
5. Select "Credit Card" payment method
6. Fill Square card form with test card
7. Submit payment successfully
8. Display order confirmation
9. Create order in database
10. Generate Square Payment ID

### Cash App Pay Tests

**Expected:** 6/6 pass OR 6/6 skip (if not available)

**Note:** Cash App Pay may not be available in Square sandbox mode. This is expected and tests will handle it gracefully.

**Each test should:**
1. Load product page successfully
2. Add product to cart
3. Navigate to checkout
4. Fill shipping information
5. Select "Cash App Pay" payment method
6. Check if Cash App button appears
7. If available: Complete payment flow
8. If not available: Skip gracefully with message

---

## 🐛 Troubleshooting

### Issue: Playwright can't connect to database

**Problem:** Tests run locally but database is on production server

**Solution:** Update `playwright.config.ts` to test against production:
```typescript
baseURL: 'https://gangrunprinting.com',
webServer: undefined, // Don't start local server
```

### Issue: Square form not loading

**Possible causes:**
- Square SDK script blocked
- CSP (Content Security Policy) restrictions
- Network timeout

**Check:**
- Browser console for errors
- Network tab for failed requests
- Screenshots in `test-results/screenshots/`

### Issue: Payment fails with "Card Declined"

**Cause:** Not using correct test card numbers

**Solution:** Use Square sandbox test cards:
- Visa: `4111 1111 1111 1111`
- Any future expiry date
- Any 3-digit CVV

### Issue: Orders not appearing in database

**Check:**
1. Database connection is correct
2. Order API endpoint is working
3. Check server logs for errors
4. Verify payment API response

---

## 📞 Support

### Test Files Location
```
tests/
├── helpers/
│   └── payment-test-helpers.ts
├── payment-square-card.spec.ts
└── payment-cashapp.spec.ts

(root)/
├── test-square-card-chrome-devtools.js
├── test-cashapp-chrome-devtools.js
├── generate-payment-test-report.js
└── cleanup-test-orders.ts
```

### Environment Variables Required
```bash
# Square API (already configured in .env)
SQUARE_ACCESS_TOKEN=EAAAl2BAJUi5Neov0Jo8...
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=LZN634J2MSXRY
SQUARE_APPLICATION_ID=sandbox-sq0idb-...

# Database (production)
DATABASE_URL=postgresql://...
```

### Useful Commands

```bash
# View test results
ls -la test-results/

# View screenshots
open test-results/screenshots/

# View Playwright trace
npx playwright show-trace test-results/trace.zip

# Check database for test orders
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const orders = await prisma.order.findMany({
  where: { email: { contains: 'test@gangrunprinting.com' } }
});
console.log(orders);
"
```

---

## 🎯 Next Steps

1. **Update Playwright config** to point to production
2. **Run Playwright tests** for Square Card (3 iterations)
3. **Run Playwright tests** for Cash App Pay (3 iterations)
4. **OR: Ask Claude to run Chrome DevTools MCP tests**
5. **Generate test report** using `generate-payment-test-report.js`
6. **Verify orders** in admin dashboard
7. **Check email notifications** received
8. **Cleanup test data** using `cleanup-test-orders.ts --force`

---

## 📝 Notes

- All tests use **Square sandbox environment** - no real money is charged
- Test cards will always succeed in sandbox
- Cash App Pay may not be available in sandbox (this is normal)
- Test data is safe to delete after verification
- Screenshots are saved for debugging

---

**Test Suite Ready!** ✅

All test files have been created and are ready to execute. Follow the instructions above to run the tests and verify payment processing is working correctly.

---

*Generated: 2025-10-18*
*Test Suite Version: 1.0*
*Framework: Playwright + Chrome DevTools MCP*
