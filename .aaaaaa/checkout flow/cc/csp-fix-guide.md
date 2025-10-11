# CSP Fix for Square 3D Secure - Implementation Guide

## 🎯 What Was Wrong

Your Content Security Policy (CSP) headers were blocking **Cardinal Commerce**, which is Square's provider for 3D Secure credit card verification.

### The Errors You Saw:
```
❌ Refused to frame 'https://geoissuer.cardinalcommerce.com/'
❌ Refused to send form data to 'https://geoissuer.cardinalcommerce.com/'
❌ ThreeDSMethodTimeoutError: Three ds method timed out
```

### What This Means:
- Square loaded correctly ✅
- Your payment form loaded ✅
- But 3D Secure verification was **blocked by your security policy** ❌
- This caused the form to timeout after 10 seconds

---

## 🚀 Fix Steps

### Step 1: Replace Your `next.config.js`

**Location:** Root of your project (same level as `package.json`)

**Action:** Replace your entire `next.config.js` with the **Fixed CSP config** artifact I just created.

### Step 2: Restart Your Dev Server

**CRITICAL:** CSP changes only take effect after restart!

```bash
# Stop your current dev server (Ctrl+C)

# Then restart:
npm run dev
# or
yarn dev
```

### Step 3: Clear Browser Cache

**Important:** Old CSP headers might be cached

**Option A - Hard Refresh:**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Option B - Incognito/Private:**
- Test in a new incognito/private window

### Step 4: Test the Payment Form

1. Go to your checkout page
2. Open browser console (F12)
3. Look for these changes:

**Before (Errors):**
```
❌ Refused to frame 'https://geoissuer.cardinalcommerce.com/'
❌ ThreeDSMethodTimeoutError
```

**After (Success):**
```
✅ (No CSP errors)
✅ Card form loads
✅ Can enter card details
```

---

## 🔍 What the Fix Does

The updated CSP adds these domains that Square's 3D Secure needs:

### **Cardinal Commerce Domains** (3D Secure Provider):
- `https://geoissuer.cardinalcommerce.com` - Device fingerprinting
- `https://songbird.cardinalcommerce.com` - 3D Secure authentication
- `https://centinelapistag.cardinalcommerce.com` - Testing environment

### **Where They're Added:**
```javascript
// Frames - Allow 3D Secure iframes
"frame-src ... https://geoissuer.cardinalcommerce.com ..."

// Form Actions - Allow 3D Secure form submissions  
"form-action ... https://geoissuer.cardinalcommerce.com ..."

// Scripts - Allow 3D Secure scripts
"script-src ... https://geoissuer.cardinalcommerce.com ..."
```

---

## ✅ Verification Checklist

After implementing the fix:

- [ ] Replaced `next.config.js` with fixed version
- [ ] Restarted dev server completely
- [ ] Cleared browser cache / tested in incognito
- [ ] No CSP errors in console
- [ ] No "Refused to frame" errors
- [ ] No "ThreeDSMethodTimeoutError"
- [ ] Payment form loads without timeout
- [ ] Can see and interact with card fields

---

## 🧪 Test the Fix

### Step 1: Open checkout page in incognito mode
### Step 2: Open console (F12)
### Step 3: Filter console to show only errors:
```
Click "Errors" tab in console
or
Type: -font -woff2
```

### Step 4: Wait 10 seconds
- **Before fix:** You'd see timeout error
- **After fix:** No errors, form works

### Step 5: Try entering card details
- Card number field should be interactive
- No errors should appear

---

## 🎯 Expected Console Output After Fix

```
✅ No CSP violation errors
✅ No Cardinal Commerce blocking
✅ No timeout errors
✅ Form initializes successfully
```

You may see these (which are fine):
```
⚠️ Font preload warnings (harmless)
⚠️ Sentry rate limit (Square's internal logging, harmless)
```

---

## 🚨 If It Still Doesn't Work

### Check 1: Verify next.config.js was updated
```bash
# Open next.config.js and search for:
"geoissuer.cardinalcommerce.com"

# Should appear in multiple places
```

### Check 2: Server actually restarted
```bash
# You should see in terminal:
✓ Ready in 2.3s
○ Local: http://localhost:3000
```

### Check 3: No syntax errors in next.config.js
```bash
# If server won't start, check for:
- Missing commas
- Unclosed brackets
- Copy-paste errors
```

### Check 4: Browser actually cleared cache
- Use incognito mode to be 100% sure
- Or clear all browsing data

---

## 📊 Before vs After

### Before (CSP Blocking):
```
User enters checkout
    ↓
Square.js loads ✅
    ↓
Card form tries to initialize
    ↓
3D Secure iframe blocked by CSP ❌
    ↓
Timeout after 10 seconds ❌
    ↓
Error: "ThreeDSMethodTimeoutError" ❌
```

### After (CSP Fixed):
```
User enters checkout
    ↓
Square.js loads ✅
    ↓
Card form initializes ✅
    ↓
3D Secure iframe loads ✅
    ↓
Form ready in ~2 seconds ✅
    ↓
User can enter card details ✅
```

---

## 💡 Why This Happened

When Square processes payments, it needs to verify cards using **3D Secure** (the extra verification step some cards require). This verification happens through Cardinal Commerce, which loads an invisible iframe to check the card.

Your original CSP was very strict and only allowed Square's own domains. It blocked Cardinal Commerce because you didn't know Square used them.

This is actually **good security practice** - strict CSP protects users. You just needed to add the legitimate domains Square requires.

---

## 🔐 Security Note

The domains we added are **official Square partners**:
- ✅ Cardinal Commerce is a trusted 3D Secure provider
- ✅ Owned by Visa
- ✅ Used by Square, Stripe, and major payment processors
- ✅ Required for PCI compliance

Adding these domains is **safe and necessary** for Square payments to work.

---

## 📝 Quick Reference

**File to edit:** `next.config.js` (root directory)  
**Action:** Replace entire file with fixed version  
**Critical step:** Restart dev server  
**How to verify:** Check console for CSP errors  
**Time to fix:** 2 minutes

---

## 🎉 What Happens After Fix

Once the CSP is fixed:
1. ✅ Payment form loads in 2-3 seconds (not 10+)
2. ✅ No console errors
3. ✅ Card fields are interactive
4. ✅ 3D Secure works properly
5. ✅ Cash App Pay also works (if enabled)
6. ✅ Test payments succeed

---

## 🚀 Deploy to Production

When deploying, make sure:
1. ✅ Updated `next.config.js` is committed to git
2. ✅ Production build includes the changes
3. ✅ Restart production server
4. ✅ Test on production domain

```bash
# Build for production
npm run build

# Start production server  
npm run start
```

---

**That's it!** This CSP fix should completely resolve your Square payment loading issues. The form should now load quickly without timeouts.