# FIX 400 BAD REQUEST ERROR

## 🔴 Your Error

```
POST https://gangrunprinting.com/api/checkout/process-square-payment 400 (Bad Request)
[Square] Payment error: Error: Payment processing failed. Please try again.
```

**A 400 error means the backend is REJECTING your request.** Something is missing or wrong.

---

## 🔍 STEP 1: Run Diagnostics (DO THIS FIRST!)

### Option A: Use the Diagnostic Component

1. **Create a new page:** `app/diagnostics/page.tsx`

```typescript
import SquareDiagnostics from '@/components/SquareDiagnostics';

export default function DiagnosticsPage() {
  return <SquareDiagnostics />;
}
```

2. **Copy the diagnostic component** from artifact: **"Diagnostic Component - Find the 400 Error"**
   - Save to: `src/components/SquareDiagnostics.tsx`

3. **Go to:** `http://localhost:3000/diagnostics`

4. **Click "Run Diagnostics"**

This will show you EXACTLY what's wrong!

### Option B: Check Server Logs Manually

Look at your terminal where `npm run dev` is running.

The updated API route now logs EVERYTHING:

```
🔵 API: Payment request received
🔍 Server env check: { hasAccessToken: true, nodeEnv: 'development' }
📦 Full request body: { ... }
📦 Extracted data: { hasSourceId: true, amount: '10.00', ... }
```

**Look for:**
```
❌ Missing sourceId
❌ Missing amount
❌ Missing locationId
❌ Missing SQUARE_ACCESS_TOKEN env variable
```

---

## 🔴 COMMON CAUSES OF 400 ERROR

### Cause #1: Environment Variables Not Set

**Check your `.env.local` file:**

```bash
# CLIENT-SIDE (must have NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-AJF8fI5VayKCqvlJL_your_actual_id
NEXT_PUBLIC_SQUARE_LOCATION_ID=LWMA9R9E2ENXP

# SERVER-SIDE (NO NEXT_PUBLIC_ prefix)
SQUARE_ACCESS_TOKEN=EAAAl1234567890_your_actual_token

# ENVIRONMENT
NODE_ENV=development
```

**Critical checks:**
- ✅ File is named EXACTLY `.env.local` (not `.env` or `env.local`)
- ✅ File is in the PROJECT ROOT (same folder as `package.json`)
- ✅ Client vars have `NEXT_PUBLIC_` prefix
- ✅ Server var does NOT have `NEXT_PUBLIC_` prefix
- ✅ No quotes around values
- ✅ No spaces around `=`

**After changing `.env.local`, you MUST restart:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

### Cause #2: Wrong Variable Names

Your API is looking for:
- `sourceId` ← Payment token from Square
- `amount` ← Payment amount
- `locationId` ← Your Square location ID

**Check the frontend is sending these:**

In browser console, run:
```javascript
console.log({
  locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
  hasAppId: !!process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
});
```

If either shows `undefined`, your environment variables aren't loading.

---

### Cause #3: Access Token Missing or Invalid

**Server-side check:**

In your terminal, run:
```bash
node -e "console.log('Access Token:', process.env.SQUARE_ACCESS_TOKEN ? 'SET' : 'MISSING')"
```

Should show: `Access Token: SET`

If it shows `MISSING`:
1. Make sure `.env.local` has `SQUARE_ACCESS_TOKEN=...`
2. Make sure you restarted the server after adding it
3. Make sure the file is saved

---

### Cause #4: Invalid Access Token

Even if the token is set, it might be:
- **Expired** - Regenerate from Square Dashboard
- **Wrong environment** - Sandbox token won't work in production
- **Insufficient permissions** - Needs PAYMENTS_WRITE scope

**How to regenerate:**
1. Go to: https://developer.squareup.com/apps
2. Select your app
3. Go to "Credentials"
4. For sandbox: Click "Show" under Sandbox Access Token
5. For production: Generate new Production Access Token
6. Copy to `.env.local`
7. Restart server

---

## 🛠️ STEP 2: Update Your Files

### File 1: Update API Route (Better Logging)

**File:** `app/api/checkout/process-square-payment/route.ts`

Copy the UPDATED artifact: **"YOUR API Route"**

This version logs EVERYTHING so you can see exactly what's missing.

### File 2: Update Component

**File:** `src/components/checkout/square-card-payment.tsx`

Make sure you're using the latest version with ZIP code field.

---

## 🧪 STEP 3: Test the API Directly

### Test with curl:

```bash
curl -X POST http://localhost:3000/api/checkout/process-square-payment \
  -H "Content-Type: application/json" \
  -d '{
    "sourceId": "TEST_TOKEN",
    "amount": "10.00",
    "locationId": "LWMA9R9E2ENXP"
  }'
```

**Expected responses:**

**If access token is missing (500):**
```json
{
  "success": false,
  "error": "Server configuration error: Missing access token",
  "details": "SQUARE_ACCESS_TOKEN environment variable is not set"
}
```

**If sourceId is missing (400):**
```json
{
  "success": false,
  "error": "Missing payment token (sourceId)",
  "details": "The payment token from Square tokenization is missing"
}
```

**If token is invalid (500):**
```json
{
  "success": false,
  "error": "Invalid credentials. Check that your access token is correct."
}
```

---

## ✅ STEP 4: Verify Everything

### Checklist:

- [ ] `.env.local` exists in project root
- [ ] `.env.local` has all 3 variables (2 with NEXT_PUBLIC_, 1 without)
- [ ] Server restarted after changing `.env.local`
- [ ] Ran diagnostics and all checks pass
- [ ] API route updated with better logging
- [ ] Server logs show environment check passes
- [ ] Can see full request body in server logs

---

## 🎯 MOST LIKELY CAUSE

Based on your error, it's **99% likely** that:

1. **Environment variables aren't loading properly**
   - Wrong file name (`.env` instead of `.env.local`)
   - Wrong location (not in project root)
   - Server not restarted after changes

2. **Access token is missing or invalid**
   - `SQUARE_ACCESS_TOKEN` not in `.env.local`
   - Using wrong environment token (sandbox vs production)
   - Token expired or revoked

---

## 🚀 QUICK FIX STEPS

### Do this NOW:

1. **Check `.env.local` location:**
```bash
ls -la .env.local
```
Should show the file. If "No such file", it's missing!

2. **Check `.env.local` content:**
```bash
cat .env.local
```
Should show your 3 variables.

3. **Restart server:**
```bash
# Stop (Ctrl+C)
rm -rf .next
npm run dev
```

4. **Run diagnostics:**
- Use the diagnostic component from the artifact
- OR check server logs for detailed output

5. **Look for the EXACT error:**
The updated API route tells you exactly what's missing!

---

## 📞 STILL STUCK?

Share with me:

1. **Output of diagnostics component**
2. **Server logs** (the part with 🔵 and ❌ emojis)
3. **Output of:**
```bash
ls -la .env.local
cat .env.local  # (hide actual tokens, just show format)
```

The diagnostic component will pinpoint the exact issue! 🎯
