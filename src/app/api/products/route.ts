import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

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
        ProductCategory: true,
        ProductImage: {
          orderBy: { sortOrder: 'asc' }
        },
        productPaperStocks: {
          include: {
            paperStock: true
          }
        },
        ProductOption: {
          include: {
            OptionValue: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        PricingTier: {
          orderBy: { minQuantity: 'asc' }
        },
        productQuantityGroups: {
          include: {
            quantityGroup: true
          }
        },
        productSizeGroups: {
          include: {
            sizeGroup: true
          }
        },
        productAddOns: {
          include: {
            addOn: true
          }
        },
        _count: {
          select: {
            ProductImage: true,
            productPaperStocks: true,
            ProductOption: true,
            productQuantityGroups: true,
            productSizeGroups: true,
            productAddOns: true
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
      quantityGroupId,
      sizeGroupId,
      ...productData
    } = data

    // Create product with related data
    const product = await prisma.product.create({
      data: {
        ...productData,
        // Create images
        ProductImage: images?.length > 0 ? {
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
        productPaperStocks: paperStocks?.length > 0 ? {
          create: paperStocks.map((ps: any) => ({
            paperStockId: ps.paperStockId,
            isDefault: ps.isDefault,
            additionalCost: ps.additionalCost
          }))
        } : undefined,
        // Create options with values
        ProductOption: options?.length > 0 ? {
          create: options.map((opt: any, index: number) => ({
            name: opt.name,
            type: opt.type,
            required: opt.required,
            sortOrder: index,
            OptionValue: {
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
        PricingTier: pricingTiers?.length > 0 ? {
          create: pricingTiers.map((tier: any) => ({
            minQuantity: tier.minQuantity,
            maxQuantity: tier.maxQuantity,
            pricePerUnit: tier.pricePerUnit,
            discountPercentage: tier.discountPercentage
          }))
        } : undefined,
        // Create quantity group association
        productQuantityGroups: quantityGroupId ? {
          create: {
            quantityGroupId: quantityGroupId
          }
        } : undefined,
        // Create size group association
        productSizeGroups: sizeGroupId ? {
          create: {
            sizeGroupId: sizeGroupId
          }
        } : undefined
      },
      include: {
        ProductCategory: true,
        ProductImage: true,
        productPaperStocks: {
          include: {
            paperStock: true
          }
        },
        ProductOption: {
          include: {
            OptionValue: true
          }
        },
        PricingTier: true
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