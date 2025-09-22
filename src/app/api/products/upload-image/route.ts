import { type NextRequest, NextResponse } from 'next/server'
import { uploadProductImage } from '@/lib/minio-products'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Configure route segment for larger body size limit
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // 30 seconds timeout
export const runtime = 'nodejs'
export const revalidate = 0

// IMPORTANT: In Next.js App Router, body size limit must be set in the route configuration
// The default is 1MB which causes ERR_CONNECTION_CLOSED for larger uploads
// This is handled by the middleware.ts file which sets the x-body-size-limit header

// POST /api/products/upload-image - Upload product image with optimization
export async function POST(request: NextRequest) {
  try {
    // Check content length header first
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 20MB limit. Please compress the image or use a smaller file.' },
        { status: 413 }
      )
    }

    // Validate user session
    let user, session
    try {
      const auth = await validateRequest()
      user = auth.user
      session = auth.session
    } catch (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    // Parse form data with better error handling
    let formData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error('Error parsing form data:', error)
      return NextResponse.json(
        { error: 'File upload failed. The file may be too large (max 10MB) or corrupted.' },
        { status: 413 }
      )
    }
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

    // Upload and process image with better error handling
    let uploadedImages
    try {
      uploadedImages = await uploadProductImage(
        buffer,
        file.name,
        file.type,
        productName,
        categoryName,
        imageCount,
        isPrimary || imageCount === 1
      )
    } catch (uploadError) {
      console.error('Image processing/upload error:', uploadError)

      // Provide more specific error messages
      if (uploadError instanceof Error) {
        if (uploadError.message.includes('MinIO') || uploadError.message.includes('storage')) {
          return NextResponse.json(
            { error: 'Storage service error. Please try again in a few moments.' },
            { status: 503 }
          )
        }
        if (uploadError.message.includes('Sharp') || uploadError.message.includes('processing')) {
          return NextResponse.json(
            { error: 'Image processing failed. Please ensure the file is a valid image.' },
            { status: 422 }
          )
        }
      }

      throw uploadError // Re-throw to be caught by outer try-catch
    }

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
