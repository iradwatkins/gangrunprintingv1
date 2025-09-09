# 🚀 DEPLOYMENT INSTRUCTIONS FOR DOKPLOY

## 📋 STEP-BY-STEP DEPLOYMENT GUIDE

### Step 1: Access Dokploy
1. Open browser and go to: **http://72.60.28.175:3000**
2. Login with your Dokploy credentials

### Step 2: Navigate to GangRun Printing Project
1. Click on **"gangrunprinting"** project in Dokploy dashboard
2. If project doesn't exist, create new project named "gangrunprinting"

### Step 3: Configure Application
Click on "Settings" or "Create Application" and enter:

```
Repository: https://github.com/iradwatkins/gangrunprinting.git
Branch: main
Build Command: npm ci && npm run build
Start Command: npm start
Port: 3000
```

### Step 4: Add Environment Variables
Go to "Environment Variables" tab and add ALL of these:

```bash
# CRITICAL - Must be set correctly
DOMAIN=gangrunprinting.com
NEXTAUTH_URL=https://gangrunprinting.com
DATABASE_URL=postgresql://gangrun_user:YOUR_PASSWORD@postgres:5432/gangrun_db
AUTH_SECRET=GENERATE_32_CHAR_SECRET_HERE

# Google OAuth (from Google Cloud Console)
AUTH_GOOGLE_ID=YOUR_GOOGLE_CLIENT_ID
AUTH_GOOGLE_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Admin User
ADMIN_EMAIL=iradwatkins@gmail.com

# Other services (can be added later)
SENDGRID_API_KEY=YOUR_KEY
SQUARE_ACCESS_TOKEN=YOUR_TOKEN
```

### Step 5: Create PostgreSQL Database
1. Go to "Services" in Dokploy
2. Create new PostgreSQL service:
   - Name: `gangrun-postgres`
   - Database: `gangrun_db`
   - User: `gangrun_user`
   - Password: Generate secure password
   - Version: 15

### Step 6: Configure Domain
1. Go to "Domains" in application settings
2. Add domain: `gangrunprinting.com`
3. Enable SSL (Let's Encrypt)
4. Add www redirect: `www.gangrunprinting.com` → `gangrunprinting.com`

### Step 7: Deploy Application
1. Click **"Deploy"** button
2. Monitor build logs for any errors
3. Wait for "Deployment Successful" message

### Step 8: Run Database Migrations
After deployment succeeds, open Dokploy terminal:

```bash
# Connect to container
docker exec -it gangrunprinting-app bash

# Run migrations
npx prisma migrate deploy

# Seed database with data
npx tsx scripts/seed-all-data.ts

# Verify admin user
npx tsx scripts/update-admin-user.ts
```

### Step 9: Verify Deployment
1. Visit: https://gangrunprinting.com
2. Click "Sign In"
3. Login with: iradwatkins@gmail.com (Google OAuth)
4. Should redirect to: /admin/dashboard

## 🔍 TROUBLESHOOTING

### If Build Fails:
```bash
# Check logs in Dokploy
# Common issues:
- Missing environment variables
- Database connection error
- Port conflict
```

### If Login Doesn't Work:
```bash
# Check AUTH_SECRET is set
# Verify Google OAuth credentials
# Check database has admin user:
docker exec -it gangrunprinting-app bash
npx tsx scripts/update-admin-user.ts
```

### If Database Error:
```bash
# Verify DATABASE_URL format
# Check postgres service is running
# Run migrations manually:
npx prisma migrate deploy
```

## ✅ SUCCESS CHECKLIST
- [ ] Application deployed and running
- [ ] Domain accessible (https://gangrunprinting.com)
- [ ] SSL certificate active
- [ ] Database connected
- [ ] Admin login works (iradwatkins@gmail.com)
- [ ] Redirects to /admin/dashboard
- [ ] Customer login redirects to /account/dashboard

## 📞 SUPPORT
If you encounter issues:
1. Check Dokploy logs
2. Verify all environment variables
3. Ensure database is seeded
4. Check domain DNS points to 72.60.28.175