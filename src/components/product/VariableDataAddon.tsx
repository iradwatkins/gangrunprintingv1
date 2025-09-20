'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface VariableDataConfig {
  enabled: boolean
  locationsCount: string
  locations: string
}

interface VariableDataAddonProps {
  quantity?: number
  onChange?: (config: VariableDataConfig, price: number) => void
  disabled?: boolean
}

export default function VariableDataAddon({
  quantity = 100,
  onChange,
  disabled = false,
}: VariableDataAddonProps) {
  const [isChecked, setIsChecked] = useState(false)
  const [locationsCount, setLocationsCount] = useState('')
  const [locations, setLocations] = useState('')

  // Calculate price: $60 base + $0.02 per piece
  const calculatePrice = () => {
    if (!isChecked) return 0
    return 60 + (0.02 * quantity)
  }

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    if (disabled) return

    setIsChecked(checked)

    // Clear fields when unchecked
    if (!checked) {
      setLocationsCount('')
      setLocations('')
    }

    // Notify parent component
    const config: VariableDataConfig = {
      enabled: checked,
      locationsCount: checked ? locationsCount : '',
      locations: checked ? locations : '',
    }
    onChange?.(config, checked ? calculatePrice() : 0)
  }

  // Handle field changes
  const handleLocationsCountChange = (value: string) => {
    setLocationsCount(value)

    if (isChecked) {
      const config: VariableDataConfig = {
        enabled: true,
        locationsCount: value,
        locations,
      }
      onChange?.(config, calculatePrice())
    }
  }

  const handleLocationsChange = (value: string) => {
    setLocations(value)

    if (isChecked) {
      const config: VariableDataConfig = {
        enabled: true,
        locationsCount,
        locations: value,
      }
      onChange?.(config, calculatePrice())
    }
  }

  // Update price when quantity changes
  useEffect(() => {
    if (isChecked) {
      const config: VariableDataConfig = {
        enabled: true,
        locationsCount,
        locations,
      }
      onChange?.(config, calculatePrice())
    }
  }, [quantity])

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-white">
      {/* Checkbox with price */}
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="variable-data"
            checked={isChecked}
            onCheckedChange={handleCheckboxChange}
            disabled={disabled}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="variable-data"
                className="text-sm font-semibold cursor-pointer"
              >
                VARIABLE DATA
              </Label>
              <span className="text-sm font-medium">
                $60.00 + $.02/piece
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                    <p>Variable data printing allows each piece to have unique information like names, numbers, or custom text.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Description box (always visible) */}
        <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          Select this option if you need your order to have a unique name, number, or word on each card.
        </div>
      </div>

      {/* Conditional fields - only show when checked */}
      {isChecked && (
        <div className="ml-6 space-y-4">
          {/* How many locations field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="locations-count"
                className="text-sm font-semibold uppercase"
              >
                How many locations for the variables?
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                    <p>Enter the number of variables you are going to have on each piece. If only a first name for example, this number should be 1.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="locations-count"
              type="number"
              min="1"
              max="10"
              value={locationsCount}
              onChange={(e) => handleLocationsCountChange(e.target.value)}
              className="max-w-full"
              placeholder=""
              disabled={disabled}
            />
          </div>

          {/* Where are the locations field */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="locations-text"
                className="text-sm font-semibold uppercase"
              >
                Where are the locations for the variables?
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-blue-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-blue-500 text-white border-0">
                    <p>Enter the location(s) or word(s) that will be replaced with variable words.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="locations-text"
              type="text"
              value={locations}
              onChange={(e) => handleLocationsChange(e.target.value)}
              className="max-w-full"
              placeholder=""
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  )
}