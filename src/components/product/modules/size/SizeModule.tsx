'use client'

import { useState } from 'react'
import { SizeSelector } from './SizeSelector'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { SizeModuleProps, SizeModuleValue } from './types'

/**
 * SizeModule - A modular wrapper for size selection
 * Handles both standard and custom sizes with validation
 */
export function SizeModule({
  sizes,
  value,
  customWidth,
  customHeight,
  onChange,
  disabled = false,
  className = '',
  required = false,
  exactSizeRequired = false,
  onExactSizeChange,
}: SizeModuleProps) {
  const [exactSize, setExactSize] = useState(exactSizeRequired)

  // Calculate actual size dimensions
  const getSizeDimensions = () => {
    const selectedSize = sizes.find(s => s.id === value)

    if (selectedSize?.isCustom && customWidth && customHeight) {
      return { width: customWidth, height: customHeight }
    }

    if (selectedSize) {
      return {
        width: selectedSize.width || 0,
        height: selectedSize.height || 0
      }
    }

    return null
  }

  const dimensions = getSizeDimensions()

  // Handle size selection change
  const handleSizeChange = (newDimensions: { width: number; height: number }) => {
    // Check if it matches a standard size
    const standardSize = sizes.find(
      s => !s.isCustom && s.width === newDimensions.width && s.height === newDimensions.height
    )

    if (standardSize) {
      onChange(standardSize.id, undefined, undefined)
    } else {
      // It's a custom size
      const customOption = sizes.find(s => s.isCustom)
      if (customOption) {
        onChange(customOption.id, newDimensions.width, newDimensions.height)
      }
    }
  }

  // Handle exact size checkbox
  const handleExactSizeChange = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true
    setExactSize(isChecked)
    onExactSizeChange?.(isChecked)
  }

  return (
    <div className={`size-module space-y-4 ${className}`}>
      <SizeSelector
        sizes={sizes}
        value={dimensions}
        onChange={handleSizeChange}
        label="PRINT SIZE"
        required={required}
        unit="inch"
        className={disabled ? 'opacity-50 pointer-events-none' : ''}
      />

      {/* Exact Size Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={exactSize}
          id="exactSize"
          onCheckedChange={handleExactSizeChange}
          disabled={disabled}
        />
        <Label
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="exactSize"
        >
          Exact size required
        </Label>
      </div>
    </div>
  )
}

// Export standardized hook for external use
export { useSizeModule } from '../hooks/StandardModuleHooks'