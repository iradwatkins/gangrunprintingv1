import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateHoleDrillingPricing() {
  try {
    console.log('🔄 Updating Hole Drilling pricing model...\n')

    const addon = await prisma.addOn.findFirst({
      where: { name: 'Hole Drilling' },
    })

    if (!addon) {
      console.log('❌ Hole Drilling addon not found')
      return
    }

    // Update to simpler pricing model
    // Formula: $20 + ($0.02 × numberOfHoles × quantity)
    const updated = await prisma.addOn.update({
      where: { id: addon.id },
      data: {
        configuration: {
          baseFee: 20,
          perHolePerPieceRate: 0.02,
          // numberOfHoles comes from sub-option selection
          // Will need to extract number from selections like "3" or "3 Hole Binder Punch"
          holeCountMap: {
            '1': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '2 Hole Binder Punch': 2,
            '3 Hole Binder Punch': 3,
            '4 Hole Binder Punch': 4,
            '5 Hole Binder Punch': 5,
          },
        },
        adminNotes:
          'Hole drilling pricing: $20 + ($0.02 × numberOfHoles × quantity). Example: 500 pieces with 3 holes = $20 + ($0.02 × 3 × 500) = $50',
      },
    })

    console.log('✅ Hole Drilling pricing updated!')
    console.log('\nNew Configuration:')
    console.log(JSON.stringify(updated.configuration, null, 2))

    console.log('\n📋 Pricing Examples:')
    console.log('\nExample 1: 500 pieces, 1 hole')
    console.log('  $20 + ($0.02 × 1 × 500) = $20 + $10 = $30.00')

    console.log('\nExample 2: 1000 pieces, 3 holes')
    console.log('  $20 + ($0.02 × 3 × 1000) = $20 + $60 = $80.00')

    console.log('\nExample 3: 2500 pieces, 3 Hole Binder Punch (3 holes)')
    console.log('  $20 + ($0.02 × 3 × 2500) = $20 + $150 = $170.00')

    console.log('\nExample 4: 500 pieces, 5 holes')
    console.log('  $20 + ($0.02 × 5 × 500) = $20 + $50 = $70.00')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateHoleDrillingPricing()
