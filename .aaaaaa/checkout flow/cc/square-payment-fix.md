# Square Payment Integration Fix Guide
## GangRun Printing - Credit Card & Cash App Fix

---

## 🔴 Critical Issues Identified

### Issue #1: Next.js Version Conflict
- **Problem**: Using Next.js 15.5.2 which has compatibility issues with Square Web Payments SDK
- **Impact**: Payment forms won't load, scripts blocked by CSP
- **Solution**: Downgrade to Next.js 14.2.0

### Issue #2: Wrong Application ID
- **Problem**: Using Invoice application ID instead of web application ID
- **Current ID**: `sq0idp-Cf85mt46wI4zaxvAs2xIyw` (Invoices)
- **Impact**: No payments processing through website
- **Solution**: Create new Square web application

### Issue #3: Missing NEXT_PUBLIC_ Prefix
- **Problem**: Environment variables not accessible in client components
- **Impact**: Square SDK can't access credentials
- **Solution**: Add NEXT_PUBLIC_ prefix to client-side variables

### Issue #4: Cash App Not Enabled
- **Problem**: Location only has `CREDIT_CARD_PROCESSING` capability
- **Location ID**: `LWMA9R9E2ENXP` (Gangrun Printing)
- **Impact**: Cash App Pay won't display
- **Solution**: Enable Cash App in Square Dashboard

### Issue #5: Outdated SDK Usage
- **Problem**: Possibly using deprecated SqPaymentForm
- **Impact**: Forms don't render properly
- **Solution**: Migrate to Square Web Payments SDK v15+

---

## 🚀 Step-by-Step Fix

### Step 1: Downgrade Next.js

**Edit `package.json`:**
```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

**Run:**
```bash
npm install
# or
yarn install
```

---

### Step 2: Create New Square Application

1. Go to: https://developer.squareup.com/apps
2. Click **"Create Application"**
3. Name it: **"GangRun Printing Website"**
4. Click **"Create Application"**
5. Copy the **Application ID** (starts with `sq0idp-`)
6. Go to **"Credentials"** tab
7. Copy your **Access Token**

---

### Step 3: Enable Cash App Pay

1. Log into Square Dashboard: https://squareup.com/dashboard
2. Go to **Account & Settings** → **Business** → **Locations**
3. Select **"Gangrun Printing"** location
4. Go to **Payment Types**
5. Enable **"Cash App Pay"**
6. Save changes

**Note**: If you don't see Cash App Pay option, contact Square Support to enable it for your account.

---

### Step 4: Update Environment Variables

**Create/Update `.env.local`:**
```bash
# Square Payment Configuration
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sq0idp-YOUR_NEW_APPLICATION_ID_HERE
NEXT_PUBLIC_SQUARE_LOCATION_ID=LWMA9R9E2ENXP
SQUARE_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE

# Environment
NEXT_PUBLIC_SQUARE_ENVIRONMENT=production
# Use "sandbox" for testing: NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox

# Other existing variables
DATABASE_URL=your_database_url
AUTH_SECRET=your_auth_secret
# ... rest of your env variables
```

**CRITICAL NOTES:**
- Variables used in client components MUST have `NEXT_PUBLIC_` prefix
- Access token (server-side only) does NOT need `NEXT_PUBLIC_`
- Never commit `.env.local` to git

---

### Step 5: Add Square Script to Layout

**Edit `app/layout.tsx`:**
```typescript
import Script from 'next/script';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://web.squarecdn.com/v1/square.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

### Step 6: Create Square Payment Component

