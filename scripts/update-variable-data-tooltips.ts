import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateVariableDataTooltips() {
  try {
    console.log('🔄 Updating Variable Data tooltips...\n')

    const addon = await prisma.addOn.findFirst({
      where: { name: 'Variable Data' },
      include: { addOnSubOptions: true },
    })

    if (!addon) {
      console.log('❌ Variable Data addon not found')
      return
    }

    // Update main addon tooltip
    const updatedAddon = await prisma.addOn.update({
      where: { id: addon.id },
      data: {
        tooltipText:
          '$60.00 + $.02/piece - Select this option if you need your order to have a unique name, number, or word on each card.',
      },
    })

    console.log('✅ Main addon tooltip updated:')
    console.log(`   Old: ${addon.tooltipText}`)
    console.log(`   New: ${updatedAddon.tooltipText}`)

    // Update "Number of Locations" sub-option
    const locationsCountSubOption = addon.addOnSubOptions.find(
      (so) => so.name === 'Number of Locations'
    )

    if (locationsCountSubOption) {
      await prisma.addOnSubOption.update({
        where: { id: locationsCountSubOption.id },
        data: {
          tooltipText:
            'Enter the number of variables you are going to have on each piece. If only a first name for example, this number should be 1.',
        },
      })
      console.log('\n✅ "Number of Locations" tooltip updated')
    }

    // Update "Location Details" sub-option
    const locationDetailsSubOption = addon.addOnSubOptions.find(
      (so) => so.name === 'Location Details'
    )

    if (locationDetailsSubOption) {
      await prisma.addOnSubOption.update({
        where: { id: locationDetailsSubOption.id },
        data: {
          tooltipText:
            'Enter the location(s) or word(s) that will be replaced with variable words.',
        },
      })
      console.log('✅ "Location Details" tooltip updated')
    }

    console.log('\n✅ All Variable Data tooltips updated successfully!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateVariableDataTooltips()
