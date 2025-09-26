'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import FileUploadZone from '../FileUploadZone'

interface DesignOption {
  id: string
  name: string
  description: string
  tooltipText?: string
  price?: number
  configuration?: {
    basePrice?: number
    requiresFileUpload?: boolean
    fileUploadOptional?: boolean
    allowDeferredUpload?: boolean
    requiresSideSelection?: boolean
    sideOptions?: {
      oneSide: { price: number; label: string }
      twoSides: { price: number; label: string }
    }
  }
}

interface DesignAddonSelectorProps {
  designAddons: DesignOption[]
  selectedDesignOption: string | null
  selectedSide?: 'oneSide' | 'twoSides'
  uploadedFiles?: any[]
  onDesignOptionChange: (optionId: string | null, side?: string, files?: any[]) => void
  onFilesUploaded?: (files: any[]) => void
  disabled?: boolean
}

export function DesignAddonSelector({
  designAddons,
  selectedDesignOption,
  selectedSide = 'oneSide',
  uploadedFiles = [],
  onDesignOptionChange,
  onFilesUploaded,
  disabled = false
}: DesignAddonSelectorProps) {
  const [currentSide, setCurrentSide] = useState<'oneSide' | 'twoSides'>(selectedSide)
  const [showFileUpload, setShowFileUpload] = useState(false)

  const selectedAddon = designAddons.find(addon => addon.id === selectedDesignOption)

  useEffect(() => {
    // Show file upload only when "Upload My Artwork" is selected
    const shouldShowUpload = selectedAddon?.configuration?.requiresFileUpload === true
    setShowFileUpload(shouldShowUpload)
  }, [selectedAddon])

  const handleDesignOptionChange = (value: string) => {
    if (value === 'none') {
      onDesignOptionChange(null)
      setShowFileUpload(false)
      return
    }

    const addon = designAddons.find(a => a.id === value)
    if (!addon) return

    // Check if side selection is required
    if (addon.configuration?.requiresSideSelection) {
      onDesignOptionChange(value, currentSide)
    } else {
      onDesignOptionChange(value)
    }
  }

  const handleSideChange = (value: 'oneSide' | 'twoSides') => {
    setCurrentSide(value)
    if (selectedDesignOption) {
      onDesignOptionChange(selectedDesignOption, value)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const getOptionLabel = (addon: DesignOption) => {
    if (addon.configuration?.requiresSideSelection && addon.configuration.sideOptions) {
      return addon.name
    }

    const price = addon.configuration?.basePrice ?? addon.price ?? 0
    return price > 0 ? `${addon.name} - ${formatPrice(price)}` : addon.name
  }

  const getOptionPrice = (addon: DesignOption, side?: 'oneSide' | 'twoSides') => {
    if (addon.configuration?.requiresSideSelection && addon.configuration.sideOptions && side) {
      return addon.configuration.sideOptions[side].price
    }
    return addon.configuration?.basePrice ?? addon.price ?? 0
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
      {/* Main Design Option Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="design-option">Design</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Please select the design option you would like.
            </TooltipContent>
          </Tooltip>
        </div>

        <RadioGroup
          value={selectedDesignOption || 'none'}
          onValueChange={handleDesignOptionChange}
          disabled={disabled}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="design-none" />
            <Label htmlFor="design-none" className="font-normal cursor-pointer">
              No design service needed
            </Label>
          </div>

          {designAddons.map((addon) => (
            <div key={addon.id} className="flex items-center space-x-2">
              <RadioGroupItem value={addon.id} id={`design-${addon.id}`} />
              <div className="flex-1 flex items-center gap-2">
                <Label htmlFor={`design-${addon.id}`} className="font-normal cursor-pointer flex-1">
                  {getOptionLabel(addon)}
                </Label>
                {addon.tooltipText && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {addon.tooltipText}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Side Selection for Standard/Rush Design */}
      {selectedAddon?.configuration?.requiresSideSelection && selectedAddon.configuration.sideOptions && (
        <div className="ml-6 space-y-2 p-4 bg-muted/50 rounded-lg">
          <Label>Select Design Sides</Label>
          <Select
            value={currentSide}
            onValueChange={(value) => handleSideChange(value as 'oneSide' | 'twoSides')}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oneSide">
                {selectedAddon.configuration.sideOptions.oneSide.label} - {formatPrice(selectedAddon.configuration.sideOptions.oneSide.price)}
              </SelectItem>
              <SelectItem value="twoSides">
                {selectedAddon.configuration.sideOptions.twoSides.label} - {formatPrice(selectedAddon.configuration.sideOptions.twoSides.price)}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* File Upload Zone for "Upload My Artwork" */}
      {showFileUpload && (
        <div className="ml-6 space-y-2">
          <div className="flex items-center gap-2">
            <Label>Upload Artwork (Optional)</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                You can upload your files now or email them to us later
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <FileUploadZone
              onFilesUploaded={(files) => {
                onFilesUploaded?.(files)
                if (selectedDesignOption) {
                  onDesignOptionChange(selectedDesignOption, undefined, files)
                }
              }}
              maxFiles={5}
              maxFileSize={25}
              disabled={disabled}
            />

            {selectedAddon?.configuration?.allowDeferredUpload && (
              <p className="mt-2 text-sm text-muted-foreground">
                Note: File upload is optional. You can email your files to us after placing your order.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Display Selected Option Summary */}
      {selectedAddon && (
        <div className="mt-4 p-3 bg-primary/5 rounded-lg">
          <div className="text-sm font-medium">Selected Design Service:</div>
          <div className="text-sm text-muted-foreground mt-1">
            {selectedAddon.name}
            {selectedAddon.configuration?.requiresSideSelection && currentSide && selectedAddon.configuration.sideOptions && (
              <span> - {selectedAddon.configuration.sideOptions[currentSide].label}</span>
            )}
            {' '}
            <span className="font-medium">
              ({formatPrice(getOptionPrice(selectedAddon, currentSide))})
            </span>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="text-sm text-muted-foreground mt-1">
              {uploadedFiles.length} file(s) uploaded
            </div>
          )}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}