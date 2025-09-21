import sharp from 'sharp'
import { Buffer } from 'buffer'
import {
  IMAGE_SIZES,
  PRODUCT_IMAGE_PROFILES,
  IMAGE_FORMAT_PRIORITY,
  IMAGE_ANALYSIS
} from '@/config/constants'

export interface ProcessedImage {
  optimized: Buffer  // Replaced "original" with "optimized" capped version
  large: Buffer
  medium: Buffer
  thumbnail: Buffer
  webp: Buffer
  avif: Buffer       // Added AVIF support
  blurDataUrl: string
  metadata: {
    width: number
    height: number
    format: string
    size: number
    originalSize: number  // Track original size for compression stats
    compressionRatio: number
    profileUsed: string
  }
}

export interface ImageAnalysis {
  hasTransparency: boolean
  averageContrast: number
  isHighContrast: boolean
  textLikelihood: number
  recommendedQuality: number
  dominantColors: number
}

export interface ImageProcessingOptions {
  quality?: number
  thumbnailSize?: number
  mediumSize?: number
  largeSize?: number
  generateWebP?: boolean
  generateAVIF?: boolean
  generateBlurPlaceholder?: boolean
  productProfile?: keyof typeof PRODUCT_IMAGE_PROFILES
  enableContentAnalysis?: boolean
  maxDimension?: number
}

const DEFAULT_OPTIONS: ImageProcessingOptions = {
  quality: 75,  // Reduced default quality for better compression
  thumbnailSize: IMAGE_SIZES.THUMBNAIL,
  mediumSize: IMAGE_SIZES.MEDIUM,
  largeSize: IMAGE_SIZES.LARGE,
  generateWebP: true,
  generateAVIF: true,  // Enable AVIF by default
  generateBlurPlaceholder: true,
  productProfile: 'DEFAULT',
  enableContentAnalysis: true,
  maxDimension: 1200,  // Cap dimensions aggressively
}

/**
 * Analyze image content to determine optimal compression settings
 */
async function analyzeImageContent(buffer: Buffer): Promise<ImageAnalysis> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Check for transparency
    const hasTransparency = metadata.channels === 4 || metadata.format === 'png' && metadata.channels === 2

    // Calculate average contrast (simplified method)
    let contrastSum = 0
    const pixelCount = info.width * info.height
    const sampleSize = Math.min(pixelCount, 10000) // Sample max 10k pixels for performance

    for (let i = 0; i < sampleSize * 3; i += 3) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (r + g + b) / 3
      contrastSum += Math.abs(brightness - 128) // Distance from middle gray
    }

    const averageContrast = contrastSum / sampleSize / 128 // Normalize to 0-1
    const isHighContrast = averageContrast > IMAGE_ANALYSIS.HIGH_CONTRAST_THRESHOLD

    // Detect text-like content (high frequency edges)
    const stats = await image.stats()
    const textLikelihood = stats.channels[0].std / 128 // Simplified edge detection via standard deviation

    // Recommend quality based on analysis
    let recommendedQuality = 75 // Default
    if (isHighContrast || textLikelihood > IMAGE_ANALYSIS.TEXT_DETECTION_THRESHOLD) {
      recommendedQuality = 70 // Lower quality for text/graphics
    } else if (averageContrast < 0.3) {
      recommendedQuality = 80 // Higher quality for smooth gradients
    }

    // Count dominant colors (simplified)
    const dominantColors = Math.min(stats.channels.length * 50, 200) // Rough estimate

    return {
      hasTransparency,
      averageContrast,
      isHighContrast,
      textLikelihood,
      recommendedQuality,
      dominantColors
    }
  } catch (error) {
    console.error('Error analyzing image content:', error)
    // Return safe defaults on error
    return {
      hasTransparency: false,
      averageContrast: 0.5,
      isHighContrast: false,
      textLikelihood: 0.5,
      recommendedQuality: 75,
      dominantColors: 100
    }
  }
}

/**
 * Process a product image with advanced optimizations
 * - Creates multiple sizes for responsive loading
 * - Generates AVIF, WebP, and JPEG versions
 * - Uses content analysis for optimal quality
 * - Applies product-specific optimization profiles
 * - Eliminates large "original" files
 */
