'use client';

import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    Square: any;
  }
}

interface SquarePaymentFormProps {
  amount: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: any) => void;
}

export default function SquarePaymentForm({
  amount,
  onPaymentSuccess,
  onPaymentError
}: SquarePaymentFormProps) {
  const [card, setCard] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const initializationAttempted = useRef(false);

  const [billingInfo, setBillingInfo] = useState({
    givenName: '',
    familyName: '',
    email: '',
    phone: '',
    addressLines: '',
    city: '',
    state: '',
    countryCode: 'US',
  });

  useEffect(() => {
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;

    async function loadSquareScript() {
      return new Promise((resolve, reject) => {
        if (window.Square) {
          console.log('✅ Square.js already loaded');
          resolve(true);
          return;
        }

        console.log('🔵 Loading Square.js script...');
        
        const script = document.createElement('script');
        script.src = process.env.NODE_ENV === 'production'
          ? 'https://web.squarecdn.com/v1/square.js'
          : 'https://sandbox.web.squarecdn.com/v1/square.js';
        
        script.async = true;
        
        script.onload = () => {
          console.log('✅ Square.js script loaded successfully');
          resolve(true);
        };
        
        script.onerror = (error) => {
          console.error('❌ Failed to load Square.js script:', error);
          reject(new Error('Failed to load Square.js. Please check your internet connection.'));
        };
        
        document.head.appendChild(script);
      });
    }

    async function waitForSquare(maxAttempts = 20) {
      for (let i = 0; i < maxAttempts; i++) {
        if (window.Square) {
          console.log('✅ Square object is available');
          return true;
        }
        console.log(`⏳ Waiting for Square... (${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      throw new Error('Square.js timeout. Please refresh the page.');
    }

    async function initializeSquare() {
      try {
        await loadSquareScript();
        await waitForSquare();

        const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

        console.log('🔍 Environment Check:');
        console.log('- App ID:', appId ? '✅ Set' : '❌ Missing');
        console.log('- Location ID:', locationId ? '✅ Set' : '❌ Missing');

        if (!appId || !locationId) {
          throw new Error('Missing Square credentials in .env.local');
        }

        console.log('🔵 Initializing Square Payments...');
        const payments = window.Square.payments(appId, locationId);
        
        console.log('🔵 Initializing Card...');
        const cardInstance = await payments.card();
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const container = document.getElementById('card-container');
        if (!container) {
          throw new Error('Card container not found');
        }

        console.log('🔵 Attaching card...');
        await cardInstance.attach('#card-container');
        
        setCard(cardInstance);
        setIsLoading(false);
        console.log('✅ Card ready!');

      } catch (err: any) {
        console.error('❌ Init error:', err);
        setError(err.message || 'Failed to initialize payment form');
        setIsLoading(false);
      }
    }

    initializeSquare();
  }, []);

  const handleSubmit = async () => {
    if (!card || isProcessing) return;
    
    setIsProcessing(true);
    setError('');

    try {
      console.log('🔵 Tokenizing...');

      // CRITICAL: Use Square's NEW tokenization approach
      const verificationDetails = {
        amount: amount,
        currencyCode: 'USD',
        intent: 'CHARGE',
        customerInitiated: true,
        sellerKeyedIn: false,
        billingContact: {
          givenName: billingInfo.givenName || undefined,
          familyName: billingInfo.familyName || undefined,
          email: billingInfo.email || undefined,
          phone: billingInfo.phone || undefined,
          addressLines: billingInfo.addressLines ? [billingInfo.addressLines] : undefined,
          city: billingInfo.city || undefined,
          state: billingInfo.state || undefined,
          countryCode: billingInfo.countryCode,
        },
      };

      const tokenResult = await card.tokenize(verificationDetails);

      if (tokenResult.status === 'OK') {
        console.log('✅ Token received');
        
        // FIXED: Use YOUR actual API endpoint
        const response = await fetch('/api/checkout/process-square-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: tokenResult.token,
            amount: amount,
            locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend error:', errorText);
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          console.log('✅ Payment successful!');
          onPaymentSuccess?.(result);
        } else {
          throw new Error(result.error || 'Payment failed');
        }
      } else {
        const errors = tokenResult.errors?.map((e: any) => e.message).join(', ');
        throw new Error(errors || 'Tokenization failed');
      }

    } catch (err: any) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment failed');
      onPaymentError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Billing Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="givenName"
            placeholder="First Name"
            value={billingInfo.givenName}
            onChange={handleInputChange}
            required
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="familyName"
            placeholder="Last Name"
            value={billingInfo.familyName}
            onChange={handleInputChange}
            required
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={billingInfo.email}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={billingInfo.phone}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="addressLines"
          placeholder="Address"
          value={billingInfo.addressLines}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={billingInfo.city}
            onChange={handleInputChange}
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={billingInfo.state}
            onChange={handleInputChange}
            maxLength={2}
            className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Card Information</h3>
        
        <div 
          id="card-container"
          className="border rounded p-4 min-h-[80px]"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isProcessing || !card}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </div>
  );
}