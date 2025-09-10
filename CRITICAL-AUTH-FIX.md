# CRITICAL: Google Authentication Fix

## The Problem
Google OAuth is failing with "Configuration Error" because:
1. Missing or incorrect environment variables in production
2. NextAuth v5 requires explicit secret configuration
3. Google OAuth redirect URIs may not be configured correctly

## IMMEDIATE FIX REQUIRED

### Step 1: Update Google Cloud Console (5 minutes)

Go to: https://console.cloud.google.com/apis/credentials

1. Find OAuth Client: `180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com`
2. Click to edit it
3. **DELETE ALL EXISTING REDIRECT URIs** and add ONLY these:

```
https://gangrunprinting.com/api/auth/callback/google
https://www.gangrunprinting.com/api/auth/callback/google
```

4. **DELETE ALL EXISTING JavaScript Origins** and add ONLY these:
```
https://gangrunprinting.com
https://www.gangrunprinting.com
```

5. Click **SAVE**
6. **WAIT 5-10 MINUTES** for changes to propagate

### Step 2: Update Dokploy Environment Variables

In Dokploy, update your application's environment variables to EXACTLY these:

```env
# CRITICAL: Use these EXACT variable names and values
AUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
NEXTAUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
AUTH_GOOGLE_ID=180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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
NEXTAUTH_URL=https://gangrunprinting.com
NEXT_PUBLIC_APP_URL=https://gangrunprinting.com
AUTH_TRUST_HOST=true

# Database
DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure@postgres:5432/gangrun_db

# Admin
ADMIN_EMAIL=iradwatkins@gmail.com
ADMIN_NAME=Ira Watkins

# Other services (keep existing values)
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=support@gangrunprinting.com
SENDGRID_FROM_NAME=GangRun Printing
TELEGRAM_BOT_TOKEN=7241850736:AAHqJYoWRzJdtFUclpdmosvVZN5C6DDbKL4
TELEGRAM_CHAT_ID=7154912264
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BIzmq1ShjRgxpW4XnHSh2IeXLK6_uLtNMAnnPNJNJ5Pj3DD7JRXFajvI7KZpoujH8J1ZE0Kl-Io5oa8rJRlCIlY
VAPID_PRIVATE_KEY=3e4BbIRQtOoayCLuW7zqWbXLqqxrHNM6pjc9jL8xvDk
VAPID_SUBJECT=mailto:support@gangrunprinting.com
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
TZ=America/Chicago
```

### Step 3: Deploy with Clean Build

After updating environment variables in Dokploy:

1. In Dokploy UI:
   - Go to your GangRun Printing application
   - Click "Settings" or "Environment Variables"
   - Replace ALL variables with the above
   - Save changes
   
2. Force rebuild:
   - Click "Deploy" or "Rebuild"
   - Select "No Cache" option if available
   - Wait for deployment to complete

### Step 4: Manual Fix via SSH (if Dokploy doesn't work)

```bash
# SSH to server
ssh root@72.60.28.175
# Password: Bobby321&Gloria321Watkins?

# Navigate to project
cd /opt/gangrunprinting

# Pull latest code
git pull origin main

# Create proper .env file
cat > .env << 'EOF'
AUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
NEXTAUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
AUTH_GOOGLE_ID=180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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
NEXTAUTH_URL=https://gangrunprinting.com
NEXT_PUBLIC_APP_URL=https://gangrunprinting.com
AUTH_TRUST_HOST=true
DATABASE_URL=postgresql://gangrun_user:GangRun2024Secure@postgres:5432/gangrun_db
ADMIN_EMAIL=iradwatkins@gmail.com
ADMIN_NAME=Ira Watkins
SQUARE_ACCESS_TOKEN=EAAAlxUo1UKk1Lin6wHkpILz-NgqN0-OiNMWN9LBAK-axvt4gmBUCKw8PW1HZeJD
SQUARE_ENVIRONMENT=production
SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCq9veQRAw5g
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=support@gangrunprinting.com
SENDGRID_FROM_NAME=GangRun Printing
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
TZ=America/Chicago
EOF

# Stop and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker logs gangrunprinting-app --tail 50
```

### Step 5: Verify Fix

1. Clear ALL browser data:
   - Open Chrome DevTools (F12)
   - Application tab > Storage > Clear site data
   
2. Test authentication:
   - Go to https://gangrunprinting.com/auth/signin
   - Click "Sign in with Google"
   - Should redirect to Google and back successfully

### If Still Not Working

Check these:
1. Google OAuth is in PRODUCTION mode (not testing)
2. Domain verification completed in Google Cloud Console
3. No typos in the Client ID or Secret
4. BOTH AUTH_SECRET and NEXTAUTH_SECRET are set
5. NEXTAUTH_URL is exactly `https://gangrunprinting.com` (no trailing slash)

### Debug Commands

```bash
# Check environment variables in container
docker exec gangrunprinting-app env | grep -E "AUTH|NEXT"

# Check auth endpoint
curl https://gangrunprinting.com/api/auth/providers

# View detailed logs
docker logs gangrunprinting-app --tail 100 | grep -i auth
```

## Root Cause
The authentication was failing because:
1. NextAuth v5 requires explicit secret configuration
2. Environment variables were not properly set in production
3. The auth configuration was not properly handling missing credentials
4. Google OAuth redirect URIs need exact matches