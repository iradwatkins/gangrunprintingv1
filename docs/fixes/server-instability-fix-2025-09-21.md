# Server Instability and Upload Connection Fix
**Date:** 2025-09-21
**Issue:** Server experiencing constant restarts (183 times) and image uploads failing with ERR_CONNECTION_CLOSED

## Problem Summary

### 1. Image Upload Issues
- Uploads larger than 1MB were failing with `ERR_CONNECTION_CLOSED`
- Next.js default body size limit (1MB) was causing connections to drop
- Nginx was configured correctly but Next.js server wasn't

### 2. Server Instability
- PM2 showing 183 restarts in crash loop
- Port 3002 conflicts with multiple processes
- Old cached Prisma errors in compiled .next files
- No graceful shutdown handling

## Root Causes Identified

### Port Conflicts (EADDRINUSE)
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3002
```
- Multiple `next-server` processes from previous deployments
- PM2 trying to restart while old process hadn't released port
- Server listening on IPv6 only (:::3002) while nginx expecting IPv4

### Prisma Query Errors
```
Unknown field `AddOnSetItem` for include statement on model `AddOnSet`
```
- Field names were incorrect in `/api/products/simple/route.ts`
- Should be plural: `addOnSetItems`, `turnaroundTimeSetItems`, `paperStockSetItems`
- Even though source was fixed, .next build cache had old compiled code

### Configuration Issues
- No port availability check before starting
- No graceful shutdown handlers (SIGTERM/SIGINT)
- PM2 using cluster mode (incompatible with custom server.js)
- No exponential backoff for restart attempts

## Solutions Implemented

### 1. Fixed Upload Size Limits

#### Updated server.js
```javascript
// Initialize Next.js app with increased body parser limit
const app = next({
  dev,
  hostname,
  port,
  conf: {
    experimental: {
      serverActions: {
        bodySizeLimit: '20mb'
      }
    }
  }
})

// Increase server limits for file uploads
server.maxHeadersCount = 100
server.headersTimeout = 120000 // 2 minutes
server.requestTimeout = 120000 // 2 minutes
server.timeout = 120000 // 2 minutes
```

### 2. Fixed IPv4/IPv6 Binding
```javascript
const hostname = '0.0.0.0'  // Listen on all interfaces (was 'localhost')
```

### 3. Added Graceful Shutdown and Port Checking
```javascript
// Check if port is already in use
const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    const tester = createServer()
      .once('error', err => {
        if (err.code === 'EADDRINUSE') {
          console.error(`Port ${port} is already in use`)
          reject(err)
        }
      })
      .once('listening', () => {
        tester.close(() => resolve())
      })
      .listen(port, hostname)
  })
}

// Graceful shutdown handler
const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing server gracefully...')
  if (server) {
    server.close(() => {
      console.log('Server closed')
      process.exit(0)
    })
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down')
      process.exit(1)
    }, 10000)
  }
}

// Register shutdown handlers
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
```

### 4. Fixed Prisma Queries
Changed in `/api/products/simple/route.ts`:
- `AddOnSetItem` → `addOnSetItems`
- `TurnaroundTimeSetItem` → `turnaroundTimeSetItems`
- `PaperStockSetItem` → `paperStockSetItems`

### 5. Created PM2 Ecosystem Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'gangrunprinting',
    script: 'server.js',
    cwd: '/root/websites/gangrunprinting',
    instances: 1,
    exec_mode: 'fork',  // Important: not cluster mode
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 5,
    restart_delay: 4000,
    exp_backoff_restart_delay: 100,
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    kill_timeout: 10000,
    listen_timeout: 10000
  }]
}
```

## Step-by-Step Recovery Process

### 1. Kill All Conflicting Processes
```bash
pm2 stop gangrunprinting
pkill -f "next-server"
pkill -f "next start"
fuser -k 3002/tcp
```

### 2. Clean Build Cache
```bash
rm -rf .next
npm run build
```

### 3. Delete and Recreate PM2 Process
```bash
pm2 delete gangrunprinting
pm2 start ecosystem.config.js
pm2 save
```

## Verification Steps

### Check Server Status
```bash
pm2 status gangrunprinting
# Should show minimal restarts (<5)

netstat -tlnp | grep 3002
# Should show: tcp 0.0.0.0:3002 (IPv4 binding)
```

### Test Upload Endpoint
```bash
# Create test file
dd if=/dev/zero of=/tmp/test-image.bin bs=1M count=5

# Test upload
curl -X POST http://localhost:3002/api/products/upload-image \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/tmp/test-image.bin" \
  -w "\nHTTP Status: %{http_code}\n"

# Should return: HTTP Status: 401 (unauthorized, but connection works)
```

## Results

### Before Fix
- 183 PM2 restarts
- ERR_CONNECTION_CLOSED on uploads >1MB
- Port conflicts causing crash loops
- IPv6 only binding

### After Fix
- Stable with <12 restarts (during configuration)
- Uploads up to 20MB working
- Graceful shutdown handling
- IPv4 binding for nginx compatibility

## Prevention Measures

1. **Always use ecosystem.config.js** for PM2 deployments
2. **Clean build cache** when fixing Prisma schema issues
3. **Check port availability** before starting servers
4. **Use fork mode** for custom server.js with PM2
5. **Implement graceful shutdown** handlers
6. **Test with large files** after deployment

## Quick Recovery Commands

If issues resurface, run:
```bash
# Emergency recovery
pm2 stop gangrunprinting
fuser -k 3002/tcp
rm -rf .next
npm run build
pm2 start ecosystem.config.js
```

## Related Files Modified

1. `/root/websites/gangrunprinting/server.js` - Added graceful shutdown, port checking, IPv4 binding
2. `/root/websites/gangrunprinting/src/app/api/products/simple/route.ts` - Fixed Prisma field names
3. `/root/websites/gangrunprinting/src/app/api/products/upload-image/route.ts` - Documentation updated
4. `/root/websites/gangrunprinting/ecosystem.config.js` - Created PM2 configuration
5. `/root/websites/gangrunprinting/next.config.mjs` - Already had 20mb limit in serverActions

## Monitoring Commands

```bash
# Check PM2 logs
pm2 logs gangrunprinting --lines 50

# Check restart count
pm2 show gangrunprinting | grep restarts

# Monitor in real-time
pm2 monit

# Check port usage
netstat -tlnp | grep 3002
```

## Notes

- The server was trying to bind to IPv6 only (:::3002) which nginx couldn't connect to
- PM2 cluster mode is incompatible with custom server.js - must use fork mode
- Always clean .next directory after fixing Prisma schema issues as compiled JS is cached
- The upload endpoint now properly handles files up to 20MB as configured