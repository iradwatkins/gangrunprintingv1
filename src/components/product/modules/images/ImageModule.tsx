'use client'

import React, { useState, useCallback, useRef } from 'react'
import { ImageUploader } from './ImageUploader'
import { ImagePreview } from './ImagePreview'
import { ModuleLoadingBoundary } from '../loading/ModuleLoadingComponents'
import { useImageModule } from '../hooks/StandardModuleHooks'
import type {
  ImageModuleProps,
  ImageFile,
  ImageUploadState,
  DEFAULT_IMAGE_CONFIG
} from './types'
import { ModuleType } from '../types/StandardModuleTypes'

/**
 * ImageModule - Always Optional Upload System
 *
 * CRITICAL ARCHITECTURE RULES:
 * - NEVER required for pricing calculations
 * - NEVER blocks checkout process
 * - System works completely without any uploads
 * - Shows "pending upload" states gracefully
 * - Errors don't crash other modules
 */
export function ImageModule({
  images = [],
  config = DEFAULT_IMAGE_CONFIG,
  onChange,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  disabled = false,
  className = '',
  uploadAreaClassName = '',
  previewClassName = '',
  showUploadArea = true,
  showPendingMessage = true,
  required = false, // Should always be false, but kept for interface compatibility
}: ImageModuleProps) {
  // Use standardized module hook for error handling, loading, etc.
  const {
    moduleState,
    moduleErrors,
    moduleLoading,
    updateModuleState,
    addModuleError,
    clearModuleErrors,
    startModuleLoading,
    completeModuleLoading,
    failModuleLoading
  } = useImageModule({
    moduleType: ModuleType.IMAGES,
    initialState: { images },
    onChange: (newState) => {
      onChange(newState.images)
    }
  })

  // Internal state for drag and drop
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Merge provided config with defaults
  const effectiveConfig = { ...DEFAULT_IMAGE_CONFIG, ...config }

  // Calculate current module state
  const currentState = {
    hasUploads: images.length > 0,
    isPending: images.some(img => img.uploadState === ImageUploadState.PENDING),
    isUploading: images.some(img => img.uploadState === ImageUploadState.UPLOADING),
    hasErrors: images.some(img => img.uploadState === ImageUploadState.FAILED),
    completedCount: images.filter(img => img.uploadState === ImageUploadState.COMPLETED).length,
    errorCount: images.filter(img => img.uploadState === ImageUploadState.FAILED).length
  }

  // Handle file selection
  const handleFileSelect = useCallback(async (files: File[]) => {
    try {
      clearModuleErrors()

      // Validate file count
      if (images.length + files.length > effectiveConfig.maxFiles) {
        addModuleError('too_many_files', `Maximum ${effectiveConfig.maxFiles} files allowed`)
        return
      }

      // Convert files to ImageFile objects
      const newImageFiles: ImageFile[] = []
      const invalidFiles: string[] = []

      for (const file of files) {
        // Validate file size
        if (file.size > effectiveConfig.maxFileSize) {
          invalidFiles.push(`${file.name} (too large)`)
          continue
        }

        // Validate file type
        if (!effectiveConfig.acceptedTypes.includes(file.type)) {
          invalidFiles.push(`${file.name} (invalid type)`)
          continue
        }

        // Create ImageFile object
        const imageFile: ImageFile = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadState: ImageUploadState.PENDING
        }

        newImageFiles.push(imageFile)
      }

      // Report invalid files
      if (invalidFiles.length > 0) {
        addModuleError('validation_failed', `Invalid files: ${invalidFiles.join(', ')}`)
      }

      // Update images list
      if (newImageFiles.length > 0) {
        const updatedImages = [...images, ...newImageFiles]
        onChange(updatedImages)
        onUploadStart?.(files.slice(0, newImageFiles.length))

        // Start uploads for each file
        newImageFiles.forEach(imageFile => {
          startUpload(imageFile, files.find(f => f.name === imageFile.name)!)
        })
      }

    } catch (error) {
      addModuleError('selection_failed', 'Failed to select files')
    }
  }, [images, effectiveConfig, onChange, onUploadStart, addModuleError, clearModuleErrors])

  // Start individual file upload
  const startUpload = useCallback(async (imageFile: ImageFile, file: File) => {
    const operationId = startModuleLoading(
      'file_upload',
      `Uploading ${imageFile.name}`,
      'high',
      30000 // 30 second estimate
    )

    try {
      // Update file state to uploading
      const updatedImages = images.map(img =>
        img.id === imageFile.id
          ? { ...img, uploadState: ImageUploadState.UPLOADING, uploadProgress: 0 }
          : img
      )
      onChange(updatedImages)

      // Simulate upload progress (replace with actual upload logic)
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20
        if (progress >= 95) {
          clearInterval(progressInterval)
          progress = 95
        }

        const progressUpdatedImages = images.map(img =>
          img.id === imageFile.id
            ? { ...img, uploadProgress: progress }
            : img
        )
        onChange(progressUpdatedImages)
        onUploadProgress?.(imageFile.id, progress)
      }, 500)

      // TODO: Replace with actual upload implementation
      // This would typically call an API endpoint to upload the file
      await simulateUpload(file, imageFile.id)

      clearInterval(progressInterval)

      // Mark as completed
      const completedImages = images.map(img =>
        img.id === imageFile.id
          ? {
              ...img,
              uploadState: ImageUploadState.COMPLETED,
              uploadProgress: 100,
              url: `https://example.com/uploads/${imageFile.id}`, // Placeholder URL
              thumbnailUrl: `https://example.com/thumbnails/${imageFile.id}`, // Placeholder
              uploadedAt: new Date()
            }
          : img
      )
      onChange(completedImages)

      completeModuleLoading(operationId)
      onUploadComplete?.(imageFile.id, completedImages.find(img => img.id === imageFile.id)!)

    } catch (error) {
      // Mark as failed
      const failedImages = images.map(img =>
        img.id === imageFile.id
          ? {
              ...img,
              uploadState: ImageUploadState.FAILED,
              errorMessage: error instanceof Error ? error.message : 'Upload failed'
            }
          : img
      )
      onChange(failedImages)

      failModuleLoading(operationId, 'Upload failed')
      onUploadError?.(imageFile.id, error instanceof Error ? error.message : 'Upload failed')
    }
  }, [images, onChange, startModuleLoading, completeModuleLoading, failModuleLoading, onUploadProgress, onUploadComplete, onUploadError])

  // Simulate upload (replace with actual implementation)
  const simulateUpload = async (file: File, fileId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve()
        } else {
          reject(new Error('Network error'))
        }
      }, 2000 + Math.random() * 3000) // 2-5 second upload time
    })
  }

  // Handle file removal
  const handleFileRemove = useCallback((fileId: string) => {
    const updatedImages = images.filter(img => img.id !== fileId)
    onChange(updatedImages)
  }, [images, onChange])

  // Handle retry for failed uploads
  const handleRetry = useCallback((fileId: string) => {
    const imageFile = images.find(img => img.id === fileId)
    if (imageFile && imageFile.uploadState === ImageUploadState.FAILED) {
      // Reset to pending state
      const updatedImages = images.map(img =>
        img.id === fileId
          ? { ...img, uploadState: ImageUploadState.PENDING, errorMessage: undefined }
          : img
      )
      onChange(updatedImages)

      // Would need original file reference to retry - this is a simplified version
      // In a real implementation, you'd store file references for retry functionality
    }
  }, [images, onChange])

  return (
    <ModuleLoadingBoundary
      loadingState={moduleLoading}
      hasErrors={moduleErrors.hasErrors}
      moduleName="Image Upload"
    >
      <div className={`image-module ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Upload Area - Only show if enabled */}
        {showUploadArea && !disabled && (
          <ImageUploader
            config={effectiveConfig}
            isDragOver={isDragOver}
            onDragOver={setIsDragOver}
            onFileSelect={handleFileSelect}
            className={uploadAreaClassName}
            fileInputRef={fileInputRef}
          />
        )}

        {/* Image Previews */}
        {images.length > 0 && (
          <ImagePreview
            images={images}
            onRemove={handleFileRemove}
            onRetry={handleRetry}
            className={previewClassName}
            showProgress={true}
          />
        )}

        {/* Pending Upload Message - Always Optional */}
        {showPendingMessage && !currentState.hasUploads && !disabled && (
          <div className="text-sm text-gray-500 mt-2">
            <p>📁 Images are optional - you can proceed without uploading any files</p>
            <p>✨ Orders without images will show "Pending customer file" status</p>
          </div>
        )}

        {/* Upload Status Summary */}
        {currentState.hasUploads && (
          <div className="text-sm text-gray-600 mt-2">
            {currentState.completedCount > 0 && (
              <span className="text-green-600">
                ✅ {currentState.completedCount} uploaded
              </span>
            )}
            {currentState.isPending && (
              <span className="text-yellow-600 ml-2">
                ⏳ Pending uploads
              </span>
            )}
            {currentState.isUploading && (
              <span className="text-blue-600 ml-2">
                🔄 Uploading...
              </span>
            )}
            {currentState.errorCount > 0 && (
              <span className="text-red-600 ml-2">
                ❌ {currentState.errorCount} failed
              </span>
            )}
          </div>
        )}

        {/* Module Errors - Ultra-Independent */}
        {moduleErrors.hasErrors && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            {moduleErrors.errors.map((error, index) => (
              <div key={index}>{error.message}</div>
            ))}
          </div>
        )}
      </div>
    </ModuleLoadingBoundary>
  )
}

// Export standardized hook for external use
export { useImageModule } from '../hooks/StandardModuleHooks'