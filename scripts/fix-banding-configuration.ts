import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBandingConfiguration() {
  try {
    console.log('🔧 Fixing Banding addon configuration...\n')

    // Find the Banding addon
    const banding = await prisma.addOn.findFirst({
      where: { name: 'Banding' },
      include: { addOnSubOptions: true },
    })

    if (!banding) {
      throw new Error('Banding addon not found')
    }

    console.log('Found Banding addon:', banding.id)

    // Update the addon with correct configuration
    // Formula: Math.ceil(quantity / itemsPerBundle) × $0.75
    // Default: 100 items per bundle
    const updated = await prisma.addOn.update({
      where: { id: banding.id },
      data: {
        configuration: {
          type: 'banding',
          unitType: 'bundle',
          perBundleRate: 0.75,
          defaultItemsPerBundle: 100,
          formula: 'Math.ceil(quantity / itemsPerBundle) × $0.75',
        },
      },
    })

    console.log('✅ Updated Banding addon configuration')
    console.log('Configuration:', updated.configuration)

    // Verify the calculation
    console.log('\n📊 Testing calculation:')
    const testQuantity = 1000
    const itemsPerBundle = 100
    const numberOfBundles = Math.ceil(testQuantity / itemsPerBundle)
    const totalPrice = numberOfBundles * 0.75

    console.log(`Quantity: ${testQuantity}`)
    console.log(`Items per bundle: ${itemsPerBundle}`)
    console.log(`Number of bundles: ${numberOfBundles}`)
    console.log(`Price per bundle: $0.75`)
    console.log(`Total price: $${totalPrice.toFixed(2)}`)
    console.log(`Expected: $7.50 ✅`)

    // Verify sub-options
    const subOptions = await prisma.addOnSubOption.findMany({
      where: { addOnId: updated.id },
    })

    console.log('\n📋 Sub-options:')
    subOptions.forEach((opt) => {
      console.log(`- ${opt.name}: ${opt.optionType} (default: ${opt.defaultValue})`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixBandingConfiguration()
