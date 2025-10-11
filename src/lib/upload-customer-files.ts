import { Client } from 'minio'

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
})

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'gangrunprinting'

export interface UploadedFile {
  fileName: string
  url: string
  thumbnailUrl?: string
  fileSize: number
  uploadedAt: string
}

export async function uploadCustomerFiles(files: File[], orderId: string): Promise<UploadedFile[]> {
  const uploadedFiles: UploadedFile[] = []

  for (const file of files) {
    try {
      const fileName = `customer-uploads/${orderId}/${Date.now()}-${file.name}`
      const buffer = Buffer.from(await file.arrayBuffer())

      // Upload to MinIO
      await minioClient.putObject(BUCKET_NAME, fileName, buffer, file.size, {
        'Content-Type': file.type,
      })

      // Generate URL
      const url = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${BUCKET_NAME}/${fileName}`

      uploadedFiles.push({
        fileName: file.name,
        url,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error)
      throw new Error(`Failed to upload file: ${file.name}`)
    }
  }

  return uploadedFiles
}
