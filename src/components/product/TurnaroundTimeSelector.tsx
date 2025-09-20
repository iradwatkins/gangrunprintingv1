'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface TurnaroundTime {
  id: string
  name: string
  displayName: string
  description?: string
  daysMin: number
  daysMax?: number
  pricingModel: 'FLAT' | 'PERCENTAGE' | 'PER_UNIT' | 'CUSTOM'
  basePrice: number
  priceMultiplier: number
  requiresNoCoating: boolean
  restrictedCoatings: string[]
  isDefault: boolean
}

interface TurnaroundTimeSelectorProps {
  turnaroundTimes: TurnaroundTime[]
  selectedTurnaroundId: string
  onTurnaroundChange: (turnaroundId: string) => void
  baseProductPrice: number
  quantity: number
  currentCoating?: string
  disabled?: boolean
}

export default function TurnaroundTimeSelector({
  turnaroundTimes,
  selectedTurnaroundId,
  onTurnaroundChange,
  baseProductPrice,
  quantity,
  currentCoating,
  disabled = false,
}: TurnaroundTimeSelectorProps) {
  const calculateTurnaroundPrice = (
    turnaround: TurnaroundTime
  ): { totalPrice: number; pricePerUnit: number } => {
    if (turnaround.pricingModel === 'FLAT') {
      const totalPrice = baseProductPrice + turnaround.basePrice
      return {
        totalPrice,
        pricePerUnit: totalPrice / quantity,
      }
    } else if (turnaround.pricingModel === 'PERCENTAGE') {
      const totalPrice = baseProductPrice * turnaround.priceMultiplier
      return {
        totalPrice,
        pricePerUnit: totalPrice / quantity,
      }
    } else if (turnaround.pricingModel === 'PER_UNIT') {
      const additionalCost = quantity * turnaround.basePrice
      const totalPrice = baseProductPrice + additionalCost
      return {
        totalPrice,
        pricePerUnit: totalPrice / quantity,
      }
    }

    // Default case
    return {
      totalPrice: baseProductPrice,
      pricePerUnit: baseProductPrice / quantity,
    }
  }

  const isOptionRestricted = (turnaround: TurnaroundTime): boolean => {
    if (turnaround.requiresNoCoating && currentCoating && currentCoating !== 'coating_4') {
      return true
    }
    if (
      turnaround.restrictedCoatings.length > 0 &&
      currentCoating &&
      turnaround.restrictedCoatings.includes(currentCoating)
    ) {
      return true
    }
    return false
  }

  const handleValueChange = (value: string) => {
    if (disabled) return

    const selectedTurnaround = turnaroundTimes.find((t) => t.id === value)
    if (selectedTurnaround && !isOptionRestricted(selectedTurnaround)) {
      onTurnaroundChange(value)
    }
  }

  // Don't render if no turnaround times available
  if (!turnaroundTimes || turnaroundTimes.length === 0) {
    return (
      <div className="space-y-3">
        <Label className="text-base font-medium">Print Turnaround</Label>
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            Turnaround options are currently unavailable. Please contact support if this persists.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Print Turnaround</Label>
      <p className="text-sm text-gray-600">Turnaround times do not include shipping</p>

      <RadioGroup
        className="space-y-2"
        disabled={disabled}
        value={selectedTurnaroundId}
        onValueChange={handleValueChange}
      >
        {turnaroundTimes.map((turnaround) => {
          const { totalPrice, pricePerUnit } = calculateTurnaroundPrice(turnaround)
          const isRestricted = isOptionRestricted(turnaround)
          const isSelected = selectedTurnaroundId === turnaround.id

          return (
            <div
              key={turnaround.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                isSelected && !isRestricted
                  ? 'bg-blue-50 border-blue-200'
                  : isRestricted
                    ? 'bg-gray-50 border-gray-200 opacity-50'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : isRestricted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !disabled && !isRestricted && handleValueChange(turnaround.id)}
            >
              <RadioGroupItem
                className="mt-0.5"
                disabled={disabled || isRestricted}
                id={turnaround.id}
                value={turnaround.id}
              />

              <div className="flex-1 min-w-0">
                <Label
                  className={`block cursor-pointer ${
                    disabled || isRestricted ? 'cursor-not-allowed' : ''
                  }`}
                  htmlFor={turnaround.id}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {turnaround.displayName}
                      </div>
                      {turnaround.description && (
                        <div className="text-xs text-gray-600 mt-1">{turnaround.description}</div>
                      )}
                      {isRestricted && (
                        <div className="text-xs text-red-600 mt-1">
                          {turnaround.requiresNoCoating
                            ? 'Requires no coating option'
                            : 'Not available with current coating selection'}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div
                        className={`text-sm font-semibold ${
                          isSelected && !isRestricted ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        ${totalPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">${pricePerUnit.toFixed(2)} ea</div>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
