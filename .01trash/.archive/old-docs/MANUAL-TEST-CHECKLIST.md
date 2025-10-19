# Manual Test Checklist - Customer Upload Workflow
## Test Date: October 16, 2025

### Purpose
Verify the complete customer workflow after fixes:
1. Cart → Upload Artwork (not direct to checkout)
2. Checkout images display in 2-column grid (larger thumbnails)

---

## Pre-Test Setup

### ✅ Code Changes Completed
- [x] Cart page redirect fixed (`/cart/page.tsx:51`)
  - Old: `router.push('/checkout')`
  - New: `router.push('/cart/upload-artwork')`
- [x] Checkout image grid enlarged (`/checkout/page.tsx:795`)
  - Old: `grid-cols-4`
  - New: `grid-cols-2`
- [x] Success page image grid enlarged (`/checkout/success/page.tsx:240`)
  - Old: `grid-cols-4`
  - New: `grid-cols-2`

### ✅ Environment Status
- Docker container: `gangrunprinting_app` running on port 3020
- Database: PostgreSQL on port 5435
- Test product exists: `test-product-1760628482508` (slug)

---

## Test Flow

### Step 1: Navigate to Product Page
**URL:** `http://localhost:3020/products/test-product-1760628482508`

**Expected:**
- [ ] Product page loads successfully (HTTP 200)
- [ ] Product details display (name, image, price)
- [ ] Configuration options visible (quantity, size, paper, etc.)
- [ ] "Add to Cart" button is visible

**Actual:**
```
Status: ___________
Notes: ____________________________________________
```

---

### Step 2: Add Product to Cart
**Action:** Click "Add to Cart" button

**Expected:**
- [ ] Success toast message appears
- [ ] Page redirects to `/cart/upload-artwork` (NOT `/cart` or `/checkout`)

**Actual:**
```
Redirect URL: ___________
Toast message: ___________
Notes: ____________________________________________
```

---

### Step 3: Upload Artwork Page
**URL:** Should be at `/cart/upload-artwork`

**Expected:**
- [ ] File upload zone is visible
- [ ] Drag & drop area present
- [ ] Progress indicator: "Item 1 of 1"
- [ ] File requirements listed (PDF, JPG, PNG, AI, PSD, EPS, SVG)
- [ ] "Skip & Continue to Checkout" button visible
- [ ] "Next: Upload Your Design Files" or "Proceed to Checkout" button visible

**Actual:**
```
Current URL: ___________
Upload zone visible: ___________
Notes: ____________________________________________
```

---

### Step 4: Test File Upload (Optional)
**Action:** Upload a test image file

**Expected:**
- [ ] File uploads successfully
- [ ] Thumbnail preview appears
- [ ] File count updates
- [ ] Green checkmark appears

**Actual:**
```
Upload success: ___________
Thumbnail visible: ___________
Notes: ____________________________________________
```

---

### Step 5: Proceed to Checkout
**Action:** Click "Skip & Continue to Checkout" OR "Proceed to Checkout"

**Expected:**
- [ ] Page redirects to `/checkout`
- [ ] Checkout page loads

**Actual:**
```
Redirect URL: ___________
Page loads: ___________
Notes: ____________________________________________
```

---

### Step 6: Verify Checkout Image Grid (CRITICAL FIX)
**URL:** Should be at `/checkout`

**Expected:**
- [ ] Product images visible in checkout summary
- [ ] Images use `grid-cols-2` (2-column layout)
- [ ] Images are visibly larger than before (not tiny thumbnails)
- [ ] Each image takes up approximately 50% width

**To Verify Grid:**
1. Right-click on image grid
2. "Inspect Element"
3. Look for `class="grid grid-cols-2"` in the HTML

**Actual:**
```
Grid class found: ___________
Image size: ___________
Visual appearance: ____________________________________________
```

---

## Test Results Summary

### ✅ Pass Criteria
- [ ] Cart redirects to upload page (not directly to checkout)
- [ ] Upload page displays correctly
- [ ] Checkout page loads
- [ ] Checkout images use 2-column grid (larger display)

### Overall Result
**PASS / FAIL / PARTIAL**

**Notes:**
```




```

---

## Known Issues from Automated Testing

1. **Product Page "Add to Cart" Button Not Visible**
   - Playwright test could not find button
   - Likely React hydration issue
   - Manual browser test needed to confirm

2. **Product Listing Uses IDs Instead of Slugs**
   - `/products/2c2bc530-8b74-4845-ad35-6ee36b289595` (returns 404)
   - Should use: `/products/test-product-1760628482508` (works)

---

## Quick Test Commands

```bash
# Check Docker status
docker ps | grep gangrun

# View app logs
docker logs --tail=50 gangrunprinting_app

# Test product page with curl
curl -I http://localhost:3020/products/test-product-1760628482508

# Check database for products
PGPASSWORD='GangRun2024Secure' psql -U gangrun_user -d gangrun_db -h localhost -p 5435 -c "SELECT id, name, slug FROM \"Product\" WHERE \"isActive\" = true LIMIT 5;"
```

---

## Files Modified

1. `/root/websites/gangrunprinting/src/app/(customer)/cart/page.tsx:51`
2. `/root/websites/gangrunprinting/src/app/(customer)/checkout/page.tsx:795`
3. `/root/websites/gangrunprinting/src/app/(customer)/checkout/success/page.tsx:240`
