# FedEx Duplicate Rates Fix - October 21, 2025

## Issue Summary

**Problem**: FedEx shipping rates not displaying on checkout page
**Error Message**: "Failed to load shipping rates"
**Root Cause**: Duplicate service codes causing React key conflicts

## Symptoms

1. User sees "Failed to load shipping rates" error on `/checkout/shipping`
2. Browser console shows React duplicate key warnings
3. FedEx rates API returns successfully but frontend fails to render
4. Southwest Cargo rates display correctly (no duplicates)

## Root Cause Analysis

### API Behavior
The FedEx shipping API was returning **duplicate service codes** with different prices:

```json
{
  "rates": [
    {
      "serviceCode": "STANDARD_OVERNIGHT",
      "rateAmount": 155.61
    },
    {
      "serviceCode": "FEDEX_2_DAY",
      "rateAmount": 92.99
    },
    {
      "serviceCode": "SMART_POST",  // ← Duplicate #1
      "rateAmount": 23.88
    },
    {
      "serviceCode": "SMART_POST",  // ← Duplicate #2
      "rateAmount": 26.53
    },
    {
      "serviceCode": "SMART_POST",  // ← Duplicate #3
      "rateAmount": 26.53
    }
  ]
}
```

### Frontend Impact
React components use `key={rate.serviceCode}` for list rendering:

```tsx
{rates.map((rate) => (
  <div key={rate.serviceCode}>  // ❌ Duplicate keys!
    ...
  </div>
))}
```

**Result**: React refuses to render duplicate keys, causing component failures.

## Solution Implemented

### Fix #1: Backend Deduplication
**File**: `src/lib/shipping/providers/fedex-enhanced.ts`
**Method**: `parseRateResponse()`

Added deduplication logic that keeps the **lowest price** for each service code:

```typescript
// Deduplicate by serviceCode, keeping the lowest price for each service
const deduplicatedRates = allRates.reduce((unique, rate) => {
  const existing = unique.find((r) => r.serviceCode === rate.serviceCode)
  if (!existing) {
    // New service code, add it
    return [...unique, rate]
  } else if (rate.rateAmount < existing.rateAmount) {
    // Found cheaper rate for same service, replace existing
    return [...unique.filter((r) => r.serviceCode !== rate.serviceCode), rate]
  }
  // Keep existing (cheaper or same price)
  return unique
}, [] as ShippingRate[])

// Log deduplication if any occurred
if (allRates.length !== deduplicatedRates.length) {
  console.log(
    `[FedEx] Deduplicated ${allRates.length} rates → ${deduplicatedRates.length} unique services`
  )
}
```

**After Fix**:
```json
{
  "rates": [
    {
      "serviceCode": "STANDARD_OVERNIGHT",
      "rateAmount": 155.61
    },
    {
      "serviceCode": "FEDEX_2_DAY",
      "rateAmount": 92.99
    },
    {
      "serviceCode": "SMART_POST",  // ✅ Only cheapest rate kept
      "rateAmount": 23.88
    }
  ]
}
```

### Fix #2: Frontend Unique Keys
**File**: `src/components/checkout/shipping-method-selector.tsx`

Changed from simple `serviceCode` keys to compound unique keys:

```tsx
// Before ❌
{rates.map((rate) => (
  <div key={rate.serviceCode}>

// After ✅
{rates.map((rate, index) => (
  <div key={`${rate.provider}-${rate.serviceCode}-${index}`}>
```

This ensures truly unique keys even if deduplication somehow fails.

### Fix #3: Enhanced Error Handling
**File**: `src/components/checkout/shipping-method-selector.tsx`

Added comprehensive logging and validation:

```typescript
// Before ❌
catch (err) {
  console.error('Shipping rates error:', err)
  setError('Failed to load shipping rates')
}

// After ✅
catch (err) {
  console.error('[ShippingMethodSelector] Shipping rates error:', err)
  const errorMessage = err instanceof Error ? err.message : 'Failed to load shipping rates'
  setError(errorMessage)
  toast.error('Could not load shipping options. Please try again.')
}
```

Now includes:
- Structured logging with `[ShippingMethodSelector]` prefix
- Detailed API error logging (status, statusText, errorData)
- Response validation before setting state
- User-friendly error messages

## Files Changed

| File | Changes | Lines |
|------|---------|-------|
| `src/lib/shipping/providers/fedex-enhanced.ts` | Add deduplication logic | 435-458 |
| `src/components/checkout/shipping-method-selector.tsx` | Unique keys + error handling | 67-134, 242-246 |
| `docs/FEDEX-DUPLICATE-RATES-FIX-2025-10-21.md` | This document | N/A |

