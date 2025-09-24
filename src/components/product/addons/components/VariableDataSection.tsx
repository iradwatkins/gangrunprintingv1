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
            id="variable-data"
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={disabled}
          />
          <Label htmlFor="variable-data" className="font-medium">
            Variable Data
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Print different versions with personalized information like names, addresses, or codes
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
            <Label htmlFor="locations-count" className="text-sm">
              Number of Locations
            </Label>
            <Input
              id="locations-count"
              type="text"
              value={locationsCount}
              onChange={(e) => onLocationsCountChange(e.target.value)}
              placeholder="Enter number of locations"
              disabled={disabled}
              className="max-w-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locations" className="text-sm">
              Location Details
            </Label>
            <Input
              id="locations"
              type="text"
              value={locations}
              onChange={(e) => onLocationsChange(e.target.value)}
              placeholder="Enter location details"
              disabled={disabled}
              className="max-w-xs"
            />
          </div>
        </div>
      )}
    </div>
  )
}
