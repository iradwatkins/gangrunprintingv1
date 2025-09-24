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
            quantity: true,
          },
        },
        productSizes: {
          include: {
            size: true,
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
        ProductImage: true,
        ProductOption: true,
      },
    })

    if (!originalProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Generate a unique SKU and slug
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(7)
    const newSku = `${originalProduct.sku}-COPY-${randomSuffix}`.toUpperCase()
    const newSlug = `${originalProduct.slug}-copy-${randomSuffix}`
    const newName = `${originalProduct.name} (Copy)`

    // Create the duplicated product
    const duplicatedProduct = await prisma.product.create({
      data: {
        name: newName,
        slug: newSlug,
        sku: newSku,
        description: originalProduct.description,
        shortDescription: originalProduct.shortDescription,
        categoryId: originalProduct.categoryId,
        basePrice: originalProduct.basePrice,
        gangRunBasePrice: originalProduct.gangRunBasePrice,
        gangRunEligible: originalProduct.gangRunEligible,
        minimumQuantity: originalProduct.minimumQuantity,
        maximumQuantity: originalProduct.maximumQuantity,
        quantityIncrement: originalProduct.quantityIncrement,
        productionTime: originalProduct.productionTime,
        isActive: false, // Set to inactive by default for review
        isFeatured: false, // Reset featured status
        isDigital: originalProduct.isDigital,
        customizationOptions: originalProduct.customizationOptions,
        weightPerUnit: originalProduct.weightPerUnit,
        shippingClass: originalProduct.shippingClass,
        taxable: originalProduct.taxable,
        taxClassId: originalProduct.taxClassId,
        metaTitle: originalProduct.metaTitle ? `${originalProduct.metaTitle} (Copy)` : null,
        metaDescription: originalProduct.metaDescription,
        metaKeywords: originalProduct.metaKeywords,
        customFields: originalProduct.customFields,
        displayOrder: originalProduct.displayOrder,
        configType: originalProduct.configType,
        // Copy paper stocks
        productPaperStocks: {
          create: originalProduct.productPaperStocks.map((ps) => ({
            paperStockId: ps.paperStockId,
            isDefault: ps.isDefault,
          })),
        },
        // Copy quantities
        productQuantities: {
          create: originalProduct.productQuantities.map((pq) => ({
            quantityId: pq.quantityId,
            isDefault: pq.isDefault,
          })),
        },
        // Copy sizes
        productSizes: {
          create: originalProduct.productSizes.map((ps) => ({
            sizeId: ps.sizeId,
            isDefault: ps.isDefault,
          })),
        },
        // Copy addon sets
        ProductAddOnSet:
          originalProduct.ProductAddOnSet.length > 0
            ? {
                create: {
                  addOnSetId: originalProduct.ProductAddOnSet[0].addOnSetId,
                },
              }
            : undefined,
        // Copy turnaround time sets
        ProductTurnaroundTimeSet:
          originalProduct.ProductTurnaroundTimeSet.length > 0
            ? {
                create: {
                  turnaroundTimeSetId:
                    originalProduct.ProductTurnaroundTimeSet[0].turnaroundTimeSetId,
                },
              }
            : undefined,
        // Copy product options
        ProductOption: {
          create: originalProduct.ProductOption.map((option) => ({
            name: option.name,
            type: option.type,
            isRequired: option.isRequired,
            options: option.options,
            defaultValue: option.defaultValue,
            priceModifier: option.priceModifier,
            priceModifierType: option.priceModifierType,
            displayOrder: option.displayOrder,
          })),
        },
        // Copy product images
        ProductImage: {
          create: originalProduct.ProductImage.map((image) => ({
            url: image.url,
            altText: image.altText,
            isPrimary: image.isPrimary,
            sortOrder: image.sortOrder,
          })),
        },
      },
      include: {
        ProductCategory: true,
        productPaperStocks: {
          include: {
            PaperStock: true,
          },
        },
        ProductImage: true,
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
      message: 'Product duplicated successfully',
      product: duplicatedProduct,
    })
  } catch (error) {
    console.error('Product duplication error:', error)
    return NextResponse.json(
      {
        error: 'Failed to duplicate product',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
