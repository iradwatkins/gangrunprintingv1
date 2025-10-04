'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { validateImageFile, validateImageDimensions } from '@/lib/validation'
import toast from '@/lib/toast'

interface ProductImage {
  id?: string
  imageId?: string
  url: string
  thumbnailUrl?: string
  largeUrl?: string
  mediumUrl?: string
  webpUrl?: string
  blurDataUrl?: string
  alt?: string
  isPrimary?: boolean
  sortOrder?: number
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
}

interface ProductImageUploadProps {
  imageUrl: string
  imageData?: ProductImage | null
  onImageUpdate: (url: string, imageData?: ProductImage) => void
}

export function ProductImageUpload({ imageUrl, imageData, onImageUpdate }: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const validateImage = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Basic file validation
      const fileValidation = validateImageFile(file)
      if (!fileValidation.isValid) {
        reject(new Error(fileValidation.error))
        return
      }

      const img = new Image()
      const imageUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(imageUrl)

        // Dimension validation
        const dimensionValidation = validateImageDimensions(img.width, img.height)
        if (!dimensionValidation.isValid) {
          reject(new Error(dimensionValidation.error))
          return
        }

        resolve()
      }

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl)
        reject(new Error('Failed to load image. Please ensure the file is a valid image.'))
      }

      img.src = imageUrl
    })
  }

  const uploadImage = async (file: File): Promise<{ url: string; imageData: ProductImage }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('isPrimary', 'true')
    formData.append('sortOrder', '0')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Upload failed'
        }))

        if (response.status === 413) {
          throw new Error('File too large. Please compress the image to under 10MB.')
        } else if (response.status === 408) {
          throw new Error('Upload timeout. The file may be too large or connection is slow.')
        } else {
          throw new Error(errorData.error || 'Failed to upload image')
        }
      }

      const responseData = await response.json()
      const data = responseData.data || responseData
      const imageUrl = data.url

      if (!imageUrl) {
        throw new Error('Invalid response: missing image URL')
      }

      // Return full image data including imageId
      const imageData: ProductImage = {
        id: data.id,
        imageId: data.imageId || data.id,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        largeUrl: data.largeUrl,
        mediumUrl: data.mediumUrl,
        webpUrl: data.webpUrl,
        blurDataUrl: data.blurDataUrl,
        alt: data.alt,
        isPrimary: data.isPrimary,
        sortOrder: data.sortOrder,
        width: data.width,
        height: data.height,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      }

      return { url: imageUrl, imageData }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout. Please try with a smaller file or check your connection.')
      }
      throw error
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      await validateImage(file)
      const { url, imageData } = await uploadImage(file)
      onImageUpdate(url, imageData)
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    onImageUpdate('', undefined)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Product Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!imageUrl ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              accept="image/*"
              className="hidden"
              disabled={uploading}
              id="product-image"
              type="file"
              onChange={handleImageUpload}
            />
            <label
              className={`cursor-pointer block ${uploading ? 'opacity-50' : ''}`}
              htmlFor="product-image"
            >
              {uploading ? (
                <div className="space-y-2">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                  <p className="text-sm font-medium">Processing image...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs text-gray-500">
                    JPEG, PNG, WebP, GIF - Max 10MB
                  </p>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <img
              alt="Product preview"
              className="w-24 h-24 object-cover rounded-lg border"
              src={imageUrl}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-600">Image uploaded successfully</p>
              <p className="text-xs text-gray-500 mt-1">{imageUrl}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveImage}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
