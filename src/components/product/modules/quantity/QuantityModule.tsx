'use client'

import { useState, useEffect } from 'react'
import { QuantitySelector } from './QuantitySelector'
import type { QuantityModuleProps, QuantityModuleValue } from './types'

/**
 * QuantityModule - A modular wrapper for quantity selection
 * Handles both standard and custom quantities with validation
 */
export function QuantityModule({
  quantities,
  value,
  customValue,
  onChange,
  disabled = false,
  className = '',
  required = false,
}: QuantityModuleProps) {
  // Calculate actual quantity value
  const getActualValue = (): number | null => {
    if (!value) return null

    const selectedQuantity = quantities.find(q => q.id === value)
    if (!selectedQuantity) return null

    if (selectedQuantity.isCustom && customValue) {
      return customValue
    }

    return selectedQuantity.value
  }

  const actualValue = getActualValue()

  // Handle quantity change
  const handleChange = (newValue: number) => {
    const selectedQuantity = quantities.find(q => q.value === newValue)

    if (selectedQuantity && !selectedQuantity.isCustom) {
      // Standard quantity selected
      onChange(selectedQuantity.id, undefined)
    } else {
      // Custom quantity
      const customOption = quantities.find(q => q.isCustom)
      if (customOption) {
        onChange(customOption.id, newValue)
      }
    }
  }

  return (
    <div className={`quantity-module ${className}`}>
      <QuantitySelector
        quantities={quantities}
        value={actualValue}
        onChange={handleChange}
        required={required}
        className={disabled ? 'opacity-50 pointer-events-none' : ''}
      />
    </div>
  )
}

// Export standardized hook for external use
export { useQuantityModule } from '../hooks/StandardModuleHooks'