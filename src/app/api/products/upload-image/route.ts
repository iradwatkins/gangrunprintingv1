import { type NextRequest, NextResponse } from 'next/server'
import { uploadProductImage } from '@/lib/minio-products'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Set max body size to 20MB for image uploads
export const maxDuration = 30 // 30 seconds timeout
export const runtime = 'nodejs'

// POST /api/products/upload-image - Upload product image with optimization
export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string | null
    const isPrimary = formData.get('isPrimary') === 'true'
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get product details for SEO alt text generation
    let productName = 'Product'
    let categoryName = 'Print'
    let imageCount = 1

    if (productId) {
      try {
        const product = await prisma.product.findUnique({
          where: { id: productId },
          include: {
            ProductCategory: true,
            ProductImage: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        })

        if (product) {
          productName = product.name
          categoryName = product.ProductCategory.name
          imageCount = product.ProductImage.length + 1

          // Enforce maximum of 4 images per product (1 primary + 3 additional)
          if (imageCount > 4) {
            return NextResponse.json(
              { error: 'Maximum 4 images allowed per product (1 primary + 3 additional)' },
              { status: 400 }
            )
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error)
      }
    }

    // Upload and process image
    const uploadedImages = await uploadProductImage(
      buffer,
      file.name,
      file.type,
      productName,
      categoryName,
      imageCount,
      isPrimary || imageCount === 1
    )

    // Save to database if productId is provided
    let dbImage = null
    if (productId) {
      try {
        // Check if this is the first image (should be primary)
        const existingImagesCount = await prisma.productImage.count({
          where: { productId },
        })

        // If this is marked as primary, unset other primary images
        if (isPrimary) {
          await prisma.productImage.updateMany({
            where: { productId, isPrimary: true },
            data: { isPrimary: false },
          })
        }

        dbImage = await prisma.productImage.create({
          data: {
            productId,
            url: uploadedImages.original,
            thumbnailUrl: uploadedImages.thumbnail,
            mimeType: 'image/jpeg', // All processed images are JPEG
            fileSize: uploadedImages.metadata.size,
            width: uploadedImages.metadata.width,
            height: uploadedImages.metadata.height,
            sortOrder: sortOrder || imageCount,
            isPrimary: isPrimary || existingImagesCount === 0,
            alt: uploadedImages.metadata.altText,
            caption: `${productName} - High Quality ${categoryName} Printing`,
          },
        })
      } catch (dbError) {
        console.error('Database save error:', dbError)
        // Continue anyway - image is uploaded to storage
      }
    }

    return NextResponse.json(
      {
        id: dbImage?.id,
        productId: dbImage?.productId,
        url: uploadedImages.original,
        thumbnailUrl: uploadedImages.thumbnail,
        largeUrl: uploadedImages.large,
        mediumUrl: uploadedImages.medium,
        webpUrl: uploadedImages.webp,
        blurDataUrl: uploadedImages.blurDataUrl,
        sortOrder: dbImage?.sortOrder,
        isPrimary: dbImage?.isPrimary,
        alt: uploadedImages.metadata.altText,
        width: uploadedImages.metadata.width,
        height: uploadedImages.metadata.height,
        success: true,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error uploading image:', error)

    // Provide more specific error messages
    let errorMessage = 'Failed to upload image'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('MinIO') || error.message.includes('storage')) {
        errorMessage = 'Storage service unavailable. Please try again later.'
        statusCode = 503
      } else if (error.message.includes('exceeds 10MB')) {
        errorMessage = 'File size exceeds maximum limit of 10MB'
        statusCode = 413
      } else if (error.message.includes('must be at least')) {
        errorMessage = error.message
        statusCode = 400
      } else if (error.message.includes('Invalid')) {
        errorMessage = error.message
        statusCode = 400
      } else if (error.message.includes('Maximum 4 images')) {
        errorMessage = error.message
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
