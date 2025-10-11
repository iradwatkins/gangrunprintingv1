/**
 * Individual addon checkbox component
 */

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { type Addon } from '../types/addon.types'

interface AddonCheckboxProps {
  addon: Addon
  checked: boolean
  disabled?: boolean
  onToggle: (addonId: string, checked: boolean) => void
}

export function AddonCheckbox({ addon, checked, disabled = false, onToggle }: AddonCheckboxProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={checked}
          disabled={disabled}
          id={`addon-${addon.id}`}
          onCheckedChange={(checked) => onToggle(addon.id, checked as boolean)}
        />
        <Label className="font-medium cursor-pointer" htmlFor={`addon-${addon.id}`}>
          {addon.name}
        </Label>
        {addon.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{addon.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {addon.additionalTurnaroundDays && addon.additionalTurnaroundDays > 0 && (
          <span className="text-xs text-muted-foreground">
            +{addon.additionalTurnaroundDays}{' '}
            {addon.additionalTurnaroundDays === 1 ? 'day' : 'days'}
          </span>
        )}
        {addon.priceDisplay && <span className="text-sm font-medium">{addon.priceDisplay}</span>}
      </div>
    </div>
  )
}
