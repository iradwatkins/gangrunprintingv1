# Story 4: Implement Shipping Provider Selection at Checkout

## Story Title

Add FedEx and Southwest Cargo/DASH Shipping Options to Checkout Flow

## Story Type

Feature Enhancement

## Story Points

5

## Priority

P1 - High (Customer Experience)

## Story Description

As a **customer**, I want to choose between FedEx and Southwest Cargo/DASH shipping options at checkout with transparent pricing and delivery estimates, so that I can select the shipping method that best meets my timeline and budget needs.

## Background

Currently, the checkout process lacks shipping provider selection, preventing customers from choosing their preferred shipping method. Gang Run Printing has partnerships with:

- **FedEx**: Standard nationwide shipping (3-5 business days)
- **Southwest Cargo/DASH**: Premium expedited shipping (1-2 business days)

Customers need visibility into shipping costs and delivery times to make informed decisions.

## Acceptance Criteria

### Must Have

- [ ] Radio button selection for FedEx and Southwest Cargo/DASH
- [ ] Display shipping provider logos for brand recognition
- [ ] Show real-time shipping rates for each provider
- [ ] Display estimated delivery dates for each option
- [ ] Selected shipping method saves with order
- [ ] Order total updates when shipping selection changes
- [ ] Shipping cost appears in order summary
- [ ] Validation prevents checkout without shipping selection

### Should Have

- [ ] Default to most economical option (FedEx)
- [ ] Show savings amount when cheaper option available
- [ ] Display shipping cutoff times for same-day processing
- [ ] Address validation for accurate shipping rates
- [ ] Shipping insurance option for high-value orders

### Could Have

- [ ] Shipping calculator before checkout
- [ ] Multiple FedEx service levels (Ground, Express, Priority)
- [ ] Package tracking integration
- [ ] Estimated carbon footprint for each option
- [ ] Saved shipping preferences for logged-in users

## Technical Details

### Checkout Page Implementation

1. **Shipping Provider Selection Component**:

```tsx
import { useState, useEffect } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Truck, Clock, DollarSign } from 'lucide-react'
import { format, addBusinessDays } from 'date-fns'

interface ShippingOption {
  provider: 'fedex' | 'southwest-dash'
  name: string
  logo: string
  rate: number
  estimatedDays: { min: number; max: number }
  cutoffTime: string
  features: string[]
}

function ShippingProviderSelection({ destination, weight, onSelect, onRateUpdate }) {
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (destination && weight) {
      fetchShippingRates()
    }
  }, [destination, weight])

  const fetchShippingRates = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          weight,
          providers: ['fedex', 'southwest-dash'],
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch shipping rates')

      const data = await response.json()
      setShippingOptions(data.options)

      // Default to cheapest option
      const cheapest = data.options.reduce((min, opt) => (opt.rate < min.rate ? opt : min))
      setSelectedProvider(cheapest.provider)
      onSelect(cheapest.provider)
      onRateUpdate(cheapest.rate)
    } catch (err) {
      setError('Unable to calculate shipping. Please try again.')
      console.error('Shipping calculation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    const selected = shippingOptions.find((opt) => opt.provider === provider)
    if (selected) {
      onSelect(provider)
      onRateUpdate(selected.rate)
    }
  }

  const getEstimatedDelivery = (days: { min: number; max: number }) => {
    const minDate = addBusinessDays(new Date(), days.min)
    const maxDate = addBusinessDays(new Date(), days.max)

    if (days.min === days.max) {
      return format(minDate, 'EEEE, MMMM d')
    }
    return `${format(minDate, 'MMM d')} - ${format(maxDate, 'MMM d')}`
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Calculating shipping rates...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-600">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Shipping Method</h3>

      <RadioGroup
        value={selectedProvider}
        onValueChange={handleProviderChange}
        className="space-y-3"
      >
        {shippingOptions.map((option) => {
          const isSelected = selectedProvider === option.provider
          const isCheapest = option.rate === Math.min(...shippingOptions.map((o) => o.rate))

          return (
            <Card
              key={option.provider}
              className={`
                relative cursor-pointer transition-all
                ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-gray-300'}
              `}
            >
              <Label htmlFor={option.provider} className="flex p-4 cursor-pointer">
                <RadioGroupItem value={option.provider} id={option.provider} className="mt-1" />

                <div className="ml-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      {/* Provider Logo and Name */}
                      <div className="flex items-center gap-3">
                        <img src={option.logo} alt={option.name} className="h-8 object-contain" />
                        <span className="font-semibold">{option.name}</span>
                        {isCheapest && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                            Best Value
                          </span>
                        )}
                      </div>

                      {/* Delivery Estimate */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Delivered by {getEstimatedDelivery(option.estimatedDays)}</span>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {option.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Cutoff Time */}
                      <p className="text-xs text-gray-500">
                        Order by {option.cutoffTime} for same-day processing
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold">${option.rate.toFixed(2)}</div>
                      {option.provider === 'southwest-dash' && (
                        <p className="text-xs text-gray-500">Express</p>
                      )}
                    </div>
                  </div>
                </div>
              </Label>
            </Card>
          )
        })}
      </RadioGroup>
    </div>
  )
}
```

