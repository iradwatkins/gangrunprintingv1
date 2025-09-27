import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { randomUUID } from 'crypto'
import { NextRequest } from 'next/server'
import { withRateLimit, RateLimitPresets } from '@/lib/rate-limit'
import { ProductService } from '@/services/product-service'
import {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createDatabaseErrorResponse,
  createAuthErrorResponse,
  generateRequestId,
} from '@/lib/api-response'
import { createProductSchema } from '@/lib/validation'
import { transformProductsForFrontend, transformProductForFrontend } from '@/lib/data-transformers'
import type { Product } from '@/types/product'

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  // Apply rate limiting for API endpoints
  const rateLimitResponse = await withRateLimit(request, {
    ...RateLimitPresets.api,
    prefix: 'products-get'
  })
  if (rateLimitResponse) return rateLimitResponse

  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const isActive = searchParams.get('isActive')
    const gangRunEligible = searchParams.get('gangRunEligible')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)

    // Use ProductService for better architecture and caching
    const result = await ProductService.listProducts({
      categoryId,
      isActive: isActive ? isActive === 'true' : undefined,
      gangRunEligible: gangRunEligible ? gangRunEligible === 'true' : undefined,
      page,
      limit,
    })

    const responseTime = Date.now() - startTime

    // Transform to match frontend expectations (PascalCase property names)
    const transformedProducts = transformProductsForFrontend(result.data)

    return createSuccessResponse(
      transformedProducts,
      200,
      {
        ...result.pagination,
        count: transformedProducts.length,
        responseTime
      },
      requestId
    )
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`[${requestId}] Error:`, error)

    return createDatabaseErrorResponse(error, requestId)
  }
}

