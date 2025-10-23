'use client'

import { useState, useCallback } from 'react'
import { useErrorHandler } from '@/stores/errorStore'
import { useLoadingManager } from '@/stores/loadingStore'
import { useChunkedUpload } from './useChunkedUpload'

export interface CustomerImage {
  id: string
  url: string
  thumbnailUrl?: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

interface UseImageUploadProps {
  productId: string
  onImagesChange?: (images: CustomerImage[]) => void
}

export function useImageUpload({ productId, onImagesChange }: UseImageUploadProps) {
  const { handleError, showSuccess } = useErrorHandler()
  const { withLoading, startFileUpload, stopLoading, updateProgress, isLoading } =
    useLoadingManager()

  const [images, setImages] = useState<CustomerImage[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])

  // Initialize chunked upload for large files
  const chunkedUpload = useChunkedUpload({
    chunkSize: 10 * 1024 * 1024, // 10MB chunks
    maxRetries: 5,
    timeout: 60000,
    onProgress: (progress) => {
      updateProgress(progress)
    },
    onError: (error) => {
      handleError(error)
    },
  })

  // Handle image upload with centralized loading and error handling
  const uploadImages = useCallback(
    async (files: File[]) => {
      if (!files.length) return

      setUploadingFiles((prev) => [...prev, ...files])

      try {
        const uploadedImages = await withLoading(
          async () => {
            const uploadPromises = files.map(async (file, index) => {
              try {
                // Determine if file is large enough to benefit from chunking (>5MB)
                const CHUNK_THRESHOLD = 5 * 1024 * 1024 // 5MB
                const useChunking = file.size > CHUNK_THRESHOLD

                let uploadResponse: any

                if (useChunking) {
                  console.log(`Using chunked upload for ${file.name} (${file.size} bytes)`)

                  // Use chunked upload for large files
                  const chunkResult = await chunkedUpload.uploadFile(file)

                  // After chunked upload, send to product image endpoint with session ID
                  uploadResponse = await fetch('/api/products/upload-customer-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sessionId: chunkResult.sessionId,
                      productId,
                      fileName: file.name,
                      fileSize: file.size,
                      mimeType: file.type,
                      isCustomerUpload: true,
                      isChunked: true,
                    }),
                  })
                } else {
                  console.log(`Using direct upload for ${file.name} (${file.size} bytes)`)

                  // Use direct upload for smaller files
                  const formData = new FormData()
                  formData.append('file', file)
                  formData.append('productId', productId)
                  formData.append('isCustomerUpload', 'true')

                  uploadResponse = await fetch('/api/products/upload-customer-image', {
                    method: 'POST',
                    body: formData,
                  })
                }

                if (!uploadResponse.ok) {
                  throw new Error(`Upload failed for ${file.name}`)
                }

                const data = await uploadResponse.json()

                const newImage: CustomerImage = {
                  id: data.id,
                  url: data.url,
                  thumbnailUrl: data.thumbnailUrl,
                  fileName: file.name,
                  fileSize: file.size,
                  uploadedAt: new Date().toISOString(),
                }

                return newImage
              } catch (error) {
                handleError(`Failed to upload ${file.name}`)
                throw error
              }
            })

            return await Promise.all(uploadPromises)
          },
          {
            label: `Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`,
            type: 'progress',
            blocking: true,
            context: 'file-upload',
          },
          (progress) => {
            // Progress callback for file upload visualization
          }
        )

        // Update images state with all successful uploads
        setImages((prev) => {
          const updated = [...prev, ...uploadedImages]
          onImagesChange?.(updated)
          return updated
        })

        showSuccess(
          `${uploadedImages.length} file${uploadedImages.length > 1 ? 's' : ''} uploaded successfully`
        )
      } catch (error) {
        // Errors are already handled in the individual upload promises
      } finally {
        setUploadingFiles([])
        chunkedUpload.reset()
      }
    },
    [productId, onImagesChange, withLoading, handleError, showSuccess, chunkedUpload]
  )

  // Handle image deletion with centralized error handling
  const deleteImage = useCallback(
    async (imageId: string) => {
      try {
        await withLoading(
          async () => {
            const response = await fetch(`/api/products/customer-images?imageId=${imageId}`, {
              method: 'DELETE',
            })

            if (!response.ok) {
              throw new Error('Failed to delete image')
            }

            setImages((prev) => {
              const updated = prev.filter((img) => img.id !== imageId)
              onImagesChange?.(updated)
              return updated
            })
          },
          {
            label: 'Deleting image...',
            type: 'spinner',
            context: 'image-delete',
          }
        )

        showSuccess('Image deleted successfully')
      } catch (error) {
        handleError(error instanceof Error ? error : new Error('Failed to delete image'))
      }
    },
    [onImagesChange, withLoading, handleError, showSuccess]
  )

  // Clear all images
  const clearImages = useCallback(() => {
    setImages([])
    onImagesChange?.([])
  }, [onImagesChange])

  return {
    images,
    uploadingFiles,
    isUploading: isLoading('file-upload'), // Use centralized loading state
    uploadImages,
    deleteImage,
    clearImages,
  }
}
