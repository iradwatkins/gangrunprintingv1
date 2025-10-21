'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react'
import { SquareCardPayment } from '@/components/checkout/square-card-payment'
import { PayPalButton } from '@/components/checkout/paypal-button'
import { CashAppQRPayment } from '@/components/checkout/cashapp-qr-payment'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'

type PaymentMethod = 'square' | 'paypal' | 'cashapp' | null

export default function PaymentPage() {
  const router = useRouter()
  const { items, subtotal, clearCart, itemCount } = useCart()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [shippingAddress, setShippingAddress] = useState<any>(null)
  const [shippingMethod, setShippingMethod] = useState<any>(null)
  const [airportId, setAirportId] = useState<string | undefined>()
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load order data from session storage
  useEffect(() => {
    const loadOrderData = () => {
      try {
        // Load shipping information from new flow
        const shippingAddressData = sessionStorage.getItem('checkout_shipping_address')
        const shippingMethodData = sessionStorage.getItem('checkout_shipping_method')
        const airportIdData = sessionStorage.getItem('checkout_airport_id')
        const artworkFiles = sessionStorage.getItem('cart_artwork_files')

        // If no shipping data, redirect back to shipping page
        if (!shippingAddressData || !shippingMethodData) {
          toast.error('Please complete shipping information first.')
          router.push('/checkout/shipping')
          return
        }

        // Parse and set the state
        const parsedAddress = JSON.parse(shippingAddressData)
        const parsedMethod = JSON.parse(shippingMethodData)
        const parsedFiles = artworkFiles ? JSON.parse(artworkFiles) : []

        setShippingAddress(parsedAddress)
        setShippingMethod(parsedMethod)
        setAirportId(airportIdData || undefined)
        setUploadedFiles(parsedFiles)
        setIsLoading(false)
      } catch (error) {
        console.error('[Payment] Error loading order data:', error)
        toast.error('Error loading order data')
        router.push('/checkout/shipping')
      }
    }

    loadOrderData()
  }, [router])

  const handlePaymentSuccess = async (result: Record<string, unknown>) => {
    try {
      console.log('[Payment] Payment successful:', result)

      // Clear cart
      clearCart()

      // Clear session storage
      sessionStorage.removeItem('checkout_shipping_address')
      sessionStorage.removeItem('checkout_shipping_method')
      sessionStorage.removeItem('checkout_airport_id')
      sessionStorage.removeItem('cart_artwork_files')

      toast.success('Payment successful!')

      // Redirect to success page
      router.push('/checkout/success')
    } catch (error) {
      console.error('[Payment] Error handling payment success:', error)
      toast.error('Payment succeeded but order creation failed. Please contact support.')
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('[Payment] Payment error:', error)
    toast.error(error)
  }

  const handleBackToShipping = () => {
    router.push('/checkout/shipping')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment options...</p>
        </div>
      </div>
    )
  }

  if (!shippingAddress || !shippingMethod || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Incomplete Checkout</h1>
          <p className="text-muted-foreground mb-6">
            Please complete shipping information first
          </p>
          <Button onClick={() => router.push('/checkout/shipping')}>Go to Shipping</Button>
        </div>
      </div>
    )
  }

  const shippingCost = shippingMethod.rate.amount
  const tax = subtotal * 0.10
  const total = subtotal + shippingCost + tax

  // Get Square environment variables
  const squareAppId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID
  const squareLocationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
  const squareEnvironment = (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            className="mb-4"
            variant="ghost"
            onClick={handleBackToShipping}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shipping
          </Button>
          <h1 className="text-3xl font-bold">Complete Your Payment</h1>
          <p className="text-muted-foreground mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} • ${total.toFixed(2)} total
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            {!selectedMethod && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Square Card Payment */}
                  <button
                    className="w-full p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
                    onClick={() => setSelectedMethod('square')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Credit/Debit Card</h3>
                          <p className="text-sm text-muted-foreground">
                            Visa, Mastercard, American Express, Discover
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Select →
                      </div>
                    </div>
                  </button>

                  {/* Cash App Pay - QR Code */}
                  <button
                    className="w-full p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
                    onClick={() => setSelectedMethod('cashapp')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-2xl">💚</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Cash App - Scan QR Code</h3>
                          <p className="text-sm text-muted-foreground">
                            Scan with your phone to pay securely
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Select →
                      </div>
                    </div>
                  </button>

                  {/* PayPal */}
                  <button
                    className="w-full p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-left group"
                    onClick={() => setSelectedMethod('paypal')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-600">P</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">PayPal</h3>
                          <p className="text-sm text-muted-foreground">
                            Pay securely with your PayPal account
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Select →
                      </div>
                    </div>
                  </button>

                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      All payments are secured with industry-standard encryption. Your payment information is never stored on our servers.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Square Payment Component */}
            {selectedMethod === 'square' && squareAppId && squareLocationId && (
              <div>
                <SquareCardPayment
                  applicationId={squareAppId}
                  environment={squareEnvironment}
                  locationId={squareLocationId}
                  total={total}
                  onBack={() => setSelectedMethod(null)}
                  onPaymentError={handlePaymentError}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </div>
            )}

            {/* PayPal Payment Component */}
            {selectedMethod === 'paypal' && (
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">P</span>
                      PayPal Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PayPalButton
                      total={total}
                      onError={handlePaymentError}
                      onSuccess={handlePaymentSuccess}
                    />
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setSelectedMethod(null)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Choose Different Method
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Cash App QR Payment Component */}
            {selectedMethod === 'cashapp' && (
              <CashAppQRPayment
                total={total}
                onBack={() => setSelectedMethod(null)}
                onPaymentError={handlePaymentError}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}

            {/* Missing Configuration Warning */}
            {selectedMethod === 'square' && (!squareAppId || !squareLocationId) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Square payment is not configured. Please contact support.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Count */}
                <div className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (estimated)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="border-t pt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    🔒 Secure checkout • PCI DSS compliant
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
