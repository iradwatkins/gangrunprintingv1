'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Expand, ZoomIn } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProductImage {
  id: string
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
  width?: number
  height?: number
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
  productCategory: string
  className?: string
  showThumbnails?: boolean
  enableZoom?: boolean
  enableLightbox?: boolean
}

export function ProductImageGallery({
  images,
  productName,
  productCategory,
  className,
  showThumbnails = true,
  enableZoom = true,
  enableLightbox = true,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  // Sort images by primary first, then by sortOrder
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })

  if (sortedImages.length === 0) {
    return (
      <div className={cn('relative aspect-square bg-gray-100 rounded-lg', className)}>
        <Image
          src="/images/product-placeholder.jpg"
          alt={`${productName} - No image available`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    )
  }

  const currentImage = sortedImages[selectedIndex] || sortedImages[0]

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1))
  }

  // Generate SEO-friendly alt text if not provided
  const getAltText = (image: ProductImage, index: number) => {
    if (image.alt) return image.alt
    if (image.isPrimary) {
      return `${productName} - ${productCategory} - Primary Product Image - High Quality Printing`
    }
    return `${productName} - ${productCategory} - Product View ${index + 1} - Professional Printing`
  }

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Main Image Display */}
        <div className="relative group">
          <div
            className={cn(
              'relative aspect-square bg-gray-100 rounded-lg overflow-hidden',
              enableZoom && 'cursor-zoom-in'
            )}
            onClick={() => enableLightbox && setIsLightboxOpen(true)}
          >
            {/* Use picture element for WebP support with fallback */}
            <picture>
              <source
                srcSet={currentImage.webpUrl || currentImage.url}
                type="image/webp"
              />
              <Image
                src={currentImage.largeUrl || currentImage.url}
                alt={getAltText(currentImage, selectedIndex)}
                fill
                priority={selectedIndex === 0}
                className={cn(
                  'object-cover transition-transform duration-300',
                  isZoomed && 'scale-125'
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                placeholder={currentImage.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={currentImage.blurDataUrl}
                onMouseEnter={() => enableZoom && setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
              />
            </picture>

            {/* Primary Badge */}
            {currentImage.isPrimary && (
              <Badge className="absolute top-2 left-2 z-10">
                Primary
              </Badge>
            )}

            {/* Navigation Arrows (for multiple images) */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePrevious()
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNext()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Zoom Indicator */}
            {enableLightbox && (
              <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand className="h-4 w-4" />
              </div>
            )}

            {/* Image Counter */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                {selectedIndex + 1} / {sortedImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {showThumbnails && sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                  selectedIndex === index
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-gray-300'
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                />
                {image.isPrimary && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      {enableLightbox && (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
            <DialogTitle className="sr-only">
              {productName} - Full size image view
            </DialogTitle>
            <div className="relative">
              <Image
                src={currentImage.largeUrl || currentImage.url}
                alt={getAltText(currentImage, selectedIndex)}
                width={currentImage.width || 1200}
                height={currentImage.height || 1200}
                className="w-full h-auto max-h-[85vh] object-contain"
                priority
              />

              {/* Lightbox Navigation */}
              {sortedImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 hover:bg-white shadow-lg"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-3 hover:bg-white shadow-lg"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-2 rounded-full text-sm">
                    {selectedIndex + 1} / {sortedImages.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

/**
 * Generate structured data for product images (SEO)
 */
export function generateProductImageStructuredData(
  images: ProductImage[],
  productName: string,
  productUrl: string
) {
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    image: sortedImages.map((img) => ({
      '@type': 'ImageObject',
      url: img.largeUrl || img.url,
      thumbnail: img.thumbnailUrl,
      width: img.width,
      height: img.height,
      caption: img.alt || `${productName} product image`,
    })),
    url: productUrl,
  }
}

export default ProductImageGallery