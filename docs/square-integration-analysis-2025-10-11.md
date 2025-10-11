# Square Payment Integration Analysis
## GangRun Printing - October 11, 2025

---

## 🔍 Current State Analysis

### ✅ What's Working

1. **Square SDK Installed**
   - Version: `^43.0.0` (latest)
   - Properly listed in package.json

2. **Environment Variables Configured**
   - ✅ `NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g`
   - ✅ `NEXT_PUBLIC_SQUARE_LOCATION_ID=LWMA9R9E2ENXP`
   - ✅ `SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD`
   - ✅ `SQUARE_ENVIRONMENT=production`
   - All have proper `NEXT_PUBLIC_` prefix where needed

3. **CSP Headers Configured**
   - Middleware includes all necessary Square domains:
     - `script-src`: `https://web.squarecdn.com`
     - `connect-src`: `https://pci-connect.squareup.com`, `https://*.squareup.com`
     - `frame-src`: `https://web.squarecdn.com`

4. **SquareCardPayment Component**
   - Location: `/src/components/checkout/square-card-payment.tsx`
   - Uses modern Square Web Payments SDK v1
   - Dynamically loads Square script (good workaround)
   - Implements card tokenization properly
   - Includes Apple Pay support
   - Has Cash App Pay detection

5. **Next.js Version**
   - Current: 15.5.2
   - Guide recommends: 14.2.0
   - **Note**: Dynamic script loading in component bypasses most Next.js 15 issues

---

## ⚠️ Issues Identified

### Issue #1: Hardcoded Credentials in Checkout Page
**Problem**: Checkout page passes hardcoded credentials to SquareCardPayment component
```typescript
// Current in checkout/page.tsx lines 109-110
const SQUARE_APPLICATION_ID = 'sq0idp-AJF8fI5VayKCq9veQRAw5g'
const SQUARE_LOCATION_ID = 'LWMA9R9E2ENXP'
```

**Impact**:
- Not using environment variables
- Hard to maintain
- Difficult to switch between sandbox/production

**Solution**: Update checkout page to read from env vars:
```typescript
const SQUARE_APPLICATION_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
```

---

### Issue #2: Missing Backend Payment Processing API
**Problem**: Component calls `/api/checkout/process-square-payment` but this endpoint may not exist

**Impact**: Payment tokenization works but actual charge processing may fail

**Solution**: Create proper API route at `/src/app/api/checkout/process-square-payment/route.ts`

---

### Issue #3: Application ID Verification Needed
**Problem**: Need to verify if `sq0idp-AJF8fI5VayKCq9veQRAw5g` is for web payments or invoices

**Guide Says Wrong ID**: `sq0idp-Cf85mt46wI4zaxvAs2xIyw` (Invoices)
**Current ID**: `sq0idp-AJF8fI5VayKCq9veQRAw5g` (Different - may be correct!)

**Action Required**: User should verify in Square Dashboard:
1. Go to https://developer.squareup.com/apps
2. Check if application named "GangRun Printing Website" or similar exists
3. Verify it's a web application (not invoice application)

---

### Issue #4: Cash App Pay Availability
**Status**: Component attempts to initialize Cash App Pay but catches errors silently

**Current Behavior**: Logs "Cash App Pay not available" if not enabled

**Action Required**: User needs to enable Cash App Pay in Square Dashboard:
1. Go to https://squareup.com/dashboard
2. Account & Settings → Business → Locations
3. Select "Gangrun Printing" location
4. Payment Types → Enable "Cash App Pay"

---

### Issue #5: Square Script Loading Strategy
**Current**: Component dynamically loads script in useEffect
**Recommendation**: Move to root layout for better performance

**Benefits of moving to layout**:
- Script loads earlier (beforeInteractive)
- Available on all pages
- Better caching
- No duplicate loading

---

## 🎯 Recommended Fixes (Priority Order)

### Priority 1: Fix Checkout Page Credentials ✅
**Impact**: High
**Effort**: Low (5 minutes)
**Action**: Update checkout page to use environment variables

### Priority 2: Verify Application ID ⚠️
**Impact**: Critical
**Effort**: User verification (5 minutes)
**Action**: User must check Square Dashboard to confirm app ID is correct

### Priority 3: Create Payment Processing API ✅
**Impact**: Critical
**Effort**: Medium (30 minutes)
**Action**: Create `/api/checkout/process-square-payment/route.ts`

### Priority 4: Add Square Script to Root Layout ✅
**Impact**: Medium (Performance improvement)
**Effort**: Low (10 minutes)
**Action**: Add Script component to `app/layout.tsx`

### Priority 5: Enable Cash App Pay ⚠️
**Impact**: Medium (Additional payment method)
**Effort**: User action (10 minutes)
**Action**: User enables in Square Dashboard

---

## 📋 Implementation Plan

### Step 1: Fix Checkout Page (Immediate)
```typescript
// Replace lines 109-110 in /src/app/(customer)/checkout/page.tsx
const SQUARE_APPLICATION_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
```

### Step 2: Add Square Script to Layout (Recommended)
```typescript
// Add to /src/app/layout.tsx
import Script from 'next/script'

// In <head>
<Script
  src="https://web.squarecdn.com/v1/square.js"
  strategy="beforeInteractive"
/>
```

### Step 3: Create Payment API Route
Create `/src/app/api/checkout/process-square-payment/route.ts` with proper Square Payments API implementation

---

## 🧪 Testing Checklist

After implementing fixes:

- [ ] Checkout page loads without errors
- [ ] Square payment form appears in checkout
- [ ] Can enter test card number
- [ ] Card validation works
- [ ] Payment tokenization succeeds
- [ ] Backend processes payment
- [ ] Success page shows after payment
- [ ] Payment appears in Square Dashboard
- [ ] Apple Pay shows on Safari/iOS (if available)
- [ ] Cash App Pay button shows (if enabled)

---

## 🔗 References

- Square Web Payments SDK: https://developer.squareup.com/docs/web-payments/overview
- Square Dashboard: https://squareup.com/dashboard
- Developer Portal: https://developer.squareup.com/apps
- Location ID: `LWMA9R9E2ENXP` (Gangrun Printing)

---

**Analysis Completed**: October 11, 2025
**Next Action**: Implement Priority 1 & 3 fixes immediately
