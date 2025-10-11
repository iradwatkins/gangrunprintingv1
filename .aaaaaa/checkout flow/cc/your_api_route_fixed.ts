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

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 API: Payment request received');
    
    const body = await request.json();
    const { sourceId, amount, locationId } = body;

    console.log('📦 Request data:', { 
      hasSourceId: !!sourceId, 
      amount, 
      locationId 
    });

    // Validate required fields
    if (!sourceId) {
      console.error('❌ Missing sourceId');
      return NextResponse.json(
        { success: false, error: 'Missing payment token (sourceId)' },
        { status: 400 }
      );
    }

    if (!amount) {
      console.error('❌ Missing amount');
      return NextResponse.json(
        { success: false, error: 'Missing amount' },
        { status: 400 }
      );
    }

    if (!locationId) {
      console.error('❌ Missing locationId');
      return NextResponse.json(
        { success: false, error: 'Missing locationId' },
        { status: 400 }
      );
    }

    // Validate access token
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.error('❌ Missing SQUARE_ACCESS_TOKEN env variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing access token' },
        { status: 500 }
      );
    }

    console.log('🔵 Creating payment with Square...');

    // Convert amount to cents (Square requires amount in smallest currency unit)
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    console.log('💰 Amount in cents:', amountInCents);

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

    console.log('✅ Payment created successfully');
    console.log('Payment ID:', result.payment?.id);
    console.log('Payment Status:', result.payment?.status);

    return NextResponse.json({
      success: true,
      paymentId: result.payment?.id,
      status: result.payment?.status,
      receiptUrl: result.payment?.receiptUrl,
    });

  } catch (error: any) {
    console.error('❌ Payment processing error:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      errors: error.errors,
    });
    
    // Extract meaningful error message
    let errorMessage = 'Payment processing failed';
    
    if (error.errors && error.errors.length > 0) {
      errorMessage = error.errors.map((e: any) => e.detail || e.code).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}