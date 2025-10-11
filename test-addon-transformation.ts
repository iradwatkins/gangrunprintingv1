import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testTransformation() {
  // Simulate the exact query from the configuration API
  const productAddOnSets = await prisma.productAddOnSet.findMany({
    where: { productId: '7d4b2f10-d026-4f11-b07c-13851d3cfeb9' },
    include: {
      AddOnSet: {
        include: {
          addOnSetItems: {
            include: { AddOn: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  console.log('Raw query result structure:')
  console.log('productAddOnSets.length:', productAddOnSets.length)

  if (productAddOnSets.length > 0) {
    const first = productAddOnSets[0]
    console.log('First set structure:')
    console.log('- Has AddOnSet:', Boolean(first.AddOnSet))
    console.log('- AddOnSet.name:', first.AddOnSet?.name)
    console.log('- AddOnSet.addOnSetItems length:', first.AddOnSet?.addOnSetItems?.length || 0)

    if (first.AddOnSet?.addOnSetItems?.length > 0) {
      const firstItem = first.AddOnSet.addOnSetItems[0]
      console.log('First item structure:')
      console.log('- Has AddOn:', Boolean(firstItem.AddOn))
      console.log('- AddOn.name:', firstItem.AddOn?.name)
      console.log('- displayPosition:', firstItem.displayPosition)
    }

    // Check second set (Design Services)
    if (productAddOnSets.length > 1) {
      const second = productAddOnSets[1]
      console.log('\nSecond set (Design Services):')
      console.log('- AddOnSet.name:', second.AddOnSet?.name)
      console.log('- AddOnSet.addOnSetItems length:', second.AddOnSet?.addOnSetItems?.length || 0)

      if (second.AddOnSet?.addOnSetItems?.length > 0) {
        const designItem = second.AddOnSet.addOnSetItems[0]
        console.log('Design item:')
        console.log('- AddOn.name:', designItem.AddOn?.name)
        console.log('- AddOn.pricingModel:', designItem.AddOn?.pricingModel)
        console.log('- displayPosition:', designItem.displayPosition)
      }
    }
  }

  await prisma.$disconnect()
}

testTransformation().catch(console.error)
