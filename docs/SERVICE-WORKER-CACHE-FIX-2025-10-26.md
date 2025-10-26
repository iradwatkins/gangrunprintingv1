# SERVICE WORKER CACHE FIX - October 26, 2025

## 🚨 CRITICAL ISSUE: Service Worker Caching Old Files

### **Problem:**
Service worker was caching Next.js build files (CSS, JS), causing:
- **CSS MIME Type Error:** Browser trying to execute CSS as JavaScript
- **Stale Files:** Old CSS/JS served even after deployments
- **Connection Errors:** Service worker issues with outdated cache

### **Root Cause:**
`public/sw.js` was using cache-first strategy for ALL files, including:
- `/_next/static/css/*.css`
- `/_next/static/chunks/*.js`
- Other Next.js build artifacts

When Next.js builds, it generates new files with new hashes (e.g., `21248b5bbaf20ec3.css`). But the service worker was serving the OLD cached version.

---

## ✅ FIXES APPLIED

### **Fix 1: Update Cache Version**
**File:** `public/sw.js` (Line 3)

**Before:**
```javascript
const CACHE_NAME = 'gangrun-printing-v1'
```

**After:**
```javascript
const CACHE_NAME = 'gangrun-printing-v2-20251026'
```

**Effect:** Forces all browsers to invalidate old cache and fetch fresh files

---

### **Fix 2: Bypass Cache for Next.js Build Files**
**File:** `public/sw.js` (Lines 38-49)

**Added Logic:**
```javascript
// CRITICAL FIX: Never cache Next.js build files
const url = new URL(event.request.url)
if (url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.js') ||
    url.pathname.includes('.json')) {
  // Always fetch fresh for Next.js build assets
  event.respondWith(fetch(event.request))
  return
}
```

**Effect:** Next.js files ALWAYS fetched fresh, never cached

---

## 🔧 FOR USERS: Clear Service Worker Cache

### **Method 1: Hard Refresh (Recommended)**
1. Open `https://gangrunprinting.com`
2. Press:
   - **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
   - **Mac:** `Cmd + Shift + R`
3. This forces browser to bypass cache and fetch fresh files

---

### **Method 2: Chrome DevTools (Complete Clear)**
1. Open `https://gangrunprinting.com`
2. Press `F12` to open DevTools
3. Go to **Application** tab
4. Left sidebar: **Service Workers**
5. Click **"Unregister"** next to service worker
6. Left sidebar: **Cache Storage**
7. Right-click each cache → **Delete**
8. Close DevTools
9. Hard refresh the page (`Ctrl + Shift + R`)

---

### **Method 3: Clear Site Data (Nuclear Option)**
1. Open Chrome Settings
2. Go to **Privacy and Security** → **Site Settings**
3. Search for `gangrunprinting.com`
4. Click **"Clear data"**
5. Refresh page

---

## 🧪 VERIFICATION

After clearing cache, check:

1. **No CSS MIME Type Errors:**
   ```
   F12 → Console → Should see NO errors about CSS/MIME types
   ```

2. **Service Worker Updated:**
   ```
   F12 → Application → Service Workers → Should show "activated and is running"
   ```

3. **Cache Version:**
   ```
   F12 → Application → Cache Storage → Should show "gangrun-printing-v2-20251026"
   ```

4. **No Connection Errors:**
   ```
   F12 → Console → Should see NO "Could not establish connection" errors
   ```

---

## 🚀 DEPLOYMENT PROCESS

### **For Future Deployments:**

**Before Every Deployment:**
1. Bump cache version in `public/sw.js`:
   ```javascript
   const CACHE_NAME = 'gangrun-printing-v3-YYYYMMDD'
   ```
2. Commit and push
3. Deploy

**This Forces All Browsers To:**
- Uninstall old service worker
- Install new service worker
- Clear old cache
- Fetch fresh files

---

## 📊 MONITORING

**Watch for these issues:**
1. CSS MIME type errors in browser console
2. "Could not establish connection" errors
3. Stale CSS/JS after deployments
4. Service worker activation failures

**Analytics to track:**
- Service worker install success rate
- Service worker activation success rate
- Cache hit/miss rates for build assets

---

## 🎯 WHY THIS HAPPENED

### **Original Design:**
Service worker was designed for **offline-first PWA functionality** with aggressive caching for performance.

### **Problem:**
Next.js generates new build files on EVERY deployment with different hashes:
- `21248b5bbaf20ec3.css` (old build)
- `a7f3d8e9c1b5a2f4.css` (new build)

The service worker kept serving the old `21248b5bbaf20ec3.css` even after new build deployed.

### **Solution:**
- **Static Content (images, fonts):** Cache aggressively ✅
- **Next.js Build Files (CSS, JS):** NEVER cache, always fetch fresh ✅

---

## 📝 COMMIT MESSAGE

```
FIX: Service Worker Caching Strategy - Bypass Next.js Build Files

## Summary
- Updated service worker cache version to force refresh
- Modified fetch handler to bypass cache for Next.js build files
- Prevents CSS MIME type errors from stale cached files
- Ensures fresh CSS/JS after every deployment

## Changes

### 1. Cache Version Bump
- File: public/sw.js
- Changed: CACHE_NAME from v1 to v2-20251026
- Effect: Forces all browsers to invalidate old cache

### 2. Bypass Cache for Build Files
- File: public/sw.js
- Added: Logic to detect and bypass /_next/static/* files
- Effect: Next.js CSS/JS always fetched fresh, never cached

## Root Cause
- Service worker was caching Next.js build files
- Old CSS files served even after new deployment
- Browser tried to execute CSS as JavaScript (MIME type error)

## Testing
- Service worker installs with new cache version
- Next.js files bypass cache and fetch fresh
- No more CSS MIME type errors

## Documentation
- Created: docs/SERVICE-WORKER-CACHE-FIX-2025-10-26.md
- Includes: User instructions for clearing cache
- Includes: Deployment process for future updates
```

---

## ⚠️ IMPORTANT NOTES

1. **Service Worker Updates Are Delayed:**
   - Users won't get the new service worker immediately
   - They need to refresh the page TWICE (first refresh installs, second activates)
   - Or close all tabs and reopen

2. **Cache Persistence:**
   - Service worker cache persists across browser restarts
   - Only cleared when cache version changes or manually cleared

3. **Testing Locally:**
   - Always test with DevTools → Application → Service Workers → "Update on reload" checked
   - This forces service worker to update on every refresh

---

## 🔗 RELATED DOCUMENTATION

- Next.js Service Worker Guide: https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps
- Service Worker Lifecycle: https://web.dev/service-worker-lifecycle/
- Cache API: https://developer.mozilla.org/en-US/docs/Web/API/Cache
