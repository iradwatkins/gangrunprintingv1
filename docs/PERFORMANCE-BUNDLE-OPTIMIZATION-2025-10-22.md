# Bundle Optimization & Performance Improvements

**Date**: October 22, 2025  
**Impact**: Reduce HTTP requests from 22 → ~10, improve Pingdom grade from B87 → A95+

---

## Problem Statement

**Pingdom Performance Test Results:**

- Grade: **B87** (held back by F24 score)
- Load Time: 800ms (excellent)
- Page Size: 435.9 KB (good)
- **Critical Issue**: F24 - Make Fewer HTTP Requests
  - 28 total requests
  - 22 JavaScript files (78% of requests)
  - Too many small chunks from aggressive code-splitting

**Root Cause:**
Next.js default configuration creates many small chunks for optimal caching granularity, but this increases HTTP requests and hurts performance scores.

---

## Solutions Implemented

### 1. Webpack Chunk Optimization ✅

**File**: `next.config.mjs` (lines 241-293)

**Strategy**: Configure webpack's SplitChunksPlugin to create fewer, larger chunks

**Implementation**:

```javascript
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    // Vendor chunk for all node_modules
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendor',
      priority: 10,
      reuseExistingChunk: true,
      enforce: true,
    },
    // UI libraries chunk (Radix, Lucide, etc.)
    ui: {
      test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
      name: 'ui',
      priority: 20,
      reuseExistingChunk: true,
    },
    // Form libraries chunk (React Hook Form, Zod)
    forms: {
      test: /[\\/]node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/,
      name: 'forms',
      priority: 20,
      reuseExistingChunk: true,
    },
    // Date/utility libraries
    utils: {
      test: /[\\/]node_modules[\\/](date-fns|lodash-es)[\\/]/,
      name: 'utils',
      priority: 20,
      reuseExistingChunk: true,
    },
    // Common chunks used across multiple pages
    commons: {
      name: 'commons',
      minChunks: 2,
      priority: 5,
      reuseExistingChunk: true,
    },
  },
  // Increase chunk size limits to create fewer chunks
  maxInitialRequests: 10, // Down from default 30
  maxAsyncRequests: 10,   // Down from default 30
  minSize: 40000,         // 40KB minimum (up from 20KB default)
  maxSize: 244000,        // 244KB maximum chunks
}
```

**Expected Impact**:

- 22 JavaScript chunks → ~10 chunks
- F24 score → A90+ score
- +66 points to overall grade

---

### 2. Package Import Optimization ✅

**File**: `next.config.mjs` (lines 27-50)

**Expanded** `optimizePackageImports` from 4 → 19 packages:

**Before** (4 packages):

```javascript
optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'date-fns', 'lodash-es']
```

**After** (19 packages):

```javascript
optimizePackageImports: [
  // UI component libraries (13 Radix UI packages)
  '@radix-ui/react-icons',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-select',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-tooltip',
  '@radix-ui/react-popover',
  '@radix-ui/react-accordion',
  '@radix-ui/react-label',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-slider',
  '@radix-ui/react-switch',
  'lucide-react',
  // Utility libraries
  'date-fns',
  'lodash-es',
  // Form libraries
  'react-hook-form',
  'zod',
]
```

**Impact**:

- Tree-shaking optimization for all Radix UI components
- Reduces unused code in bundles
- Smaller chunk sizes

---

### 3. Gzip Compression ✅

**File**: `next.config.mjs` (line 57)

**Added**:

```javascript
compress: true,
```

**Impact**:

- Automatic gzip compression for all text content
- B89 compression score → A95+ score
- ~70% reduction in transfer size for text files

---

### 4. Cache Headers (Already Configured) ✅

**File**: `next.config.mjs` (lines 112-197)

**Already optimal** - No changes needed:

```javascript
// Static files: 1-year cache
{
  source: '/_next/static/chunks/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
  ],
}
```

**Status**: B89 → A95+ (with gzip compression enabled)

---

## Expected Performance Improvements

### Pingdom Grade Breakdown

| Metric                     | Before  | After    | Improvement   |
| -------------------------- | ------- | -------- | ------------- |
| Make Fewer HTTP Requests   | F24     | A90+     | +66 points    |
| Compress Components (gzip) | B89     | A95+     | +6 points     |
| Add Expires Headers        | B89     | A95+     | +6 points     |
| **Overall Grade**          | **B87** | **A95+** | **+8 points** |

### Key Metrics

