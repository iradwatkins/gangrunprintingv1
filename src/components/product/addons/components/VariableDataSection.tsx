/**
 * Variable Data addon section component
 */

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { calculateVariableDataPrice, formatPrice } from '../utils/pricing'

interface VariableDataSectionProps {
  enabled: boolean
  locationsCount: string
  locations: string
  quantity: number
  disabled: boolean
  onToggle: (checked: boolean) => void
  onLocationsCountChange: (value: string) => void
  onLocationsChange: (value: string) => void
}

export function VariableDataSection({
  enabled,
  locationsCount,
  locations,
  quantity,
  disabled,
  onToggle,
  onLocationsCountChange,
  onLocationsChange,
}: VariableDataSectionProps) {
  const price = calculateVariableDataPrice(quantity)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={enabled}
            disabled={disabled}
            id="variable-data"
            onCheckedChange={onToggle}
          />
          <Label className="font-medium" htmlFor="variable-data">
            Variable Data
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Print different versions with personalized information like names, addresses, or
                  codes
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-sm font-medium">{formatPrice(price)}</span>
      </div>

      {enabled && (
        <div className="space-y-3 pl-6">
          <div className="space-y-2">
            <Label className="text-sm" htmlFor="locations-count">
              Number of Locations
            </Label>
            <Input
              className="max-w-xs"
              disabled={disabled}
              id="locations-count"
              placeholder="Enter number of locations"
              type="text"
              value={locationsCount}
              onChange={(e) => onLocationsCountChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm" htmlFor="locations">
              Location Details
            </Label>
            <Input
              className="max-w-xs"
              disabled={disabled}
              id="locations"
              placeholder="Enter location details"
              type="text"
              value={locations}
              onChange={(e) => onLocationsChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
