export * from './minio'
import { uploadFile } from './minio'
import {
  processProductImage,
  validateProductImage,
  generateAltText,
  determineProductProfile,
  ProcessedImage,
  ImageProcessingOptions,
} from './image-processor'

export interface UploadedProductImages {
  optimized: string    // Replaced "original" with "optimized"
  large: string
  medium: string
  thumbnail: string
  webp: string
  avif: string         // Added AVIF support
  blurDataUrl: string
  metadata: {
    width: number
    height: number
    format: string
    size: number
    originalSize: number
    compressionRatio: number
    profileUsed: string
    altText?: string
  }
}

/**
 * Upload optimized product images to MinIO storage
 * Creates multiple versions with AVIF, WebP and JPEG formats
 * Uses intelligent optimization based on product type
 */
export const uploadProductImage = async (
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  productName?: string,
  categoryName?: string,
  imageIndex: number = 1,
  isPrimary: boolean = false
): Promise<UploadedProductImages> => {
  try {
    // Validate image first
    const validation = await validateProductImage(buffer)
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image')
    }

    // Determine optimal product profile
    const productProfile = determineProductProfile(productName, categoryName)

    // Configure processing options based on product type
    const processingOptions: ImageProcessingOptions = {
      productProfile,
      enableContentAnalysis: true,
      generateAVIF: true,
      generateWebP: true,
      generateBlurPlaceholder: true,
    }

    console.log(`Processing product image with profile: ${productProfile}`)

    // Process image with advanced optimization
    const processed = await processProductImage(buffer, fileName, processingOptions)

    // Generate unique base path
    const timestamp = Date.now()
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
    const baseName = `${timestamp}-${cleanFileName.split('.')[0]}`

    // Prepare upload metadata
    const baseMetadata = {
      'x-amz-meta-original-name': fileName,
      'x-amz-meta-upload-timestamp': timestamp.toString(),
      'x-amz-meta-product-name': productName || 'Unknown',
      'x-amz-meta-category': categoryName || 'Unknown',
      'x-amz-meta-profile': productProfile,
      'x-amz-meta-compression-ratio': processed.metadata.compressionRatio.toFixed(3),
      'x-amz-meta-original-size': processed.metadata.originalSize.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    }

    // Upload all versions in parallel
    const uploadPromises = [
      // Optimized version (replaces "original")
      uploadFile('gangrun-products', `products/optimized/${baseName}.jpg`, processed.optimized, {
        'Content-Type': 'image/jpeg',
        'x-amz-meta-image-type': 'optimized',
        ...baseMetadata,
      }),
      // Large version
      uploadFile('gangrun-products', `products/large/${baseName}.jpg`, processed.large, {
        'Content-Type': 'image/jpeg',
        'x-amz-meta-image-type': 'large',
        ...baseMetadata,
      }),
      // Medium version
      uploadFile('gangrun-products', `products/medium/${baseName}.jpg`, processed.medium, {
        'Content-Type': 'image/jpeg',
        'x-amz-meta-image-type': 'medium',
        ...baseMetadata,
      }),
      // Thumbnail
      uploadFile('gangrun-products', `products/thumbnail/${baseName}.jpg`, processed.thumbnail, {
        'Content-Type': 'image/jpeg',
        'x-amz-meta-image-type': 'thumbnail',
        ...baseMetadata,
      }),
      // WebP version
      uploadFile('gangrun-products', `products/webp/${baseName}.webp`, processed.webp, {
        'Content-Type': 'image/webp',
        'x-amz-meta-image-type': 'webp',
        ...baseMetadata,
      }),
    ]

    // Add AVIF upload if available
    if (processed.avif && processed.avif.length > 0) {
      uploadPromises.push(
        uploadFile('gangrun-products', `products/avif/${baseName}.avif`, processed.avif, {
          'Content-Type': 'image/avif',
          'x-amz-meta-image-type': 'avif',
          ...baseMetadata,
        })
      )
    }

    const uploads = await Promise.all(uploadPromises)

    // Generate SEO alt text
    const altText = generateAltText(
      productName || 'Product',
      categoryName || 'Print',
      imageIndex,
      isPrimary
    )

    // Log optimization results
    const compressionRatio = processed.metadata.compressionRatio
    const savedBytes = processed.metadata.originalSize - processed.metadata.size
    const savedPercentage = ((1 - compressionRatio) * 100).toFixed(1)

    console.log(`Image optimization complete:`)
    console.log(`- Profile: ${productProfile}`)
    console.log(`- Size: ${(processed.metadata.originalSize / 1024).toFixed(1)}KB → ${(processed.metadata.size / 1024).toFixed(1)}KB`)
    console.log(`- Saved: ${(savedBytes / 1024).toFixed(1)}KB (${savedPercentage}%)`)
    console.log(`- Formats: JPEG, WebP${processed.avif.length > 0 ? ', AVIF' : ''}`)

    return {
      optimized: uploads[0].url,
      large: uploads[1].url,
      medium: uploads[2].url,
      thumbnail: uploads[3].url,
      webp: uploads[4].url,
      avif: uploads[5]?.url || '', // AVIF might not be available
      blurDataUrl: processed.blurDataUrl,
      metadata: {
        ...processed.metadata,
        altText,
      },
    }
  } catch (error) {
    console.error('Error uploading product image:', error)
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Legacy validation function for backward compatibility
 */
export const validateImage = (buffer: Buffer, fileName?: string, mimeType?: string) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  // If mimeType is provided, validate it
  if (mimeType && !allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
    }
  }

  // Validate buffer size
  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.',
    }
  }

  // Basic image signature validation
  const signatures = {
    jpeg: [0xff, 0xd8, 0xff],
    png: [0x89, 0x50, 0x4e, 0x47],
    gif: [0x47, 0x49, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF signature (WebP uses RIFF container)
  }

  let isValidImage = false
  for (const [format, signature] of Object.entries(signatures)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      isValidImage = true
      break
    }
  }

  if (!isValidImage) {
    return {
      valid: false,
      error: 'Invalid image file. File does not appear to be a valid image.',
    }
  }

  return { valid: true }
}

export const deleteProductImage = async (objectName: string) => {
  try {
    // Note: Implementation would require MinIO client delete operation
    // For now, return success - actual deletion can be implemented later
    console.log('Image deletion requested for:', objectName)
    return true
  } catch (error) {
    console.error('Error deleting product image:', error)
    throw new Error('Failed to delete image from storage')
  }
}
