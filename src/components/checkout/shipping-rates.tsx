'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Carrier } from '@prisma/client'
import { Package, Truck, Plane, Clock, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AirportSelector } from './airport-selector'
import toast from '@/lib/toast'

interface ShippingRate {
  carrier: Carrier
  serviceCode: string
  serviceName: string
  rateAmount: number
  currency: string
  estimatedDays: number
  deliveryDate?: string
  isGuaranteed?: boolean
}

interface ShippingRatesProps {
  toAddress: {
    street: string
    street2?: string
    city: string
    state: string
    zipCode: string
    country?: string
    isResidential?: boolean
  }
  items: Array<{
    productId?: string
    quantity: number
    width: number
    height: number
    paperStockId?: string
    paperStockWeight?: number
  }>
  onRateSelected: (rate: ShippingRate) => void
  onAirportSelected?: (airportId: string | null) => void
}

export function ShippingRates({
  toAddress,
  items,
  onRateSelected,
  onAirportSelected,
}: ShippingRatesProps) {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRate, setSelectedRate] = useState<string>('')
  const [totalWeight, setTotalWeight] = useState<string>('0')
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  // Create stable address key to detect real changes
  const addressKey = useMemo(
    () => `${toAddress.street}|${toAddress.city}|${toAddress.state}|${toAddress.zipCode}`,
    [toAddress.street, toAddress.city, toAddress.state, toAddress.zipCode]
  )

  // Create stable items key to detect real changes
  const itemsKey = useMemo(() => JSON.stringify(items), [items])

  useEffect(() => {
    // Reset fetch flag when address or items change
    hasFetchedRef.current = false
  }, [addressKey, itemsKey])

  useEffect(() => {
    // Only fetch once per address/items combination
    if (hasFetchedRef.current) {
      console.log('🔄 ShippingRates: Skipping duplicate fetch')
      return
    }

    // Add a small delay to avoid rapid API calls
    const timer = setTimeout(() => {
      fetchShippingRates()
      hasFetchedRef.current = true
    }, 300)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressKey, itemsKey])

  const fetchShippingRates = async () => {
    // Debug logging
    console.log('🚚 ShippingRates: Fetching rates with address:', toAddress)
    console.log('📦 ShippingRates: Items:', items)
    console.log('📍 ShippingRates: Address check - street:', !!toAddress.street, 'city:', !!toAddress.city, 'state:', !!toAddress.state, 'zip:', !!toAddress.zipCode)

    // Log each item's structure in detail
    items.forEach((item, index) => {
      console.log(`📦 Item ${index}:`, {
        quantity: item.quantity,
        width: item.width,
        height: item.height,
        paperStockWeight: item.paperStockWeight,
        paperStockId: item.paperStockId,
      })
    })

    if (!toAddress.street || !toAddress.city || !toAddress.state || !toAddress.zipCode) {
      console.log('❌ ShippingRates: Incomplete address - showing error')
      setError('Please enter a complete shipping address')
      setLoading(false)
      setRates([]) // Clear any old rates
      return
    }

    setLoading(true)
    setError(null)
    console.log('✅ ShippingRates: Making API call with payload:', {
      toAddress,
      items,
    })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toAddress,
          items,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate shipping')
      }

      console.log('✅ ShippingRates: Full API response:', data)
      console.log('✅ ShippingRates: Received rates:', data.rates)
      console.log('✅ ShippingRates: Total weight:', data.totalWeight)
      console.log('✅ ShippingRates: Success status:', data.success)

      setRates(data.rates || [])
      setTotalWeight(data.totalWeight || '0')

      // Auto-select the first rate
      if (data.rates && data.rates.length > 0) {
        const firstRate = data.rates[0]
        const rateId = `${firstRate.carrier}-${firstRate.serviceCode}`
        setSelectedRate(rateId)
        onRateSelected(firstRate)
        console.log('✅ ShippingRates: Auto-selected rate:', firstRate)
      } else {
        console.log('⚠️ ShippingRates: No rates returned - array is empty or undefined')
        console.log('⚠️ ShippingRates: data.rates value:', data.rates)
      }
    } catch (err) {
      console.error('❌ ShippingRates: Error fetching rates:', err)
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
        toast.error('Shipping calculation timed out')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to calculate shipping rates')
        toast.error('Unable to calculate shipping rates')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRateSelection = (value: string) => {
    setSelectedRate(value)
    const [carrier, serviceCode] = value.split('-')
    const rate = rates.find((r) => r.carrier === carrier && r.serviceCode === serviceCode)

    if (rate) {
      // If Southwest Cargo is selected but no airport is chosen, don't select the rate yet
      if (rate.carrier === Carrier.SOUTHWEST_CARGO && !selectedAirportId) {
        toast.error('Please select an airport pickup location for Southwest Cargo shipping')
        return
      }
      onRateSelected(rate)
    }
  }

  const handleAirportSelection = (airportId: string | null) => {
    setSelectedAirportId(airportId)
    if (onAirportSelected) {
      onAirportSelected(airportId)
    }

    // If an airport is selected and Southwest Cargo rate is already selected, trigger rate selection
    if (airportId && selectedRate.startsWith('SOUTHWEST_CARGO-')) {
      const [carrier, serviceCode] = selectedRate.split('-')
      const rate = rates.find((r) => r.carrier === carrier && r.serviceCode === serviceCode)
      if (rate) {
        onRateSelected(rate)
      }
    }
  }

  const getCarrierIcon = (carrier: Carrier) => {
    switch (carrier) {
      case Carrier.FEDEX:
      case Carrier.UPS:
        return <Truck className="h-4 w-4" />
      case Carrier.SOUTHWEST_CARGO:
        return <Plane className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getCarrierColor = (carrier: Carrier) => {
    switch (carrier) {
      case Carrier.FEDEX:
        return 'bg-purple-100 text-purple-700'
      case Carrier.UPS:
        return 'bg-amber-100 text-amber-700'
      case Carrier.SOUTHWEST_CARGO:
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDeliveryDate = (date: string | undefined, estimatedDays: number) => {
    if (date) {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    }

    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays)
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Calculating Shipping Rates...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (rates.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No shipping options available for this address. Please check your address or contact
          support.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Shipping Method
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Total Weight: {totalWeight} lbs
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedRate} onValueChange={handleRateSelection}>
          <div className="space-y-3">
            {rates.map((rate) => {
              const rateId = `${rate.carrier}-${rate.serviceCode}`
              const isSelected = selectedRate === rateId

              return (
                <label
                  key={rateId}
                  className={`
                    flex cursor-pointer rounded-lg border p-4 transition-all
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}
                  `}
                  htmlFor={rateId}
                >
                  <RadioGroupItem className="mt-1" id={rateId} value={rateId} />
                  <div className="ml-3 flex flex-1 items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rate.serviceName}</span>
                        <Badge className={getCarrierColor(rate.carrier)} variant="secondary">
                          {getCarrierIcon(rate.carrier)}
                          <span className="ml-1">{rate.carrier}</span>
                        </Badge>
                        {rate.isGuaranteed && (
                          <Badge className="text-xs" variant="outline">
                            <Check className="mr-1 h-3 w-3" />
                            Guaranteed
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rate.estimatedDays === 1
                            ? 'Next Day'
                            : `${rate.estimatedDays} Business Days`}
                        </span>
                        <span>
                          Delivery by {formatDeliveryDate(rate.deliveryDate, rate.estimatedDays)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-lg font-semibold">${rate.rateAmount.toFixed(2)}</div>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </RadioGroup>

        {/* Show airport selector if Southwest Cargo is selected */}
        {selectedRate.startsWith('SOUTHWEST_CARGO-') && (
          <div className="mt-6">
            <AirportSelector
              selectedAirportId={selectedAirportId}
              onAirportSelected={handleAirportSelection}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
