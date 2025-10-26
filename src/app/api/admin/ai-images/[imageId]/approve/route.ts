/**
 * Approve AI Image
 *
 * POST /api/admin/ai-images/{imageId}/approve
 *
 * Marks image as approved and optionally creates product with variants
 */

import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

interface ApproveImageRequest {
  createProduct?: boolean // Auto-create product for this image
  productConfig?: {
    categoryId: string
    basePrice: number
    productionTime: number
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const { imageId } = params
    const body: ApproveImageRequest = await request.json()
    const { createProduct = false, productConfig } = body

    // Get image with campaign info
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        campaign: {
          select: {
            locale: true,
            slug: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    if (image.isActive) {
      return NextResponse.json(
        { error: 'Image already approved' },
        { status: 400 }
      )
    }

    // STEP 1: Mark image as active
    const updatedImage = await prisma.image.update({
      where: { id: imageId },
      data: {
        isActive: true,
      },
    })

    // STEP 2: Optionally create product
    let product = null
    if (createProduct && productConfig && image.cityName) {
      const { categoryId, basePrice, productionTime } = productConfig

      // Generate product name from city + product type
      const productName = `${image.cityName} ${getProductTypeName(image.metadata)}`

      // Create product
      product = await prisma.product.create({
        data: {
          id: nanoid(),
          name: productName,
          slug: generateProductSlug(image.cityName, image.metadata),
          categoryId,
          basePrice,
          productionTime,
          sku: `${image.cityName?.toLowerCase().replace(/\s+/g, '-')}-${nanoid(8)}`,
          cityId: null, // Will need to link city if City record exists
          imageGenerationMethod: 'ai-generated',
          imagePromptsUsed: [image.originalPrompt || 'ai-generated'],
          seoKeywords: (image.tags || []).slice(0, 10),
          seoMetaTitle: image.alt?.substring(0, 60),
          seoMetaDescription: image.description?.substring(0, 160),
          seoImageAltText: image.alt,
          enableChatGPTSearch: true,
          enableChatGPTCheckout: true,
          itemGroupId: `${image.cityName?.toLowerCase().replace(/\s+/g, '-')}-group`,
        },
      })

      // Link image to product
      await prisma.productImage.create({
        data: {
          id: nanoid(),
          productId: product.id,
          imageId: image.id,
          sortOrder: 0,
          isPrimary: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        image: updatedImage,
        product: product
          ? {
              id: product.id,
              name: product.name,
              slug: product.slug,
            }
          : null,
        message: product
          ? 'Image approved and product created'
          : 'Image approved (no product created)',
      },
    })
  } catch (error: any) {
    console.error('Error approving image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve image' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Extract product type name from metadata
 */
function getProductTypeName(metadata: any): string {
  const productType = metadata?.seoLabels?.title || 'Product'
  // Extract product type from title like "Chicago Postcard Printing"
  const match = productType.match(/(\w+)\s+Printing/)
  return match ? match[1] : 'Product'
}

/**
 * Helper: Generate product slug from city and metadata
 */
function generateProductSlug(cityName: string | null, metadata: any): string {
  if (!cityName) return `product-${nanoid(8)}`

  const city = cityName.toLowerCase().replace(/\s+/g, '-')
  const productType = getProductTypeName(metadata)
    .toLowerCase()
    .replace(/\s+/g, '-')

  return `${city}-${productType}-${nanoid(6)}`
}
