import { PrismaClient, DisplayPosition } from '@prisma/client'

const prisma = new PrismaClient()

async function configureAddonDisplayPositions() {
  try {
    // Get the Corner Rounding and Variable Data addons
    const cornerRounding = await prisma.addOn.findFirst({
      where: { name: 'Corner Rounding' },
    })

    const variableData = await prisma.addOn.findFirst({
      where: { name: 'Variable Data Printing' },
    })

    if (!cornerRounding || !variableData) {
      console.error('Missing required addons')
      return
    }

    // Get the Premium Business Card Add-ons set
    const premiumSet = await prisma.addOnSet.findFirst({
      where: { name: 'Premium Business Card Add-ons' },
    })

    if (!premiumSet) {
      console.error('Premium Business Card Add-ons set not found')
      return
    }

    // Add Corner Rounding with ABOVE_DROPDOWN position
    await prisma.addOnSetItem.upsert({
      where: {
        addOnSetId_addOnId: {
          addOnSetId: premiumSet.id,
          addOnId: cornerRounding.id,
        },
      },
      update: {
        displayPosition: 'ABOVE_DROPDOWN',
        sortOrder: 1,
      },
      create: {
        addOnSetId: premiumSet.id,
        addOnId: cornerRounding.id,
        displayPosition: 'ABOVE_DROPDOWN',
        sortOrder: 1,
      },
    })

    // Add Variable Data with BELOW_DROPDOWN position
    await prisma.addOnSetItem.upsert({
      where: {
        addOnSetId_addOnId: {
          addOnSetId: premiumSet.id,
          addOnId: variableData.id,
        },
      },
      update: {
        displayPosition: 'BELOW_DROPDOWN',
        sortOrder: 10,
      },
      create: {
        addOnSetId: premiumSet.id,
        addOnId: variableData.id,
        displayPosition: 'BELOW_DROPDOWN',
        sortOrder: 10,
      },
    })

    // Also add them to other relevant sets
    const marketingSet = await prisma.addOnSet.findFirst({
      where: { name: 'Marketing Materials Add-ons' },
    })

    if (marketingSet) {
      // Add Variable Data to Marketing Materials set
      await prisma.addOnSetItem.upsert({
        where: {
          addOnSetId_addOnId: {
            addOnSetId: marketingSet.id,
            addOnId: variableData.id,
          },
        },
        update: {
          displayPosition: 'BELOW_DROPDOWN',
          sortOrder: 10,
        },
        create: {
          addOnSetId: marketingSet.id,
          addOnId: variableData.id,
          displayPosition: 'BELOW_DROPDOWN',
          sortOrder: 10,
        },
      })
    }
  } catch (error) {
    console.error('Error configuring display positions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

configureAddonDisplayPositions()
