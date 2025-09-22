/**
 * product-image-upload - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from '@/lib/toast'
import {
import {
import {
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {


'use client'

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
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
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