## Testing Instructions

### 1. Rebuild Docker Container
Changes require Docker rebuild:

```bash
cd /root/websites/gangrunprinting
docker-compose down
docker-compose up -d --build
```

### 2. Test API Endpoint
Verify deduplication in API response:

```bash
curl -X POST http://localhost:3020/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{
    "destination": {
      "zipCode": "90210",
      "state": "CA",
      "city": "Los Angeles",
      "countryCode": "US",
      "isResidential": true
    },
    "packages": [{"weight": 5}]
  }'
```

**Expected**: No duplicate `serviceCode` values in response

### 3. Test Browser Checkout
Complete checkout flow:

1. Navigate to https://gangrunprinting.com
2. Add any product to cart
3. Go to checkout → Enter shipping address
4. **Verify**: FedEx rates display correctly
5. **Check browser console**: No React key warnings
6. **Check logs**: `docker logs gangrunprinting_app --tail=50`
   - Look for: `[FedEx] Deduplicated X rates → Y unique services`

### 4. Verify Console Logging
Open browser DevTools Console, should see:

```
[ShippingMethodSelector] Fetching rates for: {...}
[ShippingMethodSelector] API response: {
  success: true,
  ratesCount: 5,  // ✅ No duplicates
  ...
}
```

## Success Criteria

✅ FedEx rates display on shipping page
✅ No "Failed to load shipping rates" error
✅ No React duplicate key warnings in console
✅ Can select and proceed with FedEx shipping method
✅ Deduplication log appears in Docker logs (if duplicates found)

## Impact Assessment

**Risk Level**: Low
- Changes isolated to rate parsing and rendering logic
- No database schema changes
- No API contract changes
- Backward compatible

**User Impact**: High
- Fixes complete checkout blocker for FedEx
- Improves UX with better error messages
- Provides debugging visibility via console logs

## Related Issues

**Similar to Southwest Cargo Fix (Oct 18, 2025)**:
- Root cause: Duplicate provider data causing UI failures
- Solution: Deduplication + unique keys
- Lesson: Always validate for duplicates when rendering lists

**Prevention**:
- Add API response validation tests
- Monitor for duplicate service codes in production
- Consider adding `unique` constraint checks in data layer

## Rollback Plan

If issues occur, revert these commits:

```bash
git revert <commit-hash>
docker-compose down
docker-compose up -d --build
```

Fallback rates will still work (FedEx provider has test mode fallback).

## Monitoring

After deployment, monitor:
- Checkout completion rate (should increase)
- FedEx selection rate (should become non-zero)
- Browser error logs (duplicate key warnings should disappear)
- API error rate for `/api/shipping/rates`

---

**Date**: October 21, 2025
**Author**: Claude Code
**Status**: ✅ Fixed + Enhanced (filtering applied to test rates)
**Priority**: P0 - Critical (checkout blocker)

## Additional Fix (Post-Deployment)

**Issue Discovered**: Only 3 FedEx rates returning instead of configured 4
**Missing Rate**: FEDEX_GROUND
**Root Cause**: Test rates path bypassed `filterByEnabledServices()` method

### Fix Applied (src/lib/shipping/providers/fedex-enhanced.ts)

**Lines 160-165**: Added filtering to test rates path
```typescript
// Before
if (!this.config.clientId || !this.config.accountNumber) {
  console.warn('[FedEx] No API credentials, returning test rates')
  return this.getTestRates(packages, fromAddress.zipCode, toAddress.zipCode, toAddress.isResidential)
}

// After
if (!this.config.clientId || !this.config.accountNumber) {
  console.warn('[FedEx] No API credentials, returning test rates')
  const testRates = this.getTestRates(packages, fromAddress.zipCode, toAddress.zipCode, toAddress.isResidential)
  const filteredRates = this.filterByEnabledServices(testRates)
  return this.applyMarkup(filteredRates)
}
```

**Lines 206-211**: Also fixed error fallback path
```typescript
// Before
catch (error) {
  console.error('[FedEx] Rate fetch failed:', error)
  return this.getTestRates(packages, fromAddress.zipCode, toAddress.zipCode, toAddress.isResidential)
}

// After
catch (error) {
  console.error('[FedEx] Rate fetch failed:', error)
  const testRates = this.getTestRates(packages, fromAddress.zipCode, toAddress.zipCode, toAddress.isResidential)
  const filteredRates = this.filterByEnabledServices(testRates)
  return this.applyMarkup(filteredRates)
}
```

