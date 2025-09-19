import sharp from 'sharp'
import { Buffer } from 'buffer'

export interface ProcessedImage {
  original: Buffer
  large: Buffer
  medium: Buffer
  thumbnail: Buffer
  webp: Buffer
  blurDataUrl: string
  metadata: {
    width: number
    height: number
    format: string
    size: number
  }
}

export interface ImageProcessingOptions {
  quality?: number
  thumbnailSize?: number
  mediumSize?: number
  largeSize?: number
  generateWebP?: boolean
  generateBlurPlaceholder?: boolean
}

const DEFAULT_OPTIONS: ImageProcessingOptions = {
  quality: 85,
  thumbnailSize: 150,
  mediumSize: 600,
  largeSize: 1200,
  generateWebP: true,
  generateBlurPlaceholder: true,
}

/**
 * Process a product image with multiple optimizations
 * - Creates multiple sizes for responsive loading
 * - Generates WebP version for modern browsers
 * - Creates blur placeholder for progressive loading
 * - Optimizes for web performance
 */
export async function processProductImage(
  buffer: Buffer,
  fileName: string,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    // Get original image metadata
    const metadata = await sharp(buffer).metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: unable to read dimensions')
    }

    // Process original image (optimize but maintain size)
    const originalOptimized = await sharp(buffer)
      .jpeg({ quality: opts.quality, progressive: true })
      .toBuffer()

    // Generate large version (max 1200px)
    const large = await sharp(buffer)
      .resize(opts.largeSize, opts.largeSize, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: opts.quality, progressive: true })
      .toBuffer()

    // Generate medium version (max 600px)
    const medium = await sharp(buffer)
      .resize(opts.mediumSize, opts.mediumSize, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: opts.quality - 5, progressive: true })
      .toBuffer()

    // Generate thumbnail (150x150, cropped)
    const thumbnail = await sharp(buffer)
      .resize(opts.thumbnailSize, opts.thumbnailSize, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: opts.quality - 10, progressive: true })
      .toBuffer()

    // Generate WebP version for modern browsers
    let webp: Buffer = Buffer.from([])
    if (opts.generateWebP) {
      webp = await sharp(buffer)
        .resize(opts.largeSize, opts.largeSize, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: opts.quality })
        .toBuffer()
    }

    // Generate blur placeholder
    let blurDataUrl = ''
    if (opts.generateBlurPlaceholder) {
      const blurBuffer = await sharp(buffer)
        .resize(20, 20, { fit: 'inside' })
        .blur(10)
        .jpeg({ quality: 50 })
        .toBuffer()

      blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`
    }

    return {
      original: originalOptimized,
      large,
      medium,
      thumbnail,
      webp,
      blurDataUrl,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format || 'unknown',
        size: buffer.length,
      },
    }
  } catch (error) {
    console.error('Error processing image:', error)
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate image before processing
 * - Check file size
 * - Check dimensions
 * - Check format
 */
export async function validateProductImage(
  buffer: Buffer,
  maxSizeMB: number = 10
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024
    if (buffer.length > maxBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      }
    }

    // Get metadata
    const metadata = await sharp(buffer).metadata()

    // Check if it's a valid image
    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        error: 'Invalid image file',
      }
    }

    // Check minimum dimensions (at least 300x300)
    if (metadata.width < 300 || metadata.height < 300) {
      return {
        valid: false,
        error: 'Image must be at least 300x300 pixels',
      }
    }

    // Check maximum dimensions (no larger than 5000x5000)
    if (metadata.width > 5000 || metadata.height > 5000) {
      return {
        valid: false,
        error: 'Image dimensions exceed 5000x5000 pixels',
      }
    }

    // Check format
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif']
    if (metadata.format && !allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Unsupported image format. Allowed: ${allowedFormats.join(', ')}`,
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate image',
    }
  }
}

/**
 * Generate SEO-friendly alt text for product images
 */
export function generateAltText(
  productName: string,
  categoryName: string,
  imageIndex: number,
  isPrimary: boolean
): string {
  if (isPrimary) {
    return `${productName} - ${categoryName} - Primary Product Image - High Quality Print`
  }
  return `${productName} - ${categoryName} - Product Image ${imageIndex} - Professional Printing`
}

/**
 * Generate structured data for product image
 */
export function generateImageStructuredData(
  imageUrl: string,
  altText: string,
  width: number,
  height: number
): object {
  return {
    '@type': 'ImageObject',
    url: imageUrl,
    width,
    height,
    caption: altText,
    name: altText,
    contentUrl: imageUrl,
    thumbnailUrl: imageUrl.replace('/original/', '/thumbnail/'),
  }
}

/**
 * Calculate optimal image dimensions while maintaining aspect ratio
 */
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight

  let width = originalWidth
  let height = originalHeight

  if (width > maxWidth) {
    width = maxWidth
    height = width / aspectRatio
  }

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  }
}