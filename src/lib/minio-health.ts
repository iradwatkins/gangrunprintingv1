import { getMinioClient, initializeBuckets } from './minio'

/**
 * Check MinIO health and connectivity
 */
export async function checkMinioHealth(): Promise<{
  available: boolean
  error?: string
  buckets?: string[]
}> {
  try {
    const client = getMinioClient()

    // Try to list buckets as a health check
    const bucketList = await client.listBuckets()

    // Ensure required buckets exist
    await initializeBuckets()

    return {
      available: true,
      buckets: bucketList.map((b) => b.name),
    }
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test upload functionality
 */
export async function testMinioUpload(): Promise<{
  success: boolean
  error?: string
  url?: string
}> {
  try {
    const { uploadFile } = await import('./minio')

    // Create a test buffer
    const testContent = Buffer.from('MinIO upload test at ' + new Date().toISOString())

    // Upload to test bucket
    const result = await uploadFile(
      'gangrun-uploads',
      `test/health-check-${Date.now()}.txt`,
      testContent,
      {
        'Content-Type': 'text/plain',
        'x-test': 'health-check',
      }
    )

    return {
      success: true,
      url: result.url,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload test failed',
    }
  }
}

/**
 * Get MinIO connection info for debugging
 */
export function getMinioConfig(): unknown {
  return {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: process.env.MINIO_PORT || '9000',
    publicEndpoint: process.env.MINIO_PUBLIC_ENDPOINT || 'https://gangrunprinting.com/minio',
    bucket: process.env.MINIO_BUCKET_NAME || 'gangrun-uploads',
    hasCredentials: !!(process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY),
  }
}
