import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCornerRounding() {

  console.log('=' .repeat(60))

  try {
    // Check if Corner Rounding addon exists
    const cornerRounding = await prisma.addOn.findFirst({
      where: { name: 'Corner Rounding' }
    })

    if (!cornerRounding) {

    } else {

      console.log('Configuration:', JSON.stringify(cornerRounding.configuration, null, 2))

      // Check if it has the ROUNDED CORNERS conditional field
      const config = cornerRounding.configuration as any
      if (config?.conditionalFields?.cornerType) {

      } else {

      }

      // Check if it's connected to any AddOn Sets
      const setItems = await prisma.addOnSetItem.findMany({
        where: { addOnId: cornerRounding.id },
        include: { AddOnSet: true }
      })

      if (setItems.length > 0) {

        setItems.forEach(item => {

        })
      } else {

      }
    }

    // Also check for other addons from the restoration
    console.log('\n' + '=' .repeat(60))

    const expectedAddons = [
      'Corner Rounding',
      'Variable Data Printing',
      'Perforation',
      'Banding',
      'Foil Stamping',
      'Embossing',
      'Die Cutting',
      'Spot UV',
      'Raised Spot UV',
      'Letterpress',
      'Edge Painting',
      'Plastic Card',
      'Magnetic Strip',
      'Signature Strip',
      'Scratch-off Panel',
      'Folding',
      'Scoring',
      'Hole Drilling',
      'Shrink Wrapping'
    ]

    for (const name of expectedAddons) {
      const addon = await prisma.addOn.findFirst({ where: { name } })
      if (addon) {

      } else {

      }
    }

  } catch (error) {
    console.error('Error checking data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCornerRounding()