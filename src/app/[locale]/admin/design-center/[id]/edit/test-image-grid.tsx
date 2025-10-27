'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, ThumbsUp, ThumbsDown, Trash2, MoreHorizontal, Package } from 'lucide-react'
import { ProductSelectorDialog } from './product-selector-dialog'
import type { PromptTestImage } from '@prisma/client'

interface TestImageGridProps {
  images: PromptTestImage[]
  promptId: string
}

export function TestImageGrid({ images, promptId }: TestImageGridProps) {
  const [localImages, setLocalImages] = useState(images)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<PromptTestImage | null>(null)

  const handleRateImage = async (imageId: string, quality: 'excellent' | 'good' | 'poor') => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/images/${imageId}/rate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality }),
      })

      if (!response.ok) throw new Error('Failed to rate image')

      // Update local state
      setLocalImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, quality } : img))
      )
    } catch (error) {
      console.error('Error rating image:', error)
      alert('Failed to rate image')
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Delete this test image?')) return

    try {
      const response = await fetch(`/api/prompts/${promptId}/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete image')

      // Update local state
      setLocalImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image')
    }
  }

  const handleUseAsProductImage = (image: PromptTestImage) => {
    setSelectedImage(image)
    setProductDialogOpen(true)
  }

  if (localImages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">No test images yet</p>
        <p className="text-sm text-muted-foreground">
          Click "Generate 4 Test Images" to create your first batch
        </p>
      </div>
    )
  }

  return (
    <>
    <div className="grid grid-cols-2 gap-4">
      {localImages.map((image, index) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="relative aspect-[4/3] bg-muted">
            <img
              src={image.imageUrl}
              alt={`Test image ${index + 1}`}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleUseAsProductImage(image)}>
                    <Package className="h-4 w-4 mr-2 text-primary" />
                    Use as Product Image
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleRateImage(image.id, 'excellent')}>
                    <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                    Excellent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRateImage(image.id, 'good')}>
                    <Check className="h-4 w-4 mr-2 text-blue-500" />
                    Good
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRateImage(image.id, 'poor')}>
                    <ThumbsDown className="h-4 w-4 mr-2 text-amber-500" />
                    Poor
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteImage(image.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Iteration {image.iteration}
              </div>
              <Badge
                variant={
                  image.quality === 'excellent'
                    ? 'default'
                    : image.quality === 'good'
                      ? 'secondary'
                      : 'outline'
                }
              >
                {image.quality}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Product Selector Dialog */}
    {selectedImage && (
      <ProductSelectorDialog
        open={productDialogOpen}
        onClose={() => {
          setProductDialogOpen(false)
          setSelectedImage(null)
        }}
        imageUrl={selectedImage.imageUrl}
        promptId={promptId}
        testImageId={selectedImage.id}
      />
    )}
    </>
  )
}
