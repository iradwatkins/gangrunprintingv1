import { type NextRequest, NextResponse } from 'next/server'
import { uploadProductImage } from '@/lib/minio-products'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createSuccessResponse,
  createErrorResponse,
  createAuthErrorResponse,
  createUploadErrorResponse,
  createTimeoutErrorResponse,
  generateRequestId,
} from '@/lib/api-response'

// Configure route segment for optimized uploads
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Reduced to 60 seconds for faster failure
export const runtime = 'nodejs'
export const revalidate = 0

// Set the body size limit for this route
export const preferredRegion = 'auto'

// IMPORTANT: In Next.js App Router, body size limit must be set in the route configuration
// The default is 1MB which causes ERR_CONNECTION_CLOSED for larger uploads
// This is handled by the middleware.ts file which sets the x-body-size-limit header

// POST /api/products/upload-image - Upload product image with optimization
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    // Check content length header first - use 10MB limit for images
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return createUploadErrorResponse(
        'File size exceeds 10MB limit. Please compress the image or use a smaller file.',
        MAX_FILE_SIZE,
        requestId
      )
    }

    // Validate user session
    let user, session
    try {
      const auth = await validateRequest()
      user = auth.user
      session = auth.session
    } catch (authError) {
      return createAuthErrorResponse('Authentication failed', requestId)
    }

    if (!session || !user || user.role !== 'ADMIN') {
      return createAuthErrorResponse('Admin access required', requestId)
    }

    // Parse form data with aggressive timeout for faster failure
    let formData
    try {
      // Reduced timeout for faster feedback
      const formDataPromise = request.formData()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Form data parsing timeout')), 15000)
      )

      formData = await Promise.race([formDataPromise, timeoutPromise]) as FormData
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        return createTimeoutErrorResponse('Form data parsing', 15000, requestId)
      }

      return createUploadErrorResponse(
        'File upload failed. The file may be too large (max 10MB) or corrupted.',
        MAX_FILE_SIZE,
        requestId
      )
    }
    const file = formData.get('file') as File
    const productId = formData.get('productId') as string | null
    const isPrimary = formData.get('isPrimary') === 'true'
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0

    if (!file) {
      return createErrorResponse('No file provided', 400, null, requestId)
    }

    // Additional file validation
    if (file.size > MAX_FILE_SIZE) {
      return createUploadErrorResponse(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit. Please compress the image.`,
        MAX_FILE_SIZE,
        requestId
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse(
        'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
        400,
        { allowedTypes },
        requestId
      )
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
        // Continue anyway - image is uploaded to storage
      }
    }

    const responseData = {
      id: dbImage?.id,
      productId: dbImage?.productId,
      url: uploadedImages.optimized || uploadedImages.large, // Use optimized instead of original
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
      metadata: {
        originalSize: uploadedImages.metadata.originalSize,
        compressedSize: uploadedImages.metadata.size,
        compressionRatio: uploadedImages.metadata.compressionRatio,
        profileUsed: uploadedImages.metadata.profileUsed,
      }
    }

    return createSuccessResponse(responseData, 200, null, requestId)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('MinIO') || error.message.includes('storage')) {
        return createErrorResponse(
          'Storage service unavailable. Please try again later.',
          503,
          { storageError: true },
          requestId
        )
      } else if (error.message.includes('timeout')) {
        return createTimeoutErrorResponse('Image processing', null, requestId)
      } else if (error.message.includes('exceeds 10MB')) {
        return createUploadErrorResponse(error.message, MAX_FILE_SIZE, requestId)
      } else if (error.message.includes('Maximum 4 images')) {
        return createErrorResponse(error.message, 400, { imageLimit: true }, requestId)
      }
    }

    return createErrorResponse(
      'Failed to upload image',
      500,
      { uploadError: true },
      requestId
    )
  }
}
