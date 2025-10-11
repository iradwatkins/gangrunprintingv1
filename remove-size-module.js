const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeSizeModule() {
  console.log('🔧 Removing Size Module from Quantity-Only Product...\n')

  try {
    const productId = 'cmg56rdeg0001n072z3r9txs9'

    // Remove size module from the product
    const deletedConnections = await prisma.productSizeGroup.deleteMany({
      where: {
        productId: productId,
      },
    })

    console.log(`✅ Removed ${deletedConnections.count} size group connections`)

    // Verify the product is back to quantity-only
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

    console.log('\n📦 RESTORED MODULE CONFIGURATION:')
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
      '❌ Size Module:',
      updatedProduct.productSizeGroups.length > 0 ? 'ENABLED' : 'DISABLED (Correct!)'
    )
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

    console.log('\n🎯 PRODUCT IS NOW: QUANTITY-ONLY (as intended)')
    console.log('This keeps our modules separate and independent!')

    return { success: true }
  } catch (error) {
    console.error('❌ Error removing size module:', error.message)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the removal
removeSizeModule()
  .then((result) => {
    if (result.success) {
      console.log('\n🏆 SIZE MODULE REMOVED - QUANTITY MODULE REMAINS INDEPENDENT!')
    } else {
      console.error('\n❌ Failed to remove size module')
      process.exit(1)
    }
  })
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
