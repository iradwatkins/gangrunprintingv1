# FedEx Shipping - Known Issues & Solutions

**⚠️ Git-Searchable Keywords Repository ⚠️**

This file exists to make critical FedEx shipping issues discoverable via git search.

## Quick Search Commands

```bash
# Find FedEx shipping validation issues
git log --all --grep="FEDEX-DIMENSIONS-VALIDATION"
git log --all --grep="FEDEX-400-ERROR"
git log --all --grep="FEDEX-INVALID-REQUEST"

# Find this documentation
git log --all --grep="FEDEX-CHECKOUT-BLOCKED"

# Search code for the fix
git grep "CRITICAL: FEDEX SHIPPING PACKAGE VALIDATION"
```

## Issue 1: "Invalid Request" 400 Error on Checkout

**Keywords**: `FEDEX-DIMENSIONS-VALIDATION` `FEDEX-400-ERROR` `FEDEX-INVALID-REQUEST` `FEDEX-CHECKOUT-BLOCKED`

**Date Fixed**: October 21, 2025
**Severity**: P0 (Complete checkout blockage)

### Symptoms

- Customers see "Invalid request" on `/checkout/shipping`
- Browser console: `POST /api/shipping/rates 400 (Bad Request)`
- Docker logs: `Validation failed: expected number, received undefined`

### Root Cause

Cart items contain `dimensions: { length: undefined, width: undefined, height: undefined }` which fails backend validation.

### Solution

Conditional validation in `/src/app/(customer)/checkout/shipping/page.tsx`:

- Only include dimensions if ALL values are valid numbers
- Use `typeof === 'number'` type checking
- Omit dimensions entirely if incomplete

### Quick Fix Verification

```bash
# 1. Check if fix exists in code
grep "CRITICAL: FEDEX SHIPPING PACKAGE VALIDATION" \
  src/app/\(customer\)/checkout/shipping/page.tsx

# 2. Run test script
node test-fedex-api-direct.js

# 3. Check API response
curl -X POST https://gangrunprinting.com/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{"destination": {"zipCode": "90210", "state": "CA", "city": "Los Angeles", "countryCode": "US", "isResidential": true}, "packages": [{"weight": 1}]}'
```

### Full Documentation

See: `/docs/CRITICAL-FEDEX-DIMENSIONS-VALIDATION-FIX.md`

---

## Issue 2: Missing GROUND_HOME_DELIVERY for Residential

**Keywords**: `FEDEX-RESIDENTIAL-GROUND` `FEDEX-DUPLICATE-RATES`

**Date Fixed**: October 21, 2025
**Severity**: P1 (Missing shipping option)

### Symptoms

- Residential addresses only show FEDEX_GROUND
- Missing GROUND_HOME_DELIVERY option
- Business addresses show correct options

### Solution

Conditional service generation in `/src/lib/shipping/providers/fedex-enhanced.ts`:

- Use `GROUND_HOME_DELIVERY` for residential addresses
- Use `FEDEX_GROUND` for business addresses

### Documentation

See: `/docs/FEDEX-DUPLICATE-RATES-FIX-2025-10-21.md`

---

## How to Use This File

### If Checkout Is Broken:

1. **Search git history**:

   ```bash
   git log --all --grep="FEDEX" --oneline
   ```

2. **Find related commits**:

   ```bash
   git log --all -S "FEDEX-DIMENSIONS-VALIDATION" --source --all
   ```

3. **View commit details**:

   ```bash
   git show <commit-hash>
   ```

4. **Restore the fix if needed**:
   ```bash
   git checkout <commit-hash> -- src/app/\(customer\)/checkout/shipping/page.tsx
   ```

### Testing Checklist:

- [ ] Run `node test-fedex-api-direct.js` (must pass 4/4)
- [ ] Check browser console for 400 errors
- [ ] Verify all 4 FedEx rates display
- [ ] Test residential AND business addresses
- [ ] Check Docker logs for validation errors

---

**Last Updated**: October 21, 2025
**Maintainer**: Auto-generated reference for git searchability
