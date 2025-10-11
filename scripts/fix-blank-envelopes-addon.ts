import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixBlankEnvelopesAddon() {
  try {
    console.log('🔧 Fixing Blank Envelopes addon...\n')

    // Find the Blank Envelopes addon
    const addon = await prisma.addOn.findFirst({
      where: { name: 'Blank Envelopes' },
    })

    if (!addon) {
      throw new Error('Blank Envelopes addon not found')
    }

    console.log('Found Blank Envelopes addon:', addon.id)

    // Update with correct pricing: $0.25/piece (all sizes)
    await prisma.addOn.update({
      where: { id: addon.id },
      data: {
        pricingModel: 'CUSTOM',
        configuration: {
          baseFee: 0,
          perPieceRate: 0.25,
          formula: '$0.25/piece',
        },
      },
    })

    console.log('✅ Updated Blank Envelopes addon')

    // Test calculation
    console.log('\n📊 Testing calculation:')
    const testQuantities = [100, 500, 1000]
    testQuantities.forEach((qty) => {
      const price = qty * 0.25
      console.log(`${qty} pieces = $${price.toFixed(2)}`)
    })
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixBlankEnvelopesAddon()
