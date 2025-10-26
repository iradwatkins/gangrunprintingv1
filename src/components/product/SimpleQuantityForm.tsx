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

interface SimpleQuantityFormProps {
  productId: string
  basePrice?: number
  onConfigurationChange?: (config: any, isComplete: boolean) => void
  onPriceChange?: (price: number) => void
}

export default function SimpleQuantityForm({
  productId,
  basePrice = 0,
  onConfigurationChange,
  onPriceChange,
}: SimpleQuantityFormProps) {
  const [quantities, setQuantities] = useState<any[]>([])
  const [selectedQuantity, setSelectedQuantity] = useState<string>('')
  const [customQuantity, setCustomQuantity] = useState<number | undefined>()
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
      .then((res) => res.json())
      .then((data) => {
        if (data.quantities && data.quantities.length > 0) {
          setQuantities(data.quantities)
          // Set default quantity
          const defaultQty = data.defaults?.quantity || data.quantities[0]?.id
          setSelectedQuantity(defaultQty)

          // Notify parent of initial configuration
          const initialConfig = {
            quantity: defaultQty,
            size: 'default_size',
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
      .catch((err) => {
        console.error('Failed to load quantities:', err)
        setLoading(false)
      })
  }, [productId])

  const handleQuantityChange = (value: string) => {
    setSelectedQuantity(value)

    const config = {
      quantity: value,
      customQuantity: value === 'qty_custom' ? customQuantity : undefined,
      size: 'default_size',
      paper: 'default_paper',
      coating: 'default_coating',
      sides: 'default_sides',
      turnaround: 'default_turnaround',
      selectedAddons: [],
    }

    const isComplete = value !== 'qty_custom' || Boolean(customQuantity && customQuantity > 0)
    if (onConfigurationChangeRef.current) {
      onConfigurationChangeRef.current(config, isComplete)
    }

    // Calculate price (simplified for quantity-only)
    const selectedQty = quantities.find((q) => q.id === value)
    if (selectedQty && onPriceChangeRef.current) {
      const qty = selectedQty.isCustom ? customQuantity || 0 : selectedQty.value
      // Simple price calculation: base price * quantity / 100
      const calculatedPrice = (basePrice * qty) / 100
      onPriceChangeRef.current(calculatedPrice)
    }
  }

  const handleCustomQuantityChange = (value: number) => {
    setCustomQuantity(value)
    if (selectedQuantity === 'qty_custom') {
      handleQuantityChange('qty_custom')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }

  if (quantities.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No quantities available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
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
      </div>

      {/* Custom Quantity Input */}
      {selectedQuantity === 'qty_custom' && (
        <div>
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

      {/* Price Display */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Base Price:</span>
          <span className="text-lg font-semibold">${basePrice.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This product uses simplified quantity-based pricing
        </p>
      </div>
    </div>
  )
}
