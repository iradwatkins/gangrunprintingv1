import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

// Comprehensive Zod schema for product creation
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255).trim(),
  sku: z.string().min(1, 'SKU is required').max(100).regex(/^[a-z0-9-]+$/).trim(),
  categoryId: z.string().cuid('Category ID must be valid'),
  description: z.string().max(5000).optional().nullable(),
  shortDescription: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    alt: z.string().max(255).optional(),
    caption: z.string().max(500).optional(),
    isPrimary: z.boolean().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    fileSize: z.number().int().positive().optional(),
    mimeType: z.string().optional()
  })).default([]),
  selectedPaperStocks: z.array(z.string().cuid()).min(1),
  defaultPaperStock: z.string().cuid(),
  selectedQuantityGroup: z.string().cuid(),
  selectedSizeGroup: z.string().cuid(),
  selectedAddOns: z.array(z.string().cuid()).default([]),
  productionTime: z.number().int().min(1).max(365).default(3),
  rushAvailable: z.boolean().default(false),
  rushDays: z.number().int().min(1).max(30).optional().nullable(),
  rushFee: z.number().min(0).max(10000).optional().nullable(),
  basePrice: z.number().min(0).max(100000).default(0),
  setupFee: z.number().min(0).max(10000).default(0)
}).refine(
  (data) => data.selectedPaperStocks.includes(data.defaultPaperStock),
  { message: 'Default paper stock must be selected', path: ['defaultPaperStock'] }
)

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
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[${requestId}] === PRODUCT CREATION START ===`)

  try {
    console.log(`[${requestId}] Step 1: Validating authentication...`)
    const { user, session } = await validateRequest()

    if (!session || !user || user.role !== 'ADMIN') {
      console.error(`[${requestId}] Auth failed:`, {
        hasSession: !!session,
        hasUser: !!user,
        userRole: user?.role
      })
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }
    console.log(`[${requestId}] Authentication successful`)

    console.log(`[${requestId}] Step 2: Parsing and validating data...`)
    let rawData
    try {
      rawData = await request.json()
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse failed:`, parseError)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    let data
    try {
      data = createProductSchema.parse(rawData)
    } catch (validationError) {
      console.error(`[${requestId}] Validation failed:`, validationError)
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: validationError.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }, { status: 400 })
      }
      return NextResponse.json({ error: 'Data validation failed' }, { status: 400 })
    }

    const {
      name, sku, categoryId, description, shortDescription,
      isActive, isFeatured, images, selectedPaperStocks,
      defaultPaperStock, selectedQuantityGroup, selectedSizeGroup,
      selectedAddOns, productionTime, rushAvailable,
      rushDays, rushFee, basePrice, setupFee
    } = data
    console.log(`[${requestId}] Data validated successfully`)

    console.log(`[${requestId}] Step 3: Validating foreign keys...`)
    try {
      const [category, paperStocks, quantityGroup, sizeGroup, addOns] = await Promise.all([
        prisma.productCategory.findUnique({ where: { id: categoryId } }),
        prisma.paperStock.findMany({ where: { id: { in: selectedPaperStocks } } }),
        prisma.quantityGroup.findUnique({ where: { id: selectedQuantityGroup } }),
        prisma.sizeGroup.findUnique({ where: { id: selectedSizeGroup } }),
        selectedAddOns.length > 0 ? prisma.addOn.findMany({ where: { id: { in: selectedAddOns } } }) : []
      ])

      if (!category) {
        return NextResponse.json({ error: `Category not found: ${categoryId}` }, { status: 400 })
      }
      if (paperStocks.length !== selectedPaperStocks.length) {
        const missing = selectedPaperStocks.filter(id => !paperStocks.find(ps => ps.id === id))
        return NextResponse.json({ error: `Paper stocks not found: ${missing.join(', ')}` }, { status: 400 })
      }
      if (!quantityGroup) {
        return NextResponse.json({ error: `Quantity group not found: ${selectedQuantityGroup}` }, { status: 400 })
      }
      if (!sizeGroup) {
        return NextResponse.json({ error: `Size group not found: ${selectedSizeGroup}` }, { status: 400 })
      }
      if (selectedAddOns.length > 0 && addOns.length !== selectedAddOns.length) {
        const missing = selectedAddOns.filter(id => !addOns.find(ao => ao.id === id))
        return NextResponse.json({ error: `Add-ons not found: ${missing.join(', ')}` }, { status: 400 })
      }
    } catch (validationError) {
      console.error(`[${requestId}] Foreign key validation error:`, validationError)
      return NextResponse.json({ error: 'Database validation error' }, { status: 500 })
    }
    console.log(`[${requestId}] Foreign keys validated`)

    console.log(`[${requestId}] Step 4: Generating slug...`)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    console.log(`[${requestId}] Step 5: Creating product in transaction...`)
    const product = await prisma.$transaction(async (tx) => {
      return await tx.product.create({
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
            addOnId
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
    }, {
      timeout: 30000,
      maxWait: 5000
    })

    console.log(`[${requestId}] Product created: ${product.id}`)
    console.log(`[${requestId}] === PRODUCT CREATION COMPLETE ===`)
    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error(`[${requestId}] === PRODUCT CREATION ERROR ===`)
    console.error(`[${requestId}] Error details:`, {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    })

    // Handle transaction timeouts
    if (error.name === 'TransactionTimeout') {
      return NextResponse.json(
        { error: 'Product creation timed out. Please try again.', requestId },
        { status: 408 }
      )
    }

    // Check for unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      return NextResponse.json(
        { error: `A product with this ${field} already exists`, field },
        { status: 400 }
      )
    }

    // Check for foreign key constraint violations
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid reference: One or more selected items do not exist', details: error.meta },
        { status: 400 }
      )
    }

    // Check for required field violations
    if (error.code === 'P2012') {
      return NextResponse.json(
        { error: 'Missing required fields', details: error.meta },
        { status: 400 }
      )
    }

    // Check for connection errors
    if (error.code === 'P1001' || error.code === 'P1008' || error.code === 'P1009') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again later.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create product',
        details: error.message,
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}