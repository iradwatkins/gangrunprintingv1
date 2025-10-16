'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CashAppPaymentProps {
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

export function CashAppPayment({
  applicationId,
  locationId,
  total,
  onPaymentSuccess,
  onPaymentError,
  onBack,
}: CashAppPaymentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cashAppPay, setCashAppPay] = useState<any>(null)
  const [payments, setPayments] = useState<any>(null)
  const cashAppContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // console.log('[Cash App Pay] Starting initialization')
    // console.log('[Cash App Pay] Environment:', {
    //   appId: applicationId?.substring(0, 20) + '...',
    //   locationId,
    //   amount: total,
    //   hasSquareSDK: typeof window.Square !== 'undefined',
    // })

    // Safety timeout
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.error('[Cash App Pay] Initialization timeout after 10 seconds')
        setError('Cash App Pay initialization timeout. This payment method may not be available.')
        setIsLoading(false)
      }
    }, 10000)

    const initializeCashApp = async () => {
      try {
        // console.log('[Cash App Pay] Waiting for Square SDK...')

        // Wait for Square SDK
        let attempts = 0
        const maxAttempts = 50
        while (!window.Square && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          attempts++
        }

        if (!window.Square) {
          throw new Error('Square Web Payments SDK failed to load')
        }

        // console.log('[Cash App Pay] Square SDK ready after', attempts * 100, 'ms')

        // Create payments instance
        const paymentsInstance = (window.Square as any).payments(applicationId, locationId)
        setPayments(paymentsInstance)
        // console.log('[Cash App Pay] Payments instance created')

        // Create payment request
        const paymentRequest = paymentsInstance.paymentRequest({
          countryCode: 'US',
          currencyCode: 'USD',
          total: {
            amount: total.toFixed(2),
            label: 'Total',
          },
        })

        // console.log('[Cash App Pay] Payment request created:', {
        //   amount: total.toFixed(2),
        //   currency: 'USD',
        // })

        // Initialize Cash App Pay
        // console.log('[Cash App Pay] Initializing Cash App Pay...')
        const cashAppInstance = await paymentsInstance.cashAppPay(paymentRequest, {
          redirectURL: window.location.href,
          referenceId: `order_${Date.now()}`,
        })

        // console.log('[Cash App Pay] Cash App Pay instance created')

        // Set up tokenization event listener
        cashAppInstance.addEventListener('ontokenization', async (event: any) => {
          // console.log('[Cash App Pay] Tokenization event:', event.detail)
          const { tokenResult } = event.detail

          if (tokenResult.status === 'OK') {
            await handlePayment(tokenResult.token)
          } else {
            const errorMessages = tokenResult.errors
              ?.map((error: Record<string, unknown>) => error.message)
              .join(', ')
            setError(errorMessages || 'Cash App Pay tokenization failed')
            onPaymentError(errorMessages || 'Cash App Pay tokenization failed')
          }
        })

        // Wait for container
        // console.log('[Cash App Pay] Waiting for container...')
        let containerAttempts = 0
        let container = document.getElementById('cash-app-container')
        while (!container && containerAttempts < 30) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          container = document.getElementById('cash-app-container')
          containerAttempts++
        }

        if (!container) {
          throw new Error('Cash App Pay container not found after 3 seconds')
        }

        // console.log('[Cash App Pay] Attaching to container...')
        await cashAppInstance.attach('#cash-app-container', {
          size: 'medium',
          shape: 'semiround',
          width: 'full',
        })

        setCashAppPay(cashAppInstance)
        // console.log('[Cash App Pay] Successfully attached and ready')
        setIsLoading(false)
      } catch (err) {
        console.error('[Cash App Pay] Initialization error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'

        // If Cash App Pay is not available, show a friendly message
        if (errorMsg.includes('not available') || errorMsg.includes('unsupported')) {
          setError('Cash App Pay is not available for this merchant. Please use a different payment method.')
        } else {
          setError(`Failed to initialize Cash App Pay: ${errorMsg}`)
        }
        setIsLoading(false)
      }
    }

    initializeCashApp()

    // Cleanup
    return () => {
      clearTimeout(timeout)
      if (cashAppPay) {
        try {
          cashAppPay.destroy()
        } catch (e) {
          // console.log('[Cash App Pay] Cleanup error:', e)
        }
      }
    }
  }, [applicationId, locationId, total, isLoading])

  const handlePayment = async (token: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      // console.log('[Cash App Pay] Processing payment...')

      // Send token to backend
      const response = await fetch('/api/checkout/process-square-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId: token,
          amount: Math.round(total * 100), // Convert to cents
          currency: 'USD',
        }),
      })

      const paymentResult = await response.json()

      if (paymentResult.success) {
        // console.log('[Cash App Pay] Payment successful')
        onPaymentSuccess(paymentResult)
      } else {
        throw new Error(paymentResult.error || 'Payment failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      console.error('[Cash App Pay] Payment error:', errorMessage)
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
            <span className="ml-3">Loading Cash App Pay...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
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
            <span className="text-green-600 font-bold text-2xl">$</span>
            Cash App Pay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Pay securely using your Cash App account
          </div>

          {/* Cash App Pay Button Container */}
          <div>
            <div
              ref={cashAppContainerRef}
              className="min-h-[48px]"
              id="cash-app-container"
            >
              {/* Cash App Pay button will be injected here */}
            </div>
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Powered by Square • Secure Payment Processing
        </p>
      </div>
    </div>
  )
}
