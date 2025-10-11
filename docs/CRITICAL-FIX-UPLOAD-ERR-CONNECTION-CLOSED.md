# CRITICAL FIX: Upload ERR_CONNECTION_CLOSED Error

**Date Fixed:** 2025-09-27
**Severity:** CRITICAL
**Impact:** All file uploads failing with connection closed error

## 🚨 THE PROBLEM

Users experienced `net::ERR_CONNECTION_CLOSED` errors when uploading images to `/api/products/upload-image`. The connection would immediately close, preventing any file uploads from working.

## 🔍 ROOT CAUSE ANALYSIS (3 Core Issues)

### 1. **Next.js App Router Body Size Limit**

- **Default Limit:** 1MB (hardcoded in Next.js 15)
- **Issue:** Any upload > 1MB immediately closed connection
- **Why:** App Router doesn't respect Pages Router config

### 2. **PM2 Process Memory Constraints**

- **Default:** 1G max memory restart
- **Issue:** Process killed during large uploads
- **Why:** Image processing uses significant memory

### 3. **Timeout Cascade Failure**

- **Multiple Layers:** Route (15s), PM2 (15s), Node.js (default)
- **Issue:** Premature connection termination
- **Why:** Timeouts not synchronized across stack

## ✅ THE COMPLETE FIX

### Fix 1: Route Configuration

**File:** `/src/app/api/products/upload-image/route.ts`

```typescript
// CRITICAL FIXES APPLIED:
export const maxDuration = 60 // Increased from 15s
export const fetchCache = 'force-no-store'

// Add connection headers immediately
const headers = new Headers()
headers.set('Connection', 'keep-alive')
headers.set('Keep-Alive', 'timeout=60')

// Check request signal before parsing
if (request.signal?.aborted) {
  return createErrorResponse('Request aborted', 499, null, requestId)
}

// Increased timeout to 30s
setTimeout(() => reject(new Error('Form data parsing timeout')), 30000)
```

### Fix 2: Middleware Enhancement

**File:** `/middleware.ts`

```typescript
// CRITICAL: Prevent ERR_CONNECTION_CLOSED
requestHeaders.set('Connection', 'keep-alive')
requestHeaders.set('Keep-Alive', 'timeout=60')
requestHeaders.set('x-body-size-limit', '20mb')
requestHeaders.set('x-middleware-next', '1')

// Response headers
response.headers.set('Connection', 'keep-alive')
response.headers.set('Keep-Alive', 'timeout=60')
```

### Fix 3: PM2/Node.js Configuration

**File:** `/ecosystem.config.js`

```javascript
// CRITICAL UPLOAD FIXES:
max_memory_restart: '2G', // Increased from 1G
node_args: '--max-old-space-size=2048 --max-http-header-size=32768',

env: {
  NODE_OPTIONS: '--max-old-space-size=2048 --max-http-header-size=32768',
  SERVER_KEEPALIVE_TIMEOUT: '65000',
  SERVER_HEADERS_TIMEOUT: '66000',
},

kill_timeout: 60000,    // 60 seconds for graceful shutdown
listen_timeout: 30000,  // 30 seconds for app startup
wait_ready: true,       // Wait for app ready signal
```

## 🛡️ PREVENTION CHECKLIST

### Before Deployment

- [ ] Check `ecosystem.config.js` has 2G memory limit
- [ ] Verify `middleware.ts` has keep-alive headers
- [ ] Confirm route has 60s timeout
- [ ] Test with 8MB file upload

### After Updates

- [ ] Run: `node test-upload.js`
- [ ] Check PM2 logs for memory issues
- [ ] Monitor for connection resets

## 🧪 TEST COMMANDS

```bash
# Test upload functionality
node /root/websites/gangrunprinting/test-upload.js

# Check PM2 configuration
pm2 show gangrunprinting | grep -E "max_memory|node_args"

# Monitor memory usage
pm2 monit

# Check logs for errors
pm2 logs gangrunprinting --err --lines 50 | grep -E "ERR_|CLOSED|timeout"
```

## ⚠️ WARNING SIGNS

Watch for these indicators:

1. **PM2 Logs:** "Script exited with code 137" (memory kill)
2. **Browser:** "net::ERR_CONNECTION_CLOSED"
3. **API Response:** Connection reset before response
4. **Memory:** Process using > 1.5G RAM

## 🔧 QUICK FIX IF ISSUE RETURNS

```bash
# Emergency fix sequence
pm2 delete gangrunprinting
pm2 start ecosystem.config.js
pm2 save

# Verify fix
curl -X POST http://localhost:3002/api/products/upload-image \
  -F "file=@/path/to/test-image.jpg" \
  -H "Cookie: auth_session=test"
```

## 📋 PERMANENT SOLUTION REQUIREMENTS

1. **Next.js Config:** Cannot use `api.bodyParser.sizeLimit` in App Router
2. **Middleware:** Must handle connection headers manually
3. **PM2:** Must have sufficient memory allocation
4. **Node.js:** Must have increased header size limits

## 🚨 DO NOT REMOVE OR MODIFY

These settings are CRITICAL for upload functionality:

- `max_memory_restart: '2G'` in ecosystem.config.js
- `Connection: 'keep-alive'` headers in middleware.ts
- `maxDuration = 60` in upload route
- `NODE_OPTIONS` environment variables

## 📝 NOTES

- This issue is specific to Next.js 15 App Router
- Pages Router would use different configuration
- MinIO errors in logs are separate issue (credentials)
- Solution tested with files up to 8MB successfully
