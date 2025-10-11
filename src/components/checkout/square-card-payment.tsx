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
  onPaymentSuccess: (result: Record<string, unknown>) => void
  onPaymentError: (error: string) => void
  onBack: () => void
}

declare global {
  interface Window {
    Square?: Record<string, unknown>
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
  const [applePay, setApplePay] = useState<any>(null)
  const [payments, setPayments] = useState<any>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const applePayContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // CRITICAL FIX: Don't initialize until the container ref is attached
    if (!cardContainerRef.current) {
      console.log('[Square] Container ref not ready yet, skipping initialization')
      return
    }

    console.log('[Square] Container ref confirmed ready, starting initialization')

    const initializeSquare = async () => {
      try {
        console.log('[Square] Starting initialization...', { applicationId, locationId })

        // Load Square Web Payments SDK
        if (!window.Square) {
          console.log('[Square] Loading SDK script...')
          const script = document.createElement('script')
          script.src = 'https://web.squarecdn.com/v1/square.js'
          script.async = true
          document.head.appendChild(script)

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
          })
          console.log('[Square] SDK script loaded')
        }

        // Wait for Square to be available
        let attempts = 0
        const maxAttempts = 50
        while (!window.Square && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          attempts++
        }

        if (!window.Square) {
          throw new Error('Square Web Payments SDK failed to load')
        }

        console.log('[Square] Square SDK ready after', attempts * 100, 'ms')

        // Double-check container still exists
        if (!cardContainerRef.current) {
          console.log('[Square] Container disappeared during SDK load, aborting')
          return
        }

        console.log('[Square] Creating payments instance...')
        const paymentsInstance = (window.Square as any).payments(applicationId, locationId)
        setPayments(paymentsInstance)
        console.log('[Square] Payments instance created')

        // Initialize card
        console.log('[Square] Creating card instance...')
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

        console.log('[Square] Attaching card to container...')

        // CRITICAL: Wait for DOM element to be ready
        let containerAttempts = 0
        let container = document.getElementById('card-container')
        while (!container && containerAttempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          container = document.getElementById('card-container')
          containerAttempts++
        }

        if (!container) {
          throw new Error('Card container element not found after 3 seconds')
        }

        console.log('[Square] Container found, attaching card...')
        await cardInstance.attach('#card-container')
        setCard(cardInstance)
        console.log('[Square] Card attached successfully')

        // Initialize Apple Pay (will only show on supported devices)
        try {
          console.log('[Square] Attempting Apple Pay initialization...')
          const applePayInstance = await paymentsInstance.applePay({
            style: {
              buttonType: 'plain',
              buttonColor: 'black',
              buttonLocale: 'en-US',
            },
          })
          await applePayInstance.attach('#apple-pay-container')
          setApplePay(applePayInstance)
          console.log('[Square] Apple Pay initialized')
        } catch (applePayError) {
          // Apple Pay not available on this device/browser - this is expected on non-Safari browsers
          console.log('[Square] Apple Pay not available:', applePayError)
        }

        // Try to initialize Cash App Pay
        try {
          console.log('[Square] Attempting Cash App Pay initialization...')
          const cashAppInstance = await paymentsInstance.cashAppPay({
            redirectURL: window.location.href,
            referenceId: `order_${Date.now()}`,
          })
          console.log('[Square] Cash App Pay available:', cashAppInstance)
          // We'll need to add UI for Cash App Pay if it initializes
        } catch (cashAppError) {
          console.log('[Square] Cash App Pay not available:', cashAppError)
        }

        setIsLoading(false)
        console.log('[Square] Initialization complete')
      } catch (err) {
        console.error('[Square] Initialization error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setError(`Failed to initialize payment form: ${errorMsg}`)
        setIsLoading(false)
      }
    }

    initializeSquare()

    // Cleanup
    return () => {
      if (card) {
        card.destroy()
      }
      if (applePay) {
        applePay.destroy()
      }
    }
  }, [applicationId, locationId])

  const handleCardPayment = async () => {
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
        const errorMessages = result.errors
          ?.map((error: Record<string, unknown>) => error.message)
          .join(', ')
        throw new Error(errorMessages || 'Card validation failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApplePayPayment = async () => {
    if (!applePay || !payments) return

    setIsProcessing(true)
    setError(null)

    try {
      // Tokenize Apple Pay
      const result = await applePay.tokenize()

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
        const errorMessages = result.errors
          ?.map((error: Record<string, unknown>) => error.message)
          .join(', ')
        throw new Error(errorMessages || 'Apple Pay validation failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Apple Pay processing failed'
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

          {/* Apple Pay Button - Only shows on supported devices */}
          {applePay && (
            <div>
              <label className="block text-sm font-medium mb-2">Pay with Apple Pay</label>
              <div
                ref={applePayContainerRef}
                className="mb-4"
                id="apple-pay-container"
                onClick={handleApplePayPayment}
              >
                {/* Apple Pay button will be injected here */}
              </div>
            </div>
          )}

          {/* Divider if Apple Pay is available */}
          {applePay && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or pay with card</span>
              </div>
            </div>
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
              <Button className="flex-1" disabled={isProcessing} onClick={handleCardPayment}>
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
