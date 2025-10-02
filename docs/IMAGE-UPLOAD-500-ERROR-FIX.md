# Critical Fix: Image Upload 500 Errors - MinIO Header Encoding Issue

**Date Fixed:** October 1, 2025
**Severity:** HIGH - Blocks all product creation and image uploads
**Recurrence:** This is a RECURRING issue - check this FIRST for any upload errors

---

## 🚨 SYMPTOMS

### User Reports:
- "Failed to load resource: the server responded with a status of 500"
- "POST /api/products/upload-image 500 (Internal Server Error)"
- "Image not uploading and storing to database"
- Products cannot be created
- Images fail to upload

### Server Logs Show:
```
[WARN] MinIO operation retry 1/3 {
  "operation":"Upload file products/thumbnail/...",
  "error":"Invalid character in header content [\"x-amz-meta-original-name\"]"
}
```

---

## 🔍 ROOT CAUSE

**HTTP headers can only contain ASCII characters and NO SPACES.**

When filenames contain spaces or special characters (like `"Screenshot 2025-09-28 at 5.jpg"`), they were being passed **directly** to MinIO HTTP headers without sanitization:

```typescript
// ❌ BROKEN CODE - Direct filename in header
const baseMetadata = {
  'x-amz-meta-original-name': fileName,  // Contains spaces!
  'x-amz-meta-product-name': productName,  // May contain special chars
}
```

MinIO rejects these headers, causing:
1. Image upload fails with 500 error
2. Product creation fails (depends on image)
3. Retry mechanism triggers 3x but still fails

---

## ✅ THE FIX

### File: `/root/websites/gangrunprinting/src/lib/minio-products.ts`

**Location:** Lines 74-88 (in `uploadProductImage` function)

```typescript
// Prepare upload metadata
// HTTP headers must only contain ASCII characters and no spaces or special chars
// Sanitize metadata values by replacing invalid characters with underscores
const sanitizeHeaderValue = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, '_').replace(/\s+/g, '_')

const baseMetadata = {
  'x-amz-meta-original-name': sanitizeHeaderValue(fileName),
  'x-amz-meta-upload-timestamp': timestamp.toString(),
  'x-amz-meta-product-name': sanitizeHeaderValue(productName || 'Unknown'),
  'x-amz-meta-category': sanitizeHeaderValue(categoryName || 'Unknown'),
  'x-amz-meta-profile': productProfile,
  'x-amz-meta-compression-ratio': processed.metadata.compressionRatio.toFixed(3),
  'x-amz-meta-original-size': processed.metadata.originalSize.toString(),
  'Cache-Control': 'public, max-age=31536000, immutable',
}
```

### What `sanitizeHeaderValue` Does:
1. **Removes non-ASCII chars:** `/[^\x20-\x7E]/g` → replaces with `_`
2. **Removes all spaces:** `/\s+/g` → replaces with `_`
3. **Example:** `"Screenshot 2025.jpg"` → `"Screenshot_2025.jpg"`

---

## 🔧 ADDITIONAL FIXES APPLIED

### 1. Prisma Relation Name Mismatch
**File:** `/root/websites/gangrunprinting/src/app/api/products/upload-image/route.ts`

```typescript
// ❌ WRONG - PascalCase (TypeScript type name)
ProductCategory: true,
ProductImage: { ... }

// ✅ CORRECT - camelCase (Prisma relation name)
productCategory: true,
productImages: { ... }
```

**Why it matters:** Prisma schema defines relations in camelCase, but the code was using PascalCase (the TypeScript type names), causing Prisma validation errors.

### 2. Outdated Prisma Client
- Schema was modified Oct 1, 2025
- Client was generated Sep 28, 2025
- **Solution:** Always run `npx prisma generate` after schema changes

---

## 🚀 DEPLOYMENT STEPS (MANDATORY)

After making the fix, you **MUST** rebuild and restart:

```bash
cd /root/websites/gangrunprinting

# 1. Regenerate Prisma client (if schema changed)
npx prisma generate

# 2. Rebuild Next.js (REQUIRED - changes won't work without this)
npm run build

# 3. Restart PM2
pm2 restart gangrunprinting

# 4. Verify logs
pm2 logs gangrunprinting --lines 20
```