export async function processProductImage(
  buffer: Buffer,
  fileName: string,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const originalSize = buffer.length

  try {
    // Get original image metadata
    const metadata = await sharp(buffer).metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: unable to read dimensions')
    }

    // Get product profile settings
    const profile = PRODUCT_IMAGE_PROFILES[opts.productProfile || 'DEFAULT']
    const maxDimension = opts.maxDimension || profile.maxDimension

    // Perform content analysis if enabled
    let analysis: ImageAnalysis | null = null
    let finalQuality = opts.quality || profile.quality

    if (opts.enableContentAnalysis) {
      analysis = await analyzeImageContent(buffer)
      finalQuality = Math.min(finalQuality, analysis.recommendedQuality)
    }

    // Calculate optimal dimensions while maintaining aspect ratio
    const { width: optimalWidth, height: optimalHeight } = calculateOptimalDimensions(
      metadata.width,
      metadata.height,
      maxDimension,
      maxDimension
    )

    // Create base Sharp instance with optimal dimensions
    const baseImage = sharp(buffer).resize(optimalWidth, optimalHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })

    // Generate optimized version (replaces "original" - capped and compressed)
    const optimized = await baseImage
      .clone()
      .jpeg({
        quality: finalQuality,
        progressive: true,
        mozjpeg: true // Use mozjpeg for better compression
      })
      .toBuffer()

    // Generate large version (max dimensions from profile)
    const large = await baseImage
      .clone()
      .resize(opts.largeSize, opts.largeSize, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: finalQuality, progressive: true })
      .toBuffer()

    // Generate medium version
    const medium = await baseImage
      .clone()
      .resize(opts.mediumSize, opts.mediumSize, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: Math.max(finalQuality - 5, 60), progressive: true })
      .toBuffer()

    // Generate thumbnail with smart cropping
    const thumbnail = await baseImage
      .clone()
      .resize(opts.thumbnailSize, opts.thumbnailSize, {
        fit: 'cover',
        position: sharp.strategy.attention, // Smart cropping
      })
      .jpeg({ quality: profile.thumbnailQuality, progressive: true })
      .toBuffer()

    // Generate WebP version
    let webp: Buffer = Buffer.from([])
    if (opts.generateWebP) {
      webp = await baseImage
        .clone()
        .webp({
          quality: Math.max(finalQuality - 5, 65),
          effort: 6 // Higher effort for better compression
        })
        .toBuffer()
    }

    // Generate AVIF version (best compression)
    let avif: Buffer = Buffer.from([])
    if (opts.generateAVIF) {
      try {
        avif = await baseImage
          .clone()
          .avif({
            quality: Math.max(finalQuality - 15, 50),
            effort: 9 // Maximum effort for best compression
          })
          .toBuffer()
      } catch (avifError) {
        console.warn('AVIF generation failed, skipping:', avifError)
        // AVIF might not be available in all Sharp builds
      }
    }

    // Generate enhanced blur placeholder
    let blurDataUrl = ''
    if (opts.generateBlurPlaceholder) {
      const blurBuffer = await sharp(buffer)
        .resize(20, 20, { fit: 'inside' })
        .blur(8)
        .jpeg({ quality: 40 })
        .toBuffer()

      blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`
    }

    // Calculate compression ratio
    const compressionRatio = optimized.length / originalSize

    return {
      optimized,
      large,
      medium,
      thumbnail,
      webp,
      avif,
      blurDataUrl,
      metadata: {
        width: optimalWidth,
        height: optimalHeight,
        format: metadata.format || 'unknown',
        size: optimized.length,
        originalSize,
        compressionRatio,
        profileUsed: opts.productProfile || 'DEFAULT',
      },
    }
  } catch (error) {
    console.error('Error processing image:', error)
    throw new Error(
      `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
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
    if (metadata.width < IMAGE_SIZES.MIN_DIMENSION || metadata.height < IMAGE_SIZES.MIN_DIMENSION) {
      return {
        valid: false,
        error: `Image must be at least ${IMAGE_SIZES.MIN_DIMENSION}x${IMAGE_SIZES.MIN_DIMENSION} pixels`,
      }
    }

    // Check maximum dimensions (no larger than 5000x5000)
    if (metadata.width > IMAGE_SIZES.MAX_DIMENSION || metadata.height > IMAGE_SIZES.MAX_DIMENSION) {
      return {
        valid: false,
        error: `Image dimensions exceed ${IMAGE_SIZES.MAX_DIMENSION}x${IMAGE_SIZES.MAX_DIMENSION} pixels`,
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
 * Determine optimal product profile based on product/category name
 */
export function determineProductProfile(
  productName?: string,
  categoryName?: string
): keyof typeof PRODUCT_IMAGE_PROFILES {
  const name = (productName + ' ' + categoryName).toLowerCase()

  if (name.includes('business card') || name.includes('card')) {
    return 'BUSINESS_CARD'
  }
  if (name.includes('banner') || name.includes('poster') || name.includes('large format')) {
    return 'BANNER'
  }
  if (name.includes('flyer') || name.includes('brochure') || name.includes('leaflet')) {
    return 'FLYER'
  }
  if (name.includes('premium') || name.includes('luxury') || name.includes('high quality')) {
    return 'PREMIUM'
  }

  return 'DEFAULT'
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
