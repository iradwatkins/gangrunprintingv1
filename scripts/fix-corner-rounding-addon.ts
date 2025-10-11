import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCornerRoundingAddon() {
  try {
    console.log('🔧 Fixing Corner Rounding addon...\n')

    // Find the Corner Rounding addon
    const addon = await prisma.addOn.findFirst({
      where: { name: 'Corner Rounding' },
    })

    if (!addon) {
      throw new Error('Corner Rounding addon not found')
    }

    console.log('Found Corner Rounding addon:', addon.id)

    // Update with correct pricing: $20.00 + $0.01/piece
    await prisma.addOn.update({
      where: { id: addon.id },
      data: {
        pricingModel: 'CUSTOM',
        tooltipText:
          'Corner Rounding is an option that will remove the sharp corners on your print job and add a 1/4 inch radius to business cards and a 3/16 inch radius to all other products.',
        configuration: {
          baseFee: 20,
          perPieceRate: 0.01,
          formula: '$20.00 + $0.01/piece',
        },
      },
    })

    // Delete existing sub-options
    await prisma.addOnSubOption.deleteMany({
      where: { addOnId: addon.id },
    })

    // Create the Rounded Corners sub-option with all options
    await prisma.addOnSubOption.create({
      data: {
        addOnId: addon.id,
        name: 'Rounded Corners',
        optionType: 'SELECT',
        isRequired: true,
        affectsPricing: false,
        defaultValue: 'All Four',
        tooltipText: 'Select the type of corner rounding for your order.',
        options: [
          '-- Select One --',
          'All Four',
          'Top Two',
          'Bottom Two',
          'Left Two',
          'Right Two',
          'Top Left',
          'Top Right',
          'Bottom Left',
          'Bottom Right',
          'Top Left & Bottom Right',
          'Top Right & Bottom Left',
        ],
      },
    })

    console.log('✅ Updated Corner Rounding addon')

    // Test calculation
    console.log('\n📊 Testing calculation:')
    const testQuantities = [100, 1000, 5000]
    testQuantities.forEach((qty) => {
      const price = 20 + 0.01 * qty
      console.log(`${qty} pieces = $${price.toFixed(2)}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixCornerRoundingAddon()
