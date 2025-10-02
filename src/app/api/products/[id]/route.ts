import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteProductImage } from '@/lib/minio-products'
import { validateRequest } from '@/lib/auth'
import { transformProductForFrontend } from '@/lib/data-transformers'
import { createSuccessResponse, createNotFoundErrorResponse, createDatabaseErrorResponse } from '@/lib/api-response'

// GET /api/products/[id] - Get single product
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productCategory: true,
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
        productPaperStockSets: {
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
            AddOnSet: true,
          },
        },
        productTurnaroundTimeSets: {
          include: {
            TurnaroundTimeSet: {
              include: {
                TurnaroundTimeSetItem: {
                  include: {
                    TurnaroundTime: true,
                  },
                },
              },
            },
          },
        },
        productOptions: {
          include: {
            OptionValue: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        pricingTiers: {
          orderBy: { minQuantity: 'asc' },
        },
      },
    })

    if (!product) {
      return createNotFoundErrorResponse('Product')
    }

    // Transform for frontend compatibility
    const transformedProduct = transformProductForFrontend(product)
    return createSuccessResponse(transformedProduct)
  } catch (error) {
    return createDatabaseErrorResponse(error)
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('[PUT Product] Starting update for product:', id)

    const { user, session } = await validateRequest()
    console.log('[PUT Product] Auth check:', { hasSession: !!session, hasUser: !!user, role: user?.role })

    if (!session || !user || user.role !== 'ADMIN') {
      console.error('[PUT Product] Unauthorized:', { session: !!session, user: !!user, role: user?.role })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('[PUT Product] Received data:', {
      hasImages: !!data.images,
      paperStockSetId: data.paperStockSetId,
      quantityGroupId: data.quantityGroupId,
      sizeGroupId: data.sizeGroupId,
      turnaroundTimeSetId: data.turnaroundTimeSetId,
      addOnSetId: data.addOnSetId,
      name: data.name,
      sku: data.sku,
    })

    const { images, paperStockSetId, quantityGroupId, sizeGroupId, turnaroundTimeSetId, addOnSetId, options, pricingTiers, ...productData } = data

    // Get existing product to compare images
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        productImages: true,
        productPaperStockSets: true,
        productQuantityGroups: true,
        productSizeGroups: true,
        productTurnaroundTimeSets: true,
        productAddOnSets: true,
        productOptions: {
          include: {
            OptionValue: true,
          },
        },
        pricingTiers: true,
      },
    })

    if (!existingProduct) {
      console.error('[PUT Product] Product not found:', id)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    console.log('[PUT Product] Found existing product, processing images...')

    // Delete removed images from MinIO
    const existingImageUrls = existingProduct.productImages.map((img) => img.url)
    const newImageUrls = images?.map((img: Record<string, unknown>) => img.url) || []
    const imagesToDelete = existingImageUrls.filter((url) => !newImageUrls.includes(url))

    console.log('[PUT Product] Images to delete:', imagesToDelete.length)

    for (const url of imagesToDelete) {
      try {
        await deleteProductImage(url)
      } catch (error) {
        console.error('[PUT Product] Failed to delete image from MinIO:', error)
      }
    }

    console.log('[PUT Product] Starting database transaction...')

    // Update product using transaction
    const product = await prisma.$transaction(async (tx) => {
      // Delete existing relations
      await tx.productImage.deleteMany({ where: { productId: id } })
      await tx.productPaperStockSet.deleteMany({ where: { productId: id } })
      await tx.productQuantityGroup.deleteMany({ where: { productId: id } })
      await tx.productSizeGroup.deleteMany({ where: { productId: id } })
      await tx.productTurnaroundTimeSet.deleteMany({ where: { productId: id } })
      await tx.productAddOnSet.deleteMany({ where: { productId: id } })
      await tx.productOption.deleteMany({ where: { productId: id } })
      await tx.pricingTier.deleteMany({ where: { productId: id } })

      // Update product with new data
      return await tx.product.update({
        where: { id },
        data: {
          ...productData,
          // Recreate images
          productImages:
            images?.length > 0
              ? {
                  create: images.map((img: Record<string, unknown>, index: number) => ({
                    url: img.url,
                    thumbnailUrl: img.thumbnailUrl,
                    alt: img.alt,
                    caption: img.caption,
                    isPrimary: img.isPrimary,
                    sortOrder: index,
                    width: img.width,
                    height: img.height,
                    fileSize: img.fileSize,
                    mimeType: img.mimeType,
                  })),
                }
              : undefined,
          // Recreate paper stock set association
          productPaperStockSets: paperStockSetId
            ? {
                create: {
                  paperStockSetId: paperStockSetId,
                  isDefault: true,
                },
              }
            : undefined,
          // Recreate quantity group association
          productQuantityGroups: quantityGroupId
            ? {
                create: {
                  quantityGroupId: quantityGroupId,
                },
              }
            : undefined,
          // Recreate size group association
          productSizeGroups: sizeGroupId
            ? {
                create: {
                  sizeGroupId: sizeGroupId,
                },
              }
            : undefined,
          // Recreate turnaround time set association
          productTurnaroundTimeSets: turnaroundTimeSetId
            ? {
                create: {
                  turnaroundTimeSetId: turnaroundTimeSetId,
                  isDefault: true,
                },
              }
            : undefined,
          // Recreate addon set association
          productAddOnSets: addOnSetId
            ? {
                create: {
                  addOnSetId: addOnSetId,
                  isDefault: true,
                },
              }
            : undefined,
          // Recreate options with values
          productOptions:
            options?.length > 0
              ? {
                  create: options.map((opt: Record<string, unknown>, index: number) => ({
                    name: opt.name,
                    type: opt.type,
                    required: opt.required,
                    sortOrder: index,
                    OptionValue: {
                      create: (opt.values as any[] || []).map((val: Record<string, unknown>, valIndex: number) => ({
                        value: val.value,
                        label: val.label,
                        additionalPrice: val.additionalPrice,
                        isDefault: val.isDefault,
                        sortOrder: valIndex,
                      })),
                    },
                  })),
                }
              : undefined,
          // Recreate pricing tiers
          pricingTiers:
            pricingTiers?.length > 0
              ? {
                  create: pricingTiers.map((tier: Record<string, unknown>) => ({
                    minQuantity: tier.minQuantity,
                    maxQuantity: tier.maxQuantity,
                    pricePerUnit: tier.pricePerUnit,
                    discountPercentage: tier.discountPercentage,
                  })),
                }
              : undefined,
        },
        include: {
          productCategory: true,
          productImages: true,
          productPaperStockSets: {
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
          productTurnaroundTimeSets: {
            include: {
              TurnaroundTimeSet: {
                include: {
                  TurnaroundTimeSetItem: {
                    include: {
                      TurnaroundTime: true,
                    },
                  },
                },
              },
            },
          },
          productAddOnSets: {
            include: {
              AddOnSet: {
                include: {
                  AddOnSetItem: {
                    include: {
                      AddOn: true,
                    },
                  },
                },
              },
            },
          },
          productOptions: {
            include: {
              OptionValue: true,
            },
          },
          pricingTiers: true,
        },
      })
    })

    console.log('[PUT Product] Transaction completed successfully')
    return NextResponse.json(product)
  } catch (error) {
    console.error('[PUT Product] Error occurred:', error)

    // Check for Prisma unique constraint violations
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const prismaError = error as any
      const field = prismaError.meta?.target?.[0]
      console.error('[PUT Product] Unique constraint violation:', field)
      return NextResponse.json(
        { error: `A product with this ${field} already exists` },
        { status: 400 }
      )
    }

    // Log the full error for debugging
    console.error('[PUT Product] Full error details:', error)

    // Return error response
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
    return NextResponse.json({
      error: 'Failed to update product',
      details: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

// PATCH /api/products/[id] - Simple update product (for toggles, etc.)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Update product with simple fields
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        productCategory: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[DELETE Product] Attempting to delete product:', id)

    const { user, session } = await validateRequest()
    console.log('[DELETE Product] Auth check:', { hasSession: !!session, hasUser: !!user, role: user?.role })

    if (!session || !user || user.role !== 'ADMIN') {
      console.error('[DELETE Product] Unauthorized attempt:', { session: !!session, user: !!user, role: user?.role })
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    // Get product with images to delete from MinIO
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productImages: true,
      },
    })

    if (!product) {
      console.error('[DELETE Product] Product not found:', id)
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    console.log('[DELETE Product] Found product, deleting images from MinIO...')
    // Delete images from MinIO
    for (const image of product.productImages) {
      try {
        await deleteProductImage(image.url)
      } catch (error) {
        console.error('[DELETE Product] Failed to delete image from MinIO:', error)
      }
    }

    console.log('[DELETE Product] Deleting product from database...')
    // Delete product (cascade will handle relations)
    await prisma.product.delete({
      where: { id },
    })

    console.log('[DELETE Product] Product deleted successfully:', id)
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('[DELETE Product] Error deleting product:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'Failed to delete product',
      details: errorMessage
    }, { status: 500 })
  }
}
