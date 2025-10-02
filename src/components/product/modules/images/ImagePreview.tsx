'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  X,
  RefreshCw,
  FileImage,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Eye,
  Download,
  FileText
} from 'lucide-react'
import type { ImageFile, ImageUploadState } from './types'

interface ImagePreviewProps {
  images: ImageFile[]
  onRemove: (fileId: string) => void
  onRetry: (fileId: string) => void
  className?: string
  showProgress?: boolean
  maxPreviewSize?: number
}

/**
 * ImagePreview - Shows uploaded/uploading files with status
 * Provides controls for management and retry
 */
export function ImagePreview({
  images,
  onRemove,
  onRetry,
  className = '',
  showProgress = true,
  maxPreviewSize = 5
}: ImagePreviewProps) {

  // Get appropriate icon for upload state
  const getStateIcon = (state: ImageUploadState, size: number = 16) => {
    const iconProps = { size, className: 'transition-colors duration-200' }

    switch (state) {
      case ImageUploadState.NONE:
      case ImageUploadState.PENDING:
        return <Clock {...iconProps} className="text-yellow-500" />
      case ImageUploadState.UPLOADING:
      case ImageUploadState.PROCESSING:
        return <Loader2 {...iconProps} className="text-blue-500 animate-spin" />
      case ImageUploadState.COMPLETED:
        return <CheckCircle {...iconProps} className="text-green-500" />
      case ImageUploadState.FAILED:
        return <AlertCircle {...iconProps} className="text-red-500" />
      case ImageUploadState.CANCELLED:
        return <X {...iconProps} className="text-gray-500" />
      default:
        return <FileImage {...iconProps} className="text-gray-500" />
    }
  }

  // Get state color for styling
  const getStateColor = (state: ImageUploadState) => {
    switch (state) {
      case ImageUploadState.COMPLETED:
        return 'border-green-200 bg-green-50'
      case ImageUploadState.FAILED:
        return 'border-red-200 bg-red-50'
      case ImageUploadState.UPLOADING:
      case ImageUploadState.PROCESSING:
        return 'border-blue-200 bg-blue-50'
      case ImageUploadState.PENDING:
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i]
  }

  // Get file type icon
  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-blue-500" />
    } else if (type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <FileImage className="h-8 w-8 text-gray-500" />
  }

  // Show first few images, then count
  const displayImages = images.slice(0, maxPreviewSize)
  const remainingCount = Math.max(0, images.length - maxPreviewSize)

  if (images.length === 0) {
    return null
  }

  return (
    <div className={`image-preview space-y-3 ${className}`}>
      {/* Individual File Previews */}
      {displayImages.map((image) => (
        <div
          key={image.id}
          className={`
            flex items-center space-x-3 p-3 border rounded-lg transition-all duration-200
            ${getStateColor(image.uploadState)}
          `}
        >
          {/* File Icon/Thumbnail */}
          <div className="flex-shrink-0">
            {image.thumbnailUrl ? (
              <img
                src={image.thumbnailUrl}
                alt={image.name}
                className="h-10 w-10 object-cover rounded"
              />
            ) : (
              getFileTypeIcon(image.type)
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {image.name}
              </p>
              {getStateIcon(image.uploadState, 14)}
            </div>

            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-gray-500">
                {formatFileSize(image.size)}
              </p>

              <Badge variant="outline" className="text-xs">
                {image.uploadState.replace('_', ' ').toUpperCase()}
              </Badge>

              {image.uploadedAt && (
                <p className="text-xs text-gray-400">
                  {image.uploadedAt.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Progress Bar */}
            {showProgress && image.uploadProgress !== undefined && (
              <div className="mt-2">
                <Progress
                  value={image.uploadProgress}
                  className="h-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(image.uploadProgress)}% complete
                </p>
              </div>
            )}

            {/* Error Message */}
            {image.errorMessage && (
              <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                {image.errorMessage}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center space-x-1">
            {/* Preview Button */}
            {image.url && image.uploadState === ImageUploadState.COMPLETED && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => window.open(image.url, '_blank')}
                title="Preview"
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}

            {/* Download Button */}
            {image.url && image.uploadState === ImageUploadState.COMPLETED && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = image.url!
                  link.download = image.name
                  link.click()
                }}
                title="Download"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}

            {/* Retry Button */}
            {image.uploadState === ImageUploadState.FAILED && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                onClick={() => onRetry(image.id)}
                title="Retry upload"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}

            {/* Remove Button */}
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              onClick={() => onRemove(image.id)}
              title="Remove"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}

      {/* Remaining Files Count */}
      {remainingCount > 0 && (
        <div className="text-center py-2 text-sm text-gray-500 border-t border-gray-200">
          + {remainingCount} more file{remainingCount > 1 ? 's' : ''}
        </div>
      )}

      {/* Upload Summary */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200">
        <span>
          {images.length} file{images.length > 1 ? 's' : ''} total
        </span>

        <div className="flex space-x-3">
          {images.filter(img => img.uploadState === ImageUploadState.COMPLETED).length > 0 && (
            <span className="text-green-600">
              ✅ {images.filter(img => img.uploadState === ImageUploadState.COMPLETED).length} uploaded
            </span>
          )}

          {images.filter(img => img.uploadState === ImageUploadState.UPLOADING).length > 0 && (
            <span className="text-blue-600">
              🔄 {images.filter(img => img.uploadState === ImageUploadState.UPLOADING).length} uploading
            </span>
          )}

          {images.filter(img => img.uploadState === ImageUploadState.FAILED).length > 0 && (
            <span className="text-red-600">
              ❌ {images.filter(img => img.uploadState === ImageUploadState.FAILED).length} failed
            </span>
          )}
        </div>
      </div>
    </div>
  )
}