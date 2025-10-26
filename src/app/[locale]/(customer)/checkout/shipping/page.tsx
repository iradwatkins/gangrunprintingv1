'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { SavedAddresses } from '@/components/checkout/saved-addresses'
import { useUser } from '@/hooks/use-user'
import toast from '@/lib/toast'
import { Link } from '@/lib/i18n/navigation'

export default function ShippingPage() {
  const router = useRouter()
  const { items, subtotal, itemCount } = useCart()
  const { user } = useUser()

  const [shippingAddress, setShippingAddress] = useState<Partial<ShippingAddress>>({
    country: 'US',
  })
  const [showManualForm, setShowManualForm] = useState(false)
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false)
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingRate | undefined>()
  const [selectedAirportId, setSelectedAirportId] = useState<string | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  // CRITICAL: Redirect if cart is empty OR if checkout data is missing
  // This prevents users from bookmarking /checkout/shipping and accessing it directly
  useEffect(() => {
    if (items.length === 0) {
      // No items in cart - redirect to cart/checkout page
      router.push('/checkout')
      return
    }

    // Check if checkout session exists (user should come from /checkout page)
    const checkoutData = sessionStorage.getItem('checkout_cart_data')
    if (!checkoutData) {
      // No checkout session - user trying to access shipping directly
      console.warn('[Shipping] No checkout session found - redirecting to /checkout')
      router.push('/checkout')
      return
    }
  }, [items, router])

  // Load previously entered shipping data from sessionStorage (if customer navigates back)
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedAddress = sessionStorage.getItem('checkout_shipping_address')
        const savedMethod = sessionStorage.getItem('checkout_shipping_method')
        const savedAirport = sessionStorage.getItem('checkout_airport_id')

        if (savedAddress) {
          const parsed = JSON.parse(savedAddress)
          setShippingAddress(parsed)
        }

        if (savedMethod) {
          const parsed = JSON.parse(savedMethod)
          setSelectedShippingMethod(parsed)
        }

        if (savedAirport) {
          setSelectedAirportId(savedAirport)
        }
      } catch (error) {
        console.error('[Shipping] Error loading saved data:', error)
        // Don't show error to user - just start fresh
      }
    }

    loadSavedData()
  }, []) // Run only once on mount

  // ============================================================================
  // 🚨 CRITICAL: FEDEX SHIPPING PACKAGE VALIDATION (October 21, 2025)
  // ============================================================================
  // MANDATORY PATTERN: Only include dimensions if ALL values are fully defined as valid numbers
  // FedEx API returns 400 "Invalid request" when dimensions have undefined values
  // Root Cause: Cart items can have dimensions: { length: undefined, width: undefined, height: undefined }
  // Solution: Check BOTH existence AND type - if incomplete, OMIT dimensions entirely
  // DO NOT CHANGE THIS VALIDATION WITHOUT READING: /docs/CRITICAL-FEDEX-DIMENSIONS-VALIDATION-FIX.md
  // ============================================================================
  const shippingItems = items.map((item) => {
    const pkg: any = {
      productId: item.productId,
      quantity: item.quantity,
      paperStockId: item.options.paperStockId,
      paperStockWeight: item.paperStockWeight || 1,
    }

    // CRITICAL: Must check BOTH existence AND type
    // The dimensions property must be FULLY VALID or COMPLETELY OMITTED. There is no middle ground.
    if (
      item.dimensions?.width &&
      item.dimensions?.height &&
      typeof item.dimensions.width === 'number' &&
      typeof item.dimensions.height === 'number'
    ) {
      pkg.width = item.dimensions.width
      pkg.height = item.dimensions.height
    }
    // If incomplete, OMIT dimensions entirely (no width/height properties)

    return pkg
  })

  const handleSavedAddressSelect = (address: any) => {
    setShippingAddress({
      firstName: address.name.split(' ')[0] || '',
      lastName: address.name.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: address.phone || user?.phoneNumber || '',
      company: address.company || '',
      street: address.street,
      street2: address.street2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || 'US',
    })
    setShowManualForm(true)
    setErrors({}) // Clear any previous errors
  }

  const handleNewAddress = () => {
    setShowManualForm(true)
  }

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

  const handleContinueToPayment = async () => {
    if (!validateAddress()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!selectedShippingMethod) {
      toast.error('Please select a shipping method')
      return
    }

    // Check if Southwest Cargo selected but no airport chosen
    if (selectedShippingMethod.carrier === 'SOUTHWEST_CARGO' && !selectedAirportId) {
      toast.error('Please select a pickup airport for Southwest Cargo')
      return
    }

    setIsProcessing(true)

    try {
      // Save address if user requested it
      if (user && shouldSaveAddress && shippingAddress.firstName) {
        await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label: 'Shipping Address',
            name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            company: '',
            street: shippingAddress.street,
            street2: shippingAddress.street2 || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country || 'US',
            phone: shippingAddress.phone,
            isDefault: false,
          }),
        })
        toast.success('Address saved to your account')
      }

      // Store shipping information in sessionStorage
      sessionStorage.setItem('checkout_shipping_address', JSON.stringify(shippingAddress))
      sessionStorage.setItem('checkout_shipping_method', JSON.stringify(selectedShippingMethod))
      if (selectedAirportId) {
        sessionStorage.setItem('checkout_airport_id', selectedAirportId)
      }

      // Navigate to payment page
      router.push('/checkout/payment')
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address, but continuing to payment')
      // Continue to payment even if saving address fails
      router.push('/checkout/payment')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  const shippingCost = selectedShippingMethod?.rate.amount || 0
  const tax = subtotal * 0.1 // 10% tax rate
  const total = subtotal + shippingCost + tax

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
            href="/checkout"
          >
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
            {/* Saved Addresses (for logged-in users) */}
            {user && !showManualForm && (
              <SavedAddresses
                userId={user.id}
                onNewAddress={handleNewAddress}
                onSelectAddress={handleSavedAddressSelect}
              />
            )}

            {/* Shipping Address Form */}
            {(!user || showManualForm) && (
              <ShippingAddressForm
                address={shippingAddress}
                errors={errors}
                shouldSaveAddress={shouldSaveAddress}
                user={user}
                onChange={setShippingAddress}
                onSaveAddressChange={setShouldSaveAddress}
              />
            )}

            {/* Airport Selector - ALWAYS visible (not dependent on state) */}
            <AirportSelector
              selectedAirportId={selectedAirportId ?? null}
              onAirportSelected={(airportId) => setSelectedAirportId(airportId ?? undefined)}
            />

            {/* Shipping Method Selector */}
            {shippingAddress.zipCode && shippingAddress.state && shippingAddress.city ? (
              <ShippingMethodSelector
                destination={{
                  street: shippingAddress.street,
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  zipCode: shippingAddress.zipCode,
                }}
                items={shippingItems}
                selectedAirportId={selectedAirportId}
                selectedMethod={selectedShippingMethod}
                onSelect={setSelectedShippingMethod}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Please complete the shipping address above to see available shipping options
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Missing: {!shippingAddress.city && 'City '}{!shippingAddress.state && 'State '}{!shippingAddress.zipCode && 'ZIP Code'}
                  </p>
                </CardContent>
              </Card>
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

                  {/* Per-Product Shipping Breakdown */}
                  {selectedShippingMethod?.perProductCosts && selectedShippingMethod.perProductCosts.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex justify-between font-medium text-muted-foreground">
                        <span>Shipping (by product)</span>
                      </div>
                      {selectedShippingMethod.perProductCosts.map((productCost, index) => {
                        const cartItem = items.find(item => item.productId === productCost.productId)
                        if (!cartItem) return null

                        return (
                          <div key={index} className="pl-4 text-xs text-muted-foreground space-y-0.5">
                            <div className="font-medium">{cartItem.productName}</div>
                            <div className="pl-2 space-y-0.5">
                              {cartItem.options.size && <div>Size: {cartItem.options.size}</div>}
                              {cartItem.quantity && <div>Quantity: {cartItem.quantity}</div>}
                              {cartItem.options.paperStock && <div>Paper: {cartItem.options.paperStock}</div>}
                              {cartItem.options.coating && <div>Coating: {cartItem.options.coating}</div>}
                              {cartItem.options.sides && <div>Sides: {cartItem.options.sides}</div>}
                              {cartItem.options.turnaround && <div>Turnaround: {cartItem.options.turnaround}</div>}
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex justify-between font-medium border-t pt-1 mt-1">
                        <span>Total Shipping</span>
                        <span>${shippingCost.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{selectedShippingMethod ? `$${shippingCost.toFixed(2)}` : 'TBD'}</span>
                    </div>
                  )}

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
                  disabled={isProcessing || !selectedShippingMethod}
                  size="lg"
                  onClick={handleContinueToPayment}
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
