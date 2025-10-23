import { NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { user } = await validateRequest()

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isLandingPageProduct: false, // Exclude landing page products
      },
      select: {
        id: true,
        name: true,
        slug: true,
        ProductCategory: {
          select: {
            name: true,
          },
        },
        City: {
          select: {
            name: true,
            stateCode: true,
          },
        },
        ProductSEOContent: {
          select: {
            id: true,
            approved: true,
          },
          orderBy: {
            generatedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      categoryName: product.ProductCategory.name,
      cityName: product.City?.name,
      stateCode: product.City?.stateCode,
      hasSEOContent: product.ProductSEOContent.length > 0,
      seoContentApproved: product.ProductSEOContent[0]?.approved || false,
    }))

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    })
  } catch (error) {
    console.error('[API] Error fetching products for SEO:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
