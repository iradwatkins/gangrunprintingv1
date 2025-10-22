'use client'

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

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

interface PayPalButtonProps {
  total: number
  onSuccess: (details: PayPalOrderDetails) => void
  onError: (error: string) => void
}

export function PayPalButton({ total, onSuccess, onError }: PayPalButtonProps) {
  const [error, setError] = useState<string | null>(null)

  // SECURITY: Load PayPal Client ID from environment variable
  // This should be set in .env as NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  if (!clientId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          PayPal is not configured. Please set NEXT_PUBLIC_PAYPAL_CLIENT_ID environment variable.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PayPalScriptProvider
        options={{
          clientId,
          currency: 'USD',
          intent: 'capture',
        }}
      >
        <PayPalButtons
          createOrder={async (data, actions) => {
            try {
              // Create order on your backend
              const response = await fetch('/api/checkout/create-paypal-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  amount: total.toFixed(2),
                }),
              })

              const orderData = await response.json()

              if (orderData.error) {
                throw new Error(orderData.error)
              }

              return orderData.id
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Failed to create PayPal order'
              setError(message)
              onError(message)
              throw err
            }
          }}
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
          }}
          onApprove={async (data, actions) => {
            try {
              // Capture payment on your backend
              const response = await fetch('/api/checkout/capture-paypal-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderID: data.orderID,
                }),
              })

              const details = await response.json()

              if (details.error) {
                throw new Error(details.error)
              }

              onSuccess(details)
            } catch (err) {
              const message =
                err instanceof Error ? err.message : 'Failed to capture PayPal payment'
              setError(message)
              onError(message)
            }
          }}
          onError={(err) => {
            const message = typeof err === 'string' ? err : 'PayPal payment failed'
            setError(message)
            onError(message)
          }}
        />
      </PayPalScriptProvider>

      <p className="text-xs text-center text-muted-foreground">
        Secure payment processed by PayPal
      </p>
    </div>
  )
}
