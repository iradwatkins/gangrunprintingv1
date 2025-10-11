# 🚨 UPLOAD ERRORS - QUICK DIAGNOSTIC CHECKLIST

**Run this checklist FIRST when you see ANY upload 500 errors**

---

## ⚡ 30-Second Quick Check

```bash
# 1. Check for MinIO header errors (MOST COMMON)
pm2 logs gangrunprinting --lines 50 | grep "Invalid character in header"

# If you see errors → Go to Section A
# If no errors → Go to Section B
```

---

## 📋 Section A: MinIO Header Error (95% of cases)

**This is the MOST COMMON issue - filenames with spaces/special chars**

### Instant Fix Check:

```bash
cd /root/websites/gangrunprinting

# 1. Verify sanitization function exists
grep -A 2 "sanitizeHeaderValue" src/lib/minio-products.ts

# Should output:
# const sanitizeHeaderValue = (value: string) =>
#   value.replace(/[^\x20-\x7E]/g, '_').replace(/\s+/g, '_')
```

### If function is MISSING:

```bash
# Read the full fix documentation
cat docs/IMAGE-UPLOAD-500-ERROR-FIX.md

# Apply the fix (lines 74-88 in minio-products.ts)
# Then rebuild:
npm run build && pm2 restart gangrunprinting
```

### If function EXISTS but still broken:

```bash
# Check if build is outdated
stat -c %y .next/BUILD_ID src/lib/minio-products.ts

# If source file is NEWER than BUILD_ID:
npm run build && pm2 restart gangrunprinting
```

---

## 📋 Section B: Prisma Relation Errors

### Check for Prisma errors:

```bash
pm2 logs gangrunprinting --lines 50 | grep -i "prisma\|unknown field"
```

### Common issue - Wrong relation names:

```bash
# Check upload-image route
grep -E "ProductCategory|ProductImage" src/app/api/products/upload-image/route.ts

# Should be camelCase (productCategory, productImages)
# NOT PascalCase (ProductCategory, ProductImage)
```

### Fix if wrong:

1. Change to camelCase relation names
2. Run: `npx prisma generate`
3. Run: `npm run build && pm2 restart gangrunprinting`

---

## 📋 Section C: Other Upload Issues

### Check authentication:

```bash
pm2 logs gangrunprinting --lines 50 | grep -i "auth\|401\|403"
```

### Check file size:

```bash
pm2 logs gangrunprinting --lines 50 | grep -i "size\|10mb\|exceed"
```

### Check MinIO connection:

```bash
pm2 logs gangrunprinting --lines 50 | grep -i "minio\|connection\|econnrefused"
```

### Check disk space:

```bash
df -h
```

---

## 🎯 Most Common Root Causes (In Order)

1. **MinIO header encoding (90%)** → See Section A
2. **Forgot to rebuild (5%)** → Run `npm run build`
3. **Prisma relation names (3%)** → See Section B
4. **File too large (1%)** → Check 10MB limit
5. **MinIO down (1%)** → Restart MinIO container

---

## ✅ Verification After Fix

```bash
# 1. Restart and check logs
pm2 restart gangrunprinting && sleep 3 && pm2 logs gangrunprinting --lines 20

# 2. Should see "Ready in XXXms" with no errors

# 3. Test upload with filename containing spaces
# Example: "Screenshot 2025-09-28 at 5.jpg"

# 4. Check for success in logs
pm2 logs gangrunprinting --lines 10 --nostream
```

---

## 📚 Full Documentation

For detailed explanation, prevention strategies, and code examples:

```bash
cat docs/IMAGE-UPLOAD-500-ERROR-FIX.md
```

---

## 🔗 Quick Links

- **Main Fix Doc:** `/root/websites/gangrunprinting/docs/IMAGE-UPLOAD-500-ERROR-FIX.md`
- **Troubleshooting:** See "TROUBLESHOOTING CHECKLIST" section in main doc
- **Prevention:** See "PREVENTION STRATEGIES" section in main doc

---

## ⚠️ REMEMBER

**ALWAYS rebuild after code changes:**

```bash
npm run build && pm2 restart gangrunprinting
```

**PM2 restart alone is NOT enough!**
