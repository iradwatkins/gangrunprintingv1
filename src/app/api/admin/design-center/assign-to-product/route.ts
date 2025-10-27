import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getMinioClient } from '@/lib/minio'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

const MINIO_BUCKET = process.env.MINIO_BUCKET_NAME || 'printshop-files'

const assignSchema = z.object({
  productId: z.string(),
  imageUrl: z.string(),
  promptId: z.string(),
  testImageId: z.string(),
})

// POST /api/admin/design-center/assign-to-product
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, imageUrl, promptId, testImageId } = assignSchema.parse(body)

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // If imageUrl is a data URL (base64), we need to upload it to MinIO first
    let finalImageUrl = imageUrl
    if (imageUrl.startsWith('data:')) {
      // Extract base64 data
      const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/)
      if (!matches) {
        return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
      }

      const [, extension, base64Data] = matches
      const buffer = Buffer.from(base64Data, 'base64')
      const fileName = `products/${productId}/${uuidv4()}.${extension}`

      // Upload to MinIO
      const minioClient = await getMinioClient()
      await minioClient.putObject(MINIO_BUCKET, fileName, buffer, buffer.length, {
        'Content-Type': `image/${extension}`,
      })

      finalImageUrl = `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${MINIO_BUCKET}/${fileName}`
    }

    // Create Image record
    const imageId = uuidv4()
    const image = await prisma.image.create({
      data: {
        id: imageId,
        name: `ai-generated-${productId}-${imageId}`,
        url: finalImageUrl,
        alt: `${product.name} - AI Generated`,
        width: 1024, // Default - could be extracted from actual image
        height: 768, // Default - could be extracted from actual image
      },
    })

    // Check if this is the first image for the product
    const existingImages = await prisma.productImage.count({
      where: { productId },
    })

    // Create ProductImage association
    const productImage = await prisma.productImage.create({
      data: {
        id: uuidv4(),
        productId,
        imageId: image.id,
        promptTemplateId: promptId,
        sortOrder: existingImages,
        isPrimary: existingImages === 0, // First image becomes primary
      },
    })

    return NextResponse.json({
      success: true,
      productImage,
      message: `Image successfully assigned to ${product.name}${existingImages === 0 ? ' as primary image' : ''}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error assigning image to product:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to assign image to product',
      },
      { status: 500 }
    )
  }
}
