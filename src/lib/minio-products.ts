export * from './minio'
import { uploadFile } from './minio'
import {
  processProductImage,
  validateProductImage,
  generateAltText,
  ProcessedImage,
} from './image-processor'

export interface UploadedProductImages {
  original: string
  large: string
  medium: string
  thumbnail: string
  webp: string
  blurDataUrl: string
  metadata: {
    width: number
    height: number
    format: string
    size: number
    altText?: string
  }
}

/**
 * Upload processed product images to MinIO storage
 * Creates multiple versions for optimal loading performance
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

    // Process image to create multiple versions
    const processed = await processProductImage(buffer, fileName)

    // Generate unique base path
    const timestamp = Date.now()
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()
    const baseName = `${timestamp}-${cleanFileName.split('.')[0]}`

    // Upload each version to MinIO
    const uploads = await Promise.all([
      uploadFile('gangrun-products', `products/original/${baseName}.jpg`, processed.original, {
        'Content-Type': 'image/jpeg',
        'x-amz-meta-original-name': fileName,
        'x-amz-meta-upload-timestamp': timestamp.toString(),
        'x-amz-meta-image-type': 'original',
        'Cache-Control': 'public, max-age=31536000',
      }),
      uploadFile('gangrun-products', `products/large/${baseName}.jpg`, processed.large, {
        'Content-Type': 'image/jpeg',
        'x-amz-meta-image-type': 'large',
        'Cache-Control': 'public, max-age=31536000',
      }),
      uploadFile('gangrun-products', `products/medium/${baseName}.jpg`, processed.medium, {
        'Content-Type': 'image/jpeg',
        'x-amz-meta-image-type': 'medium',
        'Cache-Control': 'public, max-age=31536000',
      }),
      uploadFile('gangrun-products', `products/thumbnail/${baseName}.jpg`, processed.thumbnail, {
        'Content-Type': 'image/jpeg',
        'x-amz-meta-image-type': 'thumbnail',
        'Cache-Control': 'public, max-age=31536000',
      }),
      uploadFile('gangrun-products', `products/webp/${baseName}.webp`, processed.webp, {
        'Content-Type': 'image/webp',
        'x-amz-meta-image-type': 'webp',
        'Cache-Control': 'public, max-age=31536000',
      }),
    ])

    // Generate SEO alt text
    const altText = generateAltText(
      productName || 'Product',
      categoryName || 'Print',
      imageIndex,
      isPrimary
    )

    return {
      original: uploads[0].url,
      large: uploads[1].url,
      medium: uploads[2].url,
      thumbnail: uploads[3].url,
      webp: uploads[4].url,
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
