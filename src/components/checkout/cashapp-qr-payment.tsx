'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Check } from 'lucide-react'
import QRCode from 'qrcode'

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
      // Create Cash App payment link
      // Format: $cashtag/amount
      const cashtag = 'gangrunprinting' // Your Cash App cashtag
      const amount = total.toFixed(2)

      // Cash App deep link format
      const cashAppLink = `https://cash.app/$${cashtag}/${amount}`

      setPaymentLink(cashAppLink)

      // Generate QR code
      const qrDataURL = await QRCode.toDataURL(cashAppLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#00D632', // Cash App green
          light: '#FFFFFF',
        },
      })

      setQRCodeDataURL(qrDataURL)
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
      // In a real implementation, you would:
      // 1. Have customer scan QR and pay via Cash App
      // 2. Customer clicks "I've Paid" button
      // 3. Backend verifies payment via Cash App API webhooks
      // 4. Once verified, call onPaymentSuccess

      // For now, simulate payment confirmation
      // TODO: Implement actual Cash App payment verification
      console.log('[Cash App QR] Payment confirmation needed for:', paymentLink)

      // Simulate API call to verify payment
      const response = await fetch('/api/checkout/verify-cashapp-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentLink,
          amount: total,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onPaymentSuccess(result)
      } else {
        throw new Error(result.error || 'Payment verification failed')
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
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💚</span>
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
                    src={qrCodeDataURL}
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

            {/* Mobile Link Alternative */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">On mobile? Tap the button below:</p>
              <a
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                href={paymentLink}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="text-lg">💚</span>
                Open in Cash App
              </a>
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
