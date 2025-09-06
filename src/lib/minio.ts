import * as Minio from 'minio'

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.NODE_ENV === 'production',
  accessKey: process.env.MINIO_ROOT_USER!,
  secretKey: process.env.MINIO_ROOT_PASSWORD!,
})

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'printshop-files'

export async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME)
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
      console.log(`Bucket ${BUCKET_NAME} created successfully`)
    }
  } catch (error) {
    console.error('Error ensuring bucket:', error)
    throw error
  }
}

export async function uploadFile(
  fileName: string,
  buffer: Buffer,
  metadata: Record<string, string> = {}
) {
  try {
    await ensureBucket()
    
    const objectName = `${Date.now()}-${fileName}`
    
    await minioClient.putObject(
      BUCKET_NAME,
      objectName,
      buffer,
      buffer.length,
      metadata
    )
    
    // Generate a presigned URL for accessing the file
    const url = await minioClient.presignedGetObject(
      BUCKET_NAME,
      objectName,
      24 * 60 * 60 * 7 // 7 days expiry
    )
    
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
    const url = await minioClient.presignedGetObject(
      BUCKET_NAME,
      objectName,
      24 * 60 * 60 // 24 hours expiry
    )
    return url
  } catch (error) {
    console.error('Error getting file URL:', error)
    throw error
  }
}

export async function deleteFile(objectName: string) {
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName)
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

export async function listFiles(prefix?: string) {
  try {
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true)
    const files: Minio.BucketItem[] = []
    
    return new Promise<Minio.BucketItem[]>((resolve, reject) => {
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
    const stat = await minioClient.statObject(BUCKET_NAME, objectName)
    return stat
  } catch (error) {
    console.error('Error getting file metadata:', error)
    throw error
  }
}