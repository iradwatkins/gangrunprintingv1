# Story 4c: Checkout Integration

## Story Title

Integrate Shipping Selection with Checkout Flow and Order Total

## Story Type

Integration

## Story Points

1

## Priority

P1 - High (Completes checkout flow)

## Story Description

As a **customer**, I want my shipping selection to be integrated with the checkout process, updating the order total and being saved with my order, so that I can complete my purchase with accurate pricing.

## Background

This story connects the shipping UI (Story 4a) and rate API (Story 4b) with the existing checkout flow:

- Updates order total with shipping cost
- Validates shipping selection before order submission
- Saves shipping details with the order
- Displays shipping in order confirmation

## Acceptance Criteria

### Must Have

- [ ] Shipping cost adds to order subtotal
- [ ] Order cannot be submitted without shipping selection
- [ ] Selected shipping method saves with order
- [ ] Shipping details appear in order confirmation
- [ ] Order summary updates when shipping changes
- [ ] Validation error if no shipping selected

### Should Have

- [ ] Shipping selection persists if user navigates back
- [ ] Email confirmation includes shipping details
- [ ] Order history shows shipping method

## Technical Details

### Checkout Integration

```tsx
// components/checkout/CheckoutFlow.tsx
import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { ShippingSelection } from '@/components/shipping/ShippingSelection'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface CheckoutState {
  customerInfo: any
  shippingAddress: any
  shippingMethod: {
    provider: string
    rate: number
    deliveryDays: any
  } | null
  paymentMethod: any
}

export function CheckoutFlow() {
  const { cart, cartTotal } = useCart()
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    customerInfo: null,
    shippingAddress: null,
    shippingMethod: null,
    paymentMethod: null,
  })
  const [shippingRates, setShippingRates] = useState([])
  const [loadingRates, setLoadingRates] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Calculate order totals
  const calculateTotals = () => {
    const subtotal = cartTotal
    const tax = subtotal * 0.0825 // 8.25% tax
    const shipping = checkoutState.shippingMethod?.rate || 0
    const total = subtotal + tax + shipping

    return {
      subtotal,
      tax,
      shipping,
      total,
    }
  }

  // Fetch shipping rates when address is entered
  useEffect(() => {
    if (checkoutState.shippingAddress) {
      fetchShippingRates()
    }
  }, [checkoutState.shippingAddress])

  const fetchShippingRates = async () => {
    setLoadingRates(true)
    try {
      // Calculate package weight from cart items
      const totalWeight = cart.reduce((sum, item) => {
        return sum + (item.product.weight || 1) * item.quantity
      }, 0)

      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: {
            zipCode: checkoutState.shippingAddress.zipCode,
            city: checkoutState.shippingAddress.city,
            state: checkoutState.shippingAddress.state,
          },
          package: {
            weight: totalWeight,
            dimensions: {
              length: 12,
              width: 12,
              height: 6,
            },
          },
        }),
      })

      const data = await response.json()
      setShippingRates(data.rates)
    } catch (error) {
      console.error('Failed to fetch shipping rates:', error)
    } finally {
      setLoadingRates(false)
    }
  }

  const handleShippingSelect = (provider: any) => {
    const rate = shippingRates.find((r: any) => r.provider === provider.id)
    if (rate) {
      setCheckoutState((prev) => ({
        ...prev,
        shippingMethod: {
          provider: rate.provider,
          rate: rate.rate.amount,
          deliveryDays: rate.delivery.estimatedDays,
        },
      }))
      setValidationErrors((errors) => errors.filter((e) => e !== 'shipping'))
    }
  }

  const validateCheckout = (): boolean => {
    const errors: string[] = []

    if (!checkoutState.customerInfo) {
      errors.push('customer')
    }
    if (!checkoutState.shippingAddress) {
      errors.push('address')
    }
    if (!checkoutState.shippingMethod) {
      errors.push('shipping')
    }
    if (!checkoutState.paymentMethod) {
      errors.push('payment')
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  const submitOrder = async () => {
    if (!validateCheckout()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-section')
      firstError?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    const totals = calculateTotals()

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: checkoutState.customerInfo,
          shippingAddress: checkoutState.shippingAddress,
          shipping: {
            method: checkoutState.shippingMethod,
            cost: checkoutState.shippingMethod.rate,
          },
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.price,
            options: item.options,
          })),
          totals: totals,
          paymentMethod: checkoutState.paymentMethod,
        }),
      })

      if (!response.ok) {
        throw new Error('Order submission failed')
      }

      const order = await response.json()

      // Redirect to confirmation
      window.location.href = `/checkout/confirmation/${order.id}`
    } catch (error) {
      console.error('Order submission error:', error)
      alert('Failed to submit order. Please try again.')
    }
  }

  const totals = calculateTotals()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* ... Customer Info Section ... */}
          {/* ... Shipping Address Section ... */}

          {/* Shipping Method Section */}
          <section className={validationErrors.includes('shipping') ? 'error-section' : ''}>
            <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>

            {!checkoutState.shippingAddress ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please enter your shipping address first</AlertDescription>
              </Alert>
            ) : loadingRates ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3">Calculating shipping rates...</span>
              </div>
            ) : (
              <>
                <ShippingSelection
                  rates={shippingRates}
                  onSelect={handleShippingSelect}
                  selectedId={checkoutState.shippingMethod?.provider}
                />
                {validationErrors.includes('shipping') && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please select a shipping method</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </section>

          {/* ... Payment Method Section ... */}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <OrderSummary
              subtotal={totals.subtotal}
              tax={totals.tax}
              shipping={totals.shipping}
              total={totals.total}
              shippingMethod={checkoutState.shippingMethod}
            />

            <Button className="w-full mt-4" size="lg" onClick={submitOrder} disabled={!cart.length}>
              Place Order - ${totals.total.toFixed(2)}
            </Button>

            {validationErrors.length > 0 && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Please complete all required fields
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Order Summary Component

```tsx
// components/checkout/OrderSummary.tsx
export function OrderSummary({ subtotal, tax, shipping, total, shippingMethod }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        {shipping > 0 && (
          <div className="flex justify-between">
            <div>
              <span>Shipping</span>
              {shippingMethod && (
                <span className="block text-xs text-gray-500">
                  {shippingMethod.provider === 'fedex' ? 'FedEx' : 'Southwest DASH'}
                  {' • '}
                  {shippingMethod.deliveryDays.min}-{shippingMethod.deliveryDays.max} days
                </span>
              )}
            </div>
            <span>${shipping.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
```

### Order Confirmation

```tsx
// app/checkout/confirmation/[orderId]/page.tsx
export default async function OrderConfirmation({ params }: { params: { orderId: string } }) {
  const order = await getOrder(params.orderId)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">Order #{order.orderNumber}</p>
      </div>

      {/* Shipping Details */}
      <Card className="p-6 mb-6">
        <h2 className="font-semibold mb-3">Shipping Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Method</p>
            <p className="font-medium">
              {order.shipping.method === 'fedex' ? 'FedEx Ground' : 'Southwest Cargo DASH'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Estimated Delivery</p>
            <p className="font-medium">{order.shipping.estimatedDelivery}</p>
          </div>
          <div>
            <p className="text-gray-500">Tracking</p>
            <p className="font-medium">
              {order.shipping.trackingNumber || 'Will be emailed when available'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Shipping Cost</p>
            <p className="font-medium">${order.shipping.cost.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* ... Order items and other details ... */}
    </div>
  )
}
```

## Testing Requirements

### Manual Testing Checklist

- [ ] Select shipping updates order total
- [ ] Cannot submit order without shipping
- [ ] Shipping details save with order
- [ ] Confirmation shows correct shipping
- [ ] Changing shipping updates total immediately
- [ ] Navigation back preserves selection
- [ ] Email includes shipping details
- [ ] Mobile responsive checkout

## Dependencies

- Stories 4a and 4b must be complete
- Existing checkout flow
- Cart management system
- Order creation API

## Definition of Done

- [ ] Shipping integrates with checkout
- [ ] Order total includes shipping
- [ ] Validation prevents missing shipping
- [ ] Order saves shipping details
- [ ] Confirmation displays shipping
- [ ] Email includes shipping info
- [ ] Tested on mobile
- [ ] Code reviewed

## Notes

- This is the final integration piece
- Ensure shipping state persists through checkout steps
- Consider session storage for checkout state
- Handle edge cases like cart changes during checkout

## Estimation Breakdown

- Integrate with checkout flow: 0.5 hours
- Update order total calculation: 0.5 hours
- Add validation: 0.5 hours
- Update order confirmation: 0.5 hours
- Testing: 0.5 hours
- Total: ~2.5 hours (1 story point)
