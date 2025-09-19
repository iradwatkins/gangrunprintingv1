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

interface Size {
  id: string
  name: string
  width: number | null
  height: number | null
  displayName: string | null
  isCustom: boolean
  minWidth?: number | null
  maxWidth?: number | null
  minHeight?: number | null
  maxHeight?: number | null
  unit?: string
}

interface SizeSelectorProps {
  sizes?: Size[]
  value?: { width: number; height: number } | null
  onChange: (value: { width: number; height: number }) => void
  label?: string
  required?: boolean
  className?: string
  unit?: 'inch' | 'cm' | 'mm'
}

export function SizeSelector({
  sizes = [],
  value,
  onChange,
  label = 'SIZE',
  required = false,
  className = '',
  unit = 'inch',
}: SizeSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [customWidth, setCustomWidth] = useState<string>('')
  const [customHeight, setCustomHeight] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [widthError, setWidthError] = useState<string>('')
  const [heightError, setHeightError] = useState<string>('')

  // Load default sizes if none provided
  const [defaultSizes, setDefaultSizes] = useState<Size[]>([])

  useEffect(() => {
    if (sizes.length === 0) {
      // Fetch sizes from API
      fetch('/api/sizes?active=true')
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then((data) => setDefaultSizes(data))
        .catch((err) => console.error('Failed to load sizes:', err))
    }
  }, [sizes])

  const sizeOptions = sizes.length > 0 ? sizes : defaultSizes
  const safeOptions = Array.isArray(sizeOptions) ? sizeOptions : []

  // Set initial selection based on value
  useEffect(() => {
    if (value && value.width && value.height) {
      const matchingSize = safeOptions.find(
        (s) => s.width === value.width && s.height === value.height
      )
      if (matchingSize) {
        setSelectedOption(matchingSize.id)
        setShowCustomInput(false)
      } else {
        // It's a custom value
        const customOption = safeOptions.find((s) => s.isCustom)
        if (customOption) {
          setSelectedOption(customOption.id)
          setCustomWidth(value.width.toString())
          setCustomHeight(value.height.toString())
          setShowCustomInput(true)
        }
      }
    }
  }, [value, safeOptions])

  const handleSelectionChange = (sizeId: string) => {
    setSelectedOption(sizeId)
    setWidthError('')
    setHeightError('')

    const selectedSize = safeOptions.find((s) => s.id === sizeId)

    if (selectedSize) {
      if (selectedSize.isCustom) {
        setShowCustomInput(true)
        // Don't clear the custom values if they exist
        if (!customWidth && value?.width) {
          setCustomWidth(value.width.toString())
        }
        if (!customHeight && value?.height) {
          setCustomHeight(value.height.toString())
        }
      } else {
        setShowCustomInput(false)
        setCustomWidth('')
        setCustomHeight('')
        if (selectedSize.width && selectedSize.height) {
          onChange({ width: selectedSize.width, height: selectedSize.height })
        }
      }
    }
  }

  const validateAndUpdateCustomSize = () => {
    const customOption = safeOptions.find((s) => s.isCustom)
    if (!customOption) return

    let hasError = false
    setWidthError('')
    setHeightError('')

    // Validate width
    if (!customWidth) {
      setWidthError('Width is required')
      hasError = true
    } else {
      const width = parseFloat(customWidth)
      if (isNaN(width)) {
        setWidthError('Please enter a valid number')
        hasError = true
      } else if (customOption.minWidth && width < customOption.minWidth) {
        setWidthError(`Minimum width is ${customOption.minWidth}"`)
        hasError = true
      } else if (customOption.maxWidth && width > customOption.maxWidth) {
        setWidthError(`Maximum width is ${customOption.maxWidth}"`)
        hasError = true
      }
    }

    // Validate height
    if (!customHeight) {
      setHeightError('Height is required')
      hasError = true
    } else {
      const height = parseFloat(customHeight)
      if (isNaN(height)) {
        setHeightError('Please enter a valid number')
        hasError = true
      } else if (customOption.minHeight && height < customOption.minHeight) {
        setHeightError(`Minimum height is ${customOption.minHeight}"`)
        hasError = true
      } else if (customOption.maxHeight && height > customOption.maxHeight) {
        setHeightError(`Maximum height is ${customOption.maxHeight}"`)
        hasError = true
      }
    }

    if (!hasError && customWidth && customHeight) {
      onChange({
        width: parseFloat(customWidth),
        height: parseFloat(customHeight),
      })
    }
  }

  const handleCustomWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomWidth(value)
    setWidthError('')
    if (value && customHeight) {
      validateAndUpdateCustomSize()
    }
  }

  const handleCustomHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomHeight(value)
    setHeightError('')
    if (customWidth && value) {
      validateAndUpdateCustomSize()
    }
  }

  useEffect(() => {
    if (showCustomInput && customWidth && customHeight) {
      validateAndUpdateCustomSize()
    }
  }, [customWidth, customHeight])

  const getUnitLabel = () => {
    switch (unit) {
      case 'cm':
        return 'cm'
      case 'mm':
        return 'mm'
      default:
        return '"'
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium" htmlFor="size">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select a standard size or choose "Custom..." to enter your own dimensions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-2">
        <Select value={selectedOption} onValueChange={handleSelectionChange}>
          <SelectTrigger className="w-full" id="size">
            <SelectValue placeholder="Select size..." />
          </SelectTrigger>
          <SelectContent>
            {safeOptions.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                {size.displayName ? `${size.name} - ${size.displayName}` : size.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showCustomInput && (
          <div className="space-y-2 p-3 border rounded-md bg-muted/50">
            <Label className="text-sm font-medium">Custom Dimensions</Label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground" htmlFor="width">
                  Width ({getUnitLabel()})
                </Label>
                <Input
                  className={widthError ? 'border-red-500' : ''}
                  id="width"
                  placeholder="Enter width..."
                  step="0.25"
                  type="number"
                  value={customWidth}
                  onBlur={validateAndUpdateCustomSize}
                  onChange={handleCustomWidthChange}
                />
                {widthError && <p className="text-xs text-red-500">{widthError}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground" htmlFor="height">
                  Height ({getUnitLabel()})
                </Label>
                <Input
                  className={heightError ? 'border-red-500' : ''}
                  id="height"
                  placeholder="Enter height..."
                  step="0.25"
                  type="number"
                  value={customHeight}
                  onBlur={validateAndUpdateCustomSize}
                  onChange={handleCustomHeightChange}
                />
                {heightError && <p className="text-xs text-red-500">{heightError}</p>}
              </div>
            </div>

            {!widthError && !heightError && customWidth && customHeight && (
              <p className="text-sm text-muted-foreground mt-2">
                Custom size: {customWidth}
                {getUnitLabel()} × {customHeight}
                {getUnitLabel()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
