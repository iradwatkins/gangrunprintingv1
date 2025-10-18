const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createWorkingProduct() {
  try {
    console.log('🔧 CREATING WORKING PRODUCT WITH REAL DATA...\n')

    // 1. Check/create category
    let category = await prisma.productCategory.findFirst({
      where: { isActive: true },
    })

    if (!category) {
      console.log('📁 Creating category...')
      category = await prisma.productCategory.create({
        data: {
          name: 'Printing Services',
          slug: 'printing-services',
          description: 'Professional printing services',
          isActive: true,
        },
      })
      console.log(`✅ Created category: ${category.name}`)
    } else {
      console.log(`✅ Using existing category: ${category.name}`)
    }

    // 2. Create Quantity Group
    console.log('\n📊 Creating quantity group...')
    const quantityGroup = await prisma.quantityGroup.create({
      data: {
        name: 'Standard Print Quantities',
        description: 'Common printing quantities',
        values: '100,250,500,1000,2500',
        defaultValue: '250',
        sortOrder: 1,
        isActive: true,
      },
    })
    console.log(`✅ Created quantity group: ${quantityGroup.name}`)

    // 3. Create Size Group
    console.log('\n📐 Creating size group...')
    const sizeGroup = await prisma.sizeGroup.create({
      data: {
        name: 'Standard Print Sizes',
        description: 'Common printing sizes',
        values: '4x6,5x7,8.5x11,11x17',
        defaultValue: '8.5x11',
        sortOrder: 1,
        isActive: true,
      },
    })
    console.log(`✅ Created size group: ${sizeGroup.name}`)

    // 4. Create Paper Stocks first
    console.log('\n📄 Creating paper stocks...')
    const paperStock1 = await prisma.paperStock.create({
      data: {
        name: '100lb Gloss Text',
        weight: 100,
        weightUnit: 'lb',
        finish: 'Gloss',
        description: 'High-quality glossy paper',
        isActive: true,
      },
    })

    const paperStock2 = await prisma.paperStock.create({
      data: {
        name: '80lb Matte Cover',
        weight: 80,
        weightUnit: 'lb',
        finish: 'Matte',
        description: 'Professional matte finish',
        isActive: true,
      },
    })

    // 5. Create Paper Stock Set
    const paperStockSet = await prisma.paperStockSet.create({
      data: {
        name: 'Standard Paper Options',
        description: 'Common paper stocks for printing',
        isActive: true,
      },
    })

    // 6. Create Paper Stock Set Items
    await prisma.paperStockSetItem.create({
      data: {
        paperStockSetId: paperStockSet.id,
        paperStockId: paperStock1.id,
        isDefault: true,
        sortOrder: 1,
      },
    })

    await prisma.paperStockSetItem.create({
      data: {
        paperStockSetId: paperStockSet.id,
        paperStockId: paperStock2.id,
        isDefault: false,
        sortOrder: 2,
      },
    })

    console.log(`✅ Created paper stock set: ${paperStockSet.name} with 2 paper options`)

    // 7. Create the main product
    console.log('\n📦 Creating the main product...')
    const productData = {
      name: 'Professional Business Flyers',
      sku: `flyer-${Date.now()}`,
      slug: `professional-business-flyers-${Date.now()}`,
      description:
        'High-quality business flyers perfect for marketing and promotion. Available in multiple sizes with professional paper options.',
      shortDescription: 'Professional marketing flyers with custom sizes and premium paper options',
      basePrice: 25.0,
      setupFee: 10.0,
      productionTime: 3,
      isActive: true,
      isFeatured: true,
      categoryId: category.id,
    }

    const product = await prisma.product.create({
      data: productData,
      include: {
        productCategory: true,
      },
    })

    // 8. Link modules to product
    console.log('\n🔗 Linking modules to product...')

    // Link quantity group
    await prisma.productQuantityGroup.create({
      data: {
        productId: product.id,
        quantityGroupId: quantityGroup.id,
      },
    })

    // Link size group
    await prisma.productSizeGroup.create({
      data: {
        productId: product.id,
        sizeGroupId: sizeGroup.id,
      },
    })

    // Link paper stock set
    await prisma.productPaperStockSet.create({
      data: {
        productId: product.id,
        paperStockSetId: paperStockSet.id,
        isDefault: true,
      },
    })

    console.log('\n✅ PRODUCT CREATED SUCCESSFULLY!')
    console.log(`📦 Product: ${product.name}`)
    console.log(`🏷️  SKU: ${product.sku}`)
    console.log(`🗂️  Category: ${product.productCategory.name}`)
    console.log(`📊 Quantity Group: ${quantityGroup.name} (${quantityGroup.values})`)
    console.log(`📐 Size Group: ${sizeGroup.name} (${sizeGroup.values})`)
    console.log(`📄 Paper Stock Set: ${paperStockSet.name} (2 options)`)

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

createWorkingProduct().then((result) => {
  if (result.success) {
    console.log(`\n🎉 SUCCESS! Created product: ${result.product.name}`)
  } else {
    console.log(`\n💥 FAILED: ${result.error}`)
  }
})
