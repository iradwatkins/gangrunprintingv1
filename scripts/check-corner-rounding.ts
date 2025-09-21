import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCornerRounding() {
  console.log('🔍 Checking for Corner Rounding addon in database...')
  console.log('=' .repeat(60))

  try {
    // Check if Corner Rounding addon exists
    const cornerRounding = await prisma.addOn.findFirst({
      where: { name: 'Corner Rounding' }
    })

    if (!cornerRounding) {
      console.log('❌ Corner Rounding addon NOT FOUND in database!')
      console.log('This is the missing data that needs to be restored.')
    } else {
      console.log('✅ Corner Rounding addon found!')
      console.log('ID:', cornerRounding.id)
      console.log('Active:', cornerRounding.isActive)
      console.log('Configuration:', JSON.stringify(cornerRounding.configuration, null, 2))

      // Check if it has the ROUNDED CORNERS conditional field
      const config = cornerRounding.configuration as any
      if (config?.conditionalFields?.cornerType) {
        console.log('\n✅ ROUNDED CORNERS field exists:')
        console.log('Label:', config.conditionalFields.cornerType.label)
        console.log('Options:', config.conditionalFields.cornerType.options)
      } else {
        console.log('\n❌ ROUNDED CORNERS conditional field is MISSING!')
      }

      // Check if it's connected to any AddOn Sets
      const setItems = await prisma.addOnSetItem.findMany({
        where: { addOnId: cornerRounding.id },
        include: { AddOnSet: true }
      })

      if (setItems.length > 0) {
        console.log('\n📦 Connected to AddOn Sets:')
        setItems.forEach(item => {
          console.log(`  - ${item.AddOnSet.name} (Position: ${item.displayPosition})`)
        })
      } else {
        console.log('\n⚠️ Not connected to any AddOn Sets')
      }
    }

    // Also check for other addons from the restoration
    console.log('\n' + '=' .repeat(60))
    console.log('Checking other restored addons...')

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
        console.log(`✅ ${name}`)
      } else {
        console.log(`❌ ${name} - MISSING`)
      }
    }

  } catch (error) {
    console.error('Error checking data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCornerRounding()