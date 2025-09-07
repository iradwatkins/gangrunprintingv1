import { Client } from 'minio'

// MinIO client configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
})

// Bucket names
export const BUCKETS = {
  UPLOADS: 'gangrun-uploads',
  PROCESSED: 'gangrun-processed',
  THUMBNAILS: 'gangrun-thumbnails',
  TEMPLATES: 'gangrun-templates'
}

// Initialize buckets
export async function initializeBuckets() {
  try {
    for (const bucketName of Object.values(BUCKETS)) {
      const exists = await minioClient.bucketExists(bucketName)
      if (!exists) {
        await minioClient.makeBucket(bucketName, 'us-east-1')
        console.log(`Bucket ${bucketName} created successfully`)
      }
    }
  } catch (error) {
    console.error('Error initializing buckets:', error)
    throw error
  }
}

// Upload file to MinIO
export async function uploadFile(
  bucketName: string,
  objectName: string,
  filePath: string | Buffer,
  metadata?: Record<string, string>
) {
  try {
    const result = await minioClient.putObject(
      bucketName,
      objectName,
      filePath,
      undefined,
      metadata
    )
    return result
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Get presigned URL for direct upload
export async function getPresignedUploadUrl(
  bucketName: string,
  objectName: string,
  expiry: number = 3600 // 1 hour default
) {
  try {
    const url = await minioClient.presignedPutObject(bucketName, objectName, expiry)
    return url
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw error
  }
}

// Get presigned URL for download
export async function getPresignedDownloadUrl(
  bucketName: string,
  objectName: string,
  expiry: number = 3600
) {
  try {
    const url = await minioClient.presignedGetObject(bucketName, objectName, expiry)
    return url
  } catch (error) {
    console.error('Error generating download URL:', error)
    throw error
  }
}

// Download file from MinIO
export async function downloadFile(bucketName: string, objectName: string) {
  try {
    const stream = await minioClient.getObject(bucketName, objectName)
    return stream
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

// Delete file from MinIO
export async function deleteFile(bucketName: string, objectName: string) {
  try {
    await minioClient.removeObject(bucketName, objectName)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// List files in bucket
export async function listFiles(
  bucketName: string,
  prefix?: string,
  recursive: boolean = false
) {
  try {
    const files: any[] = []
    const stream = minioClient.listObjectsV2(bucketName, prefix, recursive)
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => files.push(obj))
      stream.on('error', reject)
      stream.on('end', () => resolve(files))
    })
  } catch (error) {
    console.error('Error listing files:', error)
    throw error
  }
}

// Get file metadata
export async function getFileMetadata(bucketName: string, objectName: string) {
  try {
    const stat = await minioClient.statObject(bucketName, objectName)
    return stat
  } catch (error) {
    console.error('Error getting file metadata:', error)
    throw error
  }
}

// Copy file between buckets
export async function copyFile(
  sourceBucket: string,
  sourceObject: string,
  destBucket: string,
  destObject: string
) {
  try {
    await minioClient.copyObject(
      destBucket,
      destObject,
      `/${sourceBucket}/${sourceObject}`
    )
  } catch (error) {
    console.error('Error copying file:', error)
    throw error
  }
}

export default minioClient