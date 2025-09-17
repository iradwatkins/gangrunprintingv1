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
    // Only add isActive filter if explicitly provided in query params
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }
    if (gangRunEligible !== null && gangRunEligible !== undefined) {
      where.gangRunEligible = gangRunEligible === 'true'
    }

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
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const {
      name,
      sku,
      categoryId,
      description,
      shortDescription,
      isActive,
      isFeatured,
      images = [],
      selectedPaperStocks = [],
      defaultPaperStock,
      selectedQuantityGroup,
      selectedSizeGroup,
      selectedAddOns = [],
      productionTime = 3,
      rushAvailable = false,
      rushDays,
      rushFee,
      basePrice = 0,
      setupFee = 0
    } = data

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create product with related data
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        slug,
        categoryId,
        description,
        shortDescription,
        isActive,
        isFeatured,
        basePrice,
        setupFee,
        productionTime,
        rushAvailable,
        rushDays,
        rushFee,

        // Create images if provided
        ProductImage: images.length > 0 ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            thumbnailUrl: img.thumbnailUrl || img.url,
            alt: img.alt || name,
            caption: img.caption,
            isPrimary: img.isPrimary || index === 0,
            sortOrder: index,
            width: img.width,
            height: img.height,
            fileSize: img.fileSize,
            mimeType: img.mimeType
          }))
        } : undefined,

        // Create paper stock associations
        productPaperStocks: selectedPaperStocks.length > 0 ? {
          create: selectedPaperStocks.map((stockId: string) => ({
            paperStockId: stockId,
            isDefault: stockId === defaultPaperStock,
            additionalCost: 0
          }))
        } : undefined,

        // Create quantity group association
        productQuantityGroups: selectedQuantityGroup ? {
          create: {
            quantityGroupId: selectedQuantityGroup
          }
        } : undefined,

        // Create size group association
        productSizeGroups: selectedSizeGroup ? {
          create: {
            sizeGroupId: selectedSizeGroup
          }
        } : undefined,

        // Create add-on associations
        productAddOns: selectedAddOns.length > 0 ? {
          create: selectedAddOns.map((addOnId: string) => ({
            addOnId,
            isActive: true
          }))
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
        }
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
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    )
  }
}