/**
 * Banding addon section component
 */

import { Checkbox } from '@/components/ui/checkbox'
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
import { calculateBandingPrice, formatPrice } from '../utils/pricing'

interface BandingSectionProps {
  enabled: boolean
  bandingType: string
  itemsPerBundle: number
  quantity: number
  disabled: boolean
  onToggle: (checked: boolean) => void
  onBandingTypeChange: (value: string) => void
  onItemsPerBundleChange: (value: number) => void
}

export function BandingSection({
  enabled,
  bandingType,
  itemsPerBundle,
  quantity,
  disabled,
  onToggle,
  onBandingTypeChange,
  onItemsPerBundleChange,
}: BandingSectionProps) {
  const price = calculateBandingPrice(quantity, itemsPerBundle)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox checked={enabled} disabled={disabled} id="banding" onCheckedChange={onToggle} />
          <Label className="font-medium" htmlFor="banding">
            Banding
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Bundle your items with paper or elastic bands</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-sm font-medium">{formatPrice(price)}</span>
      </div>

      {enabled && (
        <div className="space-y-3 pl-6">
          <div className="space-y-2">
            <Label className="text-sm">Banding Type</Label>
            <Select disabled={disabled} value={bandingType} onValueChange={onBandingTypeChange}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paper">Paper Band</SelectItem>
                <SelectItem value="elastic">Elastic Band</SelectItem>
                <SelectItem value="shrink-wrap">Shrink Wrap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm" htmlFor="items-per-bundle">
              Items per Bundle
            </Label>
            <Input
              className="max-w-xs"
              disabled={disabled}
              id="items-per-bundle"
              min="1"
              type="number"
              value={itemsPerBundle}
              onChange={(e) => onItemsPerBundleChange(parseInt(e.target.value) || 100)}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Total bundles: {Math.ceil(quantity / itemsPerBundle)}
          </p>
        </div>
      )}
    </div>
  )
}
