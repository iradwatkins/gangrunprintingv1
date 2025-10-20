'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/cart-context'
import {
  ShippingAddressForm,
  type ShippingAddress,
} from '@/components/checkout/shipping-address-form'
import {
  ShippingMethodSelector,
  type ShippingRate,
} from '@/components/checkout/shipping-method-selector'
import { AirportSelector } from '@/components/checkout/airport-selector'
import toast from '@/lib/toast'
import Link from 'next/link'

export default function ShippingPage() {
  const router = useRouter()
  const { items, subtotal, itemCount } = useCart()

  const [shippingAddress, setShippingAddress] = useState<Partial<ShippingAddress>>({
    country: 'US',
  })
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingRate | undefined>()
  const [selectedAirportId, setSelectedAirportId] = useState<string | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/checkout')
    }
  }, [items, router])

  // Calculate package weights from cart items
  // Ensure weight is at least 0.1 lbs (API minimum) and default to 1 lb if not set
  const packages = items.map((item) => ({
    weight: item.paperStockWeight && item.paperStockWeight >= 0.1 ? item.paperStockWeight : 1,
    dimensions: item.dimensions,
  }))

  const validateAddress = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!shippingAddress.firstName) newErrors.firstName = 'First name is required'
    if (!shippingAddress.lastName) newErrors.lastName = 'Last name is required'
    if (!shippingAddress.email) newErrors.email = 'Email is required'
    if (!shippingAddress.phone) newErrors.phone = 'Phone is required'
    if (!shippingAddress.street) newErrors.street = 'Street address is required'
    if (!shippingAddress.city) newErrors.city = 'City is required'
    if (!shippingAddress.state) newErrors.state = 'State is required'
    if (!shippingAddress.zipCode) newErrors.zipCode = 'ZIP code is required'

    // Email format validation
    if (shippingAddress.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) {
      newErrors.email = 'Invalid email format'
    }

    // ZIP code format validation
    if (shippingAddress.zipCode && !/^\d{5}(-\d{4})?$/.test(shippingAddress.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinueToPayment = () => {
    if (!validateAddress()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!selectedShippingMethod) {
      toast.error('Please select a shipping method')
      return
    }

    // Check if Southwest Cargo selected but no airport chosen
    if (
      selectedShippingMethod.carrier === 'SOUTHWEST_CARGO' &&
      !selectedAirportId
    ) {
      toast.error('Please select a pickup airport for Southwest Cargo')
      return
    }

    // Store shipping information in sessionStorage
    sessionStorage.setItem('checkout_shipping_address', JSON.stringify(shippingAddress))
    sessionStorage.setItem('checkout_shipping_method', JSON.stringify(selectedShippingMethod))
    if (selectedAirportId) {
      sessionStorage.setItem('checkout_airport_id', selectedAirportId)
    }

    // Navigate to payment page
    router.push('/checkout/payment')
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  const shippingCost = selectedShippingMethod?.rate.amount || 0
  const tax = subtotal * 0.10 // 10% tax rate
  const total = subtotal + shippingCost + tax

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/checkout" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold">Shipping Information</h1>
          <p className="text-muted-foreground mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your order
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Form */}
            <ShippingAddressForm
              address={shippingAddress}
              onChange={setShippingAddress}
              errors={errors}
            />

            {/* Shipping Method Selector */}
            {shippingAddress.zipCode && shippingAddress.state && shippingAddress.city && (
              <ShippingMethodSelector
                destination={{
                  street: shippingAddress.street,
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  zipCode: shippingAddress.zipCode,
                }}
                packages={packages}
                selectedMethod={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
              />
            )}

            {/* Airport Selector (Southwest Cargo only) */}
            {selectedShippingMethod?.carrier === 'SOUTHWEST_CARGO' && shippingAddress.state && (
              <AirportSelector
                state={shippingAddress.state}
                selectedAirportId={selectedAirportId}
                onSelect={setSelectedAirportId}
              />
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {selectedShippingMethod ? `$${shippingCost.toFixed(2)}` : 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (estimated)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                {/* Continue Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleContinueToPayment}
                  disabled={isProcessing || !selectedShippingMethod}
                >
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Trust Badge */}
                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    🔒 Secure checkout powered by Square
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
