import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateBandingTooltip() {
  try {
    console.log('🔄 Updating Banding addon tooltip...\n')

    const addon = await prisma.addOn.findFirst({
      where: { name: 'Banding' },
    })

    if (!addon) {
      console.log('❌ Banding addon not found')
      return
    }

    // Update the tooltip to match specifications
    const updated = await prisma.addOn.update({
      where: { id: addon.id },
      data: {
        tooltipText:
          '$.75/bundle - Have your product bundled in specific individual quantity groups with paper bands or rubber bands. Please choose the amount you would like in each bundle.',
      },
    })

    console.log('✅ Banding addon tooltip updated:')
    console.log(`   Old: ${addon.tooltipText}`)
    console.log(`   New: ${updated.tooltipText}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateBandingTooltip()
