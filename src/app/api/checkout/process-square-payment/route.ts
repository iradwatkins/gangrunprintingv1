import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { SquareClient, SquareEnvironment } from 'square'
import { randomUUID } from 'crypto'

// Initialize Square client
const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.SQUARE_ENVIRONMENT === 'production'
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox,
})

// This endpoint processes tokenized card payments through Square
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { sourceId, amount, currency = 'USD', orderId, orderNumber } = body

    if (!sourceId || !amount) {
      return NextResponse.json({ error: 'Missing required payment details' }, { status: 400 })
    }

    console.log('[Square Payment] Processing payment:', {
      amount,
      currency,
      orderNumber,
      hasSourceId: !!sourceId,
    })

    // Create payment using Square Payments API
    const paymentsApi = squareClient.paymentsApi

    const paymentRequest = {
      sourceId: sourceId,
      amountMoney: {
        amount: BigInt(amount),
        currency: currency,
      },
      idempotencyKey: randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID!,
      referenceId: orderNumber,
    }

    const { result } = await paymentsApi.createPayment(paymentRequest)

    console.log('[Square Payment] Payment successful:', {
      paymentId: result.payment?.id,
      status: result.payment?.status,
      orderNumber,
    })

    return NextResponse.json({
      success: true,
      paymentId: result.payment?.id,
      orderId: orderId,
      orderNumber: orderNumber,
      status: result.payment?.status,
      receiptUrl: result.payment?.receiptUrl,
      message: 'Payment processed successfully',
    })
  } catch (error: any) {
    console.error('[Square Payment] Error:', error)

    // Handle specific Square API errors
    if (error?.errors && Array.isArray(error.errors)) {
      const squareError = error.errors[0]
      const errorCode = squareError?.code
      const errorDetail = squareError?.detail

      if (errorCode === 'CARD_DECLINED') {
        return NextResponse.json(
          { error: 'Your card was declined. Please try a different payment method.' },
          { status: 400 }
        )
      } else if (errorCode === 'INSUFFICIENT_FUNDS') {
        return NextResponse.json(
          { error: 'Insufficient funds. Please try a different card.' },
          { status: 400 }
        )
      } else if (errorCode === 'INVALID_CARD' || errorCode === 'INVALID_CARD_DATA') {
        return NextResponse.json(
          { error: 'Invalid card details. Please check your information and try again.' },
          { status: 400 }
        )
      } else if (errorCode === 'CVV_FAILURE') {
        return NextResponse.json(
          { error: 'Card verification failed. Please check your CVV and try again.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: errorDetail || 'Payment processing failed. Please try again.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Payment processing failed. Please try again.' },
      { status: 500 }
    )
  }
}
