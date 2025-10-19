/**
 * Date Range Picker Component
 *
 * Provides preset date ranges and custom date selection.
 */

'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format, subDays, subMonths, subYears } from 'date-fns'

export interface DateRange {
  start: Date
  end: Date
}

export interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const PRESETS = [
  { label: 'Last 7 days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'Last 90 days', getValue: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
  { label: 'Last 6 months', getValue: () => ({ start: subMonths(new Date(), 6), end: new Date() }) },
  { label: 'Last year', getValue: () => ({ start: subYears(new Date(), 1), end: new Date() }) },
]

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    onChange(preset.getValue())
    setIsOpen(false)
  }

  const displayText = `${format(value.start, 'MMM dd, yyyy')} - ${format(value.end, 'MMM dd, yyyy')}`

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal">
          <Calendar className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 space-y-2">
          <p className="text-sm font-medium mb-2">Select Date Range</p>
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => handlePresetSelect(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
