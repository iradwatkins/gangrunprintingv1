import { type NextRequest, NextResponse } from 'next/server'
import { uploadProductImage, validateImage } from '@/lib/minio-products'
import { prisma } from '@/lib/prisma'

// Set max body size to 20MB for image uploads
export const maxDuration = 30 // 30 seconds timeout
export const runtime = 'nodejs'

// POST /api/products/upload-customer-image - Upload customer design image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string | null
    const isCustomerUpload = formData.get('isCustomerUpload') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Validate image
    const validation = validateImage(buffer, file.name, file.type)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Upload to MinIO with customer prefix
    const timestamp = Date.now()
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const objectName = `customer-uploads/${timestamp}-${cleanFileName}`

    const uploadedImage = await uploadProductImage(buffer, cleanFileName, file.type)

    // Create Image record first, then ProductImage that references it
    let dbImage = null
    if (productId) {
      try {
        // Create Image record with uploaded image data
        const imageRecord = await prisma.image.create({
          data: {
            name: file.name,
            url: uploadedImage.optimized, // Use optimized as main url
            thumbnailUrl: uploadedImage.thumbnail,
            alt: `Customer upload: ${file.name}`,
            caption: 'Customer Design File',
            mimeType: file.type,
            fileSize: buffer.length,
            width: uploadedImage.metadata.width,
            height: uploadedImage.metadata.height,
            category: 'customer-upload',
            isActive: true,
          },
        })

        // Create ProductImage that references the Image
        dbImage = await prisma.productImage.create({
          data: {
            productId,
            imageId: imageRecord.id,
            sortOrder: 999, // High sort order for customer images
            isPrimary: false,
          },
        })
      } catch (dbError) {
        // Continue anyway - image is uploaded to storage
      }
    }

    return NextResponse.json(
      {
        id: dbImage?.id || `customer-${timestamp}`,
        url: uploadedImage.optimized, // Use correct property name
        thumbnailUrl: uploadedImage.thumbnail,
        fileName: file.name,
        fileSize: buffer.length,
        mimeType: file.type,
        success: true,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
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
      } else if (
        error.message.includes('Invalid file type') ||
        error.message.includes('Invalid image')
      ) {
        errorMessage =
          'Invalid file type. Only JPEG, PNG, WebP, GIF, PDF, AI, PSD, and SVG are allowed.'
        statusCode = 400
      } else {
        errorMessage = error.message || 'Failed to upload image'
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        success: false,
      },
      { status: statusCode }
    )
  }
}
