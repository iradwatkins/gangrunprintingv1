# ⚙️ DOKPLOY APPLICATION SETTINGS

## 🔴 IMPORTANT: Use these EXACT settings in Dokploy

### Application Configuration
```
Application Name: gangrunprinting
Project: gangrunprinting
Source Type: GitHub
Repository: https://github.com/iradwatkins/gangrunprinting.git
Branch: main
Build Path: /
```

### Build Settings
```
Dockerfile Path: ./Dockerfile
Build Method: Dockerfile (NOT Docker Compose)
```

### Advanced Settings
```
Port: 3000
Replicas: 1
Restart Policy: unless-stopped
Health Check Path: /api/health
```

### Environment Variables (COPY ALL)
```bash
# Database (use Dokploy PostgreSQL service)
DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure@postgres.gangrunprinting:5432/gangrun_db

# Authentication
AUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
NEXTAUTH_URL=https://gangrunprinting.com
NODE_ENV=production
AUTH_TRUST_HOST=true

# Admin
ADMIN_EMAIL=iradwatkins@gmail.com

# Google OAuth (REQUIRED - add your credentials)
AUTH_GOOGLE_ID=YOUR_GOOGLE_CLIENT_ID_HERE
AUTH_GOOGLE_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# Square Payments
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g

# SendGrid
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=support@gangrunprinting.com
```

### Domain Configuration
```
Domain: gangrunprinting.com
SSL: Enable (Let's Encrypt)
Force HTTPS: Yes
```

### PostgreSQL Service (Create Separately)
```
Service Name: postgres
Project: gangrunprinting
Database: gangrun_db
Username: gangrun_user
Password: GangRun2024Secure
Port: 5432
```

## 🚨 DEPLOYMENT STEPS

1. **Delete the current failed deployment**
   - Go to Deployments tab
   - Delete all failed deployments

2. **Update Application Settings**
   - Change from "Docker Compose" to "Dockerfile"
   - Ensure Build Method is set to "Dockerfile"

3. **Add Environment Variables**
   - Copy ALL variables above
   - Paste in Environment Variables section

4. **Create PostgreSQL Service**
   - Services → Create → PostgreSQL
   - Use settings above

5. **Deploy**
   - Click Deploy button
   - Watch logs for success

6. **After Deploy - Initialize Database**
   ```bash
   # In Dokploy terminal
   npx prisma migrate deploy
   npx tsx scripts/seed-all-data.ts
   ```

## ✅ Verification
- No more 502 error
- Login works with iradwatkins@gmail.com
- Admin dashboard accessible