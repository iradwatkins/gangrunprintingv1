# GET CORRECT SQUARE CREDENTIALS - Step by Step

## 🔴 THE PROBLEM

Your error **"This request could not be authorized"** means:

**Your Application ID and Access Token are from DIFFERENT Square applications!**

Think of it like this:
- You're using a **Visa card** at a **Mastercard** terminal
- Or a **Gmail password** to log into **Yahoo**

They don't match! You need BOTH from the SAME place.

---

## ✅ SOLUTION - Get Matching Credentials (5 Minutes)

### Step 1: Go to Square Developer Dashboard

**Open this URL:** https://developer.squareup.com/apps

You should see a list of your applications.

---

### Step 2: Choose the RIGHT Application

**IMPORTANT:** Look for an application that is:
- ✅ **NOT** named "Invoices" or "Invoice App"
- ✅ Something like "Gangrun Printing", "Website", "Web App", or "My App"

**Don't have one?** Click **"+ New Application"** and name it **"Gangrun Printing Website"**

---

### Step 3: Get Application ID (STEP 1 OF 2)

1. **Click** on your application (the one you chose in Step 2)
2. You'll see at the top:

```
Application ID
sq0idp-XXXXXXXXXXXXXXXXXXXXXXXX
```

3. **Copy this ENTIRE string** (including `sq0idp-`)
4. **SAVE IT** somewhere temporarily (Notepad, etc.)

**Example:** `sq0idp-AJF8fI5VayKCqvlJL_h-abcd1234`

---

### Step 4: Get Access Token (STEP 2 OF 2)

**STILL IN THE SAME APPLICATION** (don't switch!):

1. Look for tabs at the top: **"Credentials"** or **"OAuth"**
2. Click on it
3. You'll see sections for:
   - **Sandbox** (for testing)
   - **Production** (for live payments)

**For Testing (Recommended First):**
1. Find **"Sandbox Access Token"**
2. Click **"Show"** or the eye icon
3. **Copy the token** (starts with `EAAA` or similar)
4. **SAVE IT** with your Application ID

**For Live Payments (After Testing Works):**
1. Find **"Production Access Token"**
2. You may need to click **"Generate Token"** first
3. Copy the token
4. Save it with your Application ID

---

### Step 5: Verify Permissions

**STILL IN THE SAME APPLICATION:**

1. Look for **"OAuth"** tab
2. Find **"Permissions"** or **"Scopes"**
3. Make sure these are checked:
   - ✅ **PAYMENTS_WRITE**
   - ✅ **PAYMENTS_READ**
   - ✅ **MERCHANT_PROFILE_READ**

**If not checked:**
1. Check them
2. Click **"Save"**
3. **Generate a NEW Access Token** (old one is now invalid)

---

## 🧪 TEST YOUR CREDENTIALS

### Use the Diagnostic Tool

**Open the artifact:** "Square Credentials Diagnostic Tool"

1. Select environment (Sandbox or Production)
2. Paste your Application ID
3. Paste your Access Token (from the SAME application!)
4. Enter Location ID: `LWMA9R9E2ENXP`
5. Click **"Test Credentials"**

**If it shows SUCCESS:** Your credentials match! ✅

**If it shows ERROR:** Your credentials don't match - you copied from different applications! ❌

---

## 📝 UPDATE YOUR .env.local

**File:** `.env.local` (in your project root)

**For Sandbox (Testing):**
```bash
# Both from the SAME Sandbox application!
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-YOUR_SANDBOX_APP_ID
NEXT_PUBLIC_SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_ACCESS_TOKEN=YOUR_SANDBOX_ACCESS_TOKEN

NODE_ENV=development
```

**For Production (Live Payments):**
```bash
# Both from the SAME Production application!
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-YOUR_PRODUCTION_APP_ID
NEXT_PUBLIC_SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_ACCESS_TOKEN=YOUR_PRODUCTION_ACCESS_TOKEN

NODE_ENV=production
```

---

## 🚀 RESTART YOUR SERVER

```bash
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

Test at: `http://localhost:3000/checkout`

---

## ✅ SUCCESS INDICATORS

**Console should show:**
```
✅ Square.js loaded
✅ Square object is available
✅ Card ready!
```

**When you submit payment:**
```
✅ Token received
✅ Payment successful!
```

**NO MORE:**
```
❌ This request could not be authorized
❌ 400 error
❌ Initialization timeout
```

---

## 🔍 COMMON MISTAKES

### Mistake #1: Using "Invoices" Application
**Don't use:** The "Invoices" or "Invoice App" application
**Use:** A dedicated web application

### Mistake #2: Mixing Sandbox and Production
**Don't do:**
- Sandbox Application ID + Production Access Token ❌
- Production Application ID + Sandbox Access Token ❌

**Do:**
- Sandbox Application ID + Sandbox Access Token ✅
- Production Application ID + Production Access Token ✅

### Mistake #3: Copying from Different Applications
**Don't do:**
1. Copy Application ID from "App A"
2. Copy Access Token from "App B"

**Do:**
1. Open ONE application
2. Copy BOTH Application ID AND Access Token from that SAME application

### Mistake #4: Old/Expired Token
**If you changed permissions:**
- Old token is INVALID
- Must generate NEW token
- Copy the NEW token to `.env.local`

---

## 🎯 VISUAL GUIDE

```
Square Developer Dashboard
└─ Applications
   ├─ Invoices (DON'T USE THIS)
   └─ Gangrun Printing Website ← USE THIS ONE
      ├─ Application ID: sq0idp-ABC123 ← COPY THIS
      └─ Credentials Tab
         ├─ Sandbox
         │  └─ Access Token: EAAA... ← COPY THIS (for testing)
         └─ Production
            └─ Access Token: EAAA... ← COPY THIS (for live)
```

**BOTH** the Application ID and Access Token must come from the **SAME** application (Gangrun Printing Website in this example).

---

## 💡 STILL NOT WORKING?

### Run the Diagnostic Tool Again

The tool will tell you EXACTLY what's wrong:
- ✅ Credentials match
- ❌ Credentials don't match
- ❌ Invalid Application ID format
- ❌ Access Token expired

### Double-Check This Checklist

- [ ] Application ID starts with `sq0idp-` or `sandbox-`
- [ ] Access Token starts with `EAAA` or `EA` or similar
- [ ] Both are from the SAME application (not Invoices)
- [ ] Both are either Sandbox OR Production (not mixed)
- [ ] Permissions include PAYMENTS_WRITE
- [ ] Restarted server after changing .env.local
- [ ] Cleared browser cache (Ctrl+Shift+R)

### Get Fresh Credentials

If you're unsure which application they came from:

1. Delete your current `.env.local` values
2. Create a BRAND NEW Square application
3. Get the Application ID
4. Generate a NEW Access Token (from the SAME app)
5. Use BOTH in `.env.local`
6. Test with diagnostic tool

---

## 🎉 WHEN IT WORKS

You'll be able to:
- ✅ Load payment form without timeout
- ✅ Enter card details
- ✅ Submit test payment
- ✅ See payment in Square Dashboard
- ✅ No "unauthorized" errors

The credentials issue will be 100% resolved! 🚀
