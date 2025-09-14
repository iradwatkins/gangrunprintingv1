import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const isActive = searchParams.get('isActive')
    const gangRunEligible = searchParams.get('gangRunEligible')

    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (isActive !== null) where.isActive = isActive === 'true'
    if (gangRunEligible !== null) where.gangRunEligible = gangRunEligible === 'true'

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        paperStocks: {
          include: {
            paperStock: true
          }
        },
        options: {
          include: {
            values: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        pricingTiers: {
          orderBy: { minQuantity: 'asc' }
        },
        productQuantityGroups: {
          include: {
            quantityGroup: {
              include: {
                quantities: {
                  include: {
                    quantity: true
                  },
                  orderBy: { sortOrder: 'asc' }
                }
              }
            }
          }
        },
        productQuantities: {
          include: {
            quantity: true
          }
        },
        _count: {
          select: {
            images: true,
            paperStocks: true,
            options: true,
            productQuantities: true,
            productQuantityGroups: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const {
      images,
      paperStocks,
      options,
      pricingTiers,
      useQuantityGroup,
      quantityGroupId,
      quantityIds,
      ...productData
    } = data

    // Create product with related data
    const product = await prisma.product.create({
      data: {
        ...productData,
        // Create images
        images: images?.length > 0 ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            alt: img.alt,
            caption: img.caption,
            isPrimary: img.isPrimary,
            sortOrder: index,
            width: img.width,
            height: img.height,
            fileSize: img.fileSize,
            mimeType: img.mimeType
          }))
        } : undefined,
        // Create paper stock associations
        paperStocks: paperStocks?.length > 0 ? {
          create: paperStocks.map((ps: any) => ({
            paperStockId: ps.paperStockId,
            isDefault: ps.isDefault,
            additionalCost: ps.additionalCost
          }))
        } : undefined,
        // Create options with values
        options: options?.length > 0 ? {
          create: options.map((opt: any, index: number) => ({
            name: opt.name,
            type: opt.type,
            required: opt.required,
            sortOrder: index,
            values: {
              create: opt.values.map((val: any, valIndex: number) => ({
                value: val.value,
                label: val.label,
                additionalPrice: val.additionalPrice,
                isDefault: val.isDefault,
                sortOrder: valIndex
              }))
            }
          }))
        } : undefined,
        // Create pricing tiers
        pricingTiers: pricingTiers?.length > 0 ? {
          create: pricingTiers.map((tier: any) => ({
            minQuantity: tier.minQuantity,
            maxQuantity: tier.maxQuantity,
            pricePerUnit: tier.pricePerUnit,
            discountPercentage: tier.discountPercentage
          }))
        } : undefined,
        // Create quantity group association
        productQuantityGroups: useQuantityGroup && quantityGroupId ? {
          create: {
            quantityGroupId: quantityGroupId,
            isDefault: true
          }
        } : undefined,
        // Create individual quantity associations
        productQuantities: !useQuantityGroup && quantityIds?.length > 0 ? {
          create: quantityIds.map((quantityId: string) => ({
            quantityId: quantityId,
            isDefault: false
          }))
        } : undefined
      },
      include: {
        category: true,
        images: true,
        paperStocks: {
          include: {
            paperStock: true
          }
        },
        options: {
          include: {
            values: true
          }
        },
        pricingTiers: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    
    // Check for unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      return NextResponse.json(
        { error: `A product with this ${field} already exists` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}