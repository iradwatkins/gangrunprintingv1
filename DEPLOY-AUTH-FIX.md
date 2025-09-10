# 🚀 DEPLOY AUTH FIX - Google OAuth & Service Worker Solution

## Problem Fixed
- Google OAuth failing with "Configuration Error"
- Service worker attempting to cache authentication routes
- PWA interfering with OAuth redirect flow

## What Was Changed
1. **Service Worker Exclusions** - Prevented caching of auth routes
2. **NextAuth v5 Configuration** - Added required authorization parameters
3. **PWA Configuration** - Updated next.config.js to exclude auth patterns
4. **Cache Clearing Component** - Added automatic cache clearing on auth errors

## Deployment Steps

### 1. SSH to Server
```bash
ssh root@72.60.28.175
# Password: Bobby321&Gloria321Watkins?
```

### 2. Navigate to Project
```bash
cd /opt/gangrunprinting
```

### 3. Run Fix Deployment Script
```bash
# Make script executable if needed
chmod +x fix-deployment.sh

# Run the fix
./fix-deployment.sh
```

### 4. Verify Deployment Through Dokploy
- Access Dokploy at: http://72.60.28.175:3000
- Check the gangrunprinting application status
- Verify it shows as "Running"

### 5. Update Google OAuth (CRITICAL)
Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

Add these EXACT redirect URIs:
```
https://gangrunprinting.com/api/auth/callback/google
https://www.gangrunprinting.com/api/auth/callback/google
http://gangrunprinting.com/api/auth/callback/google
http://www.gangrunprinting.com/api/auth/callback/google
```

### 6. Clear Browser Cache (IMPORTANT)
Users experiencing issues should:
1. Clear all browser cache and cookies for gangrunprinting.com
2. Close browser completely
3. Reopen and test login

## Verification Steps

### Test Authentication
1. Go to https://gangrunprinting.com
2. Click "Sign In"
3. Choose "Sign in with Google"
4. Should redirect to Google OAuth
5. After authorization, should return to site logged in

### Check Service Worker
Open browser console and run:
```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});

// Check cache contents
caches.keys().then(names => {
  console.log('Cache names:', names);
});
```

### Monitor Logs
```bash
# On server, check logs
docker logs gangrunprinting-app --tail 50 -f
```

## If Issues Persist

### 1. Force Clear Service Worker
In browser console:
```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

### 2. Check Environment Variables
```bash
docker exec gangrunprinting-app env | grep -E "(AUTH|GOOGLE)"
```

Should show:
- AUTH_SECRET
- AUTH_URL=https://gangrunprinting.com
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

### 3. Rebuild Completely
```bash
cd /opt/gangrunprinting
docker-compose down
docker system prune -af
docker-compose build --no-cache
docker-compose up -d
```

## Success Indicators
✅ No "Configuration Error" on Google login
✅ Service worker active but not caching auth routes
✅ Users can sign in with Google
✅ PWA features still work (offline page, install prompt)

## Support
If issues continue after these steps:
1. Check Dokploy logs for the application
2. Review browser console for specific errors
3. Verify Google OAuth credentials are correct

---
Last Updated: 2025-01-10
Fix Version: 1.0.0