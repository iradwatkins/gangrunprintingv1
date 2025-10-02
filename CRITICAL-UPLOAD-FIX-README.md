# ⚠️ CRITICAL: Image Upload 500 Error - Quick Fix Guide

**If you see upload 500 errors, START HERE.**

---

## 🚨 THE PROBLEM

**Symptom:** Products won't create, images won't upload, 500 errors in console

**Root Cause:** HTTP headers can't contain spaces or special characters

**Common Trigger:** Uploading files like `"Screenshot 2025-09-28 at 5.jpg"` (filename has spaces)

---

## ⚡ INSTANT FIX (30 seconds)

```bash
# 1. Check if it's the header issue (90% of cases)
pm2 logs gangrunprinting --lines 20 | grep "Invalid character in header"

# 2. If you see that error, rebuild and restart:
cd /root/websites/gangrunprinting
npm run build && pm2 restart gangrunprinting

# 3. Test again - should work now
```

---

## 📖 FULL DOCUMENTATION

### Quick Check (1 minute):
```bash
cat docs/UPLOAD-ERRORS-QUICK-CHECK.md
```

### Complete Fix Guide (5 minutes):
```bash
cat docs/IMAGE-UPLOAD-500-ERROR-FIX.md
```

---

## 🔍 WHERE THE FIX IS

**File:** `/root/websites/gangrunprinting/src/lib/minio-products.ts`
**Lines:** 74-88
**Function:** `sanitizeHeaderValue()` - removes spaces and special chars

```typescript
const sanitizeHeaderValue = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, '_').replace(/\s+/g, '_')
```

---

## ✅ HOW TO VERIFY IT'S FIXED

```bash
# 1. Check the function exists
grep "sanitizeHeaderValue" src/lib/minio-products.ts

# 2. Verify build is fresh
stat -c %y .next/BUILD_ID src/lib/minio-products.ts
# BUILD_ID should be NEWER

# 3. No MinIO errors in logs
pm2 logs gangrunprinting --lines 30 --nostream | grep -i minio
# Should see NO "Invalid character" errors
```

---

## 🎓 LEARN FROM THIS

**This is a RECURRING issue. Commit to memory:**

1. ✅ **HTTP headers = ASCII only, NO spaces**
2. ✅ **Always sanitize user input before headers**
3. ✅ **Always rebuild after code changes** (`npm run build`)
4. ✅ **Check this fix FIRST for upload errors**

---

## 🔗 FILES CREATED

1. **Main Documentation:**
   `/root/websites/gangrunprinting/docs/IMAGE-UPLOAD-500-ERROR-FIX.md`

2. **Quick Checklist:**
   `/root/websites/gangrunprinting/docs/UPLOAD-ERRORS-QUICK-CHECK.md`

3. **This File:**
   `/root/websites/gangrunprinting/CRITICAL-UPLOAD-FIX-README.md`

---

## 📞 QUICK HELP

**"It's still not working!"**

1. Did you rebuild? `npm run build`
2. Did you restart? `pm2 restart gangrunprinting`
3. Is MinIO running? `docker ps | grep minio`
4. Check full docs: `cat docs/IMAGE-UPLOAD-500-ERROR-FIX.md`

---

**Last Updated:** October 1, 2025
**Fix Applied By:** Claude