2. **Shipping Rate Calculation API**:

```typescript
// /api/shipping/calculate/route.ts
export async function POST(request: Request) {
  try {
    const { destination, weight, providers } = await request.json()

    // Validate inputs
    if (!destination || !weight || !providers?.length) {
      return NextResponse.json({ error: 'Missing required shipping information' }, { status: 400 })
    }

    const options: ShippingOption[] = []

    // Calculate FedEx rates
    if (providers.includes('fedex')) {
      const fedexRate = await calculateFedExRate(destination, weight)
      options.push({
        provider: 'fedex',
        name: 'FedEx Ground',
        logo: '/logos/fedex.svg',
        rate: fedexRate,
        estimatedDays: { min: 3, max: 5 },
        cutoffTime: '3:00 PM CST',
        features: ['Tracking included', 'Up to $100 insurance', 'Signature optional'],
      })
    }

    // Calculate Southwest Cargo/DASH rates
    if (providers.includes('southwest-dash')) {
      const southwestRate = await calculateSouthwestRate(destination, weight)
      options.push({
        provider: 'southwest-dash',
        name: 'Southwest Cargo DASH',
        logo: '/logos/southwest-cargo.svg',
        rate: southwestRate,
        estimatedDays: { min: 1, max: 2 },
        cutoffTime: '12:00 PM CST',
        features: [
          'Priority handling',
          'Up to $500 insurance',
          'Signature required',
          'Live tracking',
        ],
      })
    }

    return NextResponse.json({
      success: true,
      options,
      cheapest: options.reduce((min, opt) => (opt.rate < min.rate ? opt : min)).provider,
    })
  } catch (error) {
    console.error('Shipping calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate shipping rates' }, { status: 500 })
  }
}

async function calculateFedExRate(destination: any, weight: number) {
  // FedEx API integration
  // Simplified calculation for example
  const baseRate = 8.99
  const weightRate = weight * 0.45
  const distanceMultiplier = getDistanceMultiplier(destination)

  return Number((baseRate + weightRate * distanceMultiplier).toFixed(2))
}

async function calculateSouthwestRate(destination: any, weight: number) {
  // Southwest Cargo API integration
  // Premium expedited pricing
  const baseRate = 24.99
  const weightRate = weight * 0.75
  const distanceMultiplier = getDistanceMultiplier(destination)

  return Number((baseRate + weightRate * distanceMultiplier).toFixed(2))
}
```

3. **Order Summary Update**:

```tsx
function OrderSummary({ cart, shippingRate, shippingProvider }) {
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.0825 // 8.25% tax rate
  const total = subtotal + tax + shippingRate

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>

        {shippingRate > 0 && (
          <div className="flex justify-between">
            <span>
              Shipping
              {shippingProvider && (
                <span className="text-xs text-gray-500 block">
                  via {shippingProvider === 'fedex' ? 'FedEx' : 'Southwest DASH'}
                </span>
              )}
            </span>
            <span>${shippingRate.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t pt-2 mt-2">
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

## Testing Requirements

### Unit Tests

- [ ] Test shipping rate calculation logic
- [ ] Test provider selection state management
- [ ] Test order total calculation with shipping
- [ ] Test delivery date estimation

### Integration Tests

- [ ] Test FedEx API integration
- [ ] Test Southwest Cargo API integration
- [ ] Test checkout flow with shipping selection
- [ ] Verify order saves with shipping details

### Manual Testing Checklist

- [ ] Select FedEx and verify rate display
- [ ] Select Southwest DASH and verify rate update
- [ ] Confirm order total updates with selection
- [ ] Test with various destination addresses
- [ ] Test with different product weights
- [ ] Verify selection persists through checkout
- [ ] Test validation (no checkout without selection)
- [ ] Check mobile responsive design
- [ ] Test error handling for API failures
- [ ] Verify shipping details in order confirmation

## Dependencies

- FedEx shipping API credentials
- Southwest Cargo/DASH API access
- Address validation service
- Date calculation utilities (date-fns)
- Shipping provider logos/assets

## Definition of Done

- [ ] Both shipping providers selectable
- [ ] Real-time rates display correctly
- [ ] Delivery estimates are accurate
- [ ] Order total updates with shipping
- [ ] Selection saves with order
- [ ] Mobile responsive design works
- [ ] Error states handled gracefully
- [ ] Shipping appears in order confirmation
- [ ] Customer receives shipping details in email
- [ ] Code reviewed and approved

## Notes

- Consider caching shipping rates for 15 minutes to reduce API calls
- Add shipping estimation to product pages for transparency
- Implement address validation to ensure accurate rates
- Consider offering free shipping thresholds for large orders
- Southwest DASH may have geographic limitations - handle gracefully

## Estimation Breakdown

- Create shipping selection component: 3 hours
- Implement shipping rate APIs: 3 hours
- Integrate with checkout flow: 2 hours
- Update order summary calculation: 1 hour
- Add validation and error handling: 1.5 hours
- Testing and edge cases: 2 hours
- Mobile optimization: 1 hour
- Total: ~13.5 hours (5 story points)
