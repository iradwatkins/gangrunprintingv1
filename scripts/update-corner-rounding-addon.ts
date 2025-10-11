import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCornerRounding() {
  try {
    console.log('🔄 Updating Corner Rounding addon...\n')

    // Find the Corner Rounding addon
    const addon = await prisma.addOn.findFirst({
      where: {
        name: 'Corner Rounding',
      },
    })

    if (!addon) {
      console.log('❌ Corner Rounding addon not found')
      return
    }

    // Update the addon with correct pricing and tooltip
    const updated = await prisma.addOn.update({
      where: {
        id: addon.id,
      },
      data: {
        description:
          'Corner Rounding is an option that will remove the sharp corners on your print job and add a 1/4 inch radius to business cards and a 3/16 inch radius to all other products.',
        tooltipText:
          '$20.00 + $.01/piece - Corner Rounding is an option that will remove the sharp corners on your print job and add a 1/4 inch radius to business cards and a 3/16 inch radius to all other products.',
        pricingModel: 'CUSTOM',
        configuration: {
          baseFee: 20,
          perPieceRate: 0.01,
        },
      },
    })

    console.log('✅ Corner Rounding addon updated successfully:')
    console.log(JSON.stringify(updated, null, 2))

    // Update the sub-option tooltip
    const subOption = await prisma.addOnSubOption.findFirst({
      where: {
        addOnId: addon.id,
        name: 'Rounded Corners',
      },
    })

    if (subOption) {
      const updatedSubOption = await prisma.addOnSubOption.update({
        where: {
          id: subOption.id,
        },
        data: {
          tooltipText: 'Select the type of corner rounding for your order.',
        },
      })

      console.log('\n✅ Sub-option updated:')
      console.log(JSON.stringify(updatedSubOption, null, 2))
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCornerRounding()
