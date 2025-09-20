import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

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

  // Basic numeric fields - optional for now
  basePrice: z.number().default(0),
  setupFee: z.number().default(0),
  productionTime: z.number().default(3),
})

// POST /api/products/simple - Create product with minimal validation
export async function POST(request: NextRequest) {
  console.log('=== SIMPLE PRODUCT CREATE START ===')

  try {
    // Check authentication
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      console.log('Auth check failed:', { session: !!session, user: !!user, role: user?.role })
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }
    console.log('Auth check passed')

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
      console.log('Validation passed')
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

    console.log('Creating product with slug:', slug)

    // Create product with minimal relations
    const product = await prisma.product.create({
      data: {
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

        // Create single paper stock set relation
        productPaperStockSets: {
          create: {
            paperStockSetId: validatedData.paperStockSetId,
            isDefault: true,
          },
        },

        // Create single quantity group relation
        productQuantityGroups: {
          create: {
            quantityGroupId: validatedData.quantityGroupId,
          },
        },

        // Create single size group relation
        productSizeGroups: {
          create: {
            sizeGroupId: validatedData.sizeGroupId,
          },
        },

        // Create addon set relation if provided
        productAddOnSets: validatedData.addOnSetId ? {
          create: {
            addOnSetId: validatedData.addOnSetId,
            isDefault: true,
          },
        } : undefined,

        // Create turnaround time set relation if provided
        productTurnaroundTimeSets: validatedData.turnaroundTimeSetId ? {
          create: {
            turnaroundTimeSetId: validatedData.turnaroundTimeSetId,
            isDefault: true,
          },
        } : undefined,
      },
      include: {
        ProductCategory: true,
        productPaperStockSets: {
          include: {
            paperStockSet: {
              include: {
                paperStockItems: {
                  include: {
                    paperStock: true,
                  },
                },
              },
            },
          },
        },
        productQuantityGroups: {
          include: {
            quantityGroup: true,
          },
        },
        productSizeGroups: {
          include: {
            sizeGroup: true,
          },
        },
        productAddOnSets: {
          include: {
            addOnSet: {
              include: {
                addOnSetItems: {
                  include: {
                    addOn: true,
                  },
                },
              },
            },
          },
        },
        productTurnaroundTimeSets: {
          include: {
            turnaroundTimeSet: {
              include: {
                turnaroundTimeItems: {
                  include: {
                    turnaroundTime: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    console.log('Product created successfully:', product.id)
    console.log('=== SIMPLE PRODUCT CREATE SUCCESS ===')

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
