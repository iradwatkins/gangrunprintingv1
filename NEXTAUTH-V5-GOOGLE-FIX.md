# NextAuth v5 Google OAuth Configuration Fix

## Problem

Google OAuth login fails with "Configuration Error" due to missing authorization parameters and incorrect environment variable configuration in NextAuth v5.

## Root Cause

1. **Missing authorization parameters** - NextAuth v5 requires explicit authorization params for Google OAuth
2. **Incorrect environment variable naming** - Need both AUTH*\* and NEXTAUTH*\* variants
3. **Missing redirect callback configuration** in Google OAuth config
4. **No explicit basePath configuration** for NextAuth v5

## Solution Applied

### 1. Updated Auth Configuration (`src/auth.config.ts`)

Created a comprehensive auth configuration with:

- Proper Google OAuth authorization parameters
- Explicit scope definition
- Redirect callback handler
- Cookie configuration for production
- Environment variable validation

Key additions:

```javascript
authorization: {
  params: {
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
    scope: "openid email profile"
  }
}
```

### 2. Environment Variables Update

Updated to include both naming conventions for compatibility:

- `AUTH_SECRET` and `NEXTAUTH_SECRET`
- `AUTH_URL` and `NEXTAUTH_URL`
- `AUTH_GOOGLE_ID` and `GOOGLE_CLIENT_ID`
- `AUTH_GOOGLE_SECRET` and `GOOGLE_CLIENT_SECRET`

### 3. Google Cloud Console Configuration

#### Required Authorized Redirect URIs:

```
https://gangrunprinting.com/api/auth/callback/google
https://www.gangrunprinting.com/api/auth/callback/google
```

#### Required Authorized JavaScript Origins:

```
https://gangrunprinting.com
https://www.gangrunprinting.com
```

## Deployment Steps

### Step 1: Update Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth 2.0 Client ID: `180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com`
3. Click to edit
4. **Remove all existing redirect URIs**
5. Add only the URIs listed above
6. **Remove all existing JavaScript origins**
7. Add only the origins listed above
8. Click **SAVE**
9. Wait 5-10 minutes for propagation

### Step 2: Update Dokploy Environment Variables

1. Go to Dokploy dashboard
2. Select your GangRun Printing application
3. Go to Environment Variables section
4. **Replace ALL variables** with the content from `DOKPLOY-ENV-VARS.txt`
5. Save changes

### Step 3: Deploy the Fix

```bash
# Option A: Via Dokploy UI
1. Click "Deploy" or "Rebuild"
2. Select "Clean Build" or "No Cache"
3. Wait for deployment to complete

# Option B: Via SSH
ssh root@72.60.28.175
cd /opt/gangrunprinting
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Step 4: Verify the Fix

1. Clear browser cache completely:
   - Chrome: Settings → Privacy → Clear browsing data → All time
   - Or: F12 → Application → Storage → Clear site data

2. Test authentication:

   ```bash
   # Check if auth endpoint is responding
   curl https://gangrunprinting.com/api/auth/providers

   # Should return:
   # {"google":{"id":"google","name":"Google","type":"oauth",...}}
   ```

3. Try logging in:
   - Go to https://gangrunprinting.com/auth/signin
   - Click "Sign in with Google"
   - Should redirect to Google and back successfully

## Troubleshooting

### If still getting "Configuration Error":

1. **Check environment variables in container:**

```bash
docker exec gangrunprinting-app env | grep -E "AUTH|GOOGLE|NEXTAUTH"
```

2. **Check auth logs:**

```bash
docker logs gangrunprinting-app --tail 100 | grep -i auth
```

3. **Verify Google OAuth is in production mode:**
   - Go to Google Cloud Console
   - OAuth consent screen
   - Publishing status should be "In production"

4. **Test with curl:**

```bash
curl -X POST https://gangrunprinting.com/api/auth/signin/google \
  -H "Content-Type: application/json" \
  -d '{"callbackUrl":"https://gangrunprinting.com"}'
```

### Common Issues and Solutions:

| Issue                         | Solution                                                        |
| ----------------------------- | --------------------------------------------------------------- |
| Invalid redirect URI          | Ensure URIs in Google Console match exactly (no trailing slash) |
| Missing environment variables | Check both AUTH*\* and NEXTAUTH*\* are set                      |
| Cookie errors                 | Clear all cookies for the domain                                |
| State mismatch                | Clear browser cache and cookies                                 |
| Invalid client                | Verify client ID and secret are correct                         |

## Files Modified

1. `src/auth.config.ts` - New comprehensive auth configuration
2. `src/auth.ts` - Simplified to use auth.config.ts
3. `DOKPLOY-ENV-VARS.txt` - Updated with all required variables
4. `docker-compose.yml` - Ensured all env vars are passed

## Key Changes for NextAuth v5

1. Added explicit `authorization.params` for Google OAuth
2. Added `basePath: '/api/auth'` configuration
3. Added redirect callback handler
4. Added cookie configuration for production
5. Added both AUTH*\* and NEXTAUTH*\* environment variables
6. Added explicit scope definition in OAuth config

## Testing Checklist

- [ ] Environment variables updated in Dokploy
- [ ] Google Cloud Console redirect URIs updated
- [ ] Application rebuilt with no cache
- [ ] Browser cache and cookies cleared
- [ ] `/api/auth/providers` endpoint returns Google provider
- [ ] Google sign-in redirects properly
- [ ] User can successfully authenticate
- [ ] Session is maintained after login

## Notes

- NextAuth v5 is more strict about configuration than v4
- The authorization params are REQUIRED for Google OAuth to work properly
- Both AUTH*\* and NEXTAUTH*\* environment variables should be set for compatibility
- Always clear browser cache when testing auth changes
- Google OAuth changes can take 5-10 minutes to propagate