| Metric                   | Before | After  | Change |
| ------------------------ | ------ | ------ | ------ |
| Total HTTP Requests      | 28     | ~15    | -46%   |
| JavaScript Requests      | 22     | ~10    | -55%   |
| Page Load Time           | 800ms  | ~600ms | -25%   |
| First Contentful Paint   | 2.9s   | ~2.0s  | -31%   |
| Largest Contentful Paint | 4.2s   | ~3.0s  | -29%   |

---

## Chunk Strategy

### New Chunk Structure

**Named Chunks** (5 chunks):

1. **vendor.js** - All node_modules (general vendor code)
2. **ui.js** - Radix UI + Lucide icons + Tailwind utilities
3. **forms.js** - React Hook Form + Zod validation
4. **utils.js** - Date-fns + Lodash utilities
5. **commons.js** - Shared code across multiple pages

**Dynamic Chunks** (~5 chunks):

- Page-specific code
- Route-specific lazy-loaded components

**Total**: ~10 chunks (down from 22)

---

## Testing Verification

### Build Output Analysis

After running `npm run build`, verify:

1. **Chunk Count**:

   ```bash
   ls .next/static/chunks/*.js | wc -l
   # Expected: ~10 (down from 22)
   ```

2. **Named Chunks Present**:

   ```bash
   ls .next/static/chunks/ | grep -E "(vendor|ui|forms|utils|commons)"
   # Should show: vendor.js, ui.js, forms.js, utils.js, commons.js
   ```

3. **Chunk Sizes**:
   ```bash
   du -h .next/static/chunks/*.js | sort -h
   # Chunks should be 40KB-244KB each
   ```

### Performance Testing

1. **Pingdom Test**:
   - URL: https://tools.pingdom.com
   - Enter: https://gangrunprinting.com
   - Expected: Grade A95+, ~15 requests

2. **Lighthouse Test**:
   - Chrome DevTools → Lighthouse
   - Expected: Performance 90+, LCP <2.5s

3. **Real-World Testing**:
   - Chrome DevTools → Network tab
   - Count JavaScript files
   - Expected: ~10 JS files (down from 22)

---

## Rollback Instructions

If chunk optimization causes issues:

1. **Revert webpack config**:

   ```bash
   git log --oneline | grep "bundle optimization"
   git revert <commit-hash>
   ```

2. **Or manually remove**:
   - Open `next.config.mjs`
   - Remove `config.optimization.splitChunks` section (lines 241-292)
   - Keep only the server/client fallback code

3. **Rebuild**:
   ```bash
   npm run build
   docker-compose build app
   docker-compose up -d app
   ```

---

## Related Files

### Modified Files

- `next.config.mjs` - Bundle optimization, compression, package imports

### Documentation

- `PERFORMANCE-WORK-COMPLETED.md` - Complete task list
- `docs/PERFORMANCE-OPTIMIZATION-SUMMARY.md` - Executive summary
- `docs/PERFORMANCE-OPTIMIZATION-COMPLETE-2025-10-22.md` - Full report
- `docs/PERFORMANCE-BUNDLE-OPTIMIZATION-2025-10-22.md` - This file

---

## Deployment

### Production Deployment

1. **Build optimized bundle**:

   ```bash
   npm run build
   ```

2. **Rebuild Docker container**:

   ```bash
   docker-compose build app
   docker-compose up -d app
   ```

3. **Verify in production**:
   ```bash
   curl -I https://gangrunprinting.com/_next/static/chunks/vendor.js
   # Check for: Content-Encoding: gzip
   # Check for: Cache-Control: public, max-age=31536000
   ```

### Monitoring

**Week 1**:

- Run daily Pingdom tests
- Monitor Lighthouse scores
- Check browser Network tab for chunk count

**Week 2-4**:

- Monitor Core Web Vitals in Google Search Console
- Check for any JavaScript errors (chunking issues)
- Verify cache hit rates for new chunks

---

## Key Takeaways

1. **Fewer, Larger Chunks** - Better for HTTP/1.1 connections (most users)
2. **Named Chunks** - Easier debugging and cache management
3. **Optimal Size Range** - 40KB-244KB balances requests vs. cache granularity
4. **Compression Essential** - 70% size reduction for text files
5. **Long Cache TTL** - 1-year cache for immutable static assets

---

**Status**: ✅ IMPLEMENTED  
**Next Test**: Pingdom test after deployment  
**Expected Result**: Grade A95+, ~15 total requests  
**Deployment Date**: October 22, 2025
