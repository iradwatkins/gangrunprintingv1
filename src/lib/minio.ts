import * as Minio from 'minio'

// Lazy initialization singleton pattern
let minioClient: Minio.Client | null = null
let initAttempted = false
let initError: Error | null = null

export function getMinioClient(): Minio.Client {
  // Return existing client if already initialized
  if (minioClient) {
    return minioClient
  }

  // If initialization was attempted but failed, throw the error
  if (initAttempted && initError) {
    throw initError
  }

  initAttempted = true

  try {
    // Server connects to localhost, but we'll handle public URLs separately
    minioClient = new Minio.Client({
      endPoint: 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
    })

    console.log(
      'MinIO client initialized successfully with endpoint: localhost:' +
        (process.env.MINIO_PORT || '9000')
    )
    return minioClient
  } catch (error) {
    initError = error as Error
    console.error('Failed to initialize MinIO client:', error)
    throw error
  }
}

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'printshop-files'

export async function ensureBucket() {
  try {
    const client = getMinioClient()
    const exists = await client.bucketExists(BUCKET_NAME)
    if (!exists) {
      await client.makeBucket(BUCKET_NAME, 'us-east-1')
    }
  } catch (error) {
    console.error('Error ensuring bucket:', error)
    // Don't throw during build time
    if (process.env.NODE_ENV === 'production' && !process.env.MINIO_ENDPOINT) {
      console.warn('MinIO not configured, skipping bucket creation')
      return
    }
    throw error
  }
}

export async function uploadFile(
  bucketOrFileName: string,
  objectNameOrBuffer?: string | Buffer,
  bufferOrMetadata?: Buffer | Record<string, string>,
  metadata?: Record<string, string>
) {
  try {
    const client = getMinioClient()

    // Handle both signatures for backward compatibility
    let bucket: string
    let objectName: string
    let buffer: Buffer
    let meta: Record<string, string>

    if (typeof objectNameOrBuffer === 'string' && Buffer.isBuffer(bufferOrMetadata)) {
      // New signature: uploadFile(bucket, objectName, buffer, metadata)
      bucket = bucketOrFileName
      objectName = objectNameOrBuffer
      buffer = bufferOrMetadata
      meta = metadata || {}
    } else if (Buffer.isBuffer(objectNameOrBuffer)) {
      // Old signature: uploadFile(fileName, buffer, metadata)
      bucket = BUCKET_NAME
      objectName = `${Date.now()}-${bucketOrFileName}`
      buffer = objectNameOrBuffer
      meta = (bufferOrMetadata as Record<string, string>) || {}
      await ensureBucket()
    } else {
      throw new Error('Invalid arguments to uploadFile')
    }

    // Ensure bucket exists
    const exists = await client.bucketExists(bucket)
    if (!exists) {
      await client.makeBucket(bucket, 'us-east-1')
    }

    await client.putObject(bucket, objectName, buffer, buffer.length, meta)

    // Generate public URL using the public endpoint
    const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || 'https://gangrunprinting.com/minio'
    const url = `${publicEndpoint}/${bucket}/${objectName}`

    return {
      objectName,
      url,
      size: buffer.length,
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

export async function getFileUrl(objectName: string) {
  try {
    // Generate public URL using the public endpoint
    const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || 'https://gangrunprinting.com/minio'
    const url = `${publicEndpoint}/${BUCKET_NAME}/${objectName}`
    return url
  } catch (error) {
    console.error('Error getting file URL:', error)
    throw error
  }
}

export async function deleteFile(objectName: string) {
  try {
    const client = getMinioClient()
    await client.removeObject(BUCKET_NAME, objectName)
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

export async function listFiles(prefix?: string) {
  try {
    const client = getMinioClient()
    const stream = client.listObjects(BUCKET_NAME, prefix, true)
    const files: any[] = []

    return new Promise<any[]>((resolve, reject) => {
      stream.on('data', (obj) => files.push(obj))
      stream.on('error', reject)
      stream.on('end', () => resolve(files))
    })
  } catch (error) {
    console.error('Error listing files:', error)
    throw error
  }
}

export async function getFileMetadata(objectName: string) {
  try {
    const client = getMinioClient()
    const stat = await client.statObject(BUCKET_NAME, objectName)
    return stat
  } catch (error) {
    console.error('Error getting file metadata:', error)
    throw error
  }
}

export async function initializeBuckets() {
  // Skip initialization during build
  if (process.env.NODE_ENV === 'production' && !process.env.MINIO_ENDPOINT) {
    return
  }

  const buckets = ['gangrun-uploads', 'gangrun-products']

  for (const bucket of buckets) {
    try {
      const client = getMinioClient()
      const exists = await client.bucketExists(bucket)
      if (!exists) {
        await client.makeBucket(bucket, 'us-east-1')
      }
    } catch (error) {
      console.error(`Error creating bucket ${bucket}:`, error)
      // Don't throw - allow app to continue without MinIO
      if (process.env.NODE_ENV === 'production') {
        console.warn(`MinIO initialization failed for ${bucket}, file uploads may not work`)
      }
    }
  }
}

export async function getPresignedUploadUrl(
  bucket: string,
  objectName: string,
  expiry: number = 3600
) {
  try {
    const client = getMinioClient()
    const url = await client.presignedPutObject(bucket, objectName, expiry)
    return url
  } catch (error) {
    console.error('Error generating presigned upload URL:', error)
    throw error
  }
}

export async function getPresignedDownloadUrl(
  bucket: string,
  objectName: string,
  expiry: number = 3600
) {
  try {
    const client = getMinioClient()
    const url = await client.presignedGetObject(bucket, objectName, expiry)
    return url
  } catch (error) {
    console.error('Error generating presigned download URL:', error)
    throw error
  }
}

// Helper to check if MinIO is available
export function isMinioAvailable(): boolean {
  try {
    // Check if we have the necessary configuration
    return !!(process.env.MINIO_ENDPOINT && process.env.MINIO_ACCESS_KEY)
  } catch {
    return false
  }
}

// Reset function for testing
export function resetMinioClient() {
  minioClient = null
  initAttempted = false
  initError = null
}
