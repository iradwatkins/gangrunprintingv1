import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'

interface BulkProductRequest {
  products: Array<{
    name: string
    slug: string
    sku: string
    category: string
    basePrice: string
    productionTime: string
    quantityGroup: string
    sizeGroup: string
    paperStockSet: string
    turnaroundSet: string
    addonSet: string
    description: string
    featured: boolean
    active: boolean
  }>
}

/**
 * POST /api/products/bulk-create
 *
 * Creates multiple products at once with automatic configuration linking
 */
export async function POST(request: Request) {
  try {
    // Validate authentication
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: BulkProductRequest = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 })
    }

    console.log(`[Bulk Create] Creating ${products.length} products...`)

    const results = []
    const errors = []

    for (let i = 0; i < products.length; i++) {
      const product = products[i]

      try {
        // Get category defaults
        const category = await prisma.productCategory.findUnique({
          where: { id: product.category },
          include: {
            defaultPaperStockSet: true,
            defaultQuantityGroup: true,
            defaultTurnaroundTimeSet: true,
            defaultAddonSet: true,
            defaultCoatingOptions: true,
            defaultSidesOptions: true,
          },
        })

        if (!category) {
          errors.push({
            row: i + 1,
            product: product.name,
            error: `Category not found: ${product.category}`,
          })
          continue
        }

        // Generate product ID
        const productId = `prod_${product.slug.replace(/-/g, '_')}`

        // Check if product already exists
        const existing = await prisma.product.findUnique({
          where: { id: productId },
        })

        if (existing) {
          errors.push({
            row: i + 1,
            product: product.name,
            error: 'Product ID already exists (duplicate slug)',
          })
          continue
        }

        // Auto-generate SEO-optimized SKU
        // Format: CATEGORY-PRODUCTNAME-VARIANT
        // Example: BC-BUSINESSCARDS-STANDARD, FLY-FLYERS-8X11
        const generateSKU = (name: string, categoryName: string): string => {
          const categoryPrefix = categoryName
            .replace(/[^a-zA-Z0-9]/g, '')
            .substring(0, 3)
            .toUpperCase()

          const productPart = name
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .trim()
            .split(/\s+/)
            .slice(0, 3)
            .join('')
            .toUpperCase()
            .substring(0, 12)

          return `${categoryPrefix}-${productPart}`
        }

        const autoSKU = generateSKU(product.name, category.name)

        // Auto-generate SEO-optimized description if not provided
        const autoDescription =
          product.description ||
          `Premium ${product.name} from GangRun Printing. Professional quality printing with fast turnaround times. Perfect for ${category.name.toLowerCase()} projects. Order online with instant pricing.`

        // Create product
        const newProduct = await prisma.product.create({
          data: {
            id: productId,
            name: product.name,
            slug: product.slug,
            sku: autoSKU,
            description: autoDescription,
            shortDescription:
              product.description || `High-quality ${product.name} with fast turnaround`,
            categoryId: category.id,
            basePrice: parseFloat(product.basePrice || '19.99'),
            productionTime: parseInt(product.productionTime || '5'),
            isActive: product.active,
            isFeatured: product.featured,
          },
        })

        // Link paper stock set (from user selection or category default)
        if (product.paperStockSet) {
          await prisma.productPaperStockSet.create({
            data: {
              productId: newProduct.id,
              paperStockSetId: product.paperStockSet,
            },
          })
        } else if (category.defaultPaperStockSet) {
          await prisma.productPaperStockSet.create({
            data: {
              productId: newProduct.id,
              paperStockSetId: category.defaultPaperStockSet.id,
            },
          })
        }

        // Link quantity group (from user selection or category default)
        if (product.quantityGroup) {
          await prisma.productQuantityGroup.create({
            data: {
              productId: newProduct.id,
              quantityGroupId: product.quantityGroup,
            },
          })
        } else if (category.defaultQuantityGroup) {
          await prisma.productQuantityGroup.create({
            data: {
              productId: newProduct.id,
              quantityGroupId: category.defaultQuantityGroup.id,
            },
          })
        }

        // Link size group (from user selection)
        if (product.sizeGroup) {
          await prisma.productSizeGroup.create({
            data: {
              productId: newProduct.id,
              sizeGroupId: product.sizeGroup,
            },
          })
        }

        // Link turnaround time set (from user selection or category default)
        if (product.turnaroundSet) {
          await prisma.productTurnaroundTimeSet.create({
            data: {
              productId: newProduct.id,
              turnaroundTimeSetId: product.turnaroundSet,
            },
          })
        } else if (category.defaultTurnaroundTimeSet) {
          await prisma.productTurnaroundTimeSet.create({
            data: {
              productId: newProduct.id,
              turnaroundTimeSetId: category.defaultTurnaroundTimeSet.id,
            },
          })
        }

        // Link addon set (from user selection or category default)
        if (product.addonSet) {
          await prisma.productAddonSet.create({
            data: {
              productId: newProduct.id,
              addonSetId: product.addonSet,
            },
          })
        } else if (category.defaultAddonSet) {
          await prisma.productAddonSet.create({
            data: {
              productId: newProduct.id,
              addonSetId: category.defaultAddonSet.id,
            },
          })
        }

        // Link coating options
        if (category.defaultCoatingOptions && category.defaultCoatingOptions.length > 0) {
          await prisma.productCoatingOption.createMany({
            data: category.defaultCoatingOptions.map((option: any) => ({
              productId: newProduct.id,
              coatingOptionId: option.id,
            })),
          })
        }

        // Link sides options
        if (category.defaultSidesOptions && category.defaultSidesOptions.length > 0) {
          await prisma.productSidesOption.createMany({
            data: category.defaultSidesOptions.map((option: any) => ({
              productId: newProduct.id,
              sidesOptionId: option.id,
            })),
          })
        }

        results.push({
          row: i + 1,
          product: newProduct.name,
          slug: newProduct.slug,
          id: newProduct.id,
        })

        console.log(`[Bulk Create] ✅ Created: ${newProduct.name}`)
      } catch (error) {
        console.error(`[Bulk Create] Error creating product ${i + 1}:`, error)
        errors.push({
          row: i + 1,
          product: product.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    console.log(`[Bulk Create] Complete: ${results.length} created, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      created: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    })
  } catch (error) {
    console.error('[Bulk Create] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create products',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
