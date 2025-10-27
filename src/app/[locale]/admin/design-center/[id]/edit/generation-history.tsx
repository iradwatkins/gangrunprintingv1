'use client'

/**
 * GenerationHistory Component - Vertical Timeline of Generated Images
 *
 * Purpose: Display history of generated images in vertical timeline
 * Shows latest first, with delete and "select as winner" options
 *
 * Date: October 27, 2025
 */

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, CheckCircle2, Star, Clock } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import type { PromptTestImage } from '@prisma/client'

interface TestImage extends PromptTestImage {
  // This extends the Prisma type to ensure compatibility
}

interface GenerationHistoryProps {
  images: TestImage[]
  onDelete: (imageId: string) => Promise<void>
  onSelectWinner: (imageId: string) => Promise<void>
  onTryAgain?: () => void
}

export function GenerationHistory({
  images,
  onDelete,
  onSelectWinner,
  onTryAgain,
}: GenerationHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectingId, setSelectingId] = useState<string | null>(null)

  // Handle delete with loading state
  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId)
    try {
      await onDelete(imageId)
    } finally {
      setDeletingId(null)
    }
  }

  // Handle winner selection with loading state
  const handleSelectWinner = async (imageId: string) => {
    setSelectingId(imageId)
    try {
      await onSelectWinner(imageId)
    } finally {
      setSelectingId(null)
    }
  }

  // Get quality badge color
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-500/10 text-green-700 border-green-500/20'
      case 'good':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'poor':
        return 'bg-red-500/10 text-red-700 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
    }
  }

  if (images.length === 0) {
    return (
      <Card className="border-dashed p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-sm font-medium">No images generated yet</h3>
        <p className="text-xs text-muted-foreground">
          Click "Generate Image" above to create your first test image
        </p>
      </Card>
    )
  }

  // Sort images by iteration descending (newest first)
  const sortedImages = [...images].sort((a, b) => b.iteration - a.iteration)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Generation History
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {images.length} {images.length === 1 ? 'version' : 'versions'}
          </span>
        </h3>
        {onTryAgain && (
          <Button variant="outline" size="sm" onClick={onTryAgain}>
            Try Again
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {sortedImages.map((image, index) => {
          const isLatest = index === 0
          const isDeleting = deletingId === image.id
          const isSelecting = selectingId === image.id

          return (
            <Card
              key={image.id}
              className={`overflow-hidden transition-all ${
                image.isWinner ? 'ring-2 ring-primary' : ''
              } ${isDeleting ? 'opacity-50' : ''}`}
            >
              <div className="flex gap-4 p-4">
                {/* Image thumbnail */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={image.imageUrl}
                    alt={`Version ${image.iteration}`}
                    fill
                    className="object-cover"
                  />
                  {image.isWinner && (
                    <div className="absolute right-1 top-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">v{image.iteration}</h4>
                      {isLatest && (
                        <Badge variant="secondary" className="text-xs">
                          Latest
                        </Badge>
                      )}
                      <Badge className={`text-xs ${getQualityColor(image.quality)}`}>
                        {image.quality}
                      </Badge>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1">
                      {!image.isWinner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleSelectWinner(image.id)}
                          disabled={isSelecting}
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Select
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(image.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Generated timestamp */}
                  <p className="text-xs text-muted-foreground">
                    {typeof image.createdAt === 'string'
                      ? format(new Date(image.createdAt), 'MMM d, yyyy h:mm a')
                      : format(image.createdAt, 'MMM d, yyyy h:mm a')}
                  </p>

                  {/* Config info */}
                  {image.config && typeof image.config === 'object' && (
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {('aspectRatio' in image.config && image.config.aspectRatio) && (
                        <span>{String(image.config.aspectRatio)}</span>
                      )}
                      {('imageSize' in image.config && image.config.imageSize) && (
                        <span>• {String(image.config.imageSize)}</span>
                      )}
                    </div>
                  )}

                  {/* Prompt preview (truncated) */}
                  <details className="group cursor-pointer">
                    <summary className="text-xs text-muted-foreground hover:text-foreground">
                      View prompt
                      <span className="ml-1 inline-block transition-transform group-open:rotate-180">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-2 rounded-md bg-muted p-2 text-xs font-mono">
                      {image.promptText}
                    </p>
                  </details>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
