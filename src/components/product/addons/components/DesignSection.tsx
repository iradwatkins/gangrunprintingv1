/**
 * Design addon section component
 * Handles professional design services only (no file uploads)
 */

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DesignSectionProps {
  enabled: boolean
  selectedOption: string | null
  selectedSide?: 'oneSide' | 'twoSides' | null
  disabled: boolean
  onToggle: (checked: boolean) => void
  onOptionChange: (optionId: string | null, side?: string | null) => void
}

export function DesignSection({
  enabled,
  selectedOption,
  selectedSide = null,
  disabled,
  onToggle,
  onOptionChange,
}: DesignSectionProps) {
  const [primarySelection, setPrimarySelection] = useState<string>(selectedOption || 'none')
  const [secondarySelection, setSecondarySelection] = useState<string>(selectedSide || '')

  // Design service options (NO file upload - that's handled by ImageUploadSection)
  const designOptions = {
    standard_design: {
      id: 'standard-design',
      name: 'Standard Custom Design',
      tooltipText: 'Our design team will create a custom design for your project',
      requiresSideSelection: true,
      sideOptions: {
        oneSide: { label: 'One Side', price: 90 },
        twoSides: { label: 'Two Sides', price: 135 },
      },
    },
    rush_design: {
      id: 'rush-design',
      name: 'Rush Custom Design',
      tooltipText: 'Priority design service with faster turnaround',
      requiresSideSelection: true,
      sideOptions: {
        oneSide: { label: 'One Side', price: 160 },
        twoSides: { label: 'Two Sides', price: 240 },
      },
    },
    minor_changes: {
      id: 'minor-changes',
      name: 'Design Changes - Minor',
      tooltipText: 'Minor text changes, color adjustments, or small layout tweaks',
      basePrice: 22.5,
    },
    major_changes: {
      id: 'major-changes',
      name: 'Design Changes - Major',
      tooltipText: 'Major redesign elements, layout changes, or extensive revisions',
      basePrice: 45,
    },
  }

  const selectedDesignOption = designOptions[primarySelection as keyof typeof designOptions]

  const handlePrimaryChange = (value: string) => {
    setPrimarySelection(value)
    setSecondarySelection('')

    if (value === 'none') {
      onOptionChange(null, null)
    } else {
      onOptionChange(value, null)
    }
  }

  const handleSecondaryChange = (value: string) => {
    setSecondarySelection(value)
    onOptionChange(primarySelection, value)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price)
  }

  const getDisplayPrice = () => {
    if (!selectedDesignOption) return null

    // For Standard/Rush Design with side selection
    if ('requiresSideSelection' in selectedDesignOption && selectedDesignOption.requiresSideSelection && 'sideOptions' in selectedDesignOption && selectedDesignOption.sideOptions) {
      if (secondarySelection) {
        const side = secondarySelection as 'oneSide' | 'twoSides'
        return formatPrice(selectedDesignOption.sideOptions[side].price)
      }
      return null // No price until side is selected
    }

    // For Minor/Major changes with flat price
    const price = ('basePrice' in selectedDesignOption ? selectedDesignOption.basePrice : 0) ?? 0
    if (price > 0) {
      return formatPrice(price)
    }

    return null
  }

  const shouldShowSecondaryDropdown = selectedDesignOption && 'requiresSideSelection' in selectedDesignOption && selectedDesignOption.requiresSideSelection === true
  const shouldShowPrice =
    primarySelection === 'minor_changes' || primarySelection === 'major_changes'

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={enabled}
              disabled={disabled}
              id="design"
              onCheckedChange={onToggle}
            />
            <Label className="font-medium" htmlFor="design">
              Design
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Choose from various design service options for your project
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          {getDisplayPrice() && <span className="text-sm font-medium">{getDisplayPrice()}</span>}
        </div>

        {enabled && (
          <div className="space-y-4 pl-6">
            {/* Primary Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="design-option">Design</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Please select the design option you would like.
                  </TooltipContent>
                </Tooltip>
              </div>

              <Select
                disabled={disabled}
                value={primarySelection}
                onValueChange={handlePrimaryChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Options</SelectItem>
                  {Object.values(designOptions).map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Dropdown for Standard/Rush Design */}
            {shouldShowSecondaryDropdown && selectedDesignOption && 'sideOptions' in selectedDesignOption && selectedDesignOption.sideOptions && (
              <div className="ml-6 space-y-2">
                <Label>Select Sides *</Label>
                <Select
                  disabled={disabled}
                  value={secondarySelection}
                  onValueChange={handleSecondaryChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose number of sides..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oneSide">
                      One Side: {formatPrice(selectedDesignOption.sideOptions.oneSide.price)}
                    </SelectItem>
                    <SelectItem value="twoSides">
                      Two Sides: {formatPrice(selectedDesignOption.sideOptions.twoSides.price)}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {!secondarySelection && (
                  <p className="text-sm text-muted-foreground">
                    Please select the number of sides for your design
                  </p>
                )}
              </div>
            )}

            {/* Static Price Display for Minor/Major Changes */}
            {shouldShowPrice && (
              <div className="ml-6 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Price: {getDisplayPrice()}</p>
              </div>
            )}

            {/* Summary Display */}
            {primarySelection !== 'none' && selectedDesignOption && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm space-y-1">
                  <div className="font-medium">Selected: {selectedDesignOption.name}</div>

                  {/* Show side selection if applicable */}
                  {shouldShowSecondaryDropdown && secondarySelection && (
                    <div className="text-muted-foreground">
                      Sides: {secondarySelection === 'oneSide' ? 'One Side' : 'Two Sides'}
                    </div>
                  )}

                  {/* Show price if available */}
                  {getDisplayPrice() && (
                    <div className="font-medium text-primary">Total: {getDisplayPrice()}</div>
                  )}

                  {/* Warning if Standard/Rush selected but no side chosen */}
                  {shouldShowSecondaryDropdown && !secondarySelection && (
                    <div className="text-orange-600 text-xs mt-2">
                      ⚠️ Please select the number of sides to continue
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