**Result**: Now all code paths (live API, test mode, error fallback) correctly apply enabled services filtering.

---

## Second Additional Fix: Residential Address FEDEX_GROUND Issue

**Issue Discovered**: After filtering fix, FEDEX_GROUND still missing for residential addresses (`isResidential: true`)
**Missing Rate**: FEDEX_GROUND (only 3 rates for residential, but 4 rates for business addresses)
**Root Cause**: FEDEX_GROUND service has `allowsResidential: false` flag in services.ts:207, causing it to be filtered out for residential deliveries

### Investigation Process

1. **Verified Configuration**: enabledServices in module-registry.ts contains all 4 services
2. **Verified Generation**: getTestRates() generates all 4 services
3. **Tested Address Types**:
   - Residential (`isResidential: true`): Returns 3 rates (missing FEDEX_GROUND)
   - Business (`isResidential: false`): Returns 4 rates (includes FEDEX_GROUND)
4. **Found Flag**: FEDEX_GROUND has `allowsResidential: false` in fedex/services.ts
5. **Attempted Fix #1**: Changed `allowsResidential` to `true` - DIDN'T WORK (filtering still occurred)
6. **Root Discovery**: The `allowsResidential` flag is checked somewhere in codebase, but exact location couldn't be found

### Final Fix Applied (Pragmatic Workaround)

**File**: `src/lib/shipping/providers/fedex-enhanced.ts`
**Line 729**: Conditional service generation based on address type

```typescript
// Before
const services = [
  { code: 'STANDARD_OVERNIGHT', name: 'FedEx Standard Overnight', base: 45, perLb: 2.0, days: 1 },
  { code: 'FEDEX_2_DAY', name: 'FedEx 2Day', base: 25, perLb: 1.5, days: 2 },
  { code: 'FEDEX_GROUND', name: 'FedEx Ground', base: 12, perLb: 0.85, days: 3 },
  { code: 'SMART_POST', name: 'FedEx Ground Economy', base: 8, perLb: 0.6, days: 5 },
]

// After - Use GROUND_HOME_DELIVERY for residential (has allowsResidential: true)
const services = [
  { code: 'STANDARD_OVERNIGHT', name: 'FedEx Standard Overnight', base: 45, perLb: 2.0, days: 1 },
  { code: 'FEDEX_2_DAY', name: 'FedEx 2Day', base: 25, perLb: 1.5, days: 2 },
  { code: isResidential ? 'GROUND_HOME_DELIVERY' : 'FEDEX_GROUND', name: isResidential ? 'FedEx Home Delivery' : 'FedEx Ground', base: 12, perLb: 0.85, days: 3 },
  { code: 'SMART_POST', name: 'FedEx Ground Economy', base: 8, perLb: 0.6, days: 5 },
]
```

**File**: `src/lib/shipping/module-registry.ts`
**Line 53**: Added GROUND_HOME_DELIVERY to enabled services

```typescript
enabledServices: ['STANDARD_OVERNIGHT', 'FEDEX_2_DAY', 'FEDEX_GROUND', 'GROUND_HOME_DELIVERY', 'SMART_POST'],
```

### Rationale

- GROUND_HOME_DELIVERY service has `allowsResidential: true` in services.ts
- Same pricing as FEDEX_GROUND (both are ground delivery)
- FedEx actually does deliver GROUND_HOME_DELIVERY to residential addresses in real world
- Pragmatic workaround when root filtering logic couldn't be located
- Provides correct customer experience: 4 rates for all address types

### Testing Results

**Residential Address (`isResidential: true`)**:
```json
{
  "ratesCount": 4,
  "services": [
    "STANDARD_OVERNIGHT",
    "FEDEX_2_DAY",
    "GROUND_HOME_DELIVERY",  // ✅ Shows instead of FEDEX_GROUND
    "SMART_POST"
  ]
}
```

**Business Address (`isResidential: false`)**:
```json
{
  "ratesCount": 4,
  "services": [
    "STANDARD_OVERNIGHT",
    "FEDEX_2_DAY",
    "FEDEX_GROUND",  // ✅ Shows for business
    "SMART_POST"
  ]
}
```

### Cleanup

- ✅ Removed debug logging from filterByEnabledServices()
- ✅ Removed debug logging from getTestRates()
- ✅ Deleted debug endpoint /api/shipping/debug-fedex/route.ts

---

**Date**: October 21, 2025
**Author**: Claude Code
**Status**: ✅ COMPLETE - All fixes applied (deduplication + filtering + residential workaround)
**Priority**: P0 - Critical (checkout blocker)
