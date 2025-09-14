import * as Minio from 'minio'

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER!,
  secretKey: process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD!,
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
  bucketOrFileName: string,
  objectNameOrBuffer?: string | Buffer,
  bufferOrMetadata?: Buffer | Record<string, string>,
  metadata?: Record<string, string>
) {
  try {
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
    const exists = await minioClient.bucketExists(bucket)
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1')
    }

    await minioClient.putObject(
      bucket,
      objectName,
      buffer,
      buffer.length,
      meta
    )

    // Generate a presigned URL for accessing the file
    const url = await minioClient.presignedGetObject(
      bucket,
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
    const stat = await minioClient.statObject(BUCKET_NAME, objectName)
    return stat
  } catch (error) {
    console.error('Error getting file metadata:', error)
    throw error
  }
}

export async function initializeBuckets() {
  const buckets = ['gangrun-uploads', 'gangrun-products']

  for (const bucket of buckets) {
    try {
      const exists = await minioClient.bucketExists(bucket)
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1')
        console.log(`Bucket ${bucket} created successfully`)
      }
    } catch (error) {
      console.error(`Error creating bucket ${bucket}:`, error)
    }
  }
}

export async function getPresignedUploadUrl(bucket: string, objectName: string, expiry: number = 3600) {
  try {
    const url = await minioClient.presignedPutObject(bucket, objectName, expiry)
    return url
  } catch (error) {
    console.error('Error generating presigned upload URL:', error)
    throw error
  }
}

export async function getPresignedDownloadUrl(bucket: string, objectName: string, expiry: number = 3600) {
  try {
    const url = await minioClient.presignedGetObject(bucket, objectName, expiry)
    return url
  } catch (error) {
    console.error('Error generating presigned download URL:', error)
    throw error
  }
}