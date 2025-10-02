'use client'

import TurnaroundSelector from './TurnaroundSelector'
import type { TurnaroundModuleProps, TurnaroundModuleValue } from './types'

/**
 * TurnaroundModule - A modular wrapper for turnaround time selection
 * Handles production time selection with pricing and coating restrictions
 */
export function TurnaroundModule({
  turnaroundTimes,
  selectedTurnaroundId,
  onTurnaroundChange,
  baseProductPrice = 0,
  quantity = 0,
  currentCoating = '',
  disabled = false,
  className = '',
  required = false,
}: TurnaroundModuleProps) {
  // If no turnaround times, don't render anything
  if (!turnaroundTimes || turnaroundTimes.length === 0) {
    return null
  }

  return (
    <div className={`turnaround-module ${className}`}>
      <TurnaroundSelector
        turnaroundTimes={turnaroundTimes}
        selectedTurnaroundId={selectedTurnaroundId}
        onTurnaroundChange={onTurnaroundChange}
        baseProductPrice={baseProductPrice}
        quantity={quantity}
        currentCoating={currentCoating}
        disabled={disabled}
      />
    </div>
  )
}

// Export standardized hook for external use
export { useTurnaroundModule } from '../hooks/StandardModuleHooks'

// Helper function to calculate business days
function calculateBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate)
  let daysAdded = 0

  while (daysAdded < businessDays) {
    result.setDate(result.getDate() + 1)

    // Skip weekends
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      daysAdded++
    }
  }

  return result
}