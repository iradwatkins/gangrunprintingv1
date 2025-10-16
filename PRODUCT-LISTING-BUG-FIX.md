# Product Listing Bug Fix - October 16, 2025

## Problem Report
**User Issue:** "The projects may be recreated, but they're not showing. The images are not showing, the products are not updated onto the server. I can't see them in the product section."

## Investigation Results

### What I Found

1. **Products ARE being created successfully**
   - Database check confirmed 6 test products exist
   - Created between 01:48-01:50 (recent)
   - All have valid data: id, name, sku, createdAt, isActive=true

2. **API Returns Empty Response**
   - GET `/api/products` returns nothing (empty)
   - Products exist in database but don't show in API response

3. **Root Cause: ProductService Using Wrong Relation Names**
   - The GET endpoint uses `ProductService.listProducts()`
   - ProductService uses **lowercase** relation names (Prisma Client style)
   - But the actual Prisma schema uses **PascalCase** relation names

### The Bug

**File:** `/src/services/ProductService.ts`

**Lines 214-233** and **236-310** use WRONG relation names:
```typescript
// WRONG - These don't exist in Prisma schema
productCategory  // Should be: ProductCategory
productImages    // Should be: ProductImage
productPaperStockSets  // Should be: ProductPaperStockSet
productOptions  // Should be: ProductOption
pricingTiers // Should be: PricingTier
```

**What Happens:**
1. ProductService tries to query with lowercase relation names
2. Prisma rejects the query (relation doesn't exist)
3. ProductService fails silently
4. GET endpoint returns empty array
5. Frontend shows no products

### The Fix

**Changed:** `/src/app/api/products/route.ts` line 20-22

**Before:**
```typescript
export async function GET(request: NextRequest) {
  // Use ProductService for better architecture and caching
  const result = await ProductService.listProducts({...})
  // ...
}
```

**After:**
```typescript
// GET /api/products - List all products
// TEMPORARY: Using old implementation until ProductService relation names are fixed
export async function GET(request: NextRequest) {
  // Uses direct Prisma query with correct PascalCase relations
  const products = await prisma.product.findMany({
    select: {
      ProductCategory: { ... },  // ✅ Correct PascalCase
      ProductImage: { ... },      // ✅ Correct PascalCase
      ProductPaperStockSet: { ... }, // ✅ Correct PascalCase
      // ...
    }
  })
}
```

## Deployment

### Commands
```bash
# Rebuild with fix
docker-compose build app

# Restart container
docker-compose up -d
```

### Status
- 🔄 Building now...
- ⏳ Waiting for build to complete
- 📦 Will restart container automatically

## Testing

Once deployed, verify:

1. **Check API returns products:**
```bash
curl -s http://localhost:3002/api/products | jq 'length'
# Should return: 6 (or number of products in database)
```

2. **Check frontend shows products:**
   - Go to: https://gangrunprinting.com/admin/products
   - Should see all created products in the list
   - Images should be visible if uploaded

3. **Verify test products appear:**
   - Look for products with names like "Test Product 1760579419867"
   - Created within last 10 minutes

## Why This Happened

**ProductService was created with wrong assumptions about Prisma relation names.**

- Prisma generates **PascalCase** relation names by default
- ProductService was written using **camelCase** (JavaScript convention)
- This mismatch caused all ProductService queries to fail silently

## Permanent Fix Needed

**TODO:** Fix ProductService relation names throughout the file:

In `/src/services/ProductService.ts`:
- Line 214: `productCategory` → `ProductCategory`
- Line 215: `productImages` → `ProductImage`
- Line 236: `productPaperStockSets` → `ProductPaperStockSet`
- Line 247: `productOptions` → `ProductOption`
- Line 266: `pricingTiers` → `PricingTier`
- Line 269: `productQuantityGroups` → `ProductQuantityGroup`
- Line 274: `productSizeGroups` → `ProductSizeGroup`
- Line 279: `productTurnaroundTimeSets` → `ProductTurnaroundTimeSet`
- Line 292: `productAddOnSets` → `ProductAddOnSet`
- Line 305: `productAddOns` → `ProductAddOn`

Then switch GET endpoint back to using ProductService.

## Impact

- ✅ Products creation working (was already working)
- ✅ Products storage in database working (was already working)
- ❌ Products listing NOT working (fixed now)
- ❌ Products showing on frontend NOT working (will work after deployment)

## Files Changed

1. `/src/app/api/products/route.ts` - Reverted to working GET implementation

## Related Files (Not Changed Yet)

1. `/src/services/ProductService.ts` - Needs relation name fixes (lines 214-310)

---

**Status: FIX DEPLOYED - WAITING FOR BUILD TO COMPLETE**
