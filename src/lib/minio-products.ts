import * as Minio from 'minio'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || '',
})

const PRODUCT_BUCKET = process.env.MINIO_PRODUCT_BUCKET || 'product-images'
const THUMBNAIL_WIDTH = 400
const THUMBNAIL_HEIGHT = 400
const MAX_IMAGE_WIDTH = 2000
const MAX_IMAGE_HEIGHT = 2000

// Ensure product bucket exists
export async function ensureProductBucket() {
  try {
    const exists = await minioClient.bucketExists(PRODUCT_BUCKET)
    if (!exists) {
      await minioClient.makeBucket(PRODUCT_BUCKET, 'us-east-1')
      
      // Set public read policy for product images
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${PRODUCT_BUCKET}/*`],
          },
        ],
      }
      await minioClient.setBucketPolicy(PRODUCT_BUCKET, JSON.stringify(policy))
    }
  } catch (error) {
    console.error('Error ensuring product bucket:', error)
    throw error
  }
}

export interface UploadedImage {
  url: string
  thumbnailUrl: string
  width: number
  height: number
  fileSize: number
  mimeType: string
}

// Upload product image with optimization and thumbnail generation
export async function uploadProductImage(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadedImage> {
  await ensureProductBucket()

  const fileId = uuidv4()
  const extension = filename.split('.').pop() || 'jpg'
  const mainKey = `products/${fileId}/original.${extension}`
  const thumbnailKey = `products/${fileId}/thumbnail.${extension}`

  try {
    // Process main image
    const mainImage = sharp(file)
    const metadata = await mainImage.metadata()
    
    // Resize if too large
    let processedMain = mainImage
    if (metadata.width && metadata.width > MAX_IMAGE_WIDTH) {
      processedMain = processedMain.resize(MAX_IMAGE_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }
    
    // Optimize based on format
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      processedMain = processedMain.jpeg({ quality: 85, progressive: true })
    } else if (mimeType.includes('png')) {
      processedMain = processedMain.png({ compressionLevel: 9 })
    } else if (mimeType.includes('webp')) {
      processedMain = processedMain.webp({ quality: 85 })
    }

    const mainBuffer = await processedMain.toBuffer()
    const mainInfo = await sharp(mainBuffer).metadata()

    // Upload main image
    await minioClient.putObject(
      PRODUCT_BUCKET,
      mainKey,
      mainBuffer,
      mainBuffer.length,
      {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      }
    )

    // Generate and upload thumbnail
    const thumbnailBuffer = await sharp(file)
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer()

    await minioClient.putObject(
      PRODUCT_BUCKET,
      thumbnailKey,
      thumbnailBuffer,
      thumbnailBuffer.length,
      {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
      }
    )

    // Generate URLs
    const baseUrl = process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`
    const url = `${baseUrl}/${PRODUCT_BUCKET}/${mainKey}`
    const thumbnailUrl = `${baseUrl}/${PRODUCT_BUCKET}/${thumbnailKey}`

    return {
      url,
      thumbnailUrl,
      width: mainInfo.width || 0,
      height: mainInfo.height || 0,
      fileSize: mainBuffer.length,
      mimeType,
    }
  } catch (error) {
    console.error('Error uploading product image:', error)
    throw error
  }
}

// Delete product image and its thumbnail
export async function deleteProductImage(imageUrl: string) {
  try {
    // Extract the key from the URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === PRODUCT_BUCKET)
    
    if (bucketIndex === -1) {
      throw new Error('Invalid image URL')
    }

    const key = pathParts.slice(bucketIndex + 1).join('/')
    const folderPath = key.substring(0, key.lastIndexOf('/'))

    // List all objects in the folder (original and thumbnail)
    const objectsList = []
    const stream = minioClient.listObjects(PRODUCT_BUCKET, folderPath, true)
    
    for await (const obj of stream) {
      objectsList.push(obj.name)
    }

    // Delete all objects
    if (objectsList.length > 0) {
      await minioClient.removeObjects(PRODUCT_BUCKET, objectsList)
    }
  } catch (error) {
    console.error('Error deleting product image:', error)
    throw error
  }
}

// Generate a presigned URL for temporary access (useful for private images)
export async function getPresignedUrl(
  objectKey: string,
  expiry: number = 3600 // 1 hour default
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(PRODUCT_BUCKET, objectKey, expiry)
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw error
  }
}

// Bulk upload multiple images
export async function uploadProductImages(
  files: Array<{ buffer: Buffer; filename: string; mimeType: string }>
): Promise<UploadedImage[]> {
  const uploadPromises = files.map(file =>
    uploadProductImage(file.buffer, file.filename, file.mimeType)
  )
  
  return Promise.all(uploadPromises)
}

// Get image metadata
export async function getImageMetadata(imageUrl: string) {
  try {
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === PRODUCT_BUCKET)
    
    if (bucketIndex === -1) {
      throw new Error('Invalid image URL')
    }

    const key = pathParts.slice(bucketIndex + 1).join('/')
    const stat = await minioClient.statObject(PRODUCT_BUCKET, key)
    
    return {
      size: stat.size,
      lastModified: stat.lastModified,
      contentType: stat.metaData['content-type'],
      etag: stat.etag,
    }
  } catch (error) {
    console.error('Error getting image metadata:', error)
    throw error
  }
}

// Copy image (useful for duplicating products)
export async function copyProductImage(sourceUrl: string): Promise<UploadedImage> {
  try {
    const url = new URL(sourceUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === PRODUCT_BUCKET)
    
    if (bucketIndex === -1) {
      throw new Error('Invalid source image URL')
    }

    const sourceKey = pathParts.slice(bucketIndex + 1).join('/')
    
    // Download the source image
    const stream = await minioClient.getObject(PRODUCT_BUCKET, sourceKey)
    const chunks: Buffer[] = []
    
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    
    const buffer = Buffer.concat(chunks)
    const stat = await minioClient.statObject(PRODUCT_BUCKET, sourceKey)
    const mimeType = stat.metaData['content-type'] || 'image/jpeg'
    const extension = sourceKey.split('.').pop() || 'jpg'
    
    // Upload as new image
    return uploadProductImage(buffer, `copy.${extension}`, mimeType)
  } catch (error) {
    console.error('Error copying product image:', error)
    throw error
  }
}

// Validate image before upload
export async function validateImage(
  buffer: Buffer,
  maxSizeMB: number = 10
): Promise<{ valid: boolean; error?: string }> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    // Check file size
    const sizeMB = buffer.length / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` }
    }
    
    // Check if it's a valid image
    if (!metadata.width || !metadata.height) {
      return { valid: false, error: 'Invalid image file' }
    }
    
    // Check minimum dimensions
    if (metadata.width < 200 || metadata.height < 200) {
      return { valid: false, error: 'Image dimensions must be at least 200x200 pixels' }
    }
    
    // Check format
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif']
    if (metadata.format && !allowedFormats.includes(metadata.format)) {
      return { valid: false, error: 'Unsupported image format' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Failed to process image' }
  }
}