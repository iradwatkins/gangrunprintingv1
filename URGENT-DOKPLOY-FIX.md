# 🚨 URGENT: Fix 502 Error - Deploy via Dokploy NOW

## ⚡ Quick Fix Steps (5 minutes)

### 1️⃣ Open Dokploy Dashboard
**URL:** http://72.60.28.175:3000
**Login:** Use your Dokploy credentials

### 2️⃣ Create/Update Application
Navigate to **gangrunprinting** project → **Applications**

If app exists, click it. If not, click **"Create Application"**

### 3️⃣ Configure Application Settings
```
Name: gangrunprinting-app
Repository: https://github.com/iradwatkins/gangrunprinting.git  
Branch: main
Build Command: npm ci && npm run build
Start Command: npm start
Port: 3000
```

### 4️⃣ Add Environment Variables (CRITICAL!)
Click **Environment Variables** tab and add:

```bash
# MINIMUM REQUIRED FOR APP TO START
DATABASE_URL=postgresql://gangrun_user:YOUR_PASSWORD@gangrun-postgres:5432/gangrun_db
AUTH_SECRET=GENERATE_32_CHAR_SECRET_HERE_NOW
NEXTAUTH_URL=https://gangrunprinting.com
AUTH_GOOGLE_ID=YOUR_GOOGLE_OAUTH_ID
AUTH_GOOGLE_SECRET=YOUR_GOOGLE_OAUTH_SECRET
ADMIN_EMAIL=iradwatkins@gmail.com
```

### 5️⃣ Create PostgreSQL Service (if not exists)
**Services** → **Create Service** → **PostgreSQL**
```
Name: gangrun-postgres
Database: gangrun_db
User: gangrun_user  
Password: [Generate secure password]
```

### 6️⃣ Configure Domain
In application **Domains** tab:
- Add: `gangrunprinting.com`
- Enable SSL ✅
- Certificate: Let's Encrypt

### 7️⃣ Deploy Now!
1. Click **"Deploy"** button
2. Watch logs for "Build successful"
3. Wait for "Container started"

### 8️⃣ Initialize Database
Once deployed, open **Terminal** in Dokploy:
```bash
npx prisma migrate deploy
npx tsx scripts/seed-all-data.ts
```

## ✅ Success Check
Visit: https://gangrunprinting.com
- Should load without 502 error
- Login with iradwatkins@gmail.com
- Should redirect to /admin/dashboard

## 🔴 If Still Getting 502:
1. Check Dokploy logs for errors
2. Verify DATABASE_URL is correct
3. Ensure container is running
4. Check port is 3000 in all configs

## 📱 Quick Support
- Port issue fixed ✅ (was 3003, now 3000)
- Docker-compose removed ✅ (must use Dokploy only)
- Latest code pushed to GitHub ✅

**Deploy through Dokploy NOW to fix the 502 error!**