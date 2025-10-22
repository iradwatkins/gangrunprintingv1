'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Check } from 'lucide-react'
import QRCode from 'qrcode'

interface PayPalOrderDetails {
  id: string
  status: string
  payer?: {
    name?: {
      given_name: string
      surname: string
    }
    email_address?: string
  }
}

interface CashAppQRPaymentProps {
  total: number
  onPaymentSuccess: (result: Record<string, unknown>) => void
  onPaymentError: (error: string) => void
  onBack: () => void
}

export function CashAppQRPayment({
  total,
  onPaymentSuccess,
  onPaymentError,
  onBack,
}: CashAppQRPaymentProps) {
  const [qrCodeDataURL, setQRCodeDataURL] = useState<string>('')
  const [paymentLink, setPaymentLink] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    generateCashAppPayment()
  }, [total])

  const generateCashAppPayment = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Get Square environment variables
      const squareAppId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
      const squareLocationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
      const squareEnvironment = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox'

      if (!squareAppId || !squareLocationId) {
        throw new Error('Square configuration missing. Please contact support.')
      }

      // Load Square.js script if not already loaded
      if (!window.Square) {
        const script = document.createElement('script')
        script.src = squareEnvironment === 'production'
          ? 'https://web.squarecdn.com/v1/square.js'
          : 'https://sandbox.web.squarecdn.com/v1/square.js'
        script.async = true

        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })

        // Wait for Square SDK to be available
        let attempts = 0
        while (!window.Square && attempts < 50) {
          await new Promise(r => setTimeout(r, 100))
          attempts++
        }
      }

      if (!window.Square) {
        throw new Error('Failed to load Square SDK')
      }

      // Initialize Square Payments
      const payments = (window.Square as any).payments(squareAppId, squareLocationId)

      // IMPORTANT: Convert total to cents (Square requirement)
      const amountInCents = Math.round(total * 100).toString()

      // Create payment request with amount in cents
      const paymentRequest = payments.paymentRequest({
        countryCode: 'US',
        currencyCode: 'USD',
        total: {
          amount: amountInCents,
          label: 'Total',
        },
      })

      // Create Cash App Pay instance
      const cashAppPayInstance = await payments.cashAppPay(paymentRequest, {
        redirectURL: window.location.href,
        referenceId: `order-${Date.now()}`,
      })

      // Generate QR code using Square's method
      const qrCode = await cashAppPayInstance.getQRCode()

      setQRCodeDataURL(qrCode)
      setPaymentLink(window.location.href)

      // Store instance for tokenization
      ;(window as any).__cashAppPayInstance = cashAppPayInstance

    } catch (err) {
      console.error('[Cash App QR] Error generating payment:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate payment QR code'
      setError(errorMsg)
      onPaymentError(errorMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConfirmPayment = async () => {
    setIsChecking(true)
    setError(null)

    try {
      // Get the Cash App Pay instance
      const cashAppPayInstance = (window as any).__cashAppPayInstance

      if (!cashAppPayInstance) {
        throw new Error('Cash App Pay not initialized. Please refresh and try again.')
      }

      // Tokenize the payment
      const result = await cashAppPayInstance.tokenize()

      if (result.status !== 'OK') {
        const errorMessages = result.errors?.map((error: any) => error.message).join(', ')
        throw new Error(errorMessages || 'Cash App payment failed')
      }

      // Process payment through Square API
      const response = await fetch('/api/checkout/process-square-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId: result.token,
          amount: Math.round(total * 100), // Amount in cents
          currency: 'USD',
        }),
      })

      const paymentResult = await response.json()

      if (paymentResult.success) {
        onPaymentSuccess(paymentResult)
      } else {
        throw new Error(paymentResult.error || 'Payment processing failed')
      }
    } catch (err) {
      console.error('[Cash App QR] Payment confirmation error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Payment verification failed'
      setError(errorMsg)
      onPaymentError(errorMsg)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#00D632] flex items-center justify-center p-1.5">
            <svg className="w-full h-full fill-white" viewBox="0 0 24 24">
              <path d="M23.59 3.47a5.11 5.11 0 0 0-3.05-3.05c-2.68-1-13.49-1-13.49-1S2.67.42 0 1.42A5.11 5.11 0 0 0-.53 4.47c-.16.8-.27 1.94-.33 3.06h.02A71.04 71.04 0 0 0-.81 12c.01 1.61.13 3.15.34 4.49a5.11 5.11 0 0 0 3.05 3.05c2.68 1 13.49 1 13.49 1s10.81.01 13.49-1a5.11 5.11 0 0 0 3.05-3.05c.16-.8.27-1.94.33-3.06h-.02a71.04 71.04 0 0 0 .03-4.47c-.01-1.61-.13-3.15-.34-4.49zM9.63 15.65V8.35L15.73 12l-6.1 3.65z"/>
            </svg>
          </div>
          Pay with Cash App
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-sm text-muted-foreground">Generating payment QR code...</p>
          </div>
        ) : (
          <>
            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-green-600">
                {qrCodeDataURL && (
                  <img
                    alt="Cash App Payment QR Code"
                    className="w-[300px] h-[300px]"
                    loading="lazy" src={qrCodeDataURL}
                  />
                )}
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Scan to Pay ${total.toFixed(2)}</h3>
                <p className="text-sm text-muted-foreground">
                  Open Cash App on your phone and scan this QR code
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs">
                  1
                </span>
                Open Cash App
              </h4>
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs">
                  2
                </span>
                Tap the QR scanner icon
              </h4>
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs">
                  3
                </span>
                Scan this QR code
              </h4>
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs">
                  4
                </span>
                Confirm payment of ${total.toFixed(2)}
              </h4>
              <h4 className="font-medium flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs">
                  5
                </span>
                Click "I've Paid" below
              </h4>
            </div>

            {/* Mobile Note */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                On mobile? The QR code will automatically open Cash App when ready.
              </p>
            </div>

            {/* Payment Confirmation */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="text-lg font-semibold text-green-600">${total.toFixed(2)}</span>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  disabled={isChecking}
                  variant="outline"
                  onClick={onBack}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isChecking}
                  onClick={handleConfirmPayment}
                >
                  {isChecking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      I've Paid
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="text-center text-xs text-muted-foreground">
          Payment processed securely through Cash App
        </div>
      </CardContent>
    </Card>
  )
}
