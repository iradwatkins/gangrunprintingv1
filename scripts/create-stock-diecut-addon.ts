import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createStockDiecutAddon() {
  try {
    console.log('🔧 Creating Stock Diecut addon...\n')

    // Create the Stock Diecut addon
    const stockDiecut = await prisma.addOn.create({
      data: {
        name: 'Stock Diecut',
        description:
          'Sharp specially shaped blades are used in die cutting to cut paper into a custom shape. We have several premade die shapes available to choose from.',
        tooltipText:
          'Sharp specially shaped blades are used in die cutting to cut paper into a custom shape. We have several premade die shapes available to choose from.',
        pricingModel: 'CUSTOM',
        configuration: {
          baseFee: 20,
          perPieceRate: 0.01,
          formula: '$20.00 + $0.01/piece',
        },
        additionalTurnaroundDays: 1,
        sortOrder: 19,
        isActive: true,
      },
    })

    console.log('✅ Created Stock Diecut addon:', stockDiecut.id)
    console.log('')

    // Test pricing calculation
    console.log('📊 Pricing examples:')
    const testQuantities = [100, 1000, 5000]
    testQuantities.forEach((qty) => {
      const price = 20 + 0.01 * qty
      console.log(`  ${qty} pieces = $${price.toFixed(2)}`)
    })

    console.log('')
    console.log('✅ Stock Diecut addon created successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Add this addon to an AddOnSet')
    console.log('2. Assign the AddOnSet to products')
    console.log('3. Test on product configuration page')
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createStockDiecutAddon()
