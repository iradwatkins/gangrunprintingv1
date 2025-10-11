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
    const { sourceId, verificationToken, amount, paymentMethod } = await request.json();

    console.log('🔵 Processing payment:', {
      amount,
      paymentMethod,
      hasVerificationToken: !!verificationToken,
    });

    // Validate required fields
    if (!sourceId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique idempotency key
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create payment request
    const paymentRequest: any = {
      sourceId,
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD',
      },
      locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!,
      idempotencyKey,
    };

    // Add verification token if present (for 3D Secure)
    if (verificationToken) {
      paymentRequest.verificationToken = verificationToken;
    }

    // Add autocomplete for immediate capture
    paymentRequest.autocomplete = true;

    console.log('🔵 Calling Square API...');

    // Create payment
    const response = await client.paymentsApi.createPayment(paymentRequest);

    console.log('✅ Payment successful:', {
      paymentId: response.result.payment?.id,
      status: response.result.payment?.status,
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: response.result.payment?.id,
        status: response.result.payment?.status,
        amount: response.result.payment?.amountMoney,
        createdAt: response.result.payment?.createdAt,
        receiptUrl: response.result.payment?.receiptUrl,
      },
    });

  } catch (error: any) {
    console.error('❌ Payment processing error:', error);
    
    // Extract error details from Square API response
    const errorDetails = error.errors || [];
    const errorMessage = errorDetails[0]?.detail || error.message || 'Payment failed';
    
    console.error('Error details:', errorDetails);

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}