import * as Minio from 'minio'
import { API_RETRY_ATTEMPTS, API_RETRY_DELAY } from '@/config/constants'

// Lazy initialization singleton pattern
let minioClient: Minio.Client | null = null
let initAttempted = false
let initError: Error | null = null
let lastHealthCheck = 0
let isHealthy = false

// Connection retry configuration
const CONNECTION_RETRY_ATTEMPTS = 3
const CONNECTION_RETRY_DELAY = 1000 // 1 second
const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

/**
 * Retry utility with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = API_RETRY_ATTEMPTS,
  baseDelay: number = API_RETRY_DELAY,
  maxDelay: number = 10000,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (attempt === maxAttempts) {
        throw new Error(`${operationName} failed after ${maxAttempts} attempts: ${lastError.message}`)
      }

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
      const jitter = Math.random() * 0.1 * delay // Add up to 10% jitter
      const finalDelay = delay + jitter

      }ms...`)
      await new Promise(resolve => setTimeout(resolve, finalDelay))
    }
  }

  throw lastError!
}

/**
 * Health check for MinIO connection
 */
async function checkMinioHealth(): Promise<boolean> {
  if (!minioClient) return false

  try {
    // Simple bucket list operation to test connectivity
    await minioClient.listBuckets()
    isHealthy = true
    lastHealthCheck = Date.now()
    return true
  } catch (error) {
    isHealthy = false
    return false
  }
}

/**
 * Get MinIO client with connection retry and health checking
 */
export async function getMinioClient(): Promise<Minio.Client> {
  // Return existing client if healthy and recent health check
  if (minioClient && isHealthy && (Date.now() - lastHealthCheck) < HEALTH_CHECK_INTERVAL) {
    return minioClient
  }

  // If we have a client but it's been a while, check health
  if (minioClient && (Date.now() - lastHealthCheck) >= HEALTH_CHECK_INTERVAL) {
    const healthy = await checkMinioHealth()
    if (healthy) return minioClient

    // Reset client if unhealthy
    minioClient = null
    initAttempted = false
    initError = null
  }

  // Initialize client with retry logic
  for (let attempt = 1; attempt <= CONNECTION_RETRY_ATTEMPTS; attempt++) {
    try {
      minioClient = new Minio.Client({
        endPoint: 'localhost',
        port: parseInt(process.env.MINIO_PORT || '9000'),
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
      })

      // Test the connection immediately
      await minioClient.listBuckets()

      isHealthy = true
      lastHealthCheck = Date.now()
      initAttempted = true
      initError = null

      )
      return minioClient

    } catch (error) {
      if (attempt === CONNECTION_RETRY_ATTEMPTS) {
        initError = error as Error
        initAttempted = true
        throw new Error(`Failed to connect to MinIO after ${CONNECTION_RETRY_ATTEMPTS} attempts: ${error}`)
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, CONNECTION_RETRY_DELAY * attempt))
    }
  }

  throw new Error('Unexpected error in MinIO client initialization')
}

/**
 * Legacy synchronous getter (deprecated - use getMinioClient() instead)
 */
export function getMinioClientSync(): Minio.Client {
  if (!minioClient) {
    throw new Error('MinIO client not initialized. Use getMinioClient() async method instead.')
  }
  return minioClient
}

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'printshop-files'

export async function ensureBucket() {
  try {
    const client = await getMinioClient()
    const exists = await client.bucketExists(BUCKET_NAME)
    if (!exists) {
      await client.makeBucket(BUCKET_NAME, 'us-east-1')
    }
  } catch (error) {
    // Don't throw during build time
    if (process.env.NODE_ENV === 'production' && !process.env.MINIO_ENDPOINT) {
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

  // Upload with retry logic
  return await retryWithBackoff(
    async () => {
      const client = await getMinioClient()

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
    },
    API_RETRY_ATTEMPTS,
    API_RETRY_DELAY,
    10000,
    `Upload file ${objectName} to bucket ${bucket}`
  )
}

export async function getFileUrl(objectName: string) {
  try {
    // Generate public URL using the public endpoint
    const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || 'https://gangrunprinting.com/minio'
    const url = `${publicEndpoint}/${BUCKET_NAME}/${objectName}`
    return url
  } catch (error) {
    throw error
  }
}

export async function deleteFile(objectName: string) {
  try {
    const client = await getMinioClient()
    await client.removeObject(BUCKET_NAME, objectName)
    return true
  } catch (error) {
    throw error
  }
}

export async function listFiles(prefix?: string) {
  try {
    const client = await getMinioClient()
    const stream = client.listObjects(BUCKET_NAME, prefix, true)
    const files: any[] = []

    return new Promise<any[]>((resolve, reject) => {
      stream.on('data', (obj) => files.push(obj))
      stream.on('error', reject)
      stream.on('end', () => resolve(files))
    })
  } catch (error) {
    throw error
  }
}

export async function getFileMetadata(objectName: string) {
  try {
    const client = await getMinioClient()
    const stat = await client.statObject(BUCKET_NAME, objectName)
    return stat
  } catch (error) {
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
      const client = await getMinioClient()
      const exists = await client.bucketExists(bucket)
      if (!exists) {
        await client.makeBucket(bucket, 'us-east-1')
      }
    } catch (error) {
      // Don't throw - allow app to continue without MinIO
      if (process.env.NODE_ENV === 'production') {
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
    const client = await getMinioClient()
    const url = await client.presignedPutObject(bucket, objectName, expiry)
    return url
  } catch (error) {
    throw error
  }
}

export async function getPresignedDownloadUrl(
  bucket: string,
  objectName: string,
  expiry: number = 3600
) {
  try {
    const client = await getMinioClient()
    const url = await client.presignedGetObject(bucket, objectName, expiry)
    return url
  } catch (error) {
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
