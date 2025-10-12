'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PayInvoiceButtonProps {
  invoiceId: string
  amount: number
}

export function PayInvoiceButton({ invoiceId, amount }: PayInvoiceButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment link')
      }

      const { payment } = await response.json()

      // Redirect to Square checkout
      if (payment.checkoutUrl) {
        window.location.href = payment.checkoutUrl
      } else {
        throw new Error('No payment URL received')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process payment')
      setIsProcessing(false)
    }
  }

  return (
    <Button
      size="lg"
      className="w-full md:w-auto min-w-[200px]"
      onClick={handlePayment}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-5 w-5 mr-2" />
          Pay ${(amount / 100).toFixed(2)} Now
        </>
      )}
    </Button>
  )
}
