import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { randomUUID } from 'crypto'

// POST /api/products/simple - Create product with simple form data
export async function POST(request: NextRequest) {
  try {
    // Validate admin user
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    const data = await request.json()
    console.log('[Simple Product] Received data:', data)

    const {
      name,
      sku,
      categoryId,
      description,
      isActive,
      isFeatured,
      paperStockId,
      quantityGroupId,
      sizeGroupId,
      turnaroundTimeSetId,
      addOnSetId,
      basePrice,
      setupFee,
      productionTime,
    } = data

    // Basic validation
    if (!name || !sku || !categoryId || !paperStockId || !quantityGroupId || !sizeGroupId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, categoryId, paperStockId, quantityGroupId, sizeGroupId' },
        { status: 400 }
      )
    }

    // Generate unique slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    let uniqueSlug = baseSlug
    let slugCounter = 1
    while (true) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: uniqueSlug },
      })
      if (!existingSlug) break
      uniqueSlug = `${baseSlug}-${slugCounter}`
      slugCounter++
      if (slugCounter > 100) {
        return NextResponse.json(
          { error: 'Unable to generate unique slug' },
          { status: 500 }
        )
      }
    }

    // Check for duplicate SKU
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    })
    if (existingSku) {
      return NextResponse.json(
        { error: `A product with SKU "${sku}" already exists` },
        { status: 400 }
      )
    }

    // Note: paperStockId is actually a PaperStockSet ID, not a PaperStock ID
    // The form incorrectly names it but we'll handle it correctly

    // Create product with minimal setup
    const product = await prisma.$transaction(async (tx) => {
      // Create base product
      const newProduct = await tx.product.create({
        data: {
          id: randomUUID(),
          name,
          sku,
          slug: uniqueSlug,
          categoryId,
          description: description || null,
          shortDescription: null,
          isActive: isActive ?? true,
          isFeatured: isFeatured ?? false,
          basePrice: basePrice || 0,
          setupFee: setupFee || 0,
          productionTime: productionTime || 3,
          rushAvailable: false,
          rushDays: null,
          rushFee: null,
        },
      })

      // Link paper stock set (required)
      await tx.productPaperStockSet.create({
        data: {
          productId: newProduct.id,
          paperStockSetId: paperStockId,
          isDefault: true,
        },
      })

      // Link quantity group (required)
      await tx.productQuantityGroup.create({
        data: {
          productId: newProduct.id,
          quantityGroupId,
        },
      })

      // Link size group (required)
      await tx.productSizeGroup.create({
        data: {
          productId: newProduct.id,
          sizeGroupId,
        },
      })

      // Link turnaround time set (optional)
      if (turnaroundTimeSetId) {
        await tx.productTurnaroundTimeSet.create({
          data: {
            productId: newProduct.id,
            turnaroundTimeSetId,
            isDefault: true,
          },
        })
      }

      // Link addon set (optional)
      if (addOnSetId) {
        await tx.productAddOnSet.create({
          data: {
            productId: newProduct.id,
            addOnSetId,
            isDefault: true,
          },
        })
      }

      return newProduct
    })

    console.log('[Simple Product] Created successfully:', product.id)
    return NextResponse.json(
      {
        success: true,
        data: product,
        message: 'Product created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Simple Product] Error:', error)

    // Handle unique constraint violations
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const prismaError = error as any
      const field = prismaError.meta?.target?.[0]
      return NextResponse.json(
        { error: `A product with this ${field} already exists` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
