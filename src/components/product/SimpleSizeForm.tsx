'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface Size {
  id: string
  name: string
  displayName: string
  width: number | null
  height: number | null
  squareInches: number | null
  priceMultiplier: number
  isDefault: boolean
  isCustom: boolean
  customMinWidth?: number
  customMaxWidth?: number
  customMinHeight?: number
  customMaxHeight?: number
}

interface SimpleSizeFormProps {
  productId: string
  basePrice?: number
  onConfigurationChange?: (config: any, isComplete: boolean) => void
  onPriceChange?: (price: number) => void
}

export default function SimpleSizeForm({
  productId,
  basePrice = 0,
  onConfigurationChange,
  onPriceChange,
}: SimpleSizeFormProps) {
  const [sizes, setSizes] = useState<Size[]>([])
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [customWidth, setCustomWidth] = useState<number | undefined>()
  const [customHeight, setCustomHeight] = useState<number | undefined>()
  const [exactSize, setExactSize] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  // Use refs to avoid adding callbacks to dependency array
  const onConfigurationChangeRef = useRef(onConfigurationChange)
  const onPriceChangeRef = useRef(onPriceChange)

  useEffect(() => {
    onConfigurationChangeRef.current = onConfigurationChange
    onPriceChangeRef.current = onPriceChange
  }, [onConfigurationChange, onPriceChange])

  useEffect(() => {
    // Direct fetch without complex loading manager
    fetch(`/api/products/${productId}/configuration`)
      .then(res => res.json())
      .then(data => {
        if (data.sizes && data.sizes.length > 0) {
          setSizes(data.sizes)
          // Set default size
          const defaultSize = data.defaults?.size || data.sizes.find(s => s.isDefault)?.id || data.sizes[0]?.id
          setSelectedSize(defaultSize)

          // Notify parent of initial configuration
          const initialConfig = {
            quantity: 'default_quantity',
            size: defaultSize,
            exactSize: false,
            paper: 'default_paper',
            coating: 'default_coating',
            sides: 'default_sides',
            turnaround: 'default_turnaround',
            selectedAddons: [],
          }
          if (onConfigurationChangeRef.current) {
            onConfigurationChangeRef.current(initialConfig, true)
          }
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load sizes:', err)
        setLoading(false)
      })
  }, [productId])

  const handleSizeChange = (value: string) => {
    setSelectedSize(value)

    const selectedSizeObj = sizes.find(s => s.id === value)

    // Reset custom dimensions if not custom size
    if (!selectedSizeObj?.isCustom) {
      setCustomWidth(undefined)
      setCustomHeight(undefined)
    }

    const config = {
      quantity: 'default_quantity',
      size: value,
      customWidth: selectedSizeObj?.isCustom ? customWidth : undefined,
      customHeight: selectedSizeObj?.isCustom ? customHeight : undefined,
      exactSize,
      paper: 'default_paper',
      coating: 'default_coating',
      sides: 'default_sides',
      turnaround: 'default_turnaround',
      selectedAddons: [],
    }

    // Check if configuration is complete
    let isComplete = Boolean(value)
    if (selectedSizeObj?.isCustom) {
      isComplete = isComplete && Boolean(customWidth && customHeight && customWidth > 0 && customHeight > 0)
    }

    if (onConfigurationChangeRef.current) {
      onConfigurationChangeRef.current(config, isComplete)
    }

    // Calculate price
    calculatePrice(selectedSizeObj)
  }

  const handleCustomSizeChange = (width?: number, height?: number) => {
    setCustomWidth(width)
    setCustomHeight(height)

    if (selectedSize) {
      handleSizeChange(selectedSize)
    }
  }

  const handleExactSizeChange = (checked: boolean | 'indeterminate') => {
    const isChecked = checked === true
    setExactSize(isChecked)

    // Update configuration with new exact size setting
    if (selectedSize) {
      handleSizeChange(selectedSize)
    }
  }

  const calculatePrice = (sizeObj?: Size) => {
    if (!sizeObj) return

    let priceMultiplier = sizeObj.priceMultiplier || 1

    // For custom sizes, calculate based on square inches
    if (sizeObj.isCustom && customWidth && customHeight) {
      const squareInches = customWidth * customHeight
      // Base calculation: 4x6 = 24 square inches as baseline
      priceMultiplier = Math.max(1, squareInches / 24)
    }

    const calculatedPrice = basePrice * priceMultiplier
    if (onPriceChangeRef.current) {
      onPriceChangeRef.current(calculatedPrice)
    }
  }

  const getSizeDimensions = (size: Size) => {
    if (size.isCustom && customWidth && customHeight) {
      return `${customWidth}" × ${customHeight}"`
    }
    if (size.width && size.height) {
      return `${size.width}" × ${size.height}"`
    }
    return size.displayName || size.name
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  if (sizes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No sizes available</p>
      </div>
    )
  }

  const selectedSizeObj = sizes.find(s => s.id === selectedSize)

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      <div>
        <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2 block">
          SELECT SIZE
        </Label>

        <Select value={selectedSize} onValueChange={handleSizeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose size" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {sizes.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                {size.displayName || `${size.name}${size.width && size.height ? ` (${size.width}" × ${size.height}")` : ''}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Size Info */}
        {selectedSizeObj && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
            <div><strong>Selected:</strong> {getSizeDimensions(selectedSizeObj)}</div>
            {selectedSizeObj.squareInches && (
              <div><strong>Area:</strong> {selectedSizeObj.squareInches} sq in</div>
            )}
            {selectedSizeObj.priceMultiplier !== 1 && (
              <div><strong>Price multiplier:</strong> {selectedSizeObj.priceMultiplier}x</div>
            )}
          </div>
        )}
      </div>

      {/* Custom Size Inputs */}
      {selectedSizeObj?.isCustom && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2 block">
              WIDTH (inches)
            </Label>
            <input
              type="number"
              min={selectedSizeObj.customMinWidth || 1}
              max={selectedSizeObj.customMaxWidth || 96}
              step={0.25}
              value={customWidth || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                if (!isNaN(value)) {
                  handleCustomSizeChange(value, customHeight)
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter width"
            />
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2 block">
              HEIGHT (inches)
            </Label>
            <input
              type="number"
              min={selectedSizeObj.customMinHeight || 1}
              max={selectedSizeObj.customMaxHeight || 96}
              step={0.25}
              value={customHeight || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                if (!isNaN(value)) {
                  handleCustomSizeChange(customWidth, value)
                }
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter height"
            />
          </div>
          <div className="col-span-2 text-xs text-gray-500">
            Size range: {selectedSizeObj.customMinWidth || 1}" × {selectedSizeObj.customMinHeight || 1}" to {selectedSizeObj.customMaxWidth || 96}" × {selectedSizeObj.customMaxHeight || 96}"
          </div>
        </div>
      )}

      {/* Exact Size Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={exactSize}
          id="exactSize"
          onCheckedChange={handleExactSizeChange}
        />
        <Label
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          htmlFor="exactSize"
        >
          Exact size required
        </Label>
      </div>

      {/* Price Display */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Base Price:</span>
          <span className="text-lg font-semibold">${basePrice.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This product uses simplified size-based pricing
        </p>
      </div>

      {/* Module Status */}
      <div className="bg-green-50 p-3 rounded text-sm">
        <div className="font-medium text-green-800 mb-1">Active Module:</div>
        <div className="text-green-600">
          ✅ Size Module ({sizes.length} size options)
        </div>
        <div className="text-xs text-green-500 mt-1">
          This demonstrates Size module working independently
        </div>
      </div>
    </div>
  )
}