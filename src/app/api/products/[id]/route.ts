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
        productAddOnSets: {
          include: {
            AddOnSet: true,
          },
        },
        ProductTurnaroundTimeSet: {
          include: {
            TurnaroundTimeSet: true,
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
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const { images, paperStockSetId, quantityGroupId, sizeGroupId, turnaroundTimeSetId, addOnSetId, options, pricingTiers, ...productData } = data

    // Get existing product to compare images
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        productImages: true,
        ProductPaperStockSet: true,
        ProductQuantityGroup: true,
        ProductSizeGroup: true,
        ProductTurnaroundTimeSet: true,
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
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete removed images from MinIO
    const existingImageUrls = existingProduct.productImages.map((img) => img.url)
    const newImageUrls = images?.map((img: Record<string, unknown>) => img.url) || []
    const imagesToDelete = existingImageUrls.filter((url) => !newImageUrls.includes(url))

    for (const url of imagesToDelete) {
      try {
        await deleteProductImage(url)
      } catch (error) {
        console.error('Failed to delete image from MinIO:', error)
      }
    }

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
          ProductPaperStockSet: paperStockSetId
            ? {
                create: {
                  paperStockSetId: paperStockSetId,
                  isDefault: true,
                },
              }
            : undefined,
          // Recreate quantity group association
          ProductQuantityGroup: quantityGroupId
            ? {
                create: {
                  quantityGroupId: quantityGroupId,
                },
              }
            : undefined,
          // Recreate size group association
          ProductSizeGroup: sizeGroupId
            ? {
                create: {
                  sizeGroupId: sizeGroupId,
                },
              }
            : undefined,
          // Recreate turnaround time set association
          ProductTurnaroundTimeSet: turnaroundTimeSetId
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
          ProductTurnaroundTimeSet: {
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

    return NextResponse.json(product)
  } catch (error) {
    // Check for Prisma unique constraint violations
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const prismaError = error as any
      const field = prismaError.meta?.target?.[0]
      return NextResponse.json(
        { error: `A product with this ${field} already exists` },
        { status: 400 }
      )
    }

    // Log the full error for debugging
    console.error('Product update error:', error)

    // Return error response
    const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
    return NextResponse.json({
      error: 'Failed to update product',
      debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
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
    const { user, session } = await validateRequest()
    if (!session || !user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get product with images to delete from MinIO
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productImages: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete images from MinIO
    for (const image of product.productImages) {
      try {
        await deleteProductImage(image.url)
      } catch (error) {
        console.error('Failed to delete image from MinIO:', error)
      }
    }

    // Delete product (cascade will handle relations)
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
