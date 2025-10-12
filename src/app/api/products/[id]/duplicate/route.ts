import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/products/[id]/duplicate
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Fetch the original product with all relationships
    const originalProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        productPaperStocks: {
          include: {
            PaperStock: true,
          },
        },
        productQuantities: {
          include: {
            StandardQuantity: true,
          },
        },
        productSizes: {
          include: {
            StandardSize: true,
          },
        },
        ProductAddOnSet: {
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
        ProductImage: {
          include: {
            Image: true,
          },
        },
        ProductOption: {
          include: {
            OptionValue: true,
          },
        },
      },
    })

    if (!originalProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Generate a unique SKU and slug
    const randomSuffix = Math.random().toString(36).substring(7)
    const newSku = `${originalProduct.sku}-COPY-${randomSuffix}`.toUpperCase()
    const newSlug = `${originalProduct.slug}-copy-${randomSuffix}`
    const newName = `${originalProduct.name} (Copy)`

    // Create the duplicated product
    const duplicatedProduct = await prisma.product.create({
      data: {
        // Basic fields
        name: newName,
        slug: newSlug,
        sku: newSku,
        description: originalProduct.description,
        shortDescription: originalProduct.shortDescription,
        categoryId: originalProduct.categoryId,
        basePrice: originalProduct.basePrice,

        // Gang run fields
        gangRunEligible: originalProduct.gangRunEligible,
        maxGangQuantity: originalProduct.maxGangQuantity,
        minGangQuantity: originalProduct.minGangQuantity,

        // Rush order fields
        rushAvailable: originalProduct.rushAvailable,
        rushDays: originalProduct.rushDays,
        rushFee: originalProduct.rushFee,

        // Other fields
        setupFee: originalProduct.setupFee,
        productionTime: originalProduct.productionTime,
        metadata: originalProduct.metadata as any,

        // Set to inactive by default for review
        isActive: false,
        isFeatured: false,

        // Copy paper stocks
        productPaperStocks:
          originalProduct.productPaperStocks.length > 0
            ? {
                create: originalProduct.productPaperStocks.map((ps) => ({
                  paperStockId: ps.paperStockId,
                  isDefault: ps.isDefault,
                  additionalCost: ps.additionalCost,
                })),
              }
            : undefined,

        // Copy quantities
        productQuantities:
          originalProduct.productQuantities.length > 0
            ? {
                create: originalProduct.productQuantities.map((pq) => ({
                  standardQuantityId: pq.standardQuantityId,
                  isDefault: pq.isDefault,
                  isActive: pq.isActive,
                })),
              }
            : undefined,

        // Copy sizes
        productSizes:
          originalProduct.productSizes.length > 0
            ? {
                create: originalProduct.productSizes.map((ps) => ({
                  standardSizeId: ps.standardSizeId,
                  isDefault: ps.isDefault,
                  isActive: ps.isActive,
                })),
              }
            : undefined,

        // Copy addon sets
        ProductAddOnSet:
          originalProduct.productAddOnSets.length > 0
            ? {
                create: originalProduct.productAddOnSets.map((pas) => ({
                  addOnSetId: pas.addOnSetId,
                  isDefault: pas.isDefault,
                  sortOrder: pas.sortOrder,
                })),
              }
            : undefined,

        // Copy turnaround time sets
        ProductTurnaroundTimeSet:
          originalProduct.productTurnaroundTimeSets.length > 0
            ? {
                create: originalProduct.productTurnaroundTimeSets.map((ptts) => ({
                  turnaroundTimeSetId: ptts.turnaroundTimeSetId,
                  isDefault: ptts.isDefault,
                })),
              }
            : undefined,

        // Copy product options
        ProductOption:
          originalProduct.productOptions.length > 0
            ? {
                create: originalProduct.productOptions.map((option) => ({
                  name: option.name,
                  type: option.type,
                  required: option.required,
                  sortOrder: option.sortOrder,
                  OptionValue:
                    option.OptionValue.length > 0
                      ? {
                          create: option.OptionValue.map((value) => ({
                            value: value.value,
                            displayName: value.displayName,
                            additionalCost: value.additionalCost,
                            isDefault: value.isDefault,
                            sortOrder: value.sortOrder,
                            width: value.width,
                            height: value.height,
                          })),
                        }
                      : undefined,
                })),
              }
            : undefined,

        // Copy product images (reference same images)
        ProductImage:
          originalProduct.productImages.length > 0
            ? {
                create: originalProduct.productImages.map((img) => ({
                  imageId: img.imageId,
                  isPrimary: img.isPrimary,
                  sortOrder: img.sortOrder,
                })),
              }
            : undefined,
      },
      include: {
        ProductCategory: true,
        productPaperStocks: {
          include: {
            PaperStock: true,
          },
        },
        ProductImage: {
          include: {
            Image: true,
          },
        },
        _count: {
          select: {
            ProductImage: true,
            productPaperStocks: true,
            ProductOption: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      product: duplicatedProduct,
      message: `Product duplicated successfully as "${newName}"`,
    })
  } catch (error) {
    console.error('Error duplicating product:', error)
    return NextResponse.json({ error: 'Failed to duplicate product' }, { status: 500 })
  }
}
