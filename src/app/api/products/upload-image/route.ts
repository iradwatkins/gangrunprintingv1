import { type NextRequest, NextResponse } from 'next/server'
import { uploadProductImage, validateImage } from '@/lib/minio-products'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Set max body size to 20MB for image uploads
export const maxDuration = 30 // 30 seconds timeout
export const runtime = 'nodejs'

// POST /api/products/upload-image - Upload product image
export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string | null
    const isPrimary = formData.get('isPrimary') === 'true'
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0

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
    const validation = validateImage(buffer, file.name, file.type)
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

    // Save to database if productId is provided
    let dbImage = null
    if (productId) {
      try {
        // Get current highest sort order for this product
        const maxSortOrder = await prisma.productImage.findFirst({
          where: { productId },
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true }
        })

        // Check if this is the first image (should be primary)
        const existingImagesCount = await prisma.productImage.count({
          where: { productId }
        })

        dbImage = await prisma.productImage.create({
          data: {
            productId,
            url: uploadedImage.url,
            thumbnailUrl: uploadedImage.thumbnailUrl,
            mimeType: file.type,
            fileSize: buffer.length,
            sortOrder: sortOrder !== undefined ? sortOrder : (maxSortOrder?.sortOrder || 0) + 1,
            isPrimary: isPrimary !== undefined ? isPrimary : existingImagesCount === 0,
            alt: `Product image for ${file.name}`,
            caption: ''
          }
        })
      } catch (dbError) {
        console.error('Database save error:', dbError)
        // Continue anyway - image is uploaded to storage
      }
    }

    return NextResponse.json({
      ...uploadedImage,
      id: dbImage?.id,
      productId: dbImage?.productId,
      sortOrder: dbImage?.sortOrder,
      isPrimary: dbImage?.isPrimary,
      success: true,
      timestamp: new Date().toISOString()
    }, { status: 200 })
  } catch (error) {
    console.error('Error uploading image:', error)

    // Provide more specific error messages
    let errorMessage = 'Failed to upload image'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('MinIO') || error.message.includes('storage')) {
        errorMessage = 'Storage service unavailable. Please try again later.'
        statusCode = 503
      } else if (error.message.includes('File too large')) {
        errorMessage = 'File size exceeds maximum limit of 10MB'
        statusCode = 413
      } else if (error.message.includes('Invalid file type') || error.message.includes('Invalid image')) {
        errorMessage = 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
        statusCode = 400
      } else {
        errorMessage = error.message || 'Failed to upload image'
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        success: false
      },
      { status: statusCode }
    )
  }
}