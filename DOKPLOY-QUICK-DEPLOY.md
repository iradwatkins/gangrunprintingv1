# 🚨 DOKPLOY QUICK DEPLOY - FIX 502 NOW

## 🔴 THE PROBLEM
You're getting 502 because the app is NOT deployed in Dokploy. Traefik can't find the container.

## ✅ THE SOLUTION - Deploy via Dokploy NOW

### Step 1: Open Dokploy
**URL:** http://72.60.28.175:3000

### Step 2: Create/Update Application
1. Go to **gangrunprinting** project
2. Click **"Applications"** → **"Create Application"** (or update existing)

### Step 3: Application Settings
```
Name: gangrunprinting-app
Repository: https://github.com/iradwatkins/gangrunprinting.git
Branch: main
Build Command: npm ci && npm run build
Start Command: npm start
Port: 3000
```

### Step 4: Environment Variables (COPY ALL)
Go to **Environment Variables** tab and paste:
```bash
DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure@gangrun-postgres:5432/gangrun_db
AUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
NEXTAUTH_URL=https://gangrunprinting.com
NODE_ENV=production
AUTH_TRUST_HOST=true
ADMIN_EMAIL=iradwatkins@gmail.com

# Add your Google OAuth (from Google Cloud Console)
AUTH_GOOGLE_ID=YOUR_GOOGLE_CLIENT_ID
AUTH_GOOGLE_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Your existing Square credentials
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g

# Your SendGrid key
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=support@gangrunprinting.com
```

### Step 5: Create PostgreSQL Service
**Services** → **Create Service** → **PostgreSQL**
```
Name: gangrun-postgres
Database: gangrun_db
User: gangrun_user
Password: GangRun2024Secure
Version: 15
```

### Step 6: Configure Domain
In application **Domains** tab:
- Domain: `gangrunprinting.com`
- SSL: ✅ Enable
- Certificate: Let's Encrypt

### Step 7: DEPLOY!
1. Click **"Deploy"** button
2. Watch logs - should see "Build successful"
3. Wait for "Container started"

### Step 8: Initialize Database
After deploy succeeds, in Dokploy terminal:
```bash
npx prisma migrate deploy
npx tsx scripts/seed-all-data.ts
```

## 🎯 SUCCESS CHECK
- Visit: https://gangrunprinting.com (no more 502!)
- Login: iradwatkins@gmail.com
- Redirects to: /admin/dashboard

## 🔧 IF STILL 502
SSH to server and check:
```bash
ssh root@72.60.28.175
# Password: Bobby321&Gloria321Watkins?

# Check if container is running
docker ps | grep gangrun

# If no container, deploy failed - check Dokploy logs
docker logs dokploy --tail 50
```

## 📝 NOTES
- Port is fixed (was 3003, now 3000) ✅
- Docker-compose removed (Dokploy only) ✅  
- Latest code on GitHub ✅
- Just need to deploy via Dokploy UI!

**All environment variables are in `.env.dokploy` file for easy copy/paste!**