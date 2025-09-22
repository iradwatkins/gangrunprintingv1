/**
 * Perforation addon section component
 */

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { calculatePerforationPrice, formatPrice } from '../utils/pricing'

interface PerforationSectionProps {
  enabled: boolean
  verticalCount: string
  verticalPosition: string
  horizontalCount: string
  horizontalPosition: string
  quantity: number
  disabled: boolean
  onToggle: (checked: boolean) => void
  onUpdateConfig: (field: string, value: string) => void
}

export function PerforationSection({
  enabled,
  verticalCount,
  verticalPosition,
  horizontalCount,
  horizontalPosition,
  quantity,
  disabled,
  onToggle,
  onUpdateConfig,
}: PerforationSectionProps) {
  const price = calculatePerforationPrice(quantity)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="perforation"
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={disabled}
          />
          <Label htmlFor="perforation" className="font-medium">
            Perforation
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Add perforated lines for easy tearing
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-sm font-medium">{formatPrice(price)}</span>
      </div>

      {enabled && (
        <div className="space-y-3 pl-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Vertical</Label>
              <Select
                value={verticalCount}
                onValueChange={(value) => onUpdateConfig('verticalCount', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1">1 Line</SelectItem>
                  <SelectItem value="2">2 Lines</SelectItem>
                  <SelectItem value="3">3 Lines</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Position</Label>
              <Input
                type="text"
                value={verticalPosition}
                onChange={(e) => onUpdateConfig('verticalPosition', e.target.value)}
                placeholder="e.g., 3.5&quot; from left"
                disabled={disabled || verticalCount === '0'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Horizontal</Label>
              <Select
                value={horizontalCount}
                onValueChange={(value) => onUpdateConfig('horizontalCount', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1">1 Line</SelectItem>
                  <SelectItem value="2">2 Lines</SelectItem>
                  <SelectItem value="3">3 Lines</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Position</Label>
              <Input
                type="text"
                value={horizontalPosition}
                onChange={(e) => onUpdateConfig('horizontalPosition', e.target.value)}
                placeholder="e.g., 2&quot; from top"
                disabled={disabled || horizontalCount === '0'}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}