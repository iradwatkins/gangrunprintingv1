'use client'

import { Suspense } from 'react'
import { CheckCircle, Download, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || 'ORD-XXXXXX'

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your order. We've received your payment and will begin processing your items shortly.
        </p>

        <div className="border rounded-lg p-6 mb-8 bg-muted/50">
          <p className="text-sm text-muted-foreground mb-2">Order Number</p>
          <p className="text-2xl font-bold font-mono">{orderNumber}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Mail className="h-5 w-5" />
            <p>A confirmation email has been sent to your email address</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>You can track your order status at any time using your order number.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
          <div className="text-left space-y-3 max-w-md mx-auto">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-medium">Design Review</p>
                <p className="text-sm text-muted-foreground">Our team will review your files within 24 hours</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-medium">Production</p>
                <p className="text-sm text-muted-foreground">Your order will enter production once approved</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <p className="font-medium">Shipping</p>
                <p className="text-sm text-muted-foreground">We'll notify you when your order ships</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Link href="/track">
            <Button size="lg">
              Track Your Order
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline">
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="mt-8">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}