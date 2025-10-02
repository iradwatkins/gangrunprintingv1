'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PriceBreakdown {
  basePrice: number
  afterAdjustments: number
  afterTurnaround: number
  addonCosts: number
  turnaroundMarkup: number
  adjustments: {
    brokerDiscount?: { percentage: number; amount: number }
    taglineDiscount?: { percentage: number; amount: number }
    exactSizeMarkup?: { percentage: number; amount: number }
  }
}

interface PriceDisplayProps {
  price: number | null
  unitPrice?: number | null
  breakdown: PriceBreakdown | null
  displayBreakdown?: string[]
  loading: boolean
  error: string | null
  showUnitPrice?: boolean
  quantity?: number
}

/**
 * Real-time price display component
 * Shows calculated price with loading/error states
 * Expandable breakdown for transparency
 */
export function PriceDisplay({
  price,
  unitPrice,
  breakdown,
  displayBreakdown = [],
  loading,
  error,
  showUnitPrice = true,
  quantity
}: PriceDisplayProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Loading state
  if (loading) {
    return (
      <div className="price-display border rounded-lg p-6 bg-gray-50" data-testid="price-display-loading">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Calculating price...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="price-display" data-testid="price-display-error">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // No price yet state
  if (price === null) {
    return (
      <div className="price-display border rounded-lg p-6 bg-gray-50" data-testid="price-display-empty">
        <p className="text-gray-500 text-center">
          Select options to see price
        </p>
      </div>
    )
  }

  // Success state - show price
  return (
    <div className="price-display border rounded-lg p-6 bg-white shadow-sm" data-testid="price-display-success">
      {/* Main Price Display */}
      <div className="price-main flex items-baseline justify-between mb-4">
        <div>
          <span className="text-sm text-gray-600 block mb-1">Total Price</span>
          <span className="text-3xl font-bold text-gray-900" data-testid="calculated-price">
            ${price.toFixed(2)}
          </span>
        </div>

        {/* Unit Price (if applicable) */}
        {showUnitPrice && unitPrice && quantity && quantity > 1 && (
          <div className="text-right">
            <span className="text-sm text-gray-600 block mb-1">Per Unit</span>
            <span className="text-lg font-semibold text-gray-700">
              ${unitPrice.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Breakdown Toggle */}
      {breakdown && (
        <div className="breakdown-section border-t pt-4">
          <Button
            onClick={() => setShowBreakdown(!showBreakdown)}
            variant="ghost"
            className="w-full justify-between hover:bg-gray-50"
            data-testid="breakdown-toggle"
          >
            <span className="text-sm font-medium text-gray-700">
              {showBreakdown ? 'Hide' : 'Show'} Price Breakdown
            </span>
            {showBreakdown ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </Button>

          {/* Expanded Breakdown */}
          {showBreakdown && (
            <div className="price-breakdown mt-4 space-y-2" data-testid="price-breakdown">
              {/* Base Price */}
              <div className="breakdown-item flex justify-between text-sm">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-medium text-gray-900">
                  ${breakdown.basePrice.toFixed(2)}
                </span>
              </div>

              {/* Adjustments */}
              {breakdown.adjustments.brokerDiscount && breakdown.adjustments.brokerDiscount.amount > 0 && (
                <div className="breakdown-item flex justify-between text-sm">
                  <span className="text-gray-600">
                    Broker Discount ({breakdown.adjustments.brokerDiscount.percentage}%):
                  </span>
                  <span className="font-medium text-green-600">
                    -${breakdown.adjustments.brokerDiscount.amount.toFixed(2)}
                  </span>
                </div>
              )}

              {breakdown.adjustments.taglineDiscount && breakdown.adjustments.taglineDiscount.amount > 0 && (
                <div className="breakdown-item flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tagline Discount ({breakdown.adjustments.taglineDiscount.percentage}%):
                  </span>
                  <span className="font-medium text-green-600">
                    -${breakdown.adjustments.taglineDiscount.amount.toFixed(2)}
                  </span>
                </div>
              )}

              {breakdown.adjustments.exactSizeMarkup && breakdown.adjustments.exactSizeMarkup.amount > 0 && (
                <div className="breakdown-item flex justify-between text-sm">
                  <span className="text-gray-600">
                    Custom Size Markup ({breakdown.adjustments.exactSizeMarkup.percentage}%):
                  </span>
                  <span className="font-medium text-orange-600">
                    +${breakdown.adjustments.exactSizeMarkup.amount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* After Adjustments */}
              {breakdown.afterAdjustments !== breakdown.basePrice && (
                <div className="breakdown-item flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">After Adjustments:</span>
                  <span className="font-medium text-gray-900">
                    ${breakdown.afterAdjustments.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Add-ons */}
              {breakdown.addonCosts > 0 && (
                <div className="breakdown-item flex justify-between text-sm">
                  <span className="text-gray-600">Add-ons:</span>
                  <span className="font-medium text-gray-900">
                    +${breakdown.addonCosts.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Turnaround */}
              {breakdown.turnaroundMarkup > 0 && (
                <div className="breakdown-item flex justify-between text-sm">
                  <span className="text-gray-600">Rush Turnaround:</span>
                  <span className="font-medium text-gray-900">
                    +${breakdown.turnaroundMarkup.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Final Total */}
              <div className="breakdown-item flex justify-between text-sm pt-2 border-t font-semibold">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">
                  ${price.toFixed(2)}
                </span>
              </div>

              {/* Display Breakdown Messages */}
              {displayBreakdown.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 font-medium mb-2">Calculation Details:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {displayBreakdown.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Helpful note */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        Price updates automatically as you select options
      </p>
    </div>
  )
}

export default PriceDisplay
