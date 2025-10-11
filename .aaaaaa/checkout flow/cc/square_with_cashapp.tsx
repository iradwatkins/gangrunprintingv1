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
  const [cashApp, setCashApp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cashapp'>('card');
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
          reject(new Error('Failed to load Square.js. Please check your internet connection and refresh the page.'));
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
      throw new Error('Square.js loaded but Square object not available. Please refresh the page.');
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
        console.log('- Environment:', process.env.NODE_ENV);

        if (!appId || !locationId) {
          throw new Error('Missing Square credentials. Check your .env.local file.');
        }

        console.log('🔵 Initializing Square Payments...');
        const payments = window.Square.payments(appId, locationId);
        
        // Initialize Card
        console.log('🔵 Initializing Card...');
        const cardInstance = await payments.card();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const cardContainer = document.getElementById('square-card-container');
        if (cardContainer) {
          console.log('🔵 Attaching card to container...');
          await cardInstance.attach('#square-card-container');
          setCard(cardInstance);
          console.log('✅ Card initialized successfully');
        }

        // Initialize Cash App Pay
        console.log('🔵 Initializing Cash App Pay...');
        try {
          const cashAppInstance = await payments.cashAppPay({
            redirectURL: window.location.href,
            referenceId: `order-${Date.now()}`,
          });
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const cashAppContainer = document.getElementById('square-cashapp-container');
          if (cashAppContainer) {
            console.log('🔵 Attaching Cash App to container...');
            await cashAppInstance.attach('#square-cashapp-container');
            setCashApp(cashAppInstance);
            console.log('✅ Cash App Pay initialized successfully');
          }
        } catch (cashAppError: any) {
          console.warn('⚠️ Cash App Pay not available:', cashAppError.message);
          console.log('💡 Cash App may not be enabled for this location');
        }
        
        setIsLoading(false);
        console.log('✅ Square payment form ready!');

      } catch (err: any) {
        console.error('❌ Initialization error:', err);
        setError(err.message || 'Failed to initialize payment form');
        setIsLoading(false);
      }
    }

    initializeSquare();
  }, []);

  const handleCardPayment = async () => {
    if (!card || isProcessing) return;
    
    setIsProcessing(true);
    setError('');

    try {
      console.log('🔵 Processing card payment...');

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

      console.log('🔵 Tokenizing card...');
      const tokenResult = await card.tokenize(verificationDetails);

      if (tokenResult.status === 'OK') {
        console.log('✅ Token received');
        await processPayment(tokenResult.token);
      } else {
        const errors = tokenResult.errors?.map((e: any) => e.message).join(', ');
        throw new Error(errors || 'Card tokenization failed');
      }

    } catch (err: any) {
      console.error('❌ Card payment error:', err);
      setError(err.message || 'Card payment failed. Please try again.');
      onPaymentError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashAppPayment = async () => {
    if (!cashApp || isProcessing) return;
    
    setIsProcessing(true);
    setError('');

    try {
      console.log('🔵 Processing Cash App payment...');

      const paymentRequest = cashApp.tokenize();
      
      if (paymentRequest.status === 'OK') {
        console.log('✅ Cash App token received');
        await processPayment(paymentRequest.token);
      } else {
        const errors = paymentRequest.errors?.map((e: any) => e.message).join(', ');
        throw new Error(errors || 'Cash App payment failed');
      }

    } catch (err: any) {
      console.error('❌ Cash App payment error:', err);
      setError(err.message || 'Cash App payment failed. Please try again.');
      onPaymentError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (token: string) => {
    console.log('🔵 Sending to backend...');
    const response = await fetch('/api/payment/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceId: token,
        amount: amount,
        locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Payment successful!');
      onPaymentSuccess?.(result);
    } else {
      throw new Error(result.error || 'Payment processing failed');
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
      <div className="flex items-center justify-center p-12 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-700 font-medium">Loading payment options...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error && !card && !cashApp) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Payment Form Error</h3>
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        
        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900">Select Payment Method</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod('card')}
              disabled={!card}
              className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              } ${!card ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              💳 Credit Card
            </button>
            <button
              onClick={() => setPaymentMethod('cashapp')}
              disabled={!cashApp}
              className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                paymentMethod === 'cashapp'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              } ${!cashApp ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              💚 Cash App Pay
              {!cashApp && <span className="text-xs block mt-1">Not Available</span>}
            </button>
          </div>
        </div>

        {paymentMethod === 'card' && card && (
          <>
            {/* Billing Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Billing Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="givenName"
                    placeholder="John"
                    value={billingInfo.givenName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="familyName"
                    placeholder="Doe"
                    value={billingInfo.familyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={billingInfo.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="(555) 555-5555"
                  value={billingInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="addressLines"
                  placeholder="123 Main St"
                  value={billingInfo.addressLines}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Atlanta"
                    value={billingInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="GA"
                    value={billingInfo.state}
                    onChange={handleInputChange}
                    maxLength={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Card Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Card Information</h3>
              
              <div 
                id="square-card-container"
                className="border-2 border-gray-300 rounded-lg p-4 min-h-[100px] bg-white"
              />
            </div>
          </>
        )}

        {paymentMethod === 'cashapp' && cashApp && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Cash App Pay</h3>
            <div 
              id="square-cashapp-container"
              className="border-2 border-gray-300 rounded-lg p-4 min-h-[80px] bg-white"
            />
            <p className="text-sm text-gray-600">
              Click the Cash App button above to complete your payment
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={paymentMethod === 'card' ? handleCardPayment : handleCashAppPayment}
          disabled={isProcessing || (paymentMethod === 'card' && !card) || (paymentMethod === 'cashapp' && !cashApp)}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg transition-all"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${amount} with ${paymentMethod === 'card' ? 'Card' : 'Cash App'}`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Your payment information is encrypted and secure. Powered by Square.
        </p>
      </div>
    </div>
  );
}