'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Truck, Plane, Loader2 } from 'lucide-react'
import toast from '@/lib/toast'

export interface ShippingRate {
  provider: string
  providerName: string
  serviceCode: string
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
    date?: string
  }
}

interface ShippingMethodSelectorProps {
  destination: {
    street?: string
    city: string
    state: string
    zipCode: string
  }
  packages: Array<{
    weight: number
    dimensions?: {
      length: number
      width: number
      height: number
    }
  }>
  selectedMethod?: ShippingRate
  onSelect: (method: ShippingRate) => void
}

export function ShippingMethodSelector({
  destination,
  packages,
  selectedMethod,
  onSelect,
}: ShippingMethodSelectorProps) {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!destination.zipCode || !destination.state || !destination.city) {
      return
    }

    fetchShippingRates()
  }, [destination.zipCode, destination.state, destination.city])

  const fetchShippingRates = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: {
            zipCode: destination.zipCode,
            state: destination.state,
            city: destination.city,
            street: destination.street || '123 Main St',
            countryCode: 'US',
            isResidential: true,
          },
          packages: packages.length > 0 ? packages : [{ weight: 1 }], // Default 1 lb if no packages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch shipping rates')
      }

      const data = await response.json()

      if (data.success && data.rates) {
        setRates(data.rates)
        // Auto-select first rate if none selected
        if (!selectedMethod && data.rates.length > 0) {
          onSelect(data.rates[0])
        }
      } else {
        setError(data.error || 'No shipping rates available')
      }
    } catch (err) {
      console.error('Shipping rates error:', err)
      setError('Failed to load shipping rates')
      toast.error('Could not load shipping options. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCarrierIcon = (carrier: string) => {
    if (carrier === 'SOUTHWEST_CARGO') {
      return <Plane className="h-5 w-5" />
    }
    return <Truck className="h-5 w-5" />
  }

  const getCarrierBadge = (rate: ShippingRate) => {
    if (rate.carrier === 'SOUTHWEST_CARGO') {
      return (
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          Airport Pickup
        </span>
      )
    }
    if (rate.delivery.guaranteed) {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          Guaranteed
        </span>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading shipping options...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchShippingRates}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (rates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Enter your shipping address to see available shipping options
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Method
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your preferred shipping method
        </p>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethod?.serviceCode}
          onValueChange={(value) => {
            const selected = rates.find((r) => r.serviceCode === value)
            if (selected) onSelect(selected)
          }}
        >
          <div className="space-y-3">
            {rates.map((rate) => (
              <div key={rate.serviceCode} className="relative">
                <Label
                  htmlFor={rate.serviceCode}
                  className="cursor-pointer block"
                >
                  <Card
                    className={`border transition-all ${
                      selectedMethod?.serviceCode === rate.serviceCode
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem
                          id={rate.serviceCode}
                          value={rate.serviceCode}
                          className="mt-0.5"
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div
                            className={`p-2 rounded-lg ${
                              selectedMethod?.serviceCode === rate.serviceCode
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {getCarrierIcon(rate.carrier)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium">{rate.providerName}</p>
                              <p className="font-semibold">
                                ${rate.rate.amount.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">
                                {rate.delivery.text}
                              </p>
                              {getCarrierBadge(rate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <p className="text-xs text-muted-foreground mt-4">
          Shipping rates are calculated based on package weight, dimensions, and destination
        </p>
      </CardContent>
    </Card>
  )
}
