const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createWorkingProduct() {
  try {
    console.log('🔧 CREATING WORKING PRODUCT WITH REAL DATA...\n')

    // 1. First check if we have the required data
    const category = await prisma.productCategory.findFirst({
      where: { isActive: true },
    })

    if (!category) {
      console.log('❌ No categories found. Creating one...')
      const newCategory = await prisma.productCategory.create({
        data: {
          name: 'Printing Services',
          slug: 'printing-services',
          description: 'Professional printing services',
          isActive: true,
        },
      })
      console.log(`✅ Created category: ${newCategory.name} (${newCategory.id})`)
      category = newCategory
    }

    // 2. Create Quantity Group with quantities
    console.log('\n📊 Creating quantity group...')
    const quantityGroup = await prisma.quantityGroup.create({
      data: {
        name: 'Standard Print Quantities',
        description: 'Common printing quantities',
        isActive: true,
        quantities: {
          create: [
            { quantity: 100, price: 25.0, isActive: true },
            { quantity: 250, price: 50.0, isActive: true },
            { quantity: 500, price: 85.0, isActive: true },
            { quantity: 1000, price: 150.0, isActive: true },
            { quantity: 2500, price: 300.0, isActive: true },
          ],
        },
      },
      include: {
        quantities: true,
      },
    })
    console.log(
      `✅ Created quantity group: ${quantityGroup.name} with ${quantityGroup.quantities.length} quantities`
    )

    // 3. Create Size Group with sizes
    console.log('\n📐 Creating size group...')
    const sizeGroup = await prisma.sizeGroup.create({
      data: {
        name: 'Standard Print Sizes',
        description: 'Common printing sizes',
        isActive: true,
        sizes: {
          create: [
            { name: '4x6', width: 4.0, height: 6.0, unit: 'inches', isActive: true },
            { name: '5x7', width: 5.0, height: 7.0, unit: 'inches', isActive: true },
            { name: '8.5x11', width: 8.5, height: 11.0, unit: 'inches', isActive: true },
            { name: '11x17', width: 11.0, height: 17.0, unit: 'inches', isActive: true },
          ],
        },
      },
      include: {
        sizes: true,
      },
    })
    console.log(`✅ Created size group: ${sizeGroup.name} with ${sizeGroup.sizes.length} sizes`)

    // 4. Create Paper Stock Set with paper stocks
    console.log('\n📄 Creating paper stock set...')
    const paperStockSet = await prisma.paperStockSet.create({
      data: {
        name: 'Standard Paper Options',
        description: 'Common paper stocks for printing',
        isActive: true,
        PaperStockSetItem: {
          create: [
            {
              PaperStock: {
                create: {
                  name: '100lb Gloss Text',
                  weight: 100,
                  weightUnit: 'lb',
                  finish: 'Gloss',
                  description: 'High-quality glossy paper',
                  isActive: true,
                },
              },
              sortOrder: 1,
              isDefault: true,
            },
            {
              PaperStock: {
                create: {
                  name: '80lb Matte Cover',
                  weight: 80,
                  weightUnit: 'lb',
                  finish: 'Matte',
                  description: 'Professional matte finish',
                  isActive: true,
                },
              },
              sortOrder: 2,
              isDefault: false,
            },
          ],
        },
      },
      include: {
        PaperStockSetItem: {
          include: {
            PaperStock: true,
          },
        },
      },
    })
    console.log(
      `✅ Created paper stock set: ${paperStockSet.name} with ${paperStockSet.PaperStockSetItem.length} paper options`
    )

    // 5. Now create the actual product with all modules
    console.log('\n📦 Creating the main product...')
    const product = await prisma.product.create({
      data: {
        name: 'Professional Business Flyers',
        sku: `flyer-${Date.now()}`,
        slug: `professional-business-flyers-${Date.now()}`,
        description:
          'High-quality business flyers perfect for marketing and promotion. Available in multiple sizes with professional paper options.',
        shortDescription:
          'Professional marketing flyers with custom sizes and premium paper options',
        basePrice: 25.0,
        setupFee: 10.0,
        productionTime: 3,
        isActive: true,
        isFeatured: true,
        categoryId: category.id,

        // Link to our modular components
        productQuantityGroups: {
          create: {
            quantityGroupId: quantityGroup.id,
          },
        },
        productSizeGroups: {
          create: {
            sizeGroupId: sizeGroup.id,
          },
        },
        productPaperStockSets: {
          create: {
            paperStockSetId: paperStockSet.id,
            isDefault: true,
          },
        },
      },
      include: {
        productCategory: true,
        productQuantityGroups: {
          include: {
            QuantityGroup: {
              include: {
                quantities: true,
              },
            },
          },
        },
        productSizeGroups: {
          include: {
            SizeGroup: {
              include: {
                sizes: true,
              },
            },
          },
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
      },
    })

    console.log('\n✅ PRODUCT CREATED SUCCESSFULLY!')
    console.log(`📦 Product: ${product.name}`)
    console.log(`🏷️  SKU: ${product.sku}`)
    console.log(`🗂️  Category: ${product.productCategory.name}`)
    console.log(
      `📊 Quantities: ${product.productQuantityGroups[0]?.QuantityGroup?.quantities?.length || 0} options`
    )
    console.log(`📐 Sizes: ${product.productSizeGroups[0]?.SizeGroup?.sizes?.length || 0} options`)
    console.log(
      `📄 Paper Stocks: ${product.productPaperStockSets[0]?.PaperStockSet?.PaperStockSetItem?.length || 0} options`
    )

    console.log('\n🌐 Product URLs:')
    console.log(`   Admin: https://gangrunprinting.com/admin/products`)
    console.log(`   Frontend: https://gangrunprinting.com/products/${product.slug}`)

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        slug: product.slug,
      },
    }
  } catch (error) {
    console.error('❌ Error creating product:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

createWorkingProduct()
