'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Loader2, Lock } from 'lucide-react'

import { CheckoutItemImages } from '@/components/checkout/checkout-item-images'
import { PaymentMethods } from '@/components/checkout/payment-methods'
import { ShippingRates } from '@/components/checkout/shipping-rates'
import { SquareCardPayment } from '@/components/checkout/square-card-payment'
import { PageErrorBoundary } from '@/components/error-boundary'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'

function CheckoutPageContent() {
  const router = useRouter()
  const { items, subtotal, tax, shipping: _shipping, total: _total, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [paymentStep, setPaymentStep] = useState<'info' | 'payment' | 'card'>('info')
  const [_selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [selectedShippingRate, setSelectedShippingRate] = useState<{
    carrier: string
    serviceName: string
    totalCost: number
    transitDays: number
    isAirportDelivery?: boolean
  } | null>(null)
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
  })

  // Square configuration (these should come from environment variables)
  const SQUARE_APPLICATION_ID =
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || 'sandbox-sq0idb-YOUR_APP_ID'
  const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || 'YOUR_LOCATION_ID'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Your cart is empty')
      router.push('/cart')
      return
    }

    // Validate form data
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate shipping rate selection
    if (!selectedShippingRate) {
      toast.error('Please select a shipping method')
      return
    }

    // Move to payment selection
    setPaymentStep('payment')
  }

  const handlePaymentMethodSelect = async (method: string) => {
    setSelectedPaymentMethod(method)
    setIsProcessing(true)

    try {
      if (method === 'card') {
        // Show inline card payment
        setPaymentStep('card')
        setIsProcessing(false)
        return
      }

      if (method === 'square') {
        // Use existing Square checkout flow
        await processSquareCheckout()
      } else {
        // Handle other payment methods (CashApp, PayPal)
        toast.error(`${method} payment is coming soon!`)
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Payment method selection error:', error)
      toast.error('Failed to initialize payment. Please try again.')
      setIsProcessing(false)
    }
  }

  const processSquareCheckout = async () => {
    try {
      const checkoutData = createCheckoutData()

      const response = await fetch('/api/checkout/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.checkoutUrl) {
        sessionStorage.setItem(
          'lastOrder',
          JSON.stringify({
            orderNumber: result.orderNumber,
            orderId: result.orderId,
            total: checkoutData.total,
            items: checkoutData.cartItems,
            customerInfo: checkoutData.customerInfo,
            shippingAddress: checkoutData.shippingAddress,
            subtotal: checkoutData.subtotal,
            tax: checkoutData.tax,
            shipping: checkoutData.shipping,
          })
        )

        clearCart()
        window.location.href = result.checkoutUrl
      } else {
        throw new Error(result.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Square checkout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process checkout'
      toast.error(errorMessage)
      throw error
    }
  }

  const createCheckoutData = () => {
    const shippingCost = selectedShippingRate?.rateAmount || 0
    const total = subtotal + tax + shippingCost

    return {
      cartItems: items,
      customerInfo: {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        phone: formData.phone,
      },
      shippingAddress: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: 'US',
      },
      billingAddress: sameAsShipping
        ? null
        : {
            street: formData.billingAddress,
            city: formData.billingCity,
            state: formData.billingState,
            zipCode: formData.billingZipCode,
            country: 'US',
          },
      shippingRate: selectedShippingRate,
      selectedAirportId,
      subtotal,
      tax,
      shipping: shippingCost,
      total,
    }
  }

  const handleCardPaymentSuccess = (result: {
    paymentId?: string
    orderId?: string
    orderNumber?: string
  }) => {
    toast.success('Payment processed successfully!')

    // Store success info
    const checkoutData = createCheckoutData()
    sessionStorage.setItem(
      'lastOrder',
      JSON.stringify({
        orderNumber: result.orderNumber || `GRP-${Date.now()}`,
        orderId: result.orderId || result.paymentId,
        total: orderTotal,
        items: checkoutData.cartItems,
        customerInfo: checkoutData.customerInfo,
        shippingAddress: checkoutData.shippingAddress,
        subtotal: checkoutData.subtotal,
        tax: checkoutData.tax,
        shipping: checkoutData.shipping,
      })
    )

    clearCart()
    router.push('/checkout/success')
  }

  const handleCardPaymentError = (error: string) => {
    toast.error(error)
    setIsProcessing(false)
  }

  const handleBackToPayment = () => {
    setPaymentStep('payment')
    setSelectedPaymentMethod('')
  }

  const handleBackToInfo = () => {
    setPaymentStep('info')
    setSelectedPaymentMethod('')
  }

  const shippingCost = selectedShippingRate?.rateAmount || 0
  const orderTotal = subtotal + tax + shippingCost

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add items to your cart before checking out</p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        href="/cart"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    required
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      required
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      required
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    required
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    required
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      required
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      required
                      id="state"
                      maxLength={2}
                      name="state"
                      placeholder="TX"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    required
                    id="zipCode"
                    maxLength={10}
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Billing Address</h2>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={sameAsShipping}
                    id="sameAsShipping"
                    onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                  />
                  <Label className="text-sm font-normal cursor-pointer" htmlFor="sameAsShipping">
                    Same as shipping
                  </Label>
                </div>
              </div>

              {!sameAsShipping && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="billingAddress">Street Address</Label>
                    <Input
                      id="billingAddress"
                      name="billingAddress"
                      required={!sameAsShipping}
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingCity">City</Label>
                      <Input
                        id="billingCity"
                        name="billingCity"
                        required={!sameAsShipping}
                        value={formData.billingCity}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingState">State</Label>
                      <Input
                        id="billingState"
                        maxLength={2}
                        name="billingState"
                        placeholder="TX"
                        required={!sameAsShipping}
                        value={formData.billingState}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="billingZipCode">ZIP Code</Label>
                    <Input
                      id="billingZipCode"
                      maxLength={10}
                      name="billingZipCode"
                      required={!sameAsShipping}
                      value={formData.billingZipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Method */}
            {formData.address && formData.city && formData.state && formData.zipCode && (
              <ShippingRates
                items={items.map((item) => ({
                  quantity: item.quantity,
                  width: 8.5, // Default width
                  height: 11, // Default height
                  paperStockWeight: 0.1, // Default weight
                }))}
                toAddress={{
                  street: formData.address,
                  city: formData.city,
                  state: formData.state,
                  zipCode: formData.zipCode,
                  country: 'US',
                }}
                onAirportSelected={setSelectedAirportId}
                onRateSelected={setSelectedShippingRate}
              />
            )}
          </div>

          {/* Order Summary / Payment */}
          <div>
            <div className="border rounded-lg p-6 sticky top-4">
              {paymentStep === 'info' && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                  {/* Cart Items */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="border-b border-border/50 pb-3 last:border-b-0">
                        <div className="flex justify-between text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                            {/* Customer Design Preview */}
                            <CheckoutItemImages item={item} />
                            {/* Item options */}
                            {(item.options.size || item.options.paperStock) && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.options.size && <span>Size: {item.options.size}</span>}
                                {item.options.size && item.options.paperStock && <span> • </span>}
                                {item.options.paperStock && (
                                  <span>Paper: {item.options.paperStock}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4 border-t pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        Shipping
                        {selectedShippingRate && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({selectedShippingRate.carrier} - {selectedShippingRate.serviceName})
                          </span>
                        )}
                      </span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 font-semibold">
                      <div className="flex justify-between text-lg">
                        <span>Total</span>
                        <span>${orderTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" disabled={isProcessing} size="lg" type="submit">
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Continue to Payment
                      </>
                    )}
                  </Button>

                  <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground">
                    <Lock className="mr-1 h-4 w-4" />
                    Secure checkout powered by Square
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <p>
                      By placing this order, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </>
              )}

              {paymentStep === 'payment' && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Button className="p-2" size="sm" variant="ghost" onClick={handleBackToInfo}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">Payment Method</h2>
                  </div>

                  <PaymentMethods
                    isProcessing={isProcessing}
                    total={orderTotal}
                    onPaymentMethodSelect={handlePaymentMethodSelect}
                  />
                </>
              )}

              {paymentStep === 'card' && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Button className="p-2" size="sm" variant="ghost" onClick={handleBackToPayment}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">Card Payment</h2>
                  </div>

                  <SquareCardPayment
                    applicationId={SQUARE_APPLICATION_ID}
                    locationId={SQUARE_LOCATION_ID}
                    total={orderTotal}
                    onBack={handleBackToPayment}
                    onPaymentError={handleCardPaymentError}
                    onPaymentSuccess={handleCardPaymentSuccess}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <PageErrorBoundary pageName="Checkout">
      <CheckoutPageContent />
    </PageErrorBoundary>
  )
}
