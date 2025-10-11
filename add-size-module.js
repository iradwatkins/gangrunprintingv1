const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addSizeModule() {
  console.log('🔧 Adding Size Module to Quantity-Only Product...\n')

  try {
    const productId = 'cmg56rdeg0001n072z3r9txs9'

    // First, check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productSizeGroups: {
          include: {
            SizeGroup: true,
          },
        },
      },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    console.log('✅ PRODUCT FOUND:', product.name)
    console.log('Current Size Groups:', product.productSizeGroups.length)

    // Get available size groups
    const sizeGroups = await prisma.sizeGroup.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    if (sizeGroups.length === 0) {
      throw new Error('No size groups found')
    }

    console.log(`\n📏 AVAILABLE SIZE GROUPS:`)
    sizeGroups.forEach((sg, i) => {
      console.log(`${i + 1}. ${sg.name} - Values: ${sg.values} (Default: ${sg.defaultValue})`)
    })

    // Use the first size group
    const selectedSizeGroup = sizeGroups[0]
    console.log(`\n🎯 SELECTED: ${selectedSizeGroup.name}`)

    // Check if already has this size group
    const existingConnection = await prisma.productSizeGroup.findFirst({
      where: {
        productId: productId,
        sizeGroupId: selectedSizeGroup.id,
      },
    })

    if (existingConnection) {
      console.log('⚠️  Size group already connected to product')
    } else {
      // Add the size group to the product
      await prisma.productSizeGroup.create({
        data: {
          productId: productId,
          sizeGroupId: selectedSizeGroup.id,
        },
      })

      console.log('✅ Size group added to product!')
    }

    // Verify the connection
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
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
        productPaperStockSets: true,
        productAddOnSets: true,
        productTurnaroundTimeSets: true,
      },
    })

    console.log('\n📦 UPDATED MODULE CONFIGURATION:')
    console.log('=====================================')
    console.log(
      '✅ Quantity Module:',
      updatedProduct.productQuantityGroups.length > 0 ? 'ENABLED' : 'DISABLED'
    )
    if (updatedProduct.productQuantityGroups.length > 0) {
      const qg = updatedProduct.productQuantityGroups[0].QuantityGroup
      console.log('   - Quantities:', qg.values.split(',').length)
    }

    console.log(
      '✅ Size Module:',
      updatedProduct.productSizeGroups.length > 0 ? 'ENABLED' : 'DISABLED'
    )
    if (updatedProduct.productSizeGroups.length > 0) {
      const sg = updatedProduct.productSizeGroups[0].SizeGroup
      console.log('   - Sizes:', sg.values)
      console.log('   - Default:', sg.defaultValue)
    }

    console.log(
      '❌ Paper Stock Module:',
      updatedProduct.productPaperStockSets.length > 0 ? 'ENABLED' : 'DISABLED (Correct!)'
    )
    console.log(
      '❌ Add-On Module:',
      updatedProduct.productAddOnSets.length > 0 ? 'ENABLED' : 'DISABLED (Correct!)'
    )
    console.log(
      '❌ Turnaround Module:',
      updatedProduct.productTurnaroundTimeSets.length > 0 ? 'ENABLED' : 'DISABLED (Correct!)'
    )

    console.log('\n🎯 PRODUCT NOW HAS: QUANTITY + SIZE MODULES')
    console.log('This demonstrates modular architecture - we can add/remove modules independently!')

    return { success: true, updatedProduct }
  } catch (error) {
    console.error('❌ Error adding size module:', error.message)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
addSizeModule()
  .then((result) => {
    if (result.success) {
      console.log('\n🏆 SIZE MODULE ADDED SUCCESSFULLY!')
      console.log(
        'Product URL: https://gangrunprinting.com/products/business-cards-quantity-only-test-1759153813144'
      )
    } else {
      console.error('\n❌ Failed to add size module')
      process.exit(1)
    }
  })
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
