'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from '@/lib/toast'
import {
  Upload,
  X,
  Star,
  StarOff,
  Image as ImageIcon,
  Loader2,
  GripVertical,
  Edit2,
  Trash2,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

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
  caption?: string
  isPrimary: boolean
  sortOrder: number
  file?: File
  uploading?: boolean
  isBlobUrl?: boolean
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
}

interface ProductImageUploadProps {
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  productId?: string
}

interface SortableImageItemProps {
  image: ProductImage
  index: number
  onRemove: (index: number) => void
  onEdit: (index: number) => void
  onSetPrimary: (index: number) => void
}

function SortableImageItem({
  image,
  index,
  onRemove,
  onEdit,
  onSetPrimary,
}: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.url,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} className="relative group" style={style}>
      <Card className="overflow-hidden">
        <div className="aspect-square relative">
          {image.uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <img
                alt={image.alt || `Product image ${index + 1}`}
                className="w-full h-full object-cover"
                src={image.thumbnailUrl || image.url}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  className="h-8 w-8"
                  size="icon"
                  variant="secondary"
                  onClick={() => onSetPrimary(index)}
                >
                  {image.isPrimary ? (
                    <Star className="h-4 w-4 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  className="h-8 w-8"
                  size="icon"
                  variant="secondary"
                  onClick={() => onEdit(index)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  className="h-8 w-8"
                  size="icon"
                  variant="destructive"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div {...attributes} {...listeners} className="absolute top-2 left-2 cursor-move">
                <div className="bg-white/90 rounded p-1">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>
            </>
          )}
        </div>
        {image.isPrimary && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-primary">Primary</Badge>
          </div>
        )}
      </Card>
      {image.caption && (
        <p className="text-sm text-muted-foreground mt-1 text-center truncate">{image.caption}</p>
      )}
    </div>
  )
}

