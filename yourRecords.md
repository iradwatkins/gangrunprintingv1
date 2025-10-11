# GangRun Printing - Development Records

This file contains important fixes, configurations, and solutions for recurring issues.

---

## 2025-09-21: Critical Server Instability and Upload Fix

### Problem

- **Server crashing constantly** - 183 PM2 restarts
- **Image uploads failing** - ERR_CONNECTION_CLOSED for files >1MB
- **Port conflicts** - Multiple processes fighting for port 3002

### Quick Fix Commands

```bash
# If server is unstable, run these commands:
pm2 stop gangrunprinting
fuser -k 3002/tcp
rm -rf .next
npm run build
pm2 start ecosystem.config.js
```

### Key Issues Found

1. **IPv6 vs IPv4 binding** - Server was on :::3002, nginx needed 0.0.0.0:3002
2. **Cached Prisma errors** - .next had old compiled code with wrong field names
3. **No graceful shutdown** - Server couldn't release port properly
4. **PM2 cluster mode** - Incompatible with custom server.js

### Permanent Solutions

1. **Updated server.js** - Added port checking, graceful shutdown, IPv4 binding
2. **Created ecosystem.config.js** - Proper PM2 configuration with fork mode
3. **Fixed Prisma queries** - Changed to plural field names (addOnSetItems, etc.)
4. **Set body size limits** - 20MB limit for uploads

### Files to Check if Issues Return

- `/root/websites/gangrunprinting/server.js` - Custom server configuration
- `/root/websites/gangrunprinting/ecosystem.config.js` - PM2 configuration
- `/root/websites/gangrunprinting/src/app/api/products/simple/route.ts` - Prisma queries
- `/root/websites/gangrunprinting/.next` - Delete this if Prisma errors persist

### Monitoring

```bash
pm2 status gangrunprinting  # Should show <5 restarts
pm2 logs gangrunprinting --lines 50  # Check for errors
netstat -tlnp | grep 3002  # Should show 0.0.0.0:3002
```

### Test Upload

```bash
curl -X POST http://localhost:3002/api/products/upload-image \
  -F "file=@/tmp/test-image.bin" -w "\nHTTP Status: %{http_code}\n"
# Should return 401 (unauthorized but working)
```

**Full documentation:** `/root/websites/gangrunprinting/docs/fixes/server-instability-fix-2025-09-21.md`

---

## Important Configuration Files

### PM2 Ecosystem (ecosystem.config.js)

- **exec_mode**: Must be 'fork' not 'cluster' for custom server
- **max_restarts**: 5 with exponential backoff
- **PORT**: 3002 (hardcoded in env)

### Server Configuration (server.js)

- **hostname**: '0.0.0.0' for IPv4 binding
- **Port check**: Prevents EADDRINUSE errors
- **Graceful shutdown**: SIGTERM/SIGINT handlers
- **Body limits**: 20MB for file uploads

### Nginx Configuration (/etc/nginx/sites-available/gangrunprinting)

- **client_max_body_size**: 20M
- **Proxy to**: localhost:3002
- **Extended timeouts**: 120s for uploads

---

## Common Issues and Solutions

### Port 3002 Already in Use

```bash
fuser -k 3002/tcp  # Force kill anything on port
pm2 restart gangrunprinting
```

### Prisma Field Errors After Schema Changes

```bash
rm -rf .next  # Clear build cache
npm run build  # Rebuild with new schema
pm2 restart gangrunprinting
```

### PM2 Constant Restarts

```bash
pm2 delete gangrunprinting
pm2 start ecosystem.config.js
pm2 save
```

### Upload Connection Closed

- Check server.js has body size limits
- Verify nginx client_max_body_size is 20M
- Ensure server is on 0.0.0.0:3002 not :::3002

---

## Emergency Recovery

If everything is broken:

```bash
# 1. Stop everything
pm2 stop all
pkill -f node
fuser -k 3002/tcp

# 2. Clean rebuild
cd /root/websites/gangrunprinting
rm -rf .next node_modules
npm install
npm run build

# 3. Start fresh
PORT=3002 pm2 start ecosystem.config.js --update-env
pm2 save
pm2 startup

# 4. Test
curl http://localhost:3002
```

---

## Database Credentials

- **Database**: gangrun_production
- **User**: gangrun_user
- **Connection**: PostgreSQL on localhost

## Service Ports

- **3002**: GangRun Printing (this app)
- **5432**: PostgreSQL
- **9000**: MinIO (file storage)
- **6379**: Redis (sessions)

---

_Last Updated: 2025-09-21_
_Updated By: Claude with critical stability fixes_
