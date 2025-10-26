import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import {
  uploadFile,
  getPresignedUploadUrl,
  BUCKETS,
  initializeBuckets,
  isMinioAvailable,
} from '@/lib/minio-client'
import { randomUUID } from 'crypto'

// Bucket initialization will happen at runtime when needed

// Zod schema for upload metadata validation
const uploadMetadataSchema = z.object({
  orderId: z.string().uuid().optional(),
  fileType: z.enum(['design', 'proof', 'reference']).optional(),
})

// Allowed file types for validation
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'application/postscript', // AI files
  'application/x-photoshop', // PSD files
  'application/vnd.adobe.photoshop',
] as const

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    // Initialize buckets on first request if MinIO is available
    if (isMinioAvailable()) {
      await initializeBuckets().catch(console.error)
    }

    // Get user session if available (but don't require it for customer uploads)
    const { user, session } = await validateRequest()

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    // Validate file presence
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File too large',
          details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          details: `Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate metadata fields with Zod
    const metadataValidation = uploadMetadataSchema.safeParse({
      orderId: formData.get('orderId'),
      fileType: formData.get('fileType'),
    })

    if (!metadataValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid metadata',
          issues: metadataValidation.error.issues,
        },
        { status: 400 }
      )
    }

    const { orderId, fileType } = metadataValidation.data

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const uniqueFilename = `${randomUUID()}.${fileExt}`
    const objectPath = orderId
      ? `orders/${orderId}/${fileType}/${uniqueFilename}`
      : `uploads/${user?.email || 'anonymous'}/${uniqueFilename}`

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to MinIO
    const uploadResult = await uploadFile(BUCKETS.UPLOADS, objectPath, buffer, {
      'original-name': file.name,
      'content-type': file.type,
      'uploaded-by': user?.email || 'anonymous',
      'upload-date': new Date().toISOString(),
    })

    // If associated with an order, create file record in database
    if (orderId) {
      const fileRecord = await prisma.file.create({
        data: {
          orderId,
          filename: file.name,
          fileUrl: objectPath,
          fileSize: file.size,
          mimeType: file.type,
          uploadedBy: user?.email || 'anonymous',
        },
      })

      return NextResponse.json({
        success: true,
        file: fileRecord,
        path: objectPath,
      })
    }

    // Generate file ID and URLs for response
    const fileId = randomUUID()
    const baseUrl = process.env.MINIO_PUBLIC_ENDPOINT || `http://localhost:9002`
    const fileUrl = `${baseUrl}/${BUCKETS.UPLOADS}/${objectPath}`
    const thumbnailUrl = file.type.startsWith('image/') ? fileUrl : null

    return NextResponse.json({
      success: true,
      fileId,
      url: fileUrl,
      thumbnailUrl,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      path: objectPath,
    })
  } catch (error) {
    console.error('Upload error:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: error.issues,
        },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')
    const filename = searchParams.get('filename')

    if (action === 'presigned' && filename) {
      // Generate presigned URL for direct upload
      const objectPath = `uploads/${user?.email || 'anonymous'}/${filename}`
      const url = await getPresignedUploadUrl(BUCKETS.UPLOADS, objectPath)

      return NextResponse.json({
        url,
        path: objectPath,
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
