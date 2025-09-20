'use client'

import { useState } from 'react'
import { HexColorPicker, HexColor } from 'react-colorful'
import { Button } from '@/components/ui/button'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const presetColors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
    '#000000',
    '#ffffff',
    '#64748b',
    '#374151',
    '#9ca3af',
  ]

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button className="w-full justify-start text-left font-normal" variant="outline">
            <div className="w-4 h-4 rounded mr-2 border" style={{ backgroundColor: value }} />
            {value}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <HexColorPicker color={value} onChange={onChange} />

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Hex:</span>
              <HexColorInput
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded"
                color={value}
                onChange={onChange}
              />
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Presets:</div>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => onChange(color)}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
