# Google OAuth Setup Guide

## Fixing the Google OAuth Error

The error "Access blocked: Authorization Error" occurs when the redirect URIs don't match what's configured in Google Cloud Console.

## Steps to Fix:

### 1. Update Local Environment Variables

In your `.env.local` file, update:
```
NEXTAUTH_URL=http://localhost:3013
```

### 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (or create one)

### 3. Add Authorized Redirect URIs

Add ALL of these URIs to the "Authorized redirect URIs" section:

**For Local Development:**
- `http://localhost:3013/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3001/api/auth/callback/google`

**For Production:**
- `https://gangrunprinting.com/api/auth/callback/google`
- `https://www.gangrunprinting.com/api/auth/callback/google`

### 4. Add Authorized JavaScript Origins

Add these to "Authorized JavaScript origins":

**For Local Development:**
- `http://localhost:3013`
- `http://localhost:3000`
- `http://localhost:3001`

**For Production:**
- `https://gangrunprinting.com`
- `https://www.gangrunprinting.com`

### 5. OAuth Consent Screen

Make sure your OAuth consent screen is configured:
1. Go to **APIs & Services** → **OAuth consent screen**
2. Configure the following:
   - App name: GangRun Printing
   - User support email: iradwatkins@gmail.com
   - App domain: gangrunprinting.com
   - Authorized domains: gangrunprinting.com
   - Developer contact: iradwatkins@gmail.com

### 6. Development vs Production

**For Development (.env.local):**
```env
NEXTAUTH_URL=http://localhost:3013
AUTH_GOOGLE_ID=your-dev-client-id
AUTH_GOOGLE_SECRET=your-dev-client-secret
```

**For Production (.env.production):**
```env
NEXTAUTH_URL=https://gangrunprinting.com
AUTH_GOOGLE_ID=your-prod-client-id
AUTH_GOOGLE_SECRET=your-prod-client-secret
```

## Creating New OAuth Credentials

If you need to create new credentials:

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Choose **Web application**
4. Name it (e.g., "GangRun Printing Dev" or "GangRun Printing Prod")
5. Add the redirect URIs and JavaScript origins as listed above
6. Click **CREATE**
7. Copy the Client ID and Client Secret to your `.env` file

## Testing

After making these changes:
1. Restart your development server
2. Clear your browser cookies for localhost
3. Try signing in with Google again

## Common Issues

- **Invalid redirect_uri**: Make sure the URI in your app matches EXACTLY what's in Google Console (including http vs https, port numbers, trailing slashes)
- **Consent screen not configured**: You must have a configured OAuth consent screen
- **Wrong credentials**: Make sure you're using the correct client ID and secret for your environment

## Note for Email Provider

The app also supports magic link authentication via email. Make sure you have configured:
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`

in your environment variables for email authentication to work.