// Keep the original implementation as a fallback
// TODO: Remove once service layer is fully tested
export async function GET_OLD(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const isActive = searchParams.get('isActive')
    const gangRunEligible = searchParams.get('gangRunEligible')

    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100) // Max 100 items per page
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (categoryId) where.categoryId = categoryId
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }
    if (gangRunEligible !== null && gangRunEligible !== undefined) {
      where.gangRunEligible = gangRunEligible === 'true'
    }

    const totalCount = await prisma.product.count({ where })

    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      select: {
        // Basic product fields
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        shortDescription: true,
        basePrice: true,
        setupFee: true,
        productionTime: true,
        rushAvailable: true,
        rushDays: true,
        rushFee: true,
        isActive: true,
        isFeatured: true,
        gangRunEligible: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,

        // Include only essential relations (max 2 levels deep)
        productCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        productImages: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            alt: true,
            caption: true,
            isPrimary: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        ProductPaperStockSet: {
          select: {
            id: true,
            paperStockSetId: true,
            isDefault: true,
            PaperStockSet: {
              select: {
                id: true,
                name: true,
                description: true,
                // Don't include deeply nested items for list view
              },
            },
          },
        },
        productOptions: {
          select: {
            id: true,
            optionName: true,
            optionType: true,
            isRequired: true,
            sortOrder: true,
            _count: {
              select: { OptionValue: true },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        pricingTiers: {
          select: {
            id: true,
            minQuantity: true,
            maxQuantity: true,
            price: true,
          },
          orderBy: { minQuantity: 'asc' },
        },
        _count: {
          select: {
            productImages: true,
            ProductPaperStockSet: true,
            productOptions: true,
            ProductQuantityGroup: true,
            ProductSizeGroup: true,
            productAddOns: true,
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })

    const responseTime = Date.now() - startTime

    // Transform to match frontend expectations (PascalCase property names)
    const transformedProducts = transformProductsForFrontend(products)

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return createSuccessResponse(
      transformedProducts,
      200,
      {
        count: transformedProducts.length,
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        responseTime
      },
      requestId
    )
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`[${requestId}] Database error:`, error)

    return createDatabaseErrorResponse(error, requestId)
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  // Apply rate limiting for admin endpoints
  const rateLimitResponse = await withRateLimit(request, {
    ...RateLimitPresets.sensitive,
    prefix: 'products-create'
  })
  if (rateLimitResponse) return rateLimitResponse

  const requestId = generateRequestId()

  try {
    const { user, session } = await validateRequest()

    if (!session || !user || user.role !== 'ADMIN') {
      return createAuthErrorResponse('Admin access required', requestId)
    }

    let rawData
    try {
      rawData = await request.json()
    } catch (parseError) {
      return createErrorResponse('Invalid JSON request body', 400, null, requestId)
    }

    let data
    try {
      data = createProductSchema.parse(rawData)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return createValidationErrorResponse(validationError.errors, requestId)
      }
      return createErrorResponse('Data validation failed', 400, null, requestId)
    }

    const {
      name,
      sku,
      categoryId,
      description,
      shortDescription,
      isActive,
      isFeatured,
      images,
      paperStockSetId,
      quantityGroupId,
      sizeGroupId,
      selectedAddOns,
      productionTime,
      rushAvailable,
      rushDays,
      rushFee,
      basePrice,
      setupFee,
    } = data

    try {
      const [category, paperStockSet, quantityGroup, sizeGroup, addOns] = await Promise.all([
        prisma.productCategory.findUnique({ where: { id: categoryId } }),
        prisma.paperStockSet.findUnique({ where: { id: paperStockSetId } }),
        prisma.quantityGroup.findUnique({ where: { id: quantityGroupId } }),
        prisma.sizeGroup.findUnique({ where: { id: sizeGroupId } }),
        selectedAddOns.length > 0
          ? prisma.addOn.findMany({ where: { id: { in: selectedAddOns } } })
          : [],
      ])

      if (!category) {
        return createErrorResponse(`Category not found: ${categoryId}`, 400, null, requestId)
      }
      if (!paperStockSet) {
        return createErrorResponse(`Paper stock set not found: ${paperStockSetId}`, 400, null, requestId)
      }
      if (!quantityGroup) {
        return createErrorResponse(`Quantity group not found: ${quantityGroupId}`, 400, null, requestId)
      }
      if (!sizeGroup) {
        return createErrorResponse(`Size group not found: ${sizeGroupId}`, 400, null, requestId)
      }
      if (selectedAddOns.length > 0 && addOns.length !== selectedAddOns.length) {
        const missing = selectedAddOns.filter((id) => !addOns.find((ao) => ao.id === id))
        return createErrorResponse(`Add-ons not found: ${missing.join(', ')}`, 400, null, requestId)
      }
    } catch (validationError) {
      return createDatabaseErrorResponse(validationError, requestId)
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create product with optimized transaction
    const product = await prisma.$transaction(
      async (tx) => {
        // Step 1: Create the base product first
        const newProduct = await tx.product.create({
          data: {
            id: randomUUID(),
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
          },
        })

        // Step 2: Create relationships in parallel for better performance
        const relationshipPromises = []

        // Paper stock set (required)
        relationshipPromises.push(
          tx.productPaperStockSet.create({
            data: {
              productId: newProduct.id,
              paperStockSetId: paperStockSetId,
              isDefault: true,
            },
          })
        )

        // Quantity group (required)
        if (quantityGroupId) {
          relationshipPromises.push(
            tx.productQuantityGroup.create({
              data: {
                productId: newProduct.id,
                quantityGroupId: quantityGroupId,
              },
            })
          )
        }

        // Size group (required)
        if (sizeGroupId) {
          relationshipPromises.push(
            tx.productSizeGroup.create({
              data: {
                productId: newProduct.id,
                sizeGroupId: sizeGroupId,
              },
            })
          )
        }

        // Add-ons (optional)
        if (selectedAddOns.length > 0) {
          relationshipPromises.push(
            tx.productAddOn.createMany({
              data: selectedAddOns.map((addOnId: string) => ({
                productId: newProduct.id,
                addOnId,
              })),
            })
          )
        }

        // Images (optional)
        if (images.length > 0) {
          relationshipPromises.push(
            tx.productImage.createMany({
              data: images.map((img: {
                url: string
                thumbnailUrl?: string
                alt?: string
                caption?: string
                isPrimary?: boolean
                width?: number
                height?: number
                fileSize?: number
                mimeType?: string
              }, index: number) => ({
                productId: newProduct.id,
                url: img.url,
                thumbnailUrl: img.thumbnailUrl || img.url,
                alt: img.alt || name,
                caption: img.caption,
                isPrimary: img.isPrimary || index === 0,
                sortOrder: index,
                width: img.width,
                height: img.height,
                fileSize: img.fileSize,
                mimeType: img.mimeType,
              })),
            })
          )
        }

        // Wait for all relationships to be created
        await Promise.all(relationshipPromises)

        // Return the complete product with all relationships
        return await tx.product.findUnique({
          where: { id: newProduct.id },
          include: {
            productCategory: true,
            productImages: true,
            ProductPaperStockSet: {
              include: {
                PaperStockSet: {
                  include: {
                    PaperStockSetItem: {
                      include: {
                        PaperStock: true,
                      },
                    },
                  },
                },
              },
            },
            ProductQuantityGroup: {
              include: {
                QuantityGroup: true,
              },
            },
            ProductSizeGroup: {
              include: {
                SizeGroup: true,
              },
            },
            productAddOns: {
              include: {
                AddOn: true,
              },
            },
          },
        })
      },
      {
        timeout: 15000, // Reduced timeout for faster failure
        maxWait: 3000,
      }
    )

    // Transform product for frontend compatibility
    const transformedProduct = transformProductForFrontend(product)
    return createSuccessResponse(transformedProduct, 201, null, requestId)
  } catch (error) {
    // Handle transaction timeouts
    if ((error as any)?.name === 'TransactionTimeout') {
      return createErrorResponse(
        'Product creation timed out. Please try again.',
        408,
        { timeout: true },
        requestId
      )
    }

    return createDatabaseErrorResponse(error, requestId)
  }
}
