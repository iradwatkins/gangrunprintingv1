import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteProductImage } from '@/lib/minio-products'
import { validateRequest } from '@/lib/auth'

// GET /api/products/[id] - Get single product
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        ProductCategory: true,
        ProductImage: {
          orderBy: { sortOrder: 'asc' },
        },
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
        ProductOption: {
          include: {
            OptionValue: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        PricingTier: {
          orderBy: { minQuantity: 'asc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
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
        ProductImage: true,
        productPaperStockSets: true,
        productQuantityGroups: true,
        productSizeGroups: true,
        productTurnaroundTimeSets: true,
        productAddOnSets: true,
        ProductOption: {
          include: {
            OptionValue: true,
          },
        },
        PricingTier: true,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete removed images from MinIO
    const existingImageUrls = existingProduct.ProductImage.map((img) => img.url)
    const newImageUrls = images?.map((img: any) => img.url) || []
    const imagesToDelete = existingImageUrls.filter((url) => !newImageUrls.includes(url))

    for (const url of imagesToDelete) {
      try {
        await deleteProductImage(url)
      } catch (error) {
        console.error('Error deleting image from MinIO:', error)
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
          ProductImage:
            images?.length > 0
              ? {
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
          ProductOption:
            options?.length > 0
              ? {
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
                        sortOrder: valIndex,
                      })),
                    },
                  })),
                }
              : undefined,
          // Recreate pricing tiers
          PricingTier:
            pricingTiers?.length > 0
              ? {
                  create: pricingTiers.map((tier: any) => ({
                    minQuantity: tier.minQuantity,
                    maxQuantity: tier.maxQuantity,
                    pricePerUnit: tier.pricePerUnit,
                    discountPercentage: tier.discountPercentage,
                  })),
                }
              : undefined,
        },
        include: {
          ProductCategory: true,
          ProductImage: true,
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
          productTurnaroundTimeSets: {
            include: {
              turnaroundTimeSet: {
                include: {
                  TurnaroundTimeSetItem: {
                    include: {
                      turnaroundTime: true,
                    },
                  },
                },
              },
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
          ProductOption: {
            include: {
              OptionValue: true,
            },
          },
          PricingTier: true,
        },
      })
    })

    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Error updating product:', error)

    // Check for unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      return NextResponse.json(
        { error: `A product with this ${field} already exists` },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
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
        ProductCategory: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
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
        ProductImage: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete images from MinIO
    for (const image of product.ProductImage) {
      try {
        await deleteProductImage(image.url)
      } catch (error) {
        console.error('Error deleting image from MinIO:', error)
      }
    }

    // Delete product (cascade will handle relations)
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
