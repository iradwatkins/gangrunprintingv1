'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { validateCustomQuantity, type Quantity } from '@/lib/utils/quantity-transformer'

interface QuantitySelectorProps {
  quantities?: Quantity[]
  value: number | null
  onChange: (value: number) => void
  label?: string
  required?: boolean
  className?: string
}

export function QuantitySelector({
  quantities = [],
  value,
  onChange,
  label = 'QUANTITY',
  required = false,
  className = '',
}: QuantitySelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [customValue, setCustomValue] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [error, setError] = useState<string>('')

  // Load default quantities if none provided
  const [defaultQuantities, setDefaultQuantities] = useState<Quantity[]>([])

  useEffect(() => {
    if (quantities.length === 0) {
      // Fetch quantities from API with selector format (already transformed)
      fetch('/api/quantities?active=true&format=selector')
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then((data: Quantity[]) => {
          // Data is already transformed by the API
          setDefaultQuantities(data)
        })
        .catch((err) => console.error('Failed to fetch quantities:', err))
    }
  }, [quantities])

  const quantityOptions = quantities.length > 0 ? quantities : defaultQuantities
  const safeQuantityOptions = Array.isArray(quantityOptions) ? quantityOptions : []

  // Set initial selection based on value
  useEffect(() => {
    if (value) {
      const matchingQuantity = safeQuantityOptions.find((q) => q.value === value)
      if (matchingQuantity) {
        setSelectedOption(matchingQuantity.id)
        setShowCustomInput(false)
      } else {
        // It's a custom value
        const customOption = safeQuantityOptions.find((q) => q.isCustom)
        if (customOption) {
          setSelectedOption(customOption.id)
          setCustomValue(value.toString())
          setShowCustomInput(true)
        }
      }
    }
  }, [value, safeQuantityOptions])

  const handleSelectionChange = (quantityId: string) => {
    setSelectedOption(quantityId)
    setError('')

    const selectedQuantity = safeQuantityOptions.find((q) => q.id === quantityId)

    if (selectedQuantity) {
      if (selectedQuantity.isCustom) {
        setShowCustomInput(true)
        // Don't clear the custom value if it exists
        if (!customValue && value) {
          setCustomValue(value.toString())
        }
      } else {
        setShowCustomInput(false)
        setCustomValue('')
        if (selectedQuantity.value) {
          onChange(selectedQuantity.value)
        }
      }
    }
  }

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setCustomValue(inputValue)
    setError('')

    // Only allow numbers
    if (inputValue && !/^\d+$/.test(inputValue)) {
      setError('Please enter a valid number')
      return
    }

    if (inputValue) {
      const numValue = parseInt(inputValue)
      const customOption = safeQuantityOptions.find((q) => q.isCustom)

      if (customOption) {
        // Use the validation function from transformer
        const validation = validateCustomQuantity(numValue, customOption)

        if (!validation.isValid) {
          setError(validation.error || 'Invalid quantity')
          return
        }

        onChange(numValue)
      }
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium" htmlFor="quantity">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select a standard quantity or choose "Custom..." to enter your own</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-2">
        <Select value={selectedOption} onValueChange={handleSelectionChange}>
          <SelectTrigger className="w-full" id="quantity">
            <SelectValue placeholder="Select quantity..." />
          </SelectTrigger>
          <SelectContent>
            {safeQuantityOptions.map((quantity) => (
              <SelectItem key={quantity.id} value={quantity.id}>
                {quantity.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showCustomInput && (
          <div className="space-y-2">
            <Input
              className={error ? 'border-red-500' : ''}
              placeholder="Enter custom quantity..."
              type="text"
              value={customValue}
              onChange={handleCustomValueChange}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {!error && customValue && (
              <p className="text-sm text-muted-foreground">
                Custom quantity: {parseInt(customValue).toLocaleString()} units
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
