'use client'

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SizeModule } from './modules/size/SizeModule'
import type { Size } from './modules/size/types'

interface QuantitySizeFormProps {
  productId: string
  basePrice?: number
  onConfigurationChange?: (config: any, isComplete: boolean) => void
  onPriceChange?: (price: number) => void
}

export default function QuantitySizeForm({
  productId,
  basePrice = 0,
  onConfigurationChange,
  onPriceChange,
}: QuantitySizeFormProps) {
  const [quantities, setQuantities] = useState<any[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [selectedQuantity, setSelectedQuantity] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [customQuantity, setCustomQuantity] = useState<number | undefined>()
  const [customWidth, setCustomWidth] = useState<number | undefined>()
  const [customHeight, setCustomHeight] = useState<number | undefined>()
  const [exactSize, setExactSize] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Direct fetch without complex loading manager
    fetch(`/api/products/${productId}/configuration`)
      .then((res) => res.json())
      .then((data) => {
        let defaultQty = ''
        let defaultSize = ''

        if (data.quantities && data.quantities.length > 0) {
          setQuantities(data.quantities)
          defaultQty = data.defaults?.quantity || data.quantities[0]?.id
          setSelectedQuantity(defaultQty)
        }

        if (data.sizes && data.sizes.length > 0) {
          setSizes(data.sizes)
          defaultSize =
            data.defaults?.size || data.sizes.find((s: Size) => s.isDefault)?.id || data.sizes[0]?.id
          setSelectedSize(defaultSize)
        }

        // Set initial configuration
        updateConfiguration(defaultQty || '', defaultSize || '', false)

        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load configuration:', err)
        setLoading(false)
      })
  }, [productId])

  const updateConfiguration = (qtyId: string, sizeId: string, isCompleteOverride?: boolean) => {
    const config = {
      quantity: qtyId,
      customQuantity: qtyId === 'qty_custom' ? customQuantity : undefined,
      size: sizeId,
      customWidth,
      customHeight,
      exactSize,
      paper: 'default_paper',
      coating: 'default_coating',
      sides: 'default_sides',
      turnaround: 'default_turnaround',
      selectedAddons: [],
    }

    let isComplete = !!(qtyId && sizeId)
    if (qtyId === 'qty_custom') {
      isComplete = !!(isComplete && customQuantity && customQuantity > 0)
    }
    const selectedSizeObj = sizes.find((s) => s.id === sizeId)
    if (selectedSizeObj?.isCustom) {
      isComplete = !!(isComplete && customWidth && customHeight && customWidth > 0 && customHeight > 0)
    }

    if (isCompleteOverride !== undefined) {
      isComplete = isCompleteOverride
    }

    onConfigurationChange?.(config, isComplete)

    // Calculate price
    calculatePrice(qtyId, sizeId)
  }

  const calculatePrice = (qtyId: string, sizeId: string) => {
    const selectedQty = quantities.find((q) => q.id === qtyId)
    const selectedSizeObj = sizes.find((s) => s.id === sizeId)

    if (selectedQty && selectedSizeObj) {
      const qty = selectedQty.isCustom ? customQuantity || 0 : selectedQty.value
      let sizeMultiplier = selectedSizeObj.priceMultiplier || 1

      // For custom sizes, calculate based on square inches
      if (selectedSizeObj.isCustom && customWidth && customHeight) {
        const squareInches = customWidth * customHeight
        sizeMultiplier = Math.max(1, squareInches / 24) // Base 4x6 = 24 sq inches
      }

      const calculatedPrice = (basePrice * qty * sizeMultiplier) / 100
      onPriceChange?.(calculatedPrice)
    }
  }

  const handleQuantityChange = (value: string) => {
    setSelectedQuantity(value)
    updateConfiguration(value, selectedSize)
  }

  const handleSizeChange = (sizeId: string, width?: number, height?: number) => {
    setSelectedSize(sizeId)
    setCustomWidth(width)
    setCustomHeight(height)
    updateConfiguration(selectedQuantity, sizeId)
  }

  const handleCustomQuantityChange = (value: number) => {
    setCustomQuantity(value)
    if (selectedQuantity === 'qty_custom') {
      updateConfiguration('qty_custom', selectedSize)
    }
  }

  const handleExactSizeChange = (checked: boolean) => {
    setExactSize(checked)
    updateConfiguration(selectedQuantity, selectedSize)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  if (quantities.length === 0 && sizes.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No configuration options available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quantity Module */}
      {quantities.length > 0 && (
        <div>
          <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2 block">
            SELECT QUANTITY
          </Label>

          <Select value={selectedQuantity} onValueChange={handleQuantityChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose quantity" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {quantities.map((qty) => (
                <SelectItem key={qty.id} value={qty.id}>
                  {qty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Quantity Input */}
          {selectedQuantity === 'qty_custom' && (
            <div className="mt-3">
              <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-2 block">
                ENTER CUSTOM QUANTITY
              </Label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                max={100000}
                min={50000}
                placeholder="Enter quantity between 50,000 and 100,000"
                step={5000}
                type="number"
                value={customQuantity || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (!isNaN(value)) {
                    handleCustomQuantityChange(value)
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Custom quantities must be between 50,000 and 100,000 units
              </p>
            </div>
          )}
        </div>
      )}

      {/* Size Module */}
      {sizes.length > 0 && (
        <div>
          <SizeModule
            customHeight={customHeight}
            customWidth={customWidth}
            exactSizeRequired={exactSize}
            required={true}
            sizes={sizes}
            value={selectedSize}
            onChange={handleSizeChange}
            onExactSizeChange={handleExactSizeChange}
          />
        </div>
      )}

      {/* Price Display */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Base Price:</span>
          <span className="text-lg font-semibold">${basePrice.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Price calculated with quantity and size multipliers
        </p>
      </div>

      {/* Module Status */}
      <div className="bg-blue-50 p-3 rounded text-sm">
        <div className="font-medium text-blue-800 mb-1">Active Modules:</div>
        <div className="text-blue-600">
          ✅ Quantity Module ({quantities.length} options) <br />✅ Size Module ({sizes.length}{' '}
          sizes)
        </div>
        <div className="text-xs text-blue-500 mt-1">
          This demonstrates modular architecture: Quantity + Size working together
        </div>
      </div>
    </div>
  )
}
