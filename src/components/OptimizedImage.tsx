'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { SafeProductImage, ProductImageWithErrorBoundary } from '@/components/product/ProductImageErrorBoundary'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  objectFit = 'cover',
  objectPosition = 'center',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate responsive sizes if not provided
  const responsiveSizes =
    sizes || fill ? sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  // Fallback image for errors
  const imageSrc = hasError ? '/images/placeholder.jpg' : src

  if (fill) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
        <Image
          fill
          alt={alt}
          blurDataURL={blurDataURL}
          className={cn('transition-opacity duration-300', isLoading ? 'opacity-0' : 'opacity-100')}
          placeholder={placeholder}
          priority={priority}
          quality={quality}
          sizes={responsiveSizes}
          src={imageSrc}
          style={{
            objectFit,
            objectPosition,
          }}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    )
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" style={{ width, height }} />
      )}
      <Image
        alt={alt}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        height={height || 500}
        placeholder={placeholder}
        priority={priority}
        quality={quality}
        sizes={responsiveSizes}
        src={imageSrc}
        width={width || 500}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}

// Product image component with zoom and gallery features
interface ProductImageProps {
  images: Array<{
    url: string
    alt?: string
  }>
  productName: string
  className?: string
}

export function ProductImage({ images, productName, className }: ProductImageProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  if (!images || images.length === 0) {
    return (
      <ProductImageWithErrorBoundary productName={productName}>
        <div className={cn('relative aspect-square bg-gray-100', className)}>
          <SafeProductImage
            fill
            alt="No image available"
            sizes="(max-width: 768px) 100vw, 50vw"
            src="/images/product-placeholder.jpg"
            productName={productName}
          />
        </div>
      </ProductImageWithErrorBoundary>
    )
  }

  const currentImage = images[selectedIndex]

  return (
    <ProductImageWithErrorBoundary productName={productName}>
      <div className={cn('space-y-4', className)}>
        {/* Main image */}
        <div
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-lg bg-gray-100"
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <SafeProductImage
            fill
            priority
            alt={currentImage.alt || productName}
            className={cn(
              'transition-transform duration-300',
              isZoomed ? 'scale-110' : 'scale-100'
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
            src={currentImage.url}
            productName={productName}
          />
        </div>

      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                'relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                selectedIndex === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-gray-300'
              )}
              onClick={() => setSelectedIndex(index)}
            >
              <SafeProductImage
                fill
                alt={`${productName} ${index + 1}`}
                sizes="80px"
                src={image.url}
                productName={productName}
              />
            </button>
          ))}
        </div>
      )}
      </div>
    </ProductImageWithErrorBoundary>
  )
}

// Hero banner image with text overlay
interface HeroBannerProps {
  src: string
  alt: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  className?: string
  height?: string
}

export function HeroBanner({
  src,
  alt,
  title,
  subtitle,
  ctaText,
  ctaHref,
  className,
  height = 'h-[500px]',
}: HeroBannerProps) {
  return (
    <div className={cn('relative overflow-hidden', height, className)}>
      <OptimizedImage
        fill
        priority
        alt={alt}
        objectFit="cover"
        quality={85}
        sizes="100vw"
        src={src}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

      {/* Content */}
      {(title || subtitle || ctaText) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            {title && (
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow-lg">{title}</h1>
            )}
            {subtitle && <p className="text-xl md:text-2xl mb-8 text-shadow">{subtitle}</p>}
            {ctaText && ctaHref && (
              <a
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                href={ctaHref}
              >
                {ctaText}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Category card with image
interface CategoryCardProps {
  src: string
  alt: string
  title: string
  description?: string
  href: string
  className?: string
}

export function CategoryCard({ src, alt, title, description, href, className }: CategoryCardProps) {
  return (
    <a
      className={cn(
        'group relative block overflow-hidden rounded-lg bg-gray-100 transition-transform hover:scale-105',
        className
      )}
      href={href}
    >
      <div className="aspect-[4/3] relative">
        <OptimizedImage
          fill
          alt={alt}
          objectFit="cover"
          quality={75}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          src={src}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
    </a>
  )
}

// Lazy loading image grid
interface ImageGridProps {
  images: Array<{
    src: string
    alt: string
    title?: string
  }>
  columns?: 2 | 3 | 4
  gap?: 2 | 4 | 6
  className?: string
}

export function ImageGrid({ images, columns = 3, gap = 4, className }: ImageGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  const gridGap = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
  }

  return (
    <div className={cn(`grid ${gridCols[columns]} ${gridGap[gap]}`, className)}>
      {images.map((image, index) => (
        <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <OptimizedImage
            fill
            alt={image.alt}
            priority={index < 6} // Prioritize first 6 images
            quality={75}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={image.src}
          />
          {image.title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white font-medium">{image.title}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default OptimizedImage