**⚠️ WARNING:** Simply restarting PM2 WITHOUT rebuilding will NOT fix the issue! Next.js serves cached builds.

---

## 🧪 HOW TO TEST

1. **Upload image with spaces in filename:**
   - Try: `"Screenshot 2025-09-28 at 5.jpg"`
   - Should work without errors

2. **Check PM2 logs:**
   ```bash
   pm2 logs gangrunprinting --lines 50 | grep -i "minio\|error"
   ```
   - Should see NO "Invalid character in header content" errors

3. **Verify database:**
   ```sql
   SELECT * FROM "ProductImage" ORDER BY "createdAt" DESC LIMIT 5;
   ```
   - Should see newly uploaded images

4. **Check MinIO storage:**
   - Images should be in `gangrun-products` bucket
   - All 5 versions: optimized, large, medium, thumbnail, webp

---

## 📋 TROUBLESHOOTING CHECKLIST (Run This FIRST)

When you see upload 500 errors, check in this order:

### ✅ Step 1: Check MinIO Logs
```bash
pm2 logs gangrunprinting --lines 100 | grep -i minio
```
**Look for:** "Invalid character in header content"

### ✅ Step 2: Verify Sanitization Function
```bash
cd /root/websites/gangrunprinting
grep -A 2 "sanitizeHeaderValue" src/lib/minio-products.ts
```
**Should see:** The `replace()` functions for spaces and special chars

### ✅ Step 3: Check Prisma Relations
```bash
grep -E "productCategory|productImages" src/app/api/products/upload-image/route.ts
```
**Should be:** camelCase, NOT PascalCase

### ✅ Step 4: Verify Build is Fresh
```bash
stat -c %y .next/BUILD_ID prisma/schema.prisma src/lib/minio-products.ts
```
**BUILD_ID should be NEWER than source files**

### ✅ Step 5: Rebuild if Needed
```bash
npm run build && pm2 restart gangrunprinting
```

---

## 🎯 PREVENTION STRATEGIES

### 1. Add Linting Rule
Add ESLint rule to catch direct header assignments:

```javascript
// .eslintrc.js
rules: {
  'no-restricted-syntax': [
    'error',
    {
      selector: "Property[key.value=/x-amz-meta/]",
      message: "MinIO headers must be sanitized. Use sanitizeHeaderValue()."
    }
  ]
}
```

### 2. Add Unit Tests
```typescript
// tests/minio-sanitization.test.ts
describe('MinIO header sanitization', () => {
  it('should remove spaces from filenames', () => {
    const result = sanitizeHeaderValue('Screenshot 2025.jpg')
    expect(result).toBe('Screenshot_2025.jpg')
  })

  it('should remove special characters', () => {
    const result = sanitizeHeaderValue('Product™ Image®.png')
    expect(result).toBe('Product__Image_.png')
  })
})
```

### 3. Add Pre-commit Hook
```bash
# .husky/pre-commit
npm run lint
npm run typecheck
```

---

## 📚 RELATED ISSUES

### Similar Problems to Watch For:
1. **Any MinIO upload operation** using custom metadata
2. **File operations with user-provided filenames**
3. **HTTP headers containing dynamic content**

### Other Upload Libraries That May Have Same Issue:
- AWS S3 SDK (use `encodeURIComponent()`)
- Azure Blob Storage
- Google Cloud Storage

---

## 🔗 REFERENCES

- [HTTP Header Spec (RFC 7230)](https://tools.ietf.org/html/rfc7230#section-3.2)
- [MinIO Metadata Documentation](https://min.io/docs/minio/linux/developers/javascript/API.html)
- [Next.js Build & Deploy](https://nextjs.org/docs/deployment)

---

## 📝 CHANGE LOG

| Date | Change | Author |
|------|--------|--------|
| 2025-10-01 | Initial fix - Added sanitizeHeaderValue() | Claude |
| 2025-10-01 | Fixed Prisma relation names | Claude |
| 2025-10-01 | Created this documentation | Claude |

---

## ⚠️ CRITICAL REMINDER

**THIS IS A RECURRING ISSUE.**

When ANY upload error occurs:
1. ✅ Check this document FIRST
2. ✅ Look for MinIO header errors in logs
3. ✅ Verify sanitization is in place
4. ✅ Always rebuild after code changes

**DO NOT skip the rebuild step!**
