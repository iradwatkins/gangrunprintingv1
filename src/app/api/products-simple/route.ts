import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple working products endpoint for testing
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching products...')

    const products = await prisma.product.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        shortDescription: true,
        basePrice: true,
        setupFee: true,
        isActive: true,
        isFeatured: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        ProductCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        ProductQuantityGroup: {
          include: {
            QuantityGroup: {
              select: {
                id: true,
                name: true,
                values: true,
                defaultValue: true,
              },
            },
          },
        },
        ProductPaperStockSet: {
          include: {
            PaperStockSet: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        productAddOns: {
          include: {
            AddOn: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            ProductImage: true,
            ProductQuantityGroup: true,
            ProductPaperStockSet: true,
            productAddOns: true,
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })

    console.log(`✅ Found ${products.length} products`)

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      message: `Found ${products.length} products`,
    })
  } catch (error) {
    console.error('❌ Products API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
