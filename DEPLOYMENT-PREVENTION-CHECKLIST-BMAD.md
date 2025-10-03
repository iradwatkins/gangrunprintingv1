# Deployment Prevention Checklist (BMAD Method™)
**Purpose:** Prevent customer-blocking issues from reaching production
**Created:** October 3, 2025
**Last Updated:** October 3, 2025

---

## 🎯 Overview

This checklist was created following the discovery of a critical P0 issue that blocked 100% of customer purchases. It follows the BMAD Method™ principles of Build, Measure, Analyze, and Document to ensure systematic quality assurance.

**Use this checklist:**
- Before EVERY deployment to production
- After ANY changes to critical user flows
- Weekly as part of maintenance routine

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Phase 1: Build Verification (15 minutes)

#### Code Compilation
- [ ] `npm run build` completes without errors
- [ ] `npm run type-check` shows zero TypeScript errors
- [ ] No console warnings about deprecated packages
- [ ] All environment variables are set correctly
- [ ] Database migrations applied successfully

#### Code Quality
- [ ] No `console.log()` statements in production code
- [ ] No TODO/FIXME comments in critical paths
- [ ] No hardcoded credentials or API keys
- [ ] All debug flags set to `false`
- [ ] No test data in production database

---

### Phase 2: Functional Testing (30 minutes)

#### Critical User Flows (MUST TEST IN REAL BROWSER)
**⚠️ DO NOT rely on curl or API testing alone**

##### Flow 1: New Customer Purchase
- [ ] Navigate to homepage in Chrome
- [ ] Click "Products" in navigation
- [ ] Click on any product
- [ ] **CRITICAL:** Verify configuration options load within 3 seconds
- [ ] **CRITICAL:** Verify "Add to Cart" button appears
- [ ] Select quantity, size, paper
- [ ] Click "Add to Cart"
- [ ] Verify cart shows item correctly
- [ ] Click "Checkout"
- [ ] Fill shipping address
- [ ] Select "Cash" payment method
- [ ] Click "Place Order"
- [ ] Verify order confirmation page appears
- [ ] Note order number

##### Flow 2: Order Verification
- [ ] Go to /account/orders
- [ ] Verify order appears in list
- [ ] Verify order status is "PROCESSING" or "PAID"
- [ ] Click on order to view details
- [ ] Verify all order information is correct

##### Flow 3: Returning Customer
- [ ] Sign in with existing account
- [ ] Add product to cart
- [ ] Complete checkout
- [ ] Verify order appears in account

---

### Phase 3: Technical Validation (20 minutes)

#### API Endpoints
Test these endpoints return 200 OK:
- [ ] `GET /api/health` - Returns healthy status
- [ ] `GET /api/products` - Returns product list
- [ ] `GET /api/products/[id]/configuration` - Returns complete config
- [ ] `POST /api/checkout/create-payment` - Accepts valid payload
- [ ] `GET /api/shipping/calculate` - Returns shipping rates

#### Database Integrity
- [ ] All OrderStatus enum values exist in database
- [ ] Products have proper configurations (qty, size, paper, turnaround)
- [ ] No orphaned records (check foreign keys)
- [ ] Database migrations are up to date

#### Frontend Validation
**Open browser DevTools Console (F12) and check:**
- [ ] Zero JavaScript errors on homepage
- [ ] Zero JavaScript errors on products page
- [ ] Zero JavaScript errors on product detail page
- [ ] Zero JavaScript errors on checkout page
- [ ] No failed network requests (check Network tab)
- [ ] No hydration errors or warnings

#### React Hydration Check
- [ ] Open React DevTools
- [ ] Navigate to product page
- [ ] Verify components show as "Hydrated" not "Client"
- [ ] Check useEffect hooks are firing (look for console logs)
- [ ] Verify state updates are working

---

### Phase 4: Performance & Security (15 minutes)

#### Performance
- [ ] Homepage loads in < 2 seconds
- [ ] Product page loads in < 3 seconds
- [ ] Checkout completes in < 5 seconds
- [ ] No memory leaks (check Chrome Task Manager)
- [ ] Images load progressively
- [ ] No layout shift (CLS) issues

#### Security
- [ ] HTTPS is enforced
- [ ] CSP headers are present
- [ ] No sensitive data in client-side code
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] Rate limiting on auth endpoints

---

### Phase 5: Cross-Browser Testing (20 minutes)

**Test in these browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**For each browser, verify:**
- [ ] Homepage loads
- [ ] Can add product to cart
- [ ] Can complete checkout
- [ ] No JavaScript errors in console

---

### Phase 6: Error Handling (15 minutes)

#### Graceful Degradation
- [ ] What happens if API is slow? (throttle to Slow 3G)
- [ ] What happens if API returns error? (block in DevTools)
- [ ] What happens if JavaScript is disabled?
- [ ] What happens if user has ad blocker?
- [ ] What shows if product has no configuration?

#### Error Messages
- [ ] Error messages are user-friendly (not technical)
- [ ] Errors are logged to monitoring system
- [ ] Users have a way to contact support
- [ ] Loading states have timeouts (max 10 seconds)
- [ ] Failed requests have retry buttons

---

### Phase 7: Monitoring & Alerts (10 minutes)

#### Before Deployment
- [ ] Sentry/error tracking is configured
- [ ] Performance monitoring is enabled
- [ ] Database query monitoring is active
- [ ] Uptime monitoring is configured
- [ ] Alert notifications are working

#### Post-Deployment Verification
- [ ] Monitor error rate for 15 minutes after deploy
- [ ] Check for spike in 500 errors
- [ ] Verify API response times < 200ms
- [ ] Check database connection pool
- [ ] Verify no memory leaks in PM2

