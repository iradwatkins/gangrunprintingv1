'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SquareCardPaymentProps {
  applicationId: string
  locationId: string
  total: number
  onPaymentSuccess: (result: any) => void
  onPaymentError: (error: string) => void
  onBack: () => void
}

declare global {
  interface Window {
    Square?: any
  }
}

export function SquareCardPayment({
  applicationId,
  locationId,
  total,
  onPaymentSuccess,
  onPaymentError,
  onBack,
}: SquareCardPaymentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState<any>(null)
  const [payments, setPayments] = useState<any>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeSquare = async () => {
      try {
        // Load Square Web Payments SDK
        if (!window.Square) {
          const script = document.createElement('script')
          script.src = 'https://web.squarecdn.com/v1/square.js'
          script.async = true
          document.head.appendChild(script)

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
          })
        }

        if (!window.Square) {
          throw new Error('Square Web Payments SDK failed to load')
        }

        // Initialize payments
        const paymentsInstance = window.Square.payments(applicationId, locationId)
        setPayments(paymentsInstance)

        // Initialize card
        const cardInstance = await paymentsInstance.card({
          style: {
            input: {
              fontSize: '14px',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
              color: '#374151',
              '::placeholder': {
                color: '#9CA3AF',
              },
            },
            '.input-container': {
              borderRadius: '6px',
              borderColor: '#D1D5DB',
              borderWidth: '1px',
            },
            '.input-container.is-focus': {
              borderColor: '#3B82F6',
              borderWidth: '2px',
            },
            '.input-container.is-error': {
              borderColor: '#EF4444',
            },
          },
        })

        await cardInstance.attach('#card-container')
        setCard(cardInstance)
        setIsLoading(false)
      } catch (err) {
        console.error('Square initialization error:', err)
        setError('Failed to initialize payment form. Please refresh and try again.')
        setIsLoading(false)
      }
    }

    initializeSquare()

    // Cleanup
    return () => {
      if (card) {
        card.destroy()
      }
    }
  }, [applicationId, locationId])

  const handlePayment = async () => {
    if (!card || !payments) return

    setIsProcessing(true)
    setError(null)

    try {
      // Tokenize the card
      const result = await card.tokenize()

      if (result.status === 'OK') {
        // Send token to your backend for processing
        const response = await fetch('/api/checkout/process-square-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: result.token,
            amount: Math.round(total * 100), // Convert to cents
            currency: 'USD',
          }),
        })

        const paymentResult = await response.json()

        if (paymentResult.success) {
          onPaymentSuccess(paymentResult)
        } else {
          throw new Error(paymentResult.error || 'Payment failed')
        }
      } else {
        // Handle tokenization errors
        const errorMessages = result.errors?.map((error: any) => error.message).join(', ')
        throw new Error(errorMessages || 'Card validation failed')
      }
    } catch (err) {
      console.error('Payment error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading payment form...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Secure Card Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Card Details</label>
            <div
              ref={cardContainerRef}
              className="min-h-[60px] p-3 border rounded-md bg-background"
              id="card-container"
            >
              {/* Square card form will be injected here */}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Your card information is secure and encrypted by Square
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Total Amount</span>
              <span className="text-lg font-semibold">${total.toFixed(2)}</span>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" disabled={isProcessing} variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button className="flex-1" disabled={isProcessing} onClick={handlePayment}>
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Powered by Square • PCI DSS Level 1 Compliant
        </p>
      </div>
    </div>
  )
}
