import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/by-slug/[slug] - Get product by slug with all related data
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: params.slug,
        isActive: true,
      },
      include: {
        productCategory: true,
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
        productPaperStockSets: {
          include: {
            PaperStockSet: {
              include: {
                PaperStockSetItem: {
                  include: {
                    PaperStock: true,
                  },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        productQuantityGroups: {
          include: {
            QuantityGroup: true,
          },
        },
        productSizeGroups: {
          include: {
            SizeGroup: true,
          },
        },
        productAddOns: {
          include: {
            AddOn: true,
          },
        },
        productAddOnSets: {
          include: {
            AddOnSet: {
              include: {
                addOnSetItems: {
                  include: {
                    AddOn: true,
                  },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
