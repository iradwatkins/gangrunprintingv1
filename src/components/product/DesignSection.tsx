'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface DesignOption {
  id: string
  name: string
  price?: number
  pricing?: { oneSide: number; twoSides: number }
  requiresUpload: boolean
  requiresSides: boolean
  requiresEmail: boolean
}

interface UploadedFileData {
  id: string
  fileName: string
  url: string
  thumbnailUrl?: string
  fileSize: number
  uploadedAt: string
}

interface DesignSectionProps {
  selectedOption: string
  onOptionChange: (optionId: string) => void
  selectedSides?: 'oneSide' | 'twoSides'
  onSidesChange?: (sides: 'oneSide' | 'twoSides') => void
  uploadedFiles: UploadedFileData[]
  onFilesChange: (files: UploadedFileData[]) => void
}

const DESIGN_OPTIONS: DesignOption[] = [
  {
    id: 'upload-artwork',
    name: 'Upload My Artwork',
    price: 0,
    requiresUpload: true,
    requiresSides: false,
    requiresEmail: false,
  },
  {
    id: 'upload-later',
    name: 'I will upload my order later',
    price: 0,
    requiresUpload: false,
    requiresSides: false,
    requiresEmail: false,
  },
  {
    id: 'standard-design-one',
    name: 'Standard Custom Design - One Side',
    price: 90,
    requiresUpload: false,
    requiresSides: false,
    requiresEmail: true,
  },
  {
    id: 'standard-design-two',
    name: 'Standard Custom Design - Two Sides',
    price: 135,
    requiresUpload: false,
    requiresSides: false,
    requiresEmail: true,
  },
  {
    id: 'rush-design-one',
    name: 'Rush Custom Design - One Side',
    price: 160,
    requiresUpload: false,
    requiresSides: false,
    requiresEmail: true,
  },
  {
    id: 'rush-design-two',
    name: 'Rush Custom Design - Two Sides',
    price: 240,
    requiresUpload: false,
    requiresSides: false,
    requiresEmail: true,
  },
  {
    id: 'minor-changes',
    name: 'Design Changes - Minor',
    price: 22.5,
    requiresUpload: true,
    requiresSides: false,
    requiresEmail: false,
  },
  {
    id: 'major-changes',
    name: 'Design Changes - Major',
    price: 45,
    requiresUpload: true,
    requiresSides: false,
    requiresEmail: false,
  },
]

export default function DesignSection({
  selectedOption,
  onOptionChange,
  selectedSides = 'oneSide',
  onSidesChange,
  uploadedFiles,
  onFilesChange,
}: DesignSectionProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})

  const currentOption = DESIGN_OPTIONS.find((opt) => opt.id === selectedOption) || DESIGN_OPTIONS[0]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = async (newFiles: File[]) => {
    // Upload each file to MinIO
    for (const file of newFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('isCustomerUpload', 'true')

        const response = await fetch('/api/products/upload-customer-image', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()

        // Add uploaded file data to state
        const uploadedFile: UploadedFileData = {
          id: result.id,
          fileName: result.fileName,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          fileSize: result.fileSize,
          uploadedAt: result.timestamp,
        }

        // Generate local thumbnail for image preview
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            setThumbnails((prev) => ({
              ...prev,
              [file.name]: e.target?.result as string,
            }))
          }
          reader.readAsDataURL(file)
        }

        onFilesChange([...uploadedFiles, uploadedFile])
      } catch (error) {
        console.error('Failed to upload file:', file.name, error)
        alert(`Failed to upload ${file.name}. Please try again.`)
      }
    }
  }

  const removeFile = (fileName: string) => {
    onFilesChange(uploadedFiles.filter((f) => f.fileName !== fileName))
    setThumbnails((prev) => {
      const newThumbnails = { ...prev }
      delete newThumbnails[fileName]
      return newThumbnails
    })
  }

  const getPrice = () => {
    return currentOption.price || 0
  }

  return (
    <div className="space-y-4">
      {/* Design Option Dropdown */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label className="text-sm font-semibold uppercase">DESIGN</Label>
          <div className="group relative">
            <Info className="h-4 w-4 text-blue-500 cursor-help" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-2 px-3 w-64 z-10">
              Please select the design option you would like.
            </div>
          </div>
        </div>
        <Select value={selectedOption} onValueChange={onOptionChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DESIGN_OPTIONS.map((option) => {
              const displayPrice =
                option.price && option.price > 0 ? ` - $${option.price.toFixed(2)}` : ''

              return (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                  {displayPrice}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Email Notice (for custom design services) */}
      {currentOption.requiresEmail && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            Email your design requirements and reference files to{' '}
            <strong>design@gangrunprinting.com</strong>. Your order will show as{' '}
            <strong>PENDING</strong> until we receive your design details.
          </AlertDescription>
        </Alert>
      )}

      {/* File Upload Zone (for Upload My Artwork and Design Changes) */}
      {currentOption.requiresUpload && (
        <div>
          <Label className="text-sm font-semibold mb-2 block">Upload Your Files</Label>

          {/* Drag and Drop Zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
            `}
            onClick={() => document.getElementById('design-file-input')?.click()}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Accepted formats: PDF, AI, EPS, JPG, PNG, TIFF (max 100MB per file)
            </p>
          </div>

          <input
            multiple
            accept=".pdf,.ai,.eps,.jpg,.jpeg,.png,.tiff,.tif"
            className="hidden"
            id="design-file-input"
            type="file"
            onChange={handleFileInput}
          />

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-xs font-semibold text-gray-600">
                Uploaded Files ({uploadedFiles.length})
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="relative border rounded-lg p-2 bg-gray-50">
                    {file.thumbnailUrl || thumbnails[file.fileName] ? (
                      <div className="relative w-full h-24 mb-2">
                        <Image
                          fill
                          alt={file.fileName}
                          className="object-cover rounded"
                          src={file.thumbnailUrl || thumbnails[file.fileName]}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 mb-2 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-2xl text-gray-400">📄</span>
                      </div>
                    )}
                    <p className="text-xs font-medium truncate mb-1">{file.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(file.fileName)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Price Display */}
      {getPrice() > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-900">Design Fee:</span>
            <span className="text-lg font-bold text-green-700">${getPrice().toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
