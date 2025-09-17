import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/by-slug/[slug] - Get product by slug with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: params.slug,
        isActive: true
      },
      include: {
        ProductCategory: true,
        ProductImage: {
          orderBy: { sortOrder: 'asc' }
        },
        productPaperStocks: {
          include: {
            paperStock: true
          },
          orderBy: { id: 'asc' }
        },
        productQuantityGroups: {
          include: {
            quantityGroup: {
              include: {
                quantities: {
                  orderBy: { amount: 'asc' }
                }
              }
            }
          }
        },
        productSizeGroups: {
          include: {
            sizeGroup: {
              include: {
                sizes: {
                  orderBy: { width: 'asc' }
                }
              }
            }
          }
        },
        productAddOns: {
          include: {
            addOn: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      product
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}