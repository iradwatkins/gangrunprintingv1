# ⚡ QUICK START - Fix Square.js Loading Issue

## 🎯 THE PROBLEM
Square.js script wasn't loading before your component tried to use it.

## ✅ THE SOLUTION
The new component **loads Square.js itself** with proper waiting and error handling.

---

## 📝 3-STEP FIX

### 1️⃣ Replace Your Payment Component

**File:** `src/components/checkout/square-card-payment.tsx`

**Action:** Copy entire content from artifact **"Square Payment Component - Fixed Script Loading"**

---

### 2️⃣ Update Your Middleware

**File:** `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://web.squarecdn.com https://js.squarecdn.com https://sandbox.web.squarecdn.com",
    "connect-src 'self' https://web.squarecdn.com https://connect.squareup.com https://connect.squareupsandbox.com https://*.cardinalcommerce.com",
    "frame-src 'self' https://web.squarecdn.com https://js.squarecdn.com https://sandbox.web.squarecdn.com https://*.cardinalcommerce.com",
    "form-action 'self' https://*.cardinalcommerce.com",
    "style-src 'self' 'unsafe-inline' https://web.squarecdn.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
  ];

  response.headers.set(
    'Content-Security-Policy',
    cspDirectives.join('; ')
  );

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

### 3️⃣ Clean & Restart

```bash
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

Test at: `http://localhost:3000/checkout` (in incognito mode)

---

## ✅ SUCCESS - You Should See:

**In Console:**
```
🔵 Loading Square.js script...
✅ Square.js script loaded successfully
✅ Square object is available
✅ Square payment form ready!
```

**On Page:**
- Billing form appears
- Card input fields load within 2-3 seconds
- No error messages

---

## ❌ STILL BROKEN? Check This:

### Quick Diagnostic (Run in Browser Console):

```javascript
console.log({
  hasSquare: typeof window.Square !== 'undefined',
  appId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
  locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
});
```

### If `appId` or `locationId` is `undefined`:

**Fix your `.env.local`:**
```bash
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-YOUR_APP_ID
NEXT_PUBLIC_SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
```

Then restart: `npm run dev`

---

## 🎉 WHAT'S DIFFERENT NOW?

### ❌ OLD (What Was Failing):
- Script in layout.tsx
- Component used Square immediately
- Race condition → failure

### ✅ NEW (What Works):
- Component loads Square.js itself
- Waits up to 10 seconds for Square to be available
- Comprehensive error messages
- No race conditions

---

## 📸 SHARE IF STILL BROKEN:

1. Screenshot of browser console
2. Output of diagnostic command above
3. First 10 lines of your `.env.local` (hide sensitive values)

This will load Square.js successfully! 🚀
