import { NextRequest, NextResponse } from 'next/server';
import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

// Initialize Square client
const client = new Client({
  environment: process.env.NODE_ENV === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
});

// User-friendly decline messages
const DECLINE_MESSAGES: Record<string, string> = {
  'CARD_DECLINED': 'Your card was declined. Please try a different card or contact your bank.',
  'INSUFFICIENT_FUNDS': 'Insufficient funds. Please use a different payment method.',
  'CVV_FAILURE': 'Invalid security code (CVV). Please check your card details.',
  'INVALID_EXPIRATION': 'Your card has expired or the expiration date is invalid.',
  'INVALID_CARD_DATA': 'Invalid card information. Please check your card details.',
  'CARD_EXPIRED': 'Your card has expired. Please use a different card.',
  'CARD_NOT_SUPPORTED': 'This card type is not supported. Please try a different card.',
  'INVALID_ACCOUNT': 'Invalid card account. Please contact your card issuer.',
  'GENERIC_DECLINE': 'Your card was declined. Please contact your bank for more information.',
  'ADDRESS_VERIFICATION_FAILURE': 'Billing address verification failed. Please check your address.',
  'CARD_DECLINED_CALL_ISSUER': 'Card declined. Please contact your card issuer.',
  'CARD_DECLINED_VERIFICATION_REQUIRED': 'Additional verification required. Please contact your bank.',
  'TEMPORARY_ERROR': 'Temporary error. Please try again in a few moments.',
  'TRANSACTION_LIMIT': 'Transaction limit exceeded. Please contact your bank or try a smaller amount.',
  'VOICE_FAILURE': 'Voice authorization required. Please contact your bank.',
  'PAN_FAILURE': 'Invalid card number. Please check and try again.',
  'ALLOWABLE_PIN_TRIES_EXCEEDED': 'Too many PIN attempts. Please contact your bank.',
  'CARDHOLDER_INSUFFICIENT_PERMISSIONS': 'This card cannot be used for this transaction. Please use a different card.',
  'CHIP_INSERTION_REQUIRED': 'Chip card must be inserted. This is an online transaction error.',
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Payment request received');
    
    const body = await request.json();
    const { sourceId, amount, locationId } = body;

    // Validate inputs
    if (!sourceId) {
      console.error('❌ Missing sourceId');
      return NextResponse.json(
        { success: false, error: 'Missing payment token' },
        { status: 400 }
      );
    }

    if (!amount || isNaN(parseFloat(amount))) {
      console.error('❌ Invalid amount:', amount);
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    if (!locationId) {
      console.error('❌ Missing locationId');
      return NextResponse.json(
        { success: false, error: 'Missing location ID' },
        { status: 400 }
      );
    }

    // Validate server configuration
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.error('❌ SQUARE_ACCESS_TOKEN not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment system not configured. Please contact support.' 
        },
        { status: 500 }
      );
    }

    // Convert to cents
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    console.log('💰 Processing payment:', {
      amount: `$${amount}`,
      amountInCents,
      locationId,
      hasSourceId: true,
    });

    // Create payment with Square
    const { result } = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: randomUUID(),
      locationId,
      amountMoney: {
        amount: BigInt(amountInCents),
        currency: 'USD',
      },
    });

    console.log('✅ Payment successful!');
    console.log('Payment ID:', result.payment?.id);
    console.log('Status:', result.payment?.status);

    return NextResponse.json({
      success: true,
      paymentId: result.payment?.id,
      status: result.payment?.status,
      receiptUrl: result.payment?.receiptUrl,
      amount: amount,
    });

  } catch (error: any) {
    console.error('❌ Payment error:', error);

    // Extract error details
    let errorCode = 'UNKNOWN_ERROR';
    let errorMessage = 'Payment processing failed. Please try again.';
    let statusCode = 500;

    // Parse Square API errors
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      const squareError = error.errors[0];
      errorCode = squareError.code || 'UNKNOWN_ERROR';
      
      console.error('Square Error Details:', {
        code: errorCode,
        category: squareError.category,
        detail: squareError.detail,
      });

      // Get user-friendly message
      if (DECLINE_MESSAGES[errorCode]) {
        errorMessage = DECLINE_MESSAGES[errorCode];
      } else if (squareError.detail) {
        // Use Square's error detail if we don't have a custom message
        errorMessage = squareError.detail;
      }

      // Set appropriate HTTP status code based on error category
      const declineErrors = [
        'CARD_DECLINED', 'INSUFFICIENT_FUNDS', 'CVV_FAILURE',
        'CARD_EXPIRED', 'INVALID_EXPIRATION', 'GENERIC_DECLINE',
        'CARD_DECLINED_CALL_ISSUER', 'TRANSACTION_LIMIT',
        'ALLOWABLE_PIN_TRIES_EXCEEDED', 'VOICE_FAILURE'
      ];

      const invalidDataErrors = [
        'INVALID_CARD_DATA', 'INVALID_ACCOUNT', 'PAN_FAILURE',
        'ADDRESS_VERIFICATION_FAILURE'
      ];

      const verificationErrors = [
        'CARD_DECLINED_VERIFICATION_REQUIRED', 'VERIFY_CVV',
        'VERIFY_AVS_FAILURE', 'CARDHOLDER_INSUFFICIENT_PERMISSIONS'
      ];

      if (declineErrors.includes(errorCode)) {
        statusCode = 402; // Payment Required (card declined)
      } else if (invalidDataErrors.includes(errorCode)) {
        statusCode = 400; // Bad Request (invalid data)
      } else if (verificationErrors.includes(errorCode)) {
        statusCode = 403; // Forbidden (verification/authorization issue)
      } else if (errorCode === 'TEMPORARY_ERROR') {
        statusCode = 503; // Service Unavailable (try again later)
      } else if (errorCode === 'CARD_NOT_SUPPORTED' || errorCode === 'CHIP_INSERTION_REQUIRED') {
        statusCode = 422; // Unprocessable Entity (card not suitable for online payment)
      }

    } else if (error.message) {
      // Handle other errors (network, etc.)
      errorMessage = error.message;
      
      if (error.message.includes('authorized')) {
        statusCode = 403;
        errorMessage = 'Payment authorization failed. Please check your payment credentials.';
      }
    }

    // Log for debugging
    console.error('Error Details:', {
      code: errorCode,
      message: errorMessage,
      statusCode,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        errorCode: errorCode,
      },
      { status: statusCode }
    );
  }
}