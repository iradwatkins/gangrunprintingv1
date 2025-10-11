import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixShrinkWrappingAddon() {
  try {
    console.log('🔧 Fixing Shrink Wrapping addon...\n')

    // Find the Shrink Wrapping addon
    const addon = await prisma.addOn.findFirst({
      where: { name: 'Shrink Wrapping' },
    })

    if (!addon) {
      throw new Error('Shrink Wrapping addon not found')
    }

    console.log('Found Shrink Wrapping addon:', addon.id)

    // Update with correct pricing: $0.30/bundle
    await prisma.addOn.update({
      where: { id: addon.id },
      data: {
        pricingModel: 'CUSTOM',
        tooltipText:
          'Have your product bundled in specific individual quantity packages with plastic wrap. Please choose the amount you would like in each bundle.',
        configuration: {
          type: 'shrinkWrapping',
          unitType: 'bundle',
          perBundleRate: 0.3,
          defaultItemsPerBundle: 25,
          formula: 'Math.ceil(quantity / itemsPerBundle) × $0.30',
        },
      },
    })

    // Update sub-option tooltip
    const subOption = await prisma.addOnSubOption.findFirst({
      where: {
        addOnId: addon.id,
        name: 'Items/Bundle',
      },
    })

    if (subOption) {
      await prisma.addOnSubOption.update({
        where: { id: subOption.id },
        data: {
          tooltipText:
            'Please enter the amount you want in each bundle. If you ordered 5000 quantity and entered 50, you would get 100 bundles.',
        },
      })
    }

    console.log('✅ Updated Shrink Wrapping addon')

    // Test calculation
    console.log('\n📊 Testing calculation:')
    console.log('5000 pieces ÷ 50/bundle = 100 bundles × $0.30 = $30.00')
    console.log('1000 pieces ÷ 25/bundle = 40 bundles × $0.30 = $12.00')
    console.log('100 pieces ÷ 25/bundle = 4 bundles × $0.30 = $1.20')

    const tests = [
      { qty: 5000, bundle: 50 },
      { qty: 1000, bundle: 25 },
      { qty: 100, bundle: 25 },
    ]

    tests.forEach(({ qty, bundle }) => {
      const bundles = Math.ceil(qty / bundle)
      const price = bundles * 0.3
      console.log(
        `${qty} pieces ÷ ${bundle}/bundle = ${bundles} bundles × $0.30 = $${price.toFixed(2)}`
      )
    })
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixShrinkWrappingAddon()
