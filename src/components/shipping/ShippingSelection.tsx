'use client'

import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, Clock, Shield, Package } from 'lucide-react'
import type { DynamicShippingRate } from '@/types/shipping'

export interface ShippingProvider {
  id: 'fedex' | 'southwest-dash'
  name: string
  displayName: string
  logo: string
  deliveryDays: {
    min: number
    max: number
    text: string
  }
  features: string[]
  baseRate: number
}

const SHIPPING_PROVIDERS: ShippingProvider[] = [
  {
    id: 'fedex',
    name: 'FedEx Ground',
    displayName: 'FedEx',
    logo: '/images/shipping/fedex-logo.svg',
    deliveryDays: {
      min: 3,
      max: 5,
      text: '3-5 business days'
    },
    features: [
      'Reliable nationwide delivery',
      'Package tracking included',
      'Up to $100 insurance'
    ],
    baseRate: 12.99
  },
  {
    id: 'southwest-dash',
    name: 'Southwest Cargo DASH',
    displayName: 'Southwest DASH',
    logo: '/images/shipping/southwest-cargo-logo.svg',
    deliveryDays: {
      min: 1,
      max: 2,
      text: '1-2 business days'
    },
    features: [
      'Express priority shipping',
      'Real-time tracking',
      'Up to $500 insurance',
      'Signature required'
    ],
    baseRate: 29.99
  }
]

interface ShippingSelectionProps {
  onSelect: (provider: ShippingProvider) => void
  selectedId?: string
  className?: string
  rates?: DynamicShippingRate[] // Dynamic rates from API
  loading?: boolean
}

export function ShippingSelection({
  onSelect,
  selectedId = 'fedex',
  className = '',
  rates,
  loading = false
}: ShippingSelectionProps) {
  const [selected, setSelected] = useState(selectedId)

  const handleSelect = (providerId: string) => {
    setSelected(providerId)
    const provider = SHIPPING_PROVIDERS.find(p => p.id === providerId)
    if (provider) {
      onSelect(provider)
    }
  }

  // Use dynamic rates if available, otherwise use static rates
  const getProviderRate = (providerId: string) => {
    if (rates && rates.length > 0) {
      const dynamicRate = rates.find(r => r.provider === providerId)
      if (dynamicRate) {
        return dynamicRate.rate.amount
      }
    }
    const staticProvider = SHIPPING_PROVIDERS.find(p => p.id === providerId)
    return staticProvider?.baseRate || 0
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Select Shipping Method</h3>
        </div>
        <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Calculating shipping rates...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Select Shipping Method</h3>
      </div>

      <RadioGroup value={selected} onValueChange={handleSelect}>
        <div className="space-y-3">
          {SHIPPING_PROVIDERS.map((provider) => {
            const isSelected = selected === provider.id
            const isEconomy = provider.id === 'fedex'
            const rate = getProviderRate(provider.id)

            return (
              <Label
                key={provider.id}
                htmlFor={provider.id}
                className="cursor-pointer block"
              >
                <Card
                  className={`
                    relative p-4 transition-all hover:shadow-md
                    ${isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'hover:border-gray-400'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value={provider.id}
                      id={provider.id}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      {/* Header with logo and badges */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-24 flex items-center">
                            {/* Using text as placeholder for logo */}
                            <span className="font-bold text-sm">
                              {provider.displayName}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{provider.name}</p>
                            {isEconomy && (
                              <Badge variant="secondary" className="mt-1">
                                Most Popular
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price Display */}
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${rate.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Clock className="h-4 w-4" />
                        <span>Delivered in {provider.deliveryDays.text}</span>
                      </div>

                      {/* Features */}
                      <div className="space-y-1">
                        {provider.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-gray-600"
                          >
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </Card>
              </Label>
            )
          })}
        </div>
      </RadioGroup>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Shipping Protection</p>
            <p className="text-xs mt-1">
              All shipments include basic insurance. Additional coverage available at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
