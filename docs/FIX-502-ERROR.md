# 🔧 Fix 502 Bad Gateway Error - GangRun Printing

## Quick Diagnosis Commands

SSH into your server first:

```bash
ssh root@72.60.28.175
# Password: Bobby321&Gloria321Watkins?
```

## Step 1: Check Container Status

```bash
# Check if containers are running
docker ps -a | grep gangrun

# If containers are not running, check logs
docker logs gangrunprinting-app
docker logs gangrunprinting-postgres
docker logs gangrunprinting-minio
```

## Step 2: Most Common Fixes

### A. Database Connection Issue (Most Likely)

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it through Dokploy or:
cd /var/lib/dokploy/projects/gangrunprinting
docker-compose -f docker-compose.dokploy.yml up -d gangrunprinting-postgres

# Wait 30 seconds for database to start
sleep 30

# Then start the app
docker-compose -f docker-compose.dokploy.yml up -d gangrunprinting-app
```

### B. Environment Variables Missing

```bash
# Check if .env file exists in Dokploy
cd /var/lib/dokploy/projects/gangrunprinting

# View current environment
docker exec gangrunprinting-app env | grep -E "DATABASE_URL|NEXTAUTH_URL|AUTH_SECRET"

# If missing, you need to add them in Dokploy UI
```

### C. Build Failed

```bash
# Rebuild the application
cd /var/lib/dokploy/projects/gangrunprinting

# Pull latest code
git pull origin main

# Rebuild through Docker
docker-compose -f docker-compose.dokploy.yml build --no-cache gangrunprinting-app

# Start fresh
docker-compose -f docker-compose.dokploy.yml up -d
```

## Step 3: Through Dokploy UI (Easiest)

1. **Login to Dokploy**: https://72.60.28.175:3000

2. **Find GangRun Project**:
   - Go to Projects → gangrunprinting
   - Check the status of each service

3. **Check Application Logs**:
   - Click on the app service
   - View logs to see specific error

4. **Common Dokploy Fixes**:
   - Click "Restart" on the application
   - Click "Redeploy" if restart doesn't work
   - Check "Environment Variables" tab - ensure all are set

## Step 4: Required Environment Variables

Make sure these are set in Dokploy:

```env
# Critical for startup
DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure!@gangrunprinting-postgres:5432/gangrun_db
NEXTAUTH_URL=https://gangrunprinting.com
AUTH_SECRET=[generate with: openssl rand -base64 32]

# Square (can use sandbox for testing)
SQUARE_ACCESS_TOKEN=EAAAl2BAJUi5Neov0Jo8SuYwyO-PPsl0EmpE59Wy-3hjfQIVW4-aBJo06T31ogBK
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=LZN634J2MSXRY
SQUARE_APPLICATION_ID=sandbox-sq0idb-QEfYQ8wDBtv-IOfvQ237WA

# SendGrid
SENDGRID_API_KEY=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
SENDGRID_BILLING_EMAIL=Billing@gangrunprinting.com
SENDGRID_SUPPORT_EMAIL=Support@gangrunprinting.com

# MinIO (internal)
MINIO_ENDPOINT=gangrunprinting-minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=gangrun_admin
MINIO_SECRET_KEY=GangRunMinio2024!
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=gangrun-files
```

## Step 5: Database Migrations

If this is the first deployment:

```bash
# Enter the app container
docker exec -it gangrunprinting-app sh

# Run migrations
npx prisma migrate deploy

# Seed categories
npx tsx src/scripts/seed-categories.ts

# Exit container
exit
```

## Step 6: Check Traefik Routing

```bash
# Check if Traefik is routing correctly
docker logs traefik | grep gangrun

# Check labels on container
docker inspect gangrunprinting-app | grep -A 5 Labels
```

## Step 7: Quick Full Reset

If nothing else works:

```bash
# Stop everything
cd /var/lib/dokploy/projects/gangrunprinting
docker-compose -f docker-compose.dokploy.yml down

# Remove volumes (WARNING: loses data)
docker volume rm gangrunprinting_gangrunprinting-postgres-data

# Start fresh
docker-compose -f docker-compose.dokploy.yml up -d

# Wait for startup
sleep 60

# Run migrations
docker exec gangrunprinting-app npx prisma migrate deploy
```

## Step 8: Verify It's Working

```bash
# Test locally on server
curl -I http://localhost:3002

# Should return: HTTP/1.1 200 OK

# Test the health endpoint
curl http://localhost:3002/api/health

# Should return: {"status":"ok"}
```

## Common Error Messages and Solutions

| Error                        | Solution                               |
| ---------------------------- | -------------------------------------- |
| `ECONNREFUSED` to PostgreSQL | Database not running - start it first  |
| `Invalid AUTH_SECRET`        | Generate new secret and add to env     |
| `Cannot find module`         | Rebuild the container                  |
| `Prisma schema not found`    | Run `npx prisma generate` in container |
| `ENOENT: no such file`       | Pull latest code and rebuild           |

## Final Check

Once fixed, you should see:

- ✅ https://gangrunprinting.com loads
- ✅ No 502 error
- ✅ Login page appears
- ✅ Can navigate to /products

## Need More Help?

1. Check the detailed logs:

```bash
docker logs -f gangrunprinting-app --tail 100
```

2. Share the error message from the logs to identify the specific issue.

The 502 error usually means:

- App container isn't running
- Database connection failed
- Missing environment variables
- Build/compilation error

Most likely it's just that the app needs to be started or redeployed through Dokploy.
