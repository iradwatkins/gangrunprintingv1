/**
 * Image Upload addon section component
 * Simple multi-image upload for client files
 */

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import FileUploadZone from '../../FileUploadZone'

interface ImageUploadSectionProps {
  enabled: boolean
  selectedOption: string | null
  uploadedFiles?: any[]
  disabled: boolean
  onToggle: (checked: boolean) => void
  onOptionChange: (optionId: string | null, files?: any[]) => void
  onFilesUploaded?: (files: any[]) => void
}

export function ImageUploadSection({
  enabled,
  selectedOption,
  uploadedFiles = [],
  disabled,
  onToggle,
  onOptionChange,
  onFilesUploaded,
}: ImageUploadSectionProps) {
  const [primarySelection, setPrimarySelection] = useState<string>(selectedOption || 'none')

  // Image upload options configuration
  const uploadOptions = {
    upload_now: {
      id: 'upload_now',
      name: 'Upload Files Now',
      description: 'Upload your additional files immediately',
      tooltipText: 'Upload multiple images or files now. All uploads are free.',
      requiresFileUpload: true,
      fileUploadOptional: false,
    },
    upload_later: {
      id: 'upload_later',
      name: 'Will Email Files Later',
      description: 'Submit files after placing order',
      tooltipText: 'You can email us your additional files after placing the order',
      requiresFileUpload: false,
    },
  }

  const selectedUploadOption = uploadOptions[primarySelection as keyof typeof uploadOptions]

  const handlePrimaryChange = (value: string) => {
    setPrimarySelection(value)

    if (value === 'none') {
      onOptionChange(null, [])
    } else {
      onOptionChange(value, uploadedFiles)
    }
  }

  const handleFilesUploaded = (files: any[]) => {
    onFilesUploaded?.(files)
    if (primarySelection !== 'none') {
      onOptionChange(primarySelection, files)
    }
  }

  const shouldShowFileUpload = primarySelection === 'upload_now'

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={enabled}
              disabled={disabled}
              id="image-upload"
              onCheckedChange={onToggle}
            />
            <Label className="font-medium" htmlFor="image-upload">
              Additional Files
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Upload additional images, logos, or files for your project. Completely optional.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-medium text-green-600">FREE</span>
        </div>

        {enabled && (
          <div className="space-y-4 pl-6">
            {/* Primary Dropdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="upload-option">Upload Method</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Choose how you'd like to provide your additional files.
                  </TooltipContent>
                </Tooltip>
              </div>

              <Select
                disabled={disabled}
                value={primarySelection}
                onValueChange={handlePrimaryChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose upload method..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Choose upload method...</SelectItem>
                  {Object.values(uploadOptions).map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload for "Upload Files Now" */}
            {shouldShowFileUpload && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Upload Additional Files</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Upload images, logos, graphics, or any additional files for your project
                    </TooltipContent>
                  </Tooltip>
                </div>

                <FileUploadZone
                  disabled={disabled}
                  maxFiles={10}
                  maxFileSize={25}
                  onFilesUploaded={handleFilesUploaded}
                />

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Maximum 10 files, 25MB each</p>
                  <p>• Accepted: JPG, PNG, GIF, WebP, PDF, AI, EPS</p>
                  <p>• All file uploads are completely free</p>
                </div>
              </div>
            )}

            {/* Summary Display */}
            {primarySelection !== 'none' && selectedUploadOption && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm space-y-1">
                  <div className="font-medium">Selected: {selectedUploadOption.name}</div>

                  {/* Show uploaded files count */}
                  {shouldShowFileUpload && uploadedFiles.length > 0 && (
                    <div className="text-muted-foreground">
                      ✅ {uploadedFiles.length} file(s) uploaded
                    </div>
                  )}

                  {/* Show note for email later option */}
                  {primarySelection === 'upload_later' && (
                    <div className="text-muted-foreground">
                      📧 You can email additional files after placing your order
                    </div>
                  )}

                  {/* Price display */}
                  <div className="font-medium text-green-600">Cost: FREE</div>
                </div>
              </div>
            )}

            {/* Help text when enabled but no option selected */}
            {primarySelection === 'none' && (
              <div className="ml-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Optional:</strong> Upload additional images, logos, or files for your
                  project. You can upload them now or email them to us later. This service is
                  completely free.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
