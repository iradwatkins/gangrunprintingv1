'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Trash2,
  FolderOpen,
} from 'lucide-react'
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
  productName?: string // For AI generation context
}

interface DraftVersion {
  filename: string
  url: string
  size: number
  lastModified: Date
}

// Default production floor prompt template
const DEFAULT_PRODUCTION_FLOOR_PROMPT = `professional product photography of {product} centered in frame, commercial print shop production floor setting in background, paper cutting equipment and printed sheets visible but softly blurred, authentic printing facility atmosphere, industrial workspace with professional lighting on centered product showing premium quality, ambient workshop lighting in background, shallow depth of field, 4k resolution, just-completed-off-the-floor aesthetic, commercial printing environment`

export function ProductImageUpload({
  imageUrl,
  imageData,
  onImageUpdate,
  productName,
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showDrafts, setShowDrafts] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [drafts, setDrafts] = useState<DraftVersion[]>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)

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
        credentials: 'include', // CRITICAL: Send auth cookies with request
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Upload failed',
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

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description for the image')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/products/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          productName: productName || 'product',
          aspectRatio: '4:3',
          imageSize: '2K',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate image')
      }

      const result = await response.json()
      const { url, draftVersions } = result.data

      toast.success(`Image generated! (Version ${draftVersions})`)

      // Update the main image
      onImageUpdate(url, {
        url,
        isPrimary: true,
        sortOrder: 0,
      })

      // Refresh drafts list if visible
      if (showDrafts) {
        loadDrafts()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  const loadDrafts = async () => {
    if (!productName) {
      toast.error('Product name required to view drafts')
      return
    }

    setLoadingDrafts(true)

    try {
      const response = await fetch(
        `/api/products/generate-image?productName=${encodeURIComponent(productName)}`
      )

      if (!response.ok) {
        throw new Error('Failed to load drafts')
      }

      const result = await response.json()
      setDrafts(result.data.drafts)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load drafts')
    } finally {
      setLoadingDrafts(false)
    }
  }

  const handleUseDraft = (draft: DraftVersion) => {
    onImageUpdate(draft.url, {
      url: draft.url,
      isPrimary: true,
      sortOrder: 0,
    })
    toast.success('Draft selected as product image')
  }

  const handleDeleteDraft = async (filename: string) => {
    try {
      const response = await fetch('/api/products/generate-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete draft')
      }

      toast.success('Draft deleted')
      loadDrafts() // Refresh list
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete draft')
    }
  }

  const handleDeleteAllDrafts = async () => {
    if (!productName) return

    if (!confirm('Delete all draft versions? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/products/generate-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          deleteAll: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete drafts')
      }

      const result = await response.json()
      toast.success(result.message)
      setDrafts([])
      setShowDrafts(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete drafts')
    }
  }

  const toggleDrafts = () => {
    if (!showDrafts) {
      loadDrafts()
    }
    setShowDrafts(!showDrafts)
  }

  const useDefaultPrompt = () => {
    const productType = productName || 'product'
    const populatedPrompt = DEFAULT_PRODUCTION_FLOOR_PROMPT.replace('{product}', productType)
    setAiPrompt(populatedPrompt)
    toast.success('Default production floor prompt loaded')
  }

  const handleAIGeneratorToggle = () => {
    if (!showAIGenerator && !aiPrompt) {
      // Auto-populate default prompt when opening for the first time
      useDefaultPrompt()
    }
    setShowAIGenerator(!showAIGenerator)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Product Image
          </div>
          <div className="flex gap-2">
            <Button
              className="text-purple-600 border-purple-300"
              size="sm"
              variant="outline"
              onClick={handleAIGeneratorToggle}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI Generate
            </Button>
            {productName && (
              <Button size="sm" variant="outline" onClick={toggleDrafts}>
                <FolderOpen className="h-4 w-4 mr-1" />
                Drafts {drafts.length > 0 && `(${drafts.length})`}
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Generator Section */}
        {showAIGenerator && (
          <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium" htmlFor="ai-prompt">
                  Describe the image you want to generate
                </Label>
                <Button
                  className="text-xs text-purple-600 hover:text-purple-700 h-6 px-2"
                  size="sm"
                  variant="ghost"
                  onClick={useDefaultPrompt}
                >
                  🏭 Use Production Floor Template
                </Button>
              </div>
              <Textarea
                className="mt-1"
                id="ai-prompt"
                placeholder="Click 'Production Floor Template' to use our default print shop aesthetic, or write your own custom prompt..."
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                disabled={generating || !aiPrompt.trim()}
                onClick={handleGenerateImage}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAIGenerator(false)}>
                Cancel
              </Button>
            </div>
            <div className="bg-white/60 rounded p-2 border border-purple-100">
              <p className="text-xs font-medium text-purple-900 mb-1">
                🏭 Production Floor Template (Default)
              </p>
              <p className="text-xs text-gray-600">
                Creates images with your product centered, print shop equipment in background,
                authentic manufacturing atmosphere - perfect for showing customers their product is
                made in-house!
              </p>
            </div>
          </div>
        )}

        {/* Drafts Section */}
        {showDrafts && (
          <div className="border-2 border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Draft Versions</h4>
              {drafts.length > 0 && (
                <Button
                  className="text-red-600"
                  size="sm"
                  variant="ghost"
                  onClick={handleDeleteAllDrafts}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete All
                </Button>
              )}
            </div>

            {loadingDrafts ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
              </div>
            ) : drafts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No draft versions yet. Generate some images to get started!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {drafts.map((draft) => (
                  <div key={draft.filename} className="border rounded-lg p-2 space-y-2">
                    <img
                      alt="Draft version"
                      className="w-full h-32 object-cover rounded"
                      loading="lazy"
                      src={draft.url}
                    />
                    <div className="flex gap-1">
                      <Button
                        className="flex-1 text-xs"
                        size="sm"
                        variant="outline"
                        onClick={() => handleUseDraft(draft)}
                      >
                        Use This
                      </Button>
                      <Button
                        className="text-red-600"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDraft(draft.filename)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {new Date(draft.lastModified).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Image or Upload Section */}
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
                  <p className="text-xs text-gray-500">JPEG, PNG, WebP, GIF - Max 10MB</p>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <img
              alt="Product preview"
              className="w-24 h-24 object-cover rounded-lg border"
              loading="lazy"
              src={imageUrl}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-600">Image selected</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{imageUrl}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={handleRemoveImage}>
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
                <Button
                  className="text-purple-600"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAIGenerator(true)}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Generate New
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
