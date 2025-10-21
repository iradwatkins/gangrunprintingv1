import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateProductSEO } from '@/lib/seo-brain/generate-product-seo'

export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, wordCount = 150, temperature = 0.7, forceRegenerate = false } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        ProductCategory: true,
        City: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Generate SEO content
    const startTime = Date.now()
    const result = await generateProductSEO({
      productId: product.id,
      productName: product.name,
      productCategory: product.ProductCategory.name,
      city: product.City?.name,
      state: product.City?.stateCode,
      wordCount,
      temperature,
      forceRegenerate,
    })
    const generationTime = Date.now() - startTime

    // Get the full SEO content record
    const seoContent = await prisma.productSEOContent.findFirst({
      where: {
        productId: product.id,
        city: product.City?.name || null,
        state: product.City?.stateCode || null,
      },
      orderBy: {
        generatedAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      id: seoContent?.id,
      content: result.content,
      wordCount: result.wordCount,
      model: result.model,
      approved: seoContent?.approved || false,
      fromCache: result.fromCache,
      generationTime,
    })
  } catch (error) {
    console.error('[API] Error generating SEO content:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate SEO content',
      },
      { status: 500 }
    )
  }
}
