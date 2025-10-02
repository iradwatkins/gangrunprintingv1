'use client'

import { Info } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { PaperStock, Coating, SidesOption } from './types'

interface PaperStockSelectorProps {
  paperStocks: PaperStock[]
  paperValue: string
  coatingValue: string
  sidesValue: string
  onPaperChange: (paperId: string) => void
  onCoatingChange: (coatingId: string) => void
  onSidesChange: (sidesId: string) => void
  disabled?: boolean
  className?: string
}

export function PaperStockSelector({
  paperStocks,
  paperValue,
  coatingValue,
  sidesValue,
  onPaperChange,
  onCoatingChange,
  onSidesChange,
  disabled = false,
  className = '',
}: PaperStockSelectorProps) {
  // Get available coatings and sides based on selected paper
  const selectedPaper = paperStocks.find(p => p.id === paperValue)
  const availableCoatings = selectedPaper?.coatings || []
  const availableSides = selectedPaper?.sides.filter(s => s.isEnabled !== false) || []

  const handlePaperChange = (paperId: string) => {
    onPaperChange(paperId)

    // Auto-select default coating and sides for new paper
    const newPaper = paperStocks.find(p => p.id === paperId)
    if (newPaper) {
      const defaultCoating = newPaper.coatings.find(c => c.isDefault) || newPaper.coatings[0]
      const defaultSides = newPaper.sides.find(s => s.isDefault) || newPaper.sides[0]

      if (defaultCoating) onCoatingChange(defaultCoating.id)
      if (defaultSides) onSidesChange(defaultSides.id)
    }
  }

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* Paper Stock Selection */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              PAPER
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose your paper stock type</p>
                {selectedPaper?.tooltipText && (
                  <p className="mt-1 text-xs">{selectedPaper.tooltipText}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={paperValue}
            onValueChange={handlePaperChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select paper" />
            </SelectTrigger>
            <SelectContent>
              {paperStocks.map((paper) => (
                <SelectItem key={paper.id} value={paper.id}>
                  <div className="flex items-center gap-2">
                    <span>{paper.name}</span>
                    {paper.weight && (
                      <span className="text-xs text-gray-500">({paper.weight}pt)</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPaper?.description && (
            <p className="mt-1 text-xs text-gray-600">{selectedPaper.description}</p>
          )}
        </div>

        {/* Coating Selection */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              COATING
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Select coating finish for your paper</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            disabled={availableCoatings.length === 0 || disabled}
            value={coatingValue}
            onValueChange={onCoatingChange}
          >
            <SelectTrigger className="w-full h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select coating" />
            </SelectTrigger>
            <SelectContent>
              {availableCoatings.map((coating) => (
                <SelectItem key={coating.id} value={coating.id}>
                  {coating.name}
                  {coating.isDefault && ' (Default)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sides Selection */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              SIDES
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500 hover:text-blue-600" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Select single or double sided printing</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            disabled={availableSides.length === 0 || disabled}
            value={sidesValue}
            onValueChange={onSidesChange}
          >
            <SelectTrigger className="w-full h-11 bg-gray-100 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Select sides" />
            </SelectTrigger>
            <SelectContent>
              {availableSides.map((side) => (
                <SelectItem key={side.id} value={side.id}>
                  {side.name}
                  {side.priceMultiplier && side.priceMultiplier > 1 && (
                    <span className="text-xs text-gray-500 ml-1">
                      (+{((side.priceMultiplier - 1) * 100).toFixed(0)}%)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </TooltipProvider>
  )
}