**Create `components/SquarePaymentForm.tsx`:**
```typescript
'use client';

import { useEffect, useState, useRef } from 'react';

// Extend Window interface for Square
declare global {
  interface Window {
    Square: any;
  }
}

interface SquarePaymentFormProps {
  amount: number; // Amount in cents (e.g., 1000 = $10.00)
  onPaymentSuccess: (paymentResult: any) => void;
  onPaymentError: (error: any) => void;
}

export default function SquarePaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentError,
}: SquarePaymentFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cashapp'>('card');
  const cardRef = useRef<any>(null);
  const cashAppRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);

  useEffect(() => {
    initializeSquarePayments();
  }, []);

  async function initializeSquarePayments() {
    if (!window.Square) {
      console.error('Square.js failed to load');
      setIsLoading(false);
      return;
    }

    try {
      const payments = window.Square.payments(
        process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
        process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
      );

      paymentsRef.current = payments;

      // Initialize Card Payment
      await initializeCard(payments);

      // Initialize Cash App Pay
      await initializeCashApp(payments);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize Square payments:', error);
      setIsLoading(false);
    }
  }

  async function initializeCard(payments: any) {
    try {
      const card = await payments.card();
      await card.attach('#card-container');
      cardRef.current = card;
      console.log('Card payment initialized');
    } catch (error) {
      console.error('Failed to initialize card:', error);
    }
  }

  async function initializeCashApp(payments: any) {
    try {
      const cashAppPay = await payments.cashAppPay({
        redirectURL: window.location.href,
        referenceId: `order-${Date.now()}`,
      });
      
      await cashAppPay.attach('#cash-app-container');
      cashAppRef.current = cashAppPay;
      console.log('Cash App Pay initialized');
    } catch (error) {
      console.error('Failed to initialize Cash App Pay:', error);
      // Cash App may not be enabled - continue without it
    }
  }

  async function handlePayment() {
    const paymentInstance = paymentMethod === 'card' 
      ? cardRef.current 
      : cashAppRef.current;

    if (!paymentInstance) {
      onPaymentError({ message: 'Payment method not initialized' });
      return;
    }

    try {
      setIsLoading(true);

      // Tokenize payment method
      const result = await paymentInstance.tokenize();

      if (result.status === 'OK') {
        // Send token to your backend
        const response = await fetch('/api/payment/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: result.token,
            amount: amount,
            paymentMethod: paymentMethod,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          onPaymentSuccess(data);
        } else {
          onPaymentError(data);
        }
      } else {
        onPaymentError(result.errors);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Payment Details</h2>
        
        <div className="text-lg">
          Total: ${(amount / 100).toFixed(2)}
        </div>

        {/* Payment Method Selector */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
            }`}
          >
            Credit Card
          </button>
          {cashAppRef.current && (
            <button
              onClick={() => setPaymentMethod('cashapp')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                paymentMethod === 'cashapp'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300'
              }`}
            >
              Cash App
            </button>
          )}
        </div>

        {/* Card Container */}
        <div
          id="card-container"
          className={`${paymentMethod === 'card' ? 'block' : 'hidden'}`}
        />

        {/* Cash App Container */}
        <div
          id="cash-app-container"
          className={`${paymentMethod === 'cashapp' ? 'block' : 'hidden'}`}
        />

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
```

---

### Step 7: Create Backend Payment API Route

**Create `app/api/payment/process/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Client, Environment } from 'square';

// Initialize Square client
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});

export async function POST(request: NextRequest) {
  try {
    const { sourceId, amount, paymentMethod } = await request.json();

    // Validate required fields
    if (!sourceId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment
    const response = await client.paymentsApi.createPayment({
      sourceId,
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD',
      },
      locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!,
      idempotencyKey: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    return NextResponse.json({
      success: true,
      payment: response.result.payment,
    });

  } catch (error: any) {
    console.error('Payment processing error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Payment failed',
        details: error.errors || []
      },
      { status: 500 }
    );
  }
}
```

---

### Step 8: Install Square SDK

**Run:**
```bash
npm install square
# or
yarn add square
```

**Update `package.json` to include:**
```json
{
  "dependencies": {
    "square": "^39.0.0"
  }
}
```

---

### Step 9: Add CSP Headers for Next.js

**Create/Update `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://web.squarecdn.com https://sandbox.web.squarecdn.com",
              "style-src 'self' 'unsafe-inline'",
              "frame-src https://web.squarecdn.com https://sandbox.web.squarecdn.com",
              "connect-src 'self' https://web.squarecdn.com https://connect.squareup.com https://pci-connect.squareup.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 📝 Usage Example

**In your checkout page (`app/checkout/page.tsx`):**
```typescript
'use client';

import { useState } from 'react';
import SquarePaymentForm from '@/components/SquarePaymentForm';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [orderAmount] = useState(5000); // $50.00 in cents

  const handlePaymentSuccess = (result: any) => {
    console.log('Payment successful:', result);
    // Redirect to success page
    router.push('/order-confirmation');
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  };

  return (
    <div className="container mx-auto py-8">
      <SquarePaymentForm
        amount={orderAmount}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
}
```

---

## 🧪 Testing

### Test in Sandbox Mode

1. **Update `.env.local`:**
```bash
NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idp-YOUR_SANDBOX_APP_ID
SQUARE_ACCESS_TOKEN=YOUR_SANDBOX_ACCESS_TOKEN
```

2. **Use Square Test Cards:**
- **Success**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Postal Code**: Any valid code

3. **Test Cash App** (requires production environment)

---

## 🔍 Debugging Checklist

- [ ] Next.js version is 14.2.0
- [ ] Created NEW Square web application (not using Invoice app)
- [ ] Environment variables have `NEXT_PUBLIC_` prefix for client-side
- [ ] Square script loads in browser (check Network tab)
- [ ] Console shows no CSP errors
- [ ] Location `LWMA9R9E2ENXP` has Cash App enabled
- [ ] `#card-container` div exists in DOM
- [ ] `#cash-app-container` div exists in DOM
- [ ] Application ID and Location ID are correct
- [ ] Access token has required permissions

---

## 🐛 Common Errors & Solutions

### Error: "Square.js failed to load"
**Cause**: Script blocked or wrong environment
**Fix**: Check CSP headers, verify script URL in Network tab

### Error: "Payment method not initialized"
**Cause**: Component not waiting for Square SDK
**Fix**: Add loading state, don't show form until initialized

### Error: "INSUFFICIENT_SCOPES"
**Cause**: Access token missing permissions
**Fix**: Regenerate access token with PAYMENTS_WRITE permission

### Error: "Invalid location"
**Cause**: Wrong location ID
**Fix**: Use `LWMA9R9E2ENXP` for Gangrun Printing

### Cash App not showing
**Cause**: Not enabled in Square Dashboard
**Fix**: Contact Square Support to enable Cash App Pay

---

## 📞 Square Support

If issues persist after following this guide:

1. **Square Developer Support**: https://developer.squareup.com/support
2. **Square Dashboard**: https://squareup.com/dashboard
3. **API Documentation**: https://developer.squareup.com/docs

---

## ✅ Verification Steps

After implementing all fixes:

1. Run `npm run dev`
2. Navigate to checkout page
3. Open browser DevTools Console
4. Look for: "Card payment initialized"
5. Look for: "Cash App Pay initialized" (if enabled)
6. Test card payment with test card
7. Verify payment appears in Square Dashboard

---

## 🎯 Expected Result

After completing all steps, you should see:
- Credit card form loading properly
- Cash App Pay button displaying (if enabled)
- Successful test payments
- Payments showing in Square Dashboard under Gangrun Printing location
- Application details showing your NEW web application (not Invoices)

---

**Last Updated**: October 11, 2025
**Repository**: github.com/iradwatkins/gangrunprintingv1
**Location ID**: LWMA9R9E2ENXP