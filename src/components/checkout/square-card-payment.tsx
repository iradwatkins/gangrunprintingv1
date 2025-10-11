'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Lock, CreditCard } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SquareCardPaymentProps {
  applicationId: string
  locationId: string
  total: number
  environment?: 'sandbox' | 'production'
  billingContact?: {
    givenName?: string
    familyName?: string
    email?: string
    phone?: string
    addressLines?: string[]
    city?: string
    state?: string
    countryCode?: string
    postalCode?: string
  }
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
  environment = 'sandbox',
  billingContact,
  onPaymentSuccess,
  onPaymentError,
  onBack,
}: SquareCardPaymentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState<any>(null)
  const [cashAppPay, setCashAppPay] = useState<any>(null)
  const [payments, setPayments] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cashapp'>('card')
  const initAttempted = useRef(false)

  useEffect(() => {
    if (initAttempted.current) return
    initAttempted.current = true

    // Set isLoading to false immediately so containers render
    setIsLoading(false)

    console.log('[Square] Starting initialization process')
    console.log('[Square] Environment check:', {
      appId: applicationId?.substring(0, 20) + '...',
      locationId,
      hasSquareSDK: typeof window.Square !== 'undefined',
    })

    const initializeSquare = async () => {
      try {
        // Load Square.js script dynamically
        await loadSquareScript()

        // Wait for Square SDK
        let attempts = 0
        const maxAttempts = 50
        while (!window.Square && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          attempts++
        }

        if (!window.Square) {
          throw new Error('Square Web Payments SDK failed to load - please refresh the page')
        }

        console.log('[Square] Square SDK ready after', attempts * 100, 'ms')
        console.log('[Square] Creating payments instance...')

        const paymentsInstance = (window.Square as any).payments(applicationId, locationId)
        setPayments(paymentsInstance)
        console.log('[Square] Payments instance created')

        // Initialize card
        console.log('[Square] Creating card instance...')
        const cardInstance = await paymentsInstance.card({
          style: {
            '.input-container': {
              borderRadius: '6px',
              borderColor: '#D1D5DB',
              borderWidth: '1px',
            },
            '.input-container.is-focus': {
              borderColor: '#3B82F6',
            },
            '.input-container.is-error': {
              borderColor: '#EF4444',
            },
            input: {
              fontSize: '14px',
              color: '#374151',
            },
            'input::placeholder': {
              color: '#9CA3AF',
            },
          },
        })

        console.log('[Square] Waiting for card container...')
        let containerAttempts = 0
        let container = document.getElementById('square-card-container')
        while (!container && containerAttempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          container = document.getElementById('square-card-container')
          containerAttempts++
        }

        if (!container) {
          throw new Error('Card container element not found after 3 seconds')
        }

        console.log('[Square] Container found, attaching card...')
        await cardInstance.attach('#square-card-container')
        setCard(cardInstance)
        console.log('[Square] Card attached successfully')

        // Try to initialize Cash App Pay
        try {
          console.log('[Cash App Pay] Attempting initialization...')
          const cashAppInstance = await paymentsInstance.cashAppPay({
            redirectURL: window.location.href,
            referenceId: `order-${Date.now()}`,
          })

          // Wait for Cash App container
          let cashAppContainer = document.getElementById('square-cashapp-container')
          let cashAppAttempts = 0
          while (!cashAppContainer && cashAppAttempts < 30) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            cashAppContainer = document.getElementById('square-cashapp-container')
            cashAppAttempts++
          }

          if (cashAppContainer) {
            await cashAppInstance.attach('#square-cashapp-container')
            setCashAppPay(cashAppInstance)
            console.log('[Cash App Pay] Initialized successfully')
          } else {
            console.warn('[Cash App Pay] Container not found')
          }
        } catch (cashAppError: any) {
          console.log('[Cash App Pay] Not available:', cashAppError.message)
        }

        setIsInitializing(false)
        console.log('[Square] Initialization complete')
      } catch (err) {
        console.error('[Square] Initialization error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setError(`Failed to initialize payment form: ${errorMsg}`)
        setIsInitializing(false)
      }
    }

    // Safety timeout
    const timeout = setTimeout(() => {
      if (isInitializing) {
        console.error('[Square] Initialization timeout after 10 seconds')
        setError('Payment form initialization timeout. Please refresh the page or contact support.')
        setIsInitializing(false)
      }
    }, 10000)

    // Wait for DOM to be ready before initializing
    const initTimer = setTimeout(() => {
      initializeSquare()
    }, 300)

    return () => {
      clearTimeout(timeout)
      clearTimeout(initTimer)
      if (card) {
        card.destroy()
      }
      if (cashAppPay) {
        cashAppPay.destroy()
      }
    }
  }, [applicationId, locationId])

  const loadSquareScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Square) {
        console.log('[Square] Square.js already loaded')
        resolve(true)
        return
      }

      console.log('[Square] Loading Square.js script...')
      const script = document.createElement('script')
      // Use correct environment URL based on SQUARE_ENVIRONMENT
      const sdkUrl = environment === 'production'
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js'
      console.log(`[Square] Using ${environment} environment:`, sdkUrl)
      script.src = sdkUrl
      script.async = true

      script.onload = () => {
        console.log('[Square] Square.js loaded successfully')
        resolve(true)
      }

      script.onerror = (error) => {
        console.error('[Square] Failed to load Square.js:', error)
        reject(new Error('Failed to load Square.js. Please check your internet connection.'))
      }

      document.head.appendChild(script)
    })
  }

  const handleCardPayment = async () => {
    if (!card || !payments) return

    setIsProcessing(true)
    setError(null)

    try {
      console.log('[Square] Starting card payment process...')

      const verificationDetails = {
        intent: 'CHARGE',
        amount: (Math.round(total * 100)).toString(),
        currencyCode: 'USD',
        billingContact: billingContact || {
          givenName: 'Customer',
          familyName: '',
        },
        customerInitiated: true,
        sellerKeyedIn: false,
      }

      console.log('[Square] Tokenizing card...')
      const result = await card.tokenize(verificationDetails)

      if (result.status === 'OK') {
        console.log('[Square] Tokenization successful')

        const response = await fetch('/api/checkout/process-square-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: result.token,
            amount: Math.round(total * 100),
            currency: 'USD',
          }),
        })

        const paymentResult = await response.json()

        if (paymentResult.success) {
          console.log('[Square] Payment successful')
          onPaymentSuccess(paymentResult)
        } else {
          throw new Error(paymentResult.error || 'Payment failed')
        }
      } else {
        const errorMessages = result.errors?.map((error: Record<string, unknown>) => error.message).join(', ')
        throw new Error(errorMessages || 'Card validation failed')
      }
    } catch (err) {
      console.error('[Square] Payment error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCashAppPayment = async () => {
    if (!cashAppPay || !payments) return

    setIsProcessing(true)
    setError(null)

    try {
      console.log('[Cash App Pay] Starting payment...')
      const result = await cashAppPay.tokenize()

      if (result.status === 'OK') {
        console.log('[Cash App Pay] Tokenization successful')

        const response = await fetch('/api/checkout/process-square-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: result.token,
            amount: Math.round(total * 100),
            currency: 'USD',
          }),
        })

        const paymentResult = await response.json()

        if (paymentResult.success) {
          console.log('[Cash App Pay] Payment successful')
          onPaymentSuccess(paymentResult)
        } else {
          throw new Error(paymentResult.error || 'Payment failed')
        }
      } else {
        const errorMessages = result.errors?.map((error: Record<string, unknown>) => error.message).join(', ')
        throw new Error(errorMessages || 'Cash App validation failed')
      }
    } catch (err) {
      console.error('[Cash App Pay] Payment error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Cash App payment failed'
      setError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            Secure Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Method Selection */}
          {cashAppPay && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Select Payment Method</label>
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
                  <CreditCard className="h-5 w-5 mx-auto mb-2" />
                  Credit Card
                </button>
                <button
                  onClick={() => setPaymentMethod('cashapp')}
                  disabled={!cashAppPay}
                  className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                    paymentMethod === 'cashapp'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${!cashAppPay ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  💚 Cash App Pay
                </button>
              </div>
            </div>
          )}

          {/* Card Payment Section */}
          {paymentMethod === 'card' && (
            <div>
              <label className="block text-sm font-medium mb-2">Card Details</label>
              <div
                className="min-h-[60px] p-3 border rounded-md bg-background relative"
                id="square-card-container"
              >
                {isInitializing && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-3 text-sm text-muted-foreground">Loading payment form...</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your card information is secure and encrypted by Square
              </p>
            </div>
          )}

          {/* Cash App Payment Section */}
          {paymentMethod === 'cashapp' && cashAppPay && (
            <div>
              <label className="block text-sm font-medium mb-2">Cash App Pay</label>
              <div
                className="min-h-[60px] p-3 border rounded-md bg-background"
                id="square-cashapp-container"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Click the Cash App button to complete your payment
              </p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Total Amount</span>
              <span className="text-lg font-semibold">${total.toFixed(2)}</span>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" disabled={isProcessing} variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={isProcessing || (paymentMethod === 'card' && !card) || (paymentMethod === 'cashapp' && !cashAppPay)}
                onClick={paymentMethod === 'card' ? handleCardPayment : handleCashAppPayment}
              >
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
