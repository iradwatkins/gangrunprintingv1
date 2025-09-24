/**
 * Corner Rounding addon section component
 */

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { calculateCornerRoundingPrice, formatPrice } from '../utils/pricing'

interface CornerRoundingSectionProps {
  enabled: boolean
  cornerType: string
  quantity: number
  disabled: boolean
  onToggle: (checked: boolean) => void
  onCornerTypeChange: (value: string) => void
}

export function CornerRoundingSection({
  enabled,
  cornerType,
  quantity,
  disabled,
  onToggle,
  onCornerTypeChange,
}: CornerRoundingSectionProps) {
  const price = calculateCornerRoundingPrice(quantity)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="corner-rounding"
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={disabled}
          />
          <Label htmlFor="corner-rounding" className="font-medium">
            Corner Rounding
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Round the corners for a smoother, professional look
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
            <Label className="text-sm">Corner Selection</Label>
            <Select
              value={cornerType}
              onValueChange={onCornerTypeChange}
              disabled={disabled}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Four">All Four Corners</SelectItem>
                <SelectItem value="Top Two">Top Two Corners</SelectItem>
                <SelectItem value="Bottom Two">Bottom Two Corners</SelectItem>
                <SelectItem value="Top Left">Top Left Only</SelectItem>
                <SelectItem value="Top Right">Top Right Only</SelectItem>
                <SelectItem value="Bottom Left">Bottom Left Only</SelectItem>
                <SelectItem value="Bottom Right">Bottom Right Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Standard radius: 1/8&quot; (3.2mm)
          </div>
        </div>
      )}
    </div>
  )
}
