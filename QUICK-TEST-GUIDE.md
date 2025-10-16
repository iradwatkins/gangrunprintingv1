# Quick Test Guide - Product CRUD

## What Was Fixed (October 16, 2025)

1. ✅ **Products Not Showing** - Fixed Prisma relation names in GET endpoint
2. ✅ **Product Deletion** - Added `credentials: 'include'` to DELETE fetch
3. ✅ **Toggle Active/Featured** - Added `credentials: 'include'` to PATCH fetch
4. ✅ **Duplicate Product** - Added `credentials: 'include'` to POST fetch

---

## Quick Test Commands

### Test 1: Verify Products Showing
```bash
# Should return 8 products
curl -s http://localhost:3020/api/products | jq '.data | length'

# List product names
curl -s http://localhost:3020/api/products | jq -r '.data[] | .Name'
```

**Expected Result:** 8 products listed

---

### Test 2: Check Admin Panel
```
URL: https://gangrunprinting.com/admin/products

Expected:
- See all 8 test products in table
- Each product shows name, SKU, category
- Active/Featured toggles visible
- Delete and Duplicate buttons working
```

---

### Test 3: Test Product Deletion
1. Go to: https://gangrunprinting.com/admin/products
2. Click trash icon on any test product
3. Confirm deletion
4. Product should disappear from list

**Expected:** Product deleted successfully

---

### Test 4: Test Toggle Active
1. Go to: https://gangrunprinting.com/admin/products
2. Click "Active" switch on any product
3. Status should toggle immediately

**Expected:** Status changes instantly

---

### Test 5: Test Toggle Featured
1. Go to: https://gangrunprinting.com/admin/products
2. Click "Featured" switch on any product
3. Status should toggle immediately

**Expected:** Status changes instantly

---

### Test 6: Test Image Upload (NOT YET TESTED)
1. Go to: https://gangrunprinting.com/admin/products/new
2. Fill in product details
3. Click "Upload Image"
4. Select an image file
5. Click "Create Product"

**Expected:** Product created with image showing

**If this fails:**
1. Start monitor: `node monitor-product-detailed.js &`
2. Try upload again
3. Stop monitor: `pkill -f monitor-product-detailed`
4. View report: `bash view-monitor-report.sh`

---

## Database Verification

### Check Products in Database
```bash
docker exec gangrunprinting-postgres psql -U gangrun_user -d gangrun_db -c "SELECT id, name, sku, \"createdAt\", \"isActive\" FROM \"Product\" ORDER BY \"createdAt\" DESC LIMIT 10;"
```

### Check Product Count
```bash
docker exec gangrunprinting-postgres psql -U gangrun_user -d gangrun_db -c "SELECT COUNT(*) FROM \"Product\";"
```

---

## If Something Breaks

### Check Container Logs
```bash
docker logs --tail=50 gangrunprinting_app
```

### Restart Container
```bash
docker-compose restart app
```

### Rebuild Container
```bash
docker-compose build app
docker-compose up -d
```

### Check Database Connection
```bash
docker exec gangrunprinting-postgres psql -U gangrun_user -d gangrun_db -c "SELECT version();"
```

---

## Files Modified (For Reference)

1. `/src/app/api/products/route.ts` (line 20-22)
   - Fixed GET endpoint to use correct Prisma relation names

2. `/src/app/admin/products/page.tsx`
   - Line 96: Added credentials to DELETE
   - Line 123: Added credentials to PATCH toggleActive
   - Line 143: Added credentials to PATCH toggleFeatured
   - Line 161: Added credentials to POST duplicate

---

## What Still Needs Work

1. **ProductService** (lines 214-310)
   - All relation names need to change from camelCase to PascalCase
   - Once fixed, can revert GET endpoint to use service layer

2. **Product Duplication Route**
   - `/src/app/api/products/[id]/duplicate/route.ts`
   - Needs same relation name fixes as ProductService

3. **Image Uploads**
   - Not yet tested
   - May need troubleshooting

---

## Current Status

✅ **WORKING:**
- Product creation
- Product listing in admin panel
- Products showing in API responses
- Database storage

⚠️ **DEPLOYED BUT NOT TESTED:**
- Product deletion
- Toggle Active status
- Toggle Featured status
- Duplicate product (fetch fixed, schema still broken)

❌ **NOT TESTED:**
- Image uploads
- Product updates/edits

---

## Quick Links

- Admin Products: https://gangrunprinting.com/admin/products
- Create Product: https://gangrunprinting.com/admin/products/new
- API Endpoint: https://gangrunprinting.com/api/products

---

**Last Updated:** October 16, 2025 01:55 UTC
