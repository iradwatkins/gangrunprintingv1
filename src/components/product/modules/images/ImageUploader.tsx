'use client'

import React, { useCallback, RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileImage, Plus } from 'lucide-react'
import type { ImageUploadConfig } from './types'

interface ImageUploaderProps {
  config: ImageUploadConfig
  isDragOver: boolean
  onDragOver: (isDragOver: boolean) => void
  onFileSelect: (files: File[]) => void
  className?: string
  fileInputRef: RefObject<HTMLInputElement>
}

/**
 * ImageUploader - Drag & Drop Upload Interface
 * Handles file selection with validation
 */
export function ImageUploader({
  config,
  isDragOver,
  onDragOver,
  onFileSelect,
  className = '',
  fileInputRef
}: ImageUploaderProps) {

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDragOver(true)
  }, [onDragOver])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only set drag over to false if leaving the upload area entirely
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      onDragOver(false)
    }
  }, [onDragOver])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFileSelect(files)
    }
  }, [onDragOver, onFileSelect])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(Array.from(files))
      // Clear input so same file can be selected again
      e.target.value = ''
    }
  }, [onFileSelect])

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get accepted file types for display
  const getAcceptedTypesDisplay = (): string => {
    return config.acceptedTypes
      .map(type => {
        const extension = type.split('/')[1]?.toUpperCase() || type
        return extension
      })
      .join(', ')
  }

  return (
    <div className={`image-uploader ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={config.allowMultiple}
        accept={config.acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${isDragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center space-y-3 cursor-pointer">
          {/* Upload Icon */}
          <div className={`
            p-3 rounded-full transition-colors duration-200
            ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}
          `}>
            {isDragOver ? (
              <Plus className="h-6 w-6 text-blue-600" />
            ) : (
              <Upload className="h-6 w-6 text-gray-600" />
            )}
          </div>

          {/* Upload Text */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">
              {isDragOver ? 'Drop files here' : 'Upload images or PDFs'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Drag & drop or click to select files
            </p>
          </div>

          {/* Upload Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            <FileImage className="h-4 w-4 mr-2" />
            Choose Files
          </Button>

          {/* File Restrictions */}
          <div className="text-xs text-gray-400 text-center space-y-1">
            <p>Max {config.maxFiles} files, {formatFileSize(config.maxFileSize)} each</p>
            <p>Supported: {getAcceptedTypesDisplay()}</p>
            <p className="font-medium text-green-600">📁 Optional - proceed without files</p>
          </div>
        </div>

        {/* Overlay for drag state */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg pointer-events-none" />
        )}
      </div>

      {/* Upload Options */}
      {config.allowMultiple && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          💡 You can select multiple files at once
        </div>
      )}
    </div>
  )
}