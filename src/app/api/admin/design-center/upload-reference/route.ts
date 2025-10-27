import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { getMinioClient } from '@/lib/minio'
import { v4 as uuidv4 } from 'uuid'

const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || 'printshop-files'

export const runtime = 'nodejs'
export const maxDuration = 60

// POST /api/admin/design-center/upload-reference
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `design-center/reference/${uuidv4()}.${fileExtension}`

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to MinIO
    const minioClient = await getMinioClient()
    await minioClient.putObject(MINIO_BUCKET, fileName, buffer, buffer.length, {
      'Content-Type': file.type,
    })

    // Generate public URL
    const url = `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${MINIO_BUCKET}/${fileName}`

    return NextResponse.json({
      success: true,
      url,
      fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Error uploading reference image:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload image',
      },
      { status: 500 }
    )
  }
}
