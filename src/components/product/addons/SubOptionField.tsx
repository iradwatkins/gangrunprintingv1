/**
 * SubOptionField - Generic renderer for addon sub-options
 * Handles SELECT, NUMBER, and TEXT field types
 */

'use client'

import { HelpCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SubOptionFieldProps {
  subOption: {
    id: string
    name: string
    optionType: 'SELECT' | 'NUMBER' | 'TEXT'
    options?: string[] | null
    defaultValue?: string
    isRequired?: boolean
    tooltipText?: string
  }
  value: any
  onChange: (value: any) => void
  disabled?: boolean
}

export function SubOptionField({ subOption, value, onChange, disabled }: SubOptionFieldProps) {
  const renderField = () => {
    switch (subOption.optionType) {
      case 'SELECT':
        return (
          <Select
            disabled={disabled}
            value={value || subOption.defaultValue || ''}
            onValueChange={onChange}
          >
            <SelectTrigger className="h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="-- Select One --" />
            </SelectTrigger>
            <SelectContent>
              {subOption.options && Array.isArray(subOption.options) ? (
                subOption.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="">
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )

      case 'NUMBER':
        return (
          <Input
            className="h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={disabled}
            min="0"
            type="number"
            value={value ?? subOption.defaultValue ?? ''}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          />
        )

      case 'TEXT':
        return (
          <Input
            className="h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={disabled}
            type="text"
            value={value ?? subOption.defaultValue ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Unknown field type: {subOption.optionType}
          </div>
        )
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          {subOption.name}
          {subOption.isRequired && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {subOption.tooltipText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{subOption.tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {renderField()}
    </div>
  )
}
