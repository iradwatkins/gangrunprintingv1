'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { 
  Upload, 
  X, 
  Star, 
  StarOff, 
  Image as ImageIcon,
  Loader2,
  GripVertical,
  Edit2,
  Trash2
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
import {
  useSortable,
} from '@dnd-kit/sortable'
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
  url: string
  thumbnailUrl?: string
  alt?: string
  caption?: string
  isPrimary: boolean
  sortOrder: number
  file?: File
  uploading?: boolean
}

interface ProductImageUploadProps {
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  productId?: string
}

function SortableImageItem({ image, index, onRemove, onEdit, onSetPrimary }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.url })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      className="relative group"
      style={style}
    >
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
              <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 cursor-move"
              >
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
        <p className="text-sm text-muted-foreground mt-1 text-center truncate">
          {image.caption}
        </p>
      )}
    </div>
  )
}

export function ProductImageUpload({ images, onImagesChange, productId }: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<{ index: number; image: ProductImage } | null>(null)
  const [editForm, setEditForm] = useState({ alt: '', caption: '' })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const newImages: ProductImage[] = acceptedFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      file,
      isPrimary: images.length === 0 && index === 0,
      sortOrder: images.length + index,
      uploading: true,
    }))

    onImagesChange([...images, ...newImages])

    // Upload images to MinIO
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
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

        if (!res.ok) throw new Error('Upload failed')

        const data = await res.json()
        
        // Update the image with the uploaded URL
        onImagesChange(prev => prev.map((img, idx) => {
          if (idx === images.length + i) {
            return {
              ...img,
              url: data.url,
              thumbnailUrl: data.thumbnailUrl,
              uploading: false,
            }
          }
          return img
        }))
      } catch (error) {
        toast.error(`Failed to upload image ${i + 1}`)
        // Remove the failed image
        onImagesChange(prev => prev.filter((_, idx) => idx !== images.length + i))
      }
    }
  }, [images, onImagesChange, productId])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.url === active.id)
      const newIndex = images.findIndex(img => img.url === over.id)
      
      const newImages = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
        ...img,
        sortOrder: idx
      }))
      
      onImagesChange(newImages)
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    // If removed image was primary, make first image primary
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
    }
    onImagesChange(newImages)
  }

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }))
    onImagesChange(newImages)
  }

  const handleEdit = (index: number) => {
    const image = images[index]
    setEditForm({
      alt: image.alt || '',
      caption: image.caption || ''
    })
    setEditingImage({ index, image })
  }

  const handleSaveEdit = () => {
    if (editingImage) {
      const newImages = [...images]
      newImages[editingImage.index] = {
        ...newImages[editingImage.index],
        alt: editForm.alt,
        caption: editForm.caption
      }
      onImagesChange(newImages)
      setEditingImage(null)
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop images here' : 'Drag & drop images here, or click to select'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Supports JPEG, PNG, WebP, GIF (max 10MB per file)
        </p>
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Product Images ({images.length})</Label>
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
              items={images.map(img => img.url)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <SortableImageItem
                    key={image.url}
                    id={image.url}
                    image={image}
                    index={index}
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                    onSetPrimary={handleSetPrimary}
                  />
                ))}
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
                onChange={(e) => setEditForm(prev => ({ ...prev, alt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                placeholder="Optional caption for the image"
                value={editForm.caption}
                onChange={(e) => setEditForm(prev => ({ ...prev, caption: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingImage(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}