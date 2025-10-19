'use client'

import { useState } from 'react'
import { Loader2, MapPin, Truck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import toast from '@/lib/toast'

interface ShippingRate {
  provider: string
  providerName: string
  serviceType: string
  carrier: string
  rate: {
    amount: number
    currency: string
  }
  delivery: {
    estimatedDays: {
      min: number
      max: number
    }
    text: string
    guaranteed: boolean
  }
}

interface ShippingPreviewProps {
  cartItems: any[]
  onShippingSelected: (rate: ShippingRate | null) => void
  selectedShipping: ShippingRate | null
}

export function ShippingPreview({ cartItems, onShippingSelected, selectedShipping }: ShippingPreviewProps) {
  const [zipCode, setZipCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [error, setError] = useState<string | null>(null)

  const calculateShipping = async () => {
    if (!zipCode || zipCode.length < 5) {
      toast.error('Please enter a valid 5-digit zip code')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get package info from first cart item (single product model)
      const item = cartItems[0]

      // Extract dimensions and weight from cart item
      const dimensions = item.dimensions || { length: 12, width: 9, height: 0.5 }
      const weight = item.paperStockWeight || 1 // fallback weight in lbs

      // Use a zip code lookup service or default state (simplified for now)
      // In production, you'd want to use a proper zip code to state/city lookup
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: {
            zipCode: zipCode.trim(),
            state: 'IL', // Default - in production, lookup from zip
            city: 'Chicago', // Default - in production, lookup from zip
            isResidential: true,
          },
          package: {
            weight: weight * item.quantity, // Total weight for quantity
            dimensions: dimensions,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch shipping rates')
      }

      const data = await response.json()

      if (data.success && data.rates.length > 0) {
        setRates(data.rates)
        toast.success(`Found ${data.rates.length} shipping options`)
      } else {
        setRates([])
        setError('No shipping options available for this destination')
        toast.error('No shipping options available')
      }
    } catch (err) {
      console.error('Shipping calculation error:', err)
      setError('Unable to calculate shipping rates. Please try again.')
      toast.error('Failed to calculate shipping')
      setRates([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleShippingSelect = (rateIndex: number) => {
    const rate = rates[rateIndex]
    onShippingSelected(rate)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold">Shipping Estimate</h3>
      </div>

      {/* Zip Code Input */}
      <div className="space-y-2">
        <Label htmlFor="shipping-zip">Delivery Zip Code</Label>
        <div className="flex gap-2">
          <Input
            id="shipping-zip"
            placeholder="Enter zip code"
            value={zipCode}
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9-]/g, '')
              setZipCode(value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                calculateShipping()
              }
            }}
          />
          <Button
            onClick={calculateShipping}
            disabled={isLoading || !zipCode}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Calculate'
            )}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Shipping Options */}
      {rates.length > 0 && (
        <div className="space-y-2">
          <Label>Select Shipping Method</Label>
          <RadioGroup
            value={selectedShipping ? rates.findIndex(r => r.serviceType === selectedShipping.serviceType).toString() : undefined}
            onValueChange={(value) => handleShippingSelect(parseInt(value))}
          >
            {rates.map((rate, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
              >
                <RadioGroupItem value={index.toString()} id={`rate-${index}`} />
                <label
                  htmlFor={`rate-${index}`}
                  className="flex-1 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{rate.providerName}</p>
                      <p className="text-xs text-muted-foreground">{rate.delivery.text}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${rate.rate.amount.toFixed(2)}</p>
                    {rate.delivery.guaranteed && (
                      <p className="text-xs text-green-600">Guaranteed</p>
                    )}
                  </div>
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Helpful Message */}
      {rates.length === 0 && !error && !isLoading && (
        <div className="text-sm text-muted-foreground text-center p-4 bg-muted/30 rounded-md">
          Enter your zip code to see available shipping options
        </div>
      )}
    </div>
  )
}