---

## 🚨 CRITICAL FAILURE POINTS

**These issues will block ALL customers. Check extra carefully:**

### 1. Product Configuration Not Loading
**Symptoms:**
- "Loading quantities..." never changes
- No "Add to Cart" button
- Blank product page

**Check:**
- [ ] API endpoint `/api/products/[id]/configuration` returns data
- [ ] React component receives `initialConfiguration` prop
- [ ] useEffect in SimpleQuantityTest is firing
- [ ] Browser console shows no errors

**Test:**
```bash
# In terminal
curl http://localhost:3002/api/products/[product-id]/configuration

# Should return JSON with quantities, sizes, paperStocks, turnaroundTimes
# If not, deployment MUST be blocked
```

### 2. Database Enum Mismatch
**Symptoms:**
- 500 errors on order creation
- "Invalid enum value" errors in logs

**Check:**
```sql
-- Run in psql
SELECT enumlabel FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'OrderStatus');

-- Must include: PAID, PROCESSING, PRINTING, PAYMENT_FAILED
```

### 3. React Hydration Failure
**Symptoms:**
- Components don't respond to clicks
- Forms don't submit
- State updates don't work

**Check:**
- [ ] Open React DevTools
- [ ] Look for red hydration errors
- [ ] Verify components show correct state

---

## 📊 Automated Testing (Future)

**TODO: Implement these automated checks**
- [ ] E2E test suite with Puppeteer
- [ ] Run before every deployment
- [ ] Block deployment if any test fails
- [ ] Report results to Slack/email

**Test scenarios to automate:**
1. New customer creates account
2. Customer browses products
3. Customer adds product to cart
4. Customer completes checkout
5. Customer views order history

---

## 🔄 Post-Deployment Verification (30 minutes)

**Within 5 minutes of deployment:**
- [ ] Visit homepage - verify it loads
- [ ] Visit /products - verify products show
- [ ] Visit /products/[slug] - verify product details load
- [ ] Add to cart - verify it works
- [ ] Check /api/health - verify healthy status

**Within 15 minutes of deployment:**
- [ ] Check error logs - verify no spike in errors
- [ ] Check performance metrics - verify response times normal
- [ ] Test checkout flow - verify orders can be placed
- [ ] Check database - verify no connection issues

**Within 30 minutes of deployment:**
- [ ] Monitor customer activity - verify users completing purchases
- [ ] Check support channels - verify no customer complaints
- [ ] Review analytics - verify traffic patterns normal

---

## 🚨 Rollback Criteria

**Immediately rollback if:**
- [ ] Error rate > 5% in first 5 minutes
- [ ] Any critical API endpoint returns 500
- [ ] Customers cannot add products to cart
- [ ] Customers cannot complete checkout
- [ ] Database connection fails
- [ ] More than 3 customer complaints in 10 minutes

**Rollback procedure:**
```bash
# 1. Get previous commit hash
git log -5 --oneline

# 2. Revert to last working version
git checkout [previous-commit-hash]

# 3. Rebuild
npm run build

# 4. Restart PM2
pm2 restart gangrunprinting

# 5. Verify rollback successful
curl http://localhost:3002/api/health
```

---

## 📝 Deployment Log Template

**Copy this for every deployment:**

```
Date: YYYY-MM-DD HH:MM
Deployed by: [Your Name]
Commit: [git commit hash]
Branch: main

Pre-Deployment Checklist:
✅ Build: PASS
✅ Critical Flows: PASS
✅ API Endpoints: PASS
✅ Browser Testing: PASS
✅ Error Handling: PASS

Post-Deployment Verification (15 min):
✅ Homepage: PASS
✅ Products: PASS
✅ Checkout: PASS
✅ Error Rate: NORMAL (< 1%)
✅ Response Times: NORMAL (< 200ms)

Issues Found: NONE / [list issues]
Rollback Required: NO / YES
```

---

## 🎓 Lessons Learned (October 3, 2025)

### What Went Wrong
1. **Deployed without testing in browser** - Only tested API endpoints with curl
2. **No E2E tests** - Would have caught the issue before production
3. **No monitoring for client-side errors** - Took manual testing to discover
4. **Assumed API working = everything working** - Frontend can fail even with working API

### What We Improved
1. **Created comprehensive E2E test suite** - Tests full customer journey
2. **Added browser testing to checklist** - Must test in real browser
3. **Enhanced error logging** - Better debugging for future issues
4. **Documented prevention strategy** - This checklist

### Key Takeaways
- **Always test in browser, not just API**
- **React hydration can fail even with perfect API**
- **Critical paths need server-side rendering**
- **Add timeouts and fallbacks for everything**
- **Monitor what matters: "Can customer buy product?"**

---

## 🔗 Related Documentation

- [Root Cause Analysis](./ROOT-CAUSE-ANALYSIS-PRODUCT-CONFIGURATION.md)
- [Website Audit Report](./WEBSITE-AUDIT-REPORT-2025-10-03.md)
- [BMAD Code Quality Guide](./.AAAAAA/bmad-code-quality-guide.md)
- [CLAUDE.md](./CLAUDE.md) - Main deployment instructions

---

## ✅ Sign-Off

**Before deploying to production, the following people must sign off:**

- [ ] Developer: ________________ Date: ________
- [ ] QA Engineer: ______________ Date: ________
- [ ] Tech Lead: ________________ Date: ________

**Deployment approved:** YES / NO

**Notes:**
```
[Add any specific notes about this deployment]
```

---

*This checklist follows the BMAD Method™ principles and should be updated after every major incident or learning.*

*Last major incident: October 3, 2025 - Product configuration not loading*
*Prevention added: Browser testing, React hydration checks, E2E test suite*
