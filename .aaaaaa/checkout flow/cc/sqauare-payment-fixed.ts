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
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cashapp'>('card');
  const [error, setError] = useState<string | null>(null);
  
  const cardRef = useRef<any>(null);
  const cashAppRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);
  const containerMountedRef = useRef(false);

  useEffect(() => {
    // Mark containers as mounted
    containerMountedRef.current = true;
    
    // Wait for DOM to be fully ready
    const initTimer = setTimeout(() => {
      initializeSquarePayments();
    }, 100);

    return () => {
      clearTimeout(initTimer);
      containerMountedRef.current = false;
    };
  }, []);

  async function initializeSquarePayments() {
    console.log('🔵 Initializing Square...');
    
    // Verify containers exist
    const cardContainer = document.getElementById('card-container');
    const cashAppContainer = document.getElementById('cash-app-container');
    
    console.log('Card container exists?', !!cardContainer);
    console.log('Cash App container exists?', !!cashAppContainer);
    
    if (!cardContainer) {
      setError('Payment form not ready. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    if (!window.Square) {
      console.error('❌ Square.js failed to load');
      setError('Payment system not loaded. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    try {
      const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
      const locId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
      
      console.log('App ID:', appId);
      console.log('Location ID:', locId);

      if (!appId || !locId) {
        throw new Error('Missing Square configuration');
      }

      const payments = window.Square.payments(appId, locId);
      paymentsRef.current = payments;

      // Initialize Card Payment
      await initializeCard(payments);

      // Try to initialize Cash App Pay (may fail if not enabled)
      await initializeCashApp(payments);

      setIsLoading(false);
      console.log('✅ Square initialized successfully');
    } catch (error: any) {
      console.error('❌ Failed to initialize Square:', error);
      setError(error.message || 'Failed to load payment form');
      setIsLoading(false);
    }
  }

  async function initializeCard(payments: any) {
    try {
      console.log('🔵 Initializing card...');
      
      const card = await payments.card({
        style: {
          input: {
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#000',
          },
          '.input-container': {
            borderColor: '#d1d5db',
            borderRadius: '0.5rem',
          },
          '.input-container.is-focus': {
            borderColor: '#3b82f6',
          },
          '.input-container.is-error': {
            borderColor: '#ef4444',
          },
        },
      });
      
      await card.attach('#card-container');
      cardRef.current = card;
      console.log('✅ Card initialized');
    } catch (error: any) {
      console.error('❌ Card initialization failed:', error);
      throw error;
    }
  }

  async function initializeCashApp(payments: any) {
    try {
      console.log('🔵 Attempting Cash App initialization...');
      
      const cashAppPay = await payments.cashAppPay({
        redirectURL: window.location.href,
        referenceId: `order-${Date.now()}`,
      });
      
      await cashAppPay.attach('#cash-app-container');
      cashAppRef.current = cashAppPay;
      console.log('✅ Cash App initialized');
    } catch (error: any) {
      console.warn('⚠️ Cash App not available:', error.message);
      // Cash App may not be enabled - this is OK
    }
  }

  async function handlePayment() {
    const paymentInstance = paymentMethod === 'card' 
      ? cardRef.current 
      : cashAppRef.current;

    if (!paymentInstance) {
      setError('Payment method not available');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      console.log('🔵 Tokenizing payment...');

      // Tokenize payment method
      const result = await paymentInstance.tokenize();

      if (result.status === 'OK') {
        console.log('✅ Token received:', result.token);

        // Create verification details for 3D Secure - ALL REQUIRED FIELDS
        const verificationDetails = {
          intent: 'CHARGE', // Required: string
          amount: amount.toString(), // Amount in cents as string
          currencyCode: 'USD',
          billingContact: {
            givenName: result.details?.cardholderName?.split(' ')[0] || '',
            familyName: result.details?.cardholderName?.split(' ').slice(1).join(' ') || '',
          },
          // CRITICAL: These fields are required by Square
          customerInitiated: true, // Required: boolean - true = customer initiated payment
          sellerKeyedIn: false, // Required: boolean - false = card entered online, true = keyed in by merchant
        };

        // Verify buyer for 3D Secure (SCA - Strong Customer Authentication)
        let verificationToken = undefined;
        try {
          console.log('🔵 Verifying buyer with 3D Secure...');
          const verificationResult = await paymentsRef.current.verifyBuyer(
            result.token,
            verificationDetails
          );
          verificationToken = verificationResult.token;
          console.log('✅ Buyer verification complete:', verificationToken);
        } catch (verifyError: any) {
          console.warn('⚠️ Verification error (may not be required for this card):', verifyError.message);
          // Some cards don't require 3D Secure - continue without verification token
        }

        // Send to backend
        console.log('🔵 Processing payment...');
        const response = await fetch('/api/payment/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: result.token,
            verificationToken: verificationToken,
            amount: amount,
            paymentMethod: paymentMethod,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('✅ Payment successful');
          onPaymentSuccess(data);
        } else {
          console.error('❌ Payment failed:', data);
          setError(data.error || 'Payment failed');
          onPaymentError(data);
        }
      } else {
        console.error('❌ Tokenization failed:', result.errors);
        const errorMessage = result.errors?.[0]?.message || 'Payment failed';
        setError(errorMessage);
        onPaymentError(result.errors);
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setError(error.message || 'An error occurred');
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
        <p className="text-center text-gray-600 mt-4">Loading payment form...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Payment Details</h2>
        
        <div className="text-lg font-semibold">
          Total: ${(amount / 100).toFixed(2)}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Payment Method Selector */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setPaymentMethod('card')}
            disabled={isProcessing}
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors font-medium ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            💳 Credit Card
          </button>
          {cashAppRef.current && (
            <button
              onClick={() => setPaymentMethod('cashapp')}
              disabled={isProcessing}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors font-medium ${
                paymentMethod === 'cashapp'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              💵 Cash App
            </button>
          )}
        </div>

        {/* Card Container - MUST EXIST IN DOM */}
        <div
          id="card-container"
          className={`min-h-[200px] ${paymentMethod === 'card' ? 'block' : 'hidden'}`}
          style={{ minHeight: '200px' }} // Ensure it has height even when hidden
        />

        {/* Cash App Container - MUST EXIST IN DOM */}
        <div
          id="cash-app-container"
          className={`min-h-[100px] ${paymentMethod === 'cashapp' ? 'block' : 'hidden'}`}
          style={{ minHeight: '100px' }}
        />

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing || isLoading}
          className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your payment is secure and encrypted
        </p>
      </div>
    </div>
  );
}