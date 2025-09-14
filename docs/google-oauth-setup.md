# Google OAuth Setup Instructions

## Required Google Cloud Console Configuration

You need to add the following redirect URI to your Google OAuth 2.0 Client ID configuration:

### Redirect URI to Add:
```
https://gangrunprinting.com/api/auth/google/callback
```

## Steps to Configure:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Select Your Project**
   - Make sure you're in the correct project for GangRun Printing

3. **Navigate to OAuth Credentials**
   - Go to: APIs & Services → Credentials
   - Or direct link: https://console.cloud.google.com/apis/credentials

4. **Edit Your OAuth 2.0 Client**
   - Find your OAuth 2.0 Client ID (the one with Client ID: `180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com`)
   - Click on it to edit

5. **Add Authorized Redirect URI**
   - Scroll down to "Authorized redirect URIs"
   - Click "ADD URI"
   - Add exactly: `https://gangrunprinting.com/api/auth/google/callback`
   - Make sure there are no trailing slashes or spaces

6. **Save Changes**
   - Click "SAVE" at the bottom

## Current OAuth Configuration in Code:

- **Client ID**: `180548408438-40kht5tlgpiim2j4qhu0qs1mtonvnanq.apps.googleusercontent.com`
- **Callback URL**: `https://gangrunprinting.com/api/auth/google/callback`
- **Scopes**: profile, email

## Testing:

After adding the redirect URI in Google Cloud Console:
1. Wait 1-2 minutes for changes to propagate
2. Try signing in again at: https://gangrunprinting.com/auth/signin
3. Click "Continue with Google"

## Troubleshooting:

If you still get redirect_uri_mismatch error:
- Ensure the URL is exactly: `https://gangrunprinting.com/api/auth/google/callback`
- Check there are no typos or extra characters
- Verify you saved the changes in Google Cloud Console
- Clear browser cache and cookies
- Try in an incognito/private window

## Additional URIs (Optional):

For development/testing, you might also want to add:
- `http://localhost:3002/api/auth/google/callback` (for local development)

## Security Note:

Only add redirect URIs that you control. Each URI must be HTTPS in production (except localhost for development).