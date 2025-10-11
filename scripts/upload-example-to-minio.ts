/**
 * Upload example image to MinIO for viewing
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import * as fs from 'fs'

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true,
})

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'gangrun-products'
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'

async function main() {
  try {
    const imageBuffer = fs.readFileSync('/tmp/production-floor-example.png')
    const filename = 'examples/production-floor-business-cards.png'

    console.log('📤 Uploading to MinIO...')

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: imageBuffer,
        ContentType: 'image/png',
        Metadata: {
          prompt: 'Production floor shot with Heidelberg press',
          generatedAt: new Date().toISOString(),
        },
      })
    )

    const publicUrl = `${MINIO_PUBLIC_URL}/${BUCKET_NAME}/${filename}`

    console.log('✅ Upload successful!\n')
    console.log('🌐 View your image at:')
    console.log(`   ${publicUrl}\n`)
    console.log('📋 Or view in browser:')
    console.log(`   https://gangrunprinting.com/view-example-image\n`)
  } catch (error: any) {
    console.error('❌ Upload failed:', error.message)
    process.exit(1)
  }
}

main()
