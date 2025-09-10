import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { uploadProductImage, validateImage } from '@/lib/minio-products'

// POST /api/products/upload-image - Upload product image
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate image
    const validation = await validateImage(buffer)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Upload to MinIO
    const uploadedImage = await uploadProductImage(
      buffer,
      file.name,
      file.type
    )

    return NextResponse.json(uploadedImage, { status: 200 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}