'use client'

import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import type { SimpleProductConfiguration } from '@/hooks/useProductConfiguration'
import { usePriceCalculation } from '@/hooks/usePriceCalculation'

interface PriceCalculatorProps {
  configData: any
  configuration: SimpleProductConfiguration
  getQuantityValue: (config: SimpleProductConfiguration) => number
  setupFee?: number
  productionTime?: number
  className?: string
}

export function PriceCalculator({
  configData,
  configuration,
  getQuantityValue,
  setupFee = 0,
  productionTime = 3,
  className = ''
}: PriceCalculatorProps) {
  const { calculateFinalPrice, getPriceBreakdown } = usePriceCalculation({
    configData,
    getQuantityValue
  })

  const finalPrice = calculateFinalPrice(configuration)
  const priceBreakdown = getPriceBreakdown(configuration)

  if (!priceBreakdown) {
    return (
      <div className={`border-t pt-6 ${className}`}>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-sm text-muted-foreground">Total Price</span>
            <p className="text-3xl font-bold">--</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border-t pt-6 ${className}`}>
      {/* Price Display */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-sm text-muted-foreground">Total Price</span>
          <p className="text-3xl font-bold">${finalPrice.toFixed(2)}</p>
          {setupFee > 0 && (
            <p className="text-sm text-muted-foreground">
              Includes ${setupFee.toFixed(2)} setup fee
            </p>
          )}
          {priceBreakdown.quantity > 1 && (
            <p className="text-sm text-muted-foreground">
              ${priceBreakdown.unitPrice.toFixed(4)} per unit
            </p>
          )}
        </div>
        <Badge className="mb-1" variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          {productionTime} days
        </Badge>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Base Price:</span>
          <span>${priceBreakdown.basePrice.toFixed(2)}</span>
        </div>

        {priceBreakdown.turnaroundCost > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Turnaround ({priceBreakdown.turnaroundDescription}):</span>
            <span>${priceBreakdown.turnaroundCost.toFixed(2)}</span>
          </div>
        )}

        {priceBreakdown.specialAddonCosts > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Special Add-ons:</span>
            <span>${priceBreakdown.specialAddonCosts.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t pt-2 flex justify-between font-medium">
          <span>Total:</span>
          <span>${finalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm space-y-1">
        <div className="font-medium">Configuration:</div>
        <div>Quantity: {priceBreakdown.quantity.toLocaleString()}</div>
        <div>Size: {priceBreakdown.sizeDescription}</div>
        <div>Paper: {priceBreakdown.paperType}</div>
        {priceBreakdown.turnaroundDescription && (
          <div>Turnaround: {priceBreakdown.turnaroundDescription}</div>
        )}
      </div>
    </div>
  )
}