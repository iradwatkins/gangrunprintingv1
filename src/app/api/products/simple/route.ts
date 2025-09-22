import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// Simplified schema - focus on core data only
const simpleProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),

  // Single selections - required
  paperStockSetId: z.string().min(1, 'Paper stock set is required'),
  quantityGroupId: z.string().min(1, 'Quantity group is required'),
  sizeGroupId: z.string().min(1, 'Size group is required'),

  // New set selections - optional for backward compatibility
  addOnSetId: z.string().optional().nullable(),
  turnaroundTimeSetId: z.string().optional().nullable(),

  // Image URL - optional
  imageUrl: z.string().optional().nullable(),

  // Basic numeric fields - optional for now
  basePrice: z.number().default(0),
  setupFee: z.number().default(0),
  productionTime: z.number().default(3),
})

// POST /api/products/simple - Create product with minimal validation
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    // Parse request body
    let rawData
    try {
      rawData = await request.json()
      console.log('Received data:', JSON.stringify(rawData, null, 2))
    } catch (error) {
      console.error('JSON parse error:', error)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    // Validate with simple schema
    let validatedData
    try {
      validatedData = simpleProductSchema.parse(rawData)
    } catch (error) {
      console.error('Validation error:', error)
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: error.errors.map((err: any) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: 'Data validation failed' }, { status: 400 })
    }

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create product with minimal relations
    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        name: validatedData.name,
        sku: validatedData.sku,
        slug,
        categoryId: validatedData.categoryId,
        description: validatedData.description || null,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        basePrice: validatedData.basePrice,
        setupFee: validatedData.setupFee,
        productionTime: validatedData.productionTime,
        createdAt: new Date(),
        updatedAt: new Date(),

        // Create single paper stock set relation
        productPaperStockSets: {
          create: {
            id: uuidv4(),
            paperStockSetId: validatedData.paperStockSetId,
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },

        // Create single quantity group relation
        productQuantityGroups: {
          create: {
            id: uuidv4(),
            quantityGroupId: validatedData.quantityGroupId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },

        // Create single size group relation
        productSizeGroups: {
          create: {
            id: uuidv4(),
            sizeGroupId: validatedData.sizeGroupId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },

        // Create addon set relation if provided
        productAddOnSets: validatedData.addOnSetId
          ? {
              create: {
                id: uuidv4(),
                addOnSetId: validatedData.addOnSetId,
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }
          : undefined,

        // Create turnaround time set relation if provided
        productTurnaroundTimeSets: validatedData.turnaroundTimeSetId
          ? {
              create: {
                id: uuidv4(),
                turnaroundTimeSetId: validatedData.turnaroundTimeSetId,
                isDefault: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }
          : undefined,

        // Create product image if provided
        productImages: validatedData.imageUrl
          ? {
              create: {
                id: uuidv4(),
                url: validatedData.imageUrl,
                thumbnailUrl: validatedData.imageUrl, // Use same URL for simplicity
                alt: `${validatedData.name} product image`,
                isPrimary: true,
                sortOrder: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }
          : undefined,
      },
      include: {
        productCategory: true,
        productImages: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        productPaperStockSets: {
          include: {
            PaperStockSet: {
              include: {
                paperStockSetItems: {
                  include: {
                    PaperStock: true,
                  },
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
        productAddOnSets: {
          include: {
            AddOnSet: {
              include: {
                addOnSetItems: {
                  include: {
                    AddOn: true,
                  },
                },
              },
            },
          },
        },
        productTurnaroundTimeSets: {
          include: {
            TurnaroundTimeSet: {
              include: {
                turnaroundTimeSetItems: {
                  include: {
                    TurnaroundTime: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('=== SIMPLE PRODUCT CREATE ERROR ===')
    console.error('Error:', error)

    // Handle specific database errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      return NextResponse.json(
        { error: `A product with this ${field} already exists` },
        { status: 400 }
      )
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid reference: One of the selected items does not exist in the database' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create product',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
