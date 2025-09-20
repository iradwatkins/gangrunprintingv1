# Google OAuth Configuration Fix

## Problem

Getting "Authentication Error: Configuration" when trying to sign in with Google.

## Solution

### 1. Update Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

1. Find your OAuth 2.0 Client ID (should be: `180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com`)
2. Click to edit it
3. Add these Authorized redirect URIs:

```
https://gangrunprinting.com/api/auth/callback/google
https://www.gangrunprinting.com/api/auth/callback/google
http://gangrunprinting.com/api/auth/callback/google
http://www.gangrunprinting.com/api/auth/callback/google
```

4. Add Authorized JavaScript origins:

```
https://gangrunprinting.com
https://www.gangrunprinting.com
http://gangrunprinting.com
http://www.gangrunprinting.com
```

5. Click "SAVE"

### 2. Verify Environment Variables in Dokploy

Make sure these are set in your Dokploy environment:

```env
AUTH_SECRET=MBRKOKyebhm9xOfSyP/IAPKAmTu8nGhhZx710URU6bo=
AUTH_GOOGLE_ID=180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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
NEXTAUTH_URL=https://gangrunprinting.com
AUTH_TRUST_HOST=true
```

### 3. Important Notes

- The OAuth client must be in PRODUCTION mode, not testing
- The domain verification might be required if not done already
- Changes can take 5-10 minutes to propagate

### 4. Test the Fix

After updating:

1. Wait 5-10 minutes for Google to propagate changes
2. Clear your browser cache
3. Try signing in again at https://gangrunprinting.com/auth/signin
