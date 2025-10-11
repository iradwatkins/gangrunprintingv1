'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  selectedSide?: 'oneSide' | 'twoSides' | null
  uploadedFiles?: any[]
  onDesignOptionChange: (optionId: string | null, side?: string | null, files?: any[]) => void
  onFilesUploaded?: (files: any[]) => void
  disabled?: boolean
}

export function DesignAddonSelector({
  designAddons,
  selectedDesignOption,
  selectedSide = null,
  uploadedFiles = [],
  onDesignOptionChange,
  onFilesUploaded,
  disabled = false,
}: DesignAddonSelectorProps) {
  const [primarySelection, setPrimarySelection] = useState<string>('none')
  const [secondarySelection, setSecondarySelection] = useState<string>('')

  // Initialize state from props
  useEffect(() => {
    if (selectedDesignOption) {
      setPrimarySelection(selectedDesignOption)
      if (selectedSide) {
        setSecondarySelection(selectedSide)
      }
    }
  }, [selectedDesignOption, selectedSide])

  const selectedAddon = designAddons.find((addon) => addon.id === primarySelection)

  const handlePrimaryChange = (value: string) => {
    setPrimarySelection(value)
    setSecondarySelection('') // Clear secondary selection when primary changes

    if (value === 'none') {
      onDesignOptionChange(null, null, [])
    } else {
      const addon = designAddons.find((a) => a.id === value)
      if (addon) {
        // For options that don't require side selection, immediately update
        if (!addon.configuration?.requiresSideSelection) {
          onDesignOptionChange(value, null, uploadedFiles)
        } else {
          // For options requiring side selection, wait for secondary selection
          onDesignOptionChange(value, null, uploadedFiles)
        }
      }
    }
  }

  const handleSecondaryChange = (value: string) => {
    setSecondarySelection(value)
    onDesignOptionChange(primarySelection, value, uploadedFiles)
  }

  const handleFilesUploaded = (files: any[]) => {
    onFilesUploaded?.(files)
    if (primarySelection !== 'none') {
      onDesignOptionChange(primarySelection, secondarySelection || null, files)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price)
  }

  const getPrimaryOptionLabel = (addon: DesignOption) => {
    return addon.name
  }

  const getDisplayPrice = () => {
    if (!selectedAddon) return null

    // For Standard/Rush Design with side selection
    if (
      selectedAddon.configuration?.requiresSideSelection &&
      selectedAddon.configuration.sideOptions
    ) {
      if (secondarySelection) {
        const side = secondarySelection as 'oneSide' | 'twoSides'
        return formatPrice(selectedAddon.configuration.sideOptions[side].price)
      }
      return null // No price until side is selected
    }

    // For Minor/Major changes with flat price
    const price = selectedAddon.configuration?.basePrice ?? selectedAddon.price ?? 0
    if (price > 0) {
      return formatPrice(price)
    }

    return null
  }

  const shouldShowFileUpload = primarySelection === 'addon_upload_artwork'
  const shouldShowSecondaryDropdown = selectedAddon?.configuration?.requiresSideSelection === true
  const shouldShowPrice =
    primarySelection === 'addon_design_changes_minor' ||
    primarySelection === 'addon_design_changes_major'

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Primary Dropdown */}
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

          <Select disabled={disabled} value={primarySelection} onValueChange={handlePrimaryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Options" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select Options</SelectItem>
              {designAddons.map((addon) => (
                <SelectItem key={addon.id} value={addon.id}>
                  {getPrimaryOptionLabel(addon)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditional Secondary Elements */}

        {/* Secondary Dropdown for Standard/Rush Design */}
        {shouldShowSecondaryDropdown && selectedAddon?.configuration?.sideOptions && (
          <div className="ml-6 space-y-2">
            <Label>Select Sides *</Label>
            <Select
              disabled={disabled}
              value={secondarySelection}
              onValueChange={handleSecondaryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose number of sides..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oneSide">
                  One Side: {formatPrice(selectedAddon.configuration.sideOptions.oneSide.price)}
                </SelectItem>
                <SelectItem value="twoSides">
                  Two Sides: {formatPrice(selectedAddon.configuration.sideOptions.twoSides.price)}
                </SelectItem>
              </SelectContent>
            </Select>
            {!secondarySelection && (
              <p className="text-sm text-muted-foreground">
                Please select the number of sides for your design
              </p>
            )}
          </div>
        )}

        {/* File Upload for "Upload My Artwork" Only */}
        {shouldShowFileUpload && (
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

            <FileUploadZone
              disabled={disabled}
              maxFiles={5}
              maxFileSize={25}
              onFilesUploaded={handleFilesUploaded}
            />

            <p className="text-sm text-muted-foreground">
              Note: File upload is optional. You can email your files to us after placing your
              order.
            </p>
          </div>
        )}

        {/* Static Price Display for Minor/Major Changes */}
        {shouldShowPrice && (
          <div className="ml-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Price: {getDisplayPrice()}</p>
          </div>
        )}

        {/* Summary Display */}
        {primarySelection !== 'none' && selectedAddon && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-sm space-y-1">
              <div className="font-medium">Selected: {selectedAddon.name}</div>

              {/* Show side selection if applicable */}
              {shouldShowSecondaryDropdown && secondarySelection && (
                <div className="text-muted-foreground">
                  Sides: {secondarySelection === 'oneSide' ? 'One Side' : 'Two Sides'}
                </div>
              )}

              {/* Show price if available */}
              {getDisplayPrice() && (
                <div className="font-medium text-primary">Total: {getDisplayPrice()}</div>
              )}

              {/* Show uploaded files count */}
              {shouldShowFileUpload && uploadedFiles.length > 0 && (
                <div className="text-muted-foreground">{uploadedFiles.length} file(s) uploaded</div>
              )}

              {/* Warning if Standard/Rush selected but no side chosen */}
              {shouldShowSecondaryDropdown && !secondarySelection && (
                <div className="text-orange-600 text-xs mt-2">
                  ⚠️ Please select the number of sides to continue
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