export function ProductImageUpload({
  images = [],
  onImagesChange,
  productId,
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<{ index: number; image: ProductImage } | null>(
    null
  )
  const [editForm, setEditForm] = useState({ alt: '', caption: '' })

  // Maximum images allowed (1 primary + 3 additional)
  const MAX_IMAGES = 4
  const canAddMore = images.length < MAX_IMAGES

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      const safeImages = Array.isArray(images) ? images : []
      safeImages.forEach((image) => {
        if (image.isBlobUrl && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url)
        }
      })
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    const safeImages = Array.isArray(images) ? images : []

    // Check if we can add more images
    const remainingSlots = MAX_IMAGES - safeImages.length
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed (1 primary + 3 additional)`)
      return
    }

    // Limit files to available slots
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    if (files.length > filesToProcess.length) {
      toast.warning(`Only ${remainingSlots} image(s) can be added. Maximum is ${MAX_IMAGES} total.`)
    }

    const newImages: ProductImage[] = filesToProcess.map((file, index) => {
      const blobUrl = URL.createObjectURL(file)

      return {
        url: blobUrl,
        file,
        isPrimary: safeImages.length === 0 && index === 0,
        sortOrder: safeImages.length + index,
        uploading: false,
        isBlobUrl: true, // Mark as blob URL for cleanup
      }
    })

    onImagesChange([...safeImages, ...newImages])

    // ALWAYS upload images immediately to prevent blob URLs in database
    // Upload happens for both new and existing products
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i]
      const formData = new FormData()
      formData.append('file', file)
      if (productId) {
        formData.append('productId', productId)
      }

      try {
        const res = await fetch('/api/products/upload-image', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Upload failed' }))
          throw new Error(errorData.error || 'Upload failed')
        }

        const data = await res.json()
        const uploadedUrl = data.data?.url || data.url

        // Validate response data
        if (!uploadedUrl) {
          throw new Error('Invalid response from upload service')
        }

        // FIX: Compute new array from images prop (not callback function)
        // Update the image with the uploaded URL and clean up blob
        const currentImages = Array.isArray(images) ? images : []
        const updatedImages = currentImages.map((img, idx) => {
          if (idx === safeImages.length + i) {
            // Clean up blob URL if it exists
            if (img.isBlobUrl && img.url.startsWith('blob:')) {
              URL.revokeObjectURL(img.url)
            }
            return {
              ...img,
              // CRITICAL: Include imageId from upload response
              id: data.data?.id || data.id,
              imageId: data.data?.imageId || data.imageId || data.data?.id || data.id,
              url: uploadedUrl,
              thumbnailUrl: data.data?.thumbnailUrl || data.thumbnailUrl || uploadedUrl,
              largeUrl: data.data?.largeUrl || data.largeUrl,
              mediumUrl: data.data?.mediumUrl || data.mediumUrl,
              webpUrl: data.data?.webpUrl || data.webpUrl,
              blurDataUrl: data.data?.blurDataUrl || data.blurDataUrl,
              alt: data.data?.alt || data.alt,
              width: data.data?.width || data.width,
              height: data.data?.height || data.height,
              fileSize: data.data?.fileSize || data.fileSize,
              mimeType: data.data?.mimeType || data.mimeType,
              uploading: false,
              isBlobUrl: false,
              file: undefined, // Remove file reference after upload
            }
          }
          return img
        })
        onImagesChange(updatedImages)

        toast.success(`Image ${i + 1} uploaded successfully`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`Failed to upload image ${i + 1}: ${errorMessage}`)

        // FIX: Compute new array from images prop (not callback function)
        // Remove the failed image safely
        const currentImages = Array.isArray(images) ? images : []
        const filteredImages = currentImages.filter((_, idx) => idx !== safeImages.length + i)
        onImagesChange(filteredImages)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
    )
    handleFiles(files)
  }

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } }) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const safeImages = Array.isArray(images) ? images : []
      const oldIndex = safeImages.findIndex((img) => img.url === active.id)
      const newIndex = safeImages.findIndex((img) => img.url === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(safeImages, oldIndex, newIndex).map((img, idx) => ({
          ...img,
          sortOrder: idx,
        }))

        onImagesChange(newImages)
      }
    }
  }

  const handleRemove = (index: number) => {
    const safeImages = Array.isArray(images) ? images : []
    if (index < 0 || index >= safeImages.length) return

    const imageToRemove = safeImages[index]

    // Clean up blob URL if it exists
    if (imageToRemove?.isBlobUrl && imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url)
    }

    const newImages = safeImages.filter((_, i) => i !== index)
    // If removed image was primary, make first image primary
    if (safeImages[index]?.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
    }
    onImagesChange(newImages)
  }

  const handleSetPrimary = (index: number) => {
    const safeImages = Array.isArray(images) ? images : []
    if (index < 0 || index >= safeImages.length) return

    const newImages = safeImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    onImagesChange(newImages)
  }

  const handleEdit = (index: number) => {
    const safeImages = Array.isArray(images) ? images : []
    if (index < 0 || index >= safeImages.length) return

    const image = safeImages[index]
    if (image) {
      setEditForm({
        alt: image.alt || '',
        caption: image.caption || '',
      })
      setEditingImage({ index, image })
    }
  }

  const handleSaveEdit = () => {
    if (editingImage) {
      const safeImages = Array.isArray(images) ? images : []
      if (editingImage.index >= 0 && editingImage.index < safeImages.length) {
        const newImages = [...safeImages]
        newImages[editingImage.index] = {
          ...newImages[editingImage.index],
          alt: editForm.alt,
          caption: editForm.caption,
        }
        onImagesChange(newImages)
      }
      setEditingImage(null)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            !canAddMore
              ? 'border-muted-foreground/10 bg-muted/50 cursor-not-allowed'
              : isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary cursor-pointer'
          }
        `}
        onClick={() => canAddMore && fileInputRef.current?.click()}
        onDragLeave={handleDragLeave}
        onDragOver={canAddMore ? handleDragOver : undefined}
        onDrop={canAddMore ? handleDrop : undefined}
      >
        <input
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          disabled={!canAddMore}
          name="productImages"
          type="file"
          onChange={handleFileInput}
        />
        <Upload
          className={`mx-auto h-12 w-12 mb-4 ${!canAddMore ? 'text-muted-foreground/30' : 'text-muted-foreground'}`}
        />
        {canAddMore ? (
          <>
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports JPEG, PNG, WebP, GIF (max 10MB per file)
            </p>
            <p className="text-xs text-primary mt-1 font-medium">
              {images.length} of {MAX_IMAGES} images uploaded
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-muted-foreground">
              Maximum number of images reached
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {MAX_IMAGES} images maximum (1 primary + 3 additional)
            </p>
          </>
        )}
      </div>

      {Array.isArray(images) && images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>
                Product Images ({Array.isArray(images) ? images.length : 0}/{MAX_IMAGES})
              </Label>
              {images.find((img) => img.isPrimary) && (
                <Badge className="text-xs" variant="default">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Primary Set
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Drag to reorder • Click star to set primary
            </p>
          </div>

          <DndContext
            collisionDetection={closestCenter}
            sensors={sensors}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={Array.isArray(images) ? images.map((img) => img.url) : []}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.isArray(images)
                  ? images.map((image, index) => (
                      <SortableImageItem
                        key={image.url}
                        id={image.url}
                        image={image}
                        index={index}
                        onEdit={handleEdit}
                        onRemove={handleRemove}
                        onSetPrimary={handleSetPrimary}
                      />
                    ))
                  : []}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
            <DialogDescription>
              Add alt text and caption for better SEO and accessibility
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                placeholder="Describe the image for screen readers"
                value={editForm.alt}
                onChange={(e) => setEditForm((prev) => ({ ...prev, alt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                placeholder="Optional caption for the image"
                value={editForm.caption}
                onChange={(e) => setEditForm((prev) => ({ ...prev, caption: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingImage(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
