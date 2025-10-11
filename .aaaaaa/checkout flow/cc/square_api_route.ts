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
    const { sourceId, amount, locationId } = await request.json();

    // Validate required fields
    if (!sourceId || !amount || !locationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment with Square
    const { result } = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: randomUUID(),
      locationId,
      amountMoney: {
        amount: BigInt(Math.round(parseFloat(amount) * 100)), // Convert to cents
        currency: 'USD',
      },
    });

    console.log('Payment created successfully:', result.payment?.id);

    return NextResponse.json({
      success: true,
      paymentId: result.payment?.id,
      status: result.payment?.status,
    });

  } catch (error: any) {
    console.error('Payment processing error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Payment processing failed',
      },
      { status: 500 }
    );
  }
}
