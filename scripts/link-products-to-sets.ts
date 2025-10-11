import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function linkProductsToSets() {
  try {
    // Get all products
    const products = await prisma.product.findMany()

    // Get relevant sets
    const paperStockSets = await prisma.paperStockSet.findMany()
    const addOnSets = await prisma.addOnSet.findMany()
    const turnaroundSets = await prisma.turnaroundTimeSet.findMany()

    for (const product of products) {
      // Link appropriate Paper Stock Set based on product type
      if (product.name.includes('Business Card')) {
        const standardSet = paperStockSets.find((s) => s.name === 'Standard Cardstock Set')
        if (standardSet) {
          await prisma.productPaperStockSet.upsert({
            where: {
              productId_paperStockSetId: {
                productId: product.id,
                paperStockSetId: standardSet.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              paperStockSetId: standardSet.id,
            },
          })
        }

        // Link to Premium Business Card Add-ons
        const premiumAddons = addOnSets.find((s) => s.name === 'Premium Business Card Add-ons')
        if (premiumAddons) {
          await prisma.productAddOnSet.upsert({
            where: {
              productId_addOnSetId: {
                productId: product.id,
                addOnSetId: premiumAddons.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              addOnSetId: premiumAddons.id,
            },
          })
        }

        // Link to Business Card Turnaround
        const bcTurnaround = turnaroundSets.find((s) => s.name === 'Business Card Turnaround')
        if (bcTurnaround) {
          await prisma.productTurnaroundTimeSet.upsert({
            where: {
              productId_turnaroundTimeSetId: {
                productId: product.id,
                turnaroundTimeSetId: bcTurnaround.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              turnaroundTimeSetId: bcTurnaround.id,
            },
          })
        }
      } else if (product.name.includes('Flyer')) {
        const marketingSet = paperStockSets.find((s) => s.name === 'Marketing Materials Set')
        if (marketingSet) {
          await prisma.productPaperStockSet.upsert({
            where: {
              productId_paperStockSetId: {
                productId: product.id,
                paperStockSetId: marketingSet.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              paperStockSetId: marketingSet.id,
            },
          })
        }

        // Link to Marketing Materials Add-ons
        const marketingAddons = addOnSets.find((s) => s.name === 'Marketing Materials Add-ons')
        if (marketingAddons) {
          await prisma.productAddOnSet.upsert({
            where: {
              productId_addOnSetId: {
                productId: product.id,
                addOnSetId: marketingAddons.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              addOnSetId: marketingAddons.id,
            },
          })
        }

        // Link to Marketing Materials Turnaround
        const marketingTurnaround = turnaroundSets.find(
          (s) => s.name === 'Marketing Materials Turnaround'
        )
        if (marketingTurnaround) {
          await prisma.productTurnaroundTimeSet.upsert({
            where: {
              productId_turnaroundTimeSetId: {
                productId: product.id,
                turnaroundTimeSetId: marketingTurnaround.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              turnaroundTimeSetId: marketingTurnaround.id,
            },
          })
        }
      } else if (product.name.includes('Poster')) {
        const largeFormatSet = paperStockSets.find((s) => s.name === 'Large Format Set')
        if (largeFormatSet) {
          await prisma.productPaperStockSet.upsert({
            where: {
              productId_paperStockSetId: {
                productId: product.id,
                paperStockSetId: largeFormatSet.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              paperStockSetId: largeFormatSet.id,
            },
          })
        }

        // Link to Large Format Add-ons
        const largeAddons = addOnSets.find((s) => s.name === 'Large Format Add-ons')
        if (largeAddons) {
          await prisma.productAddOnSet.upsert({
            where: {
              productId_addOnSetId: {
                productId: product.id,
                addOnSetId: largeAddons.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              addOnSetId: largeAddons.id,
            },
          })
        }

        // Link to Large Format Turnaround
        const largeTurnaround = turnaroundSets.find((s) => s.name === 'Large Format Turnaround')
        if (largeTurnaround) {
          await prisma.productTurnaroundTimeSet.upsert({
            where: {
              productId_turnaroundTimeSetId: {
                productId: product.id,
                turnaroundTimeSetId: largeTurnaround.id,
              },
            },
            update: {},
            create: {
              productId: product.id,
              turnaroundTimeSetId: largeTurnaround.id,
            },
          })
        }
      }
    }
  } catch (error) {
    console.error('Error linking products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

linkProductsToSets()
