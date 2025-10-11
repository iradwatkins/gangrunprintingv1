import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupPaperRelationships() {
  try {
    // Get all paper stocks
    const paperStocks = await prisma.paperStock.findMany()
    const coatings = await prisma.coatingOption.findMany()
    const sidesOptions = await prisma.sidesOption.findMany()

    // For each paper stock, create relationships
    for (const paperStock of paperStocks) {
      // Check existing relationships
      const existingCoatings = await prisma.paperStockCoating.count({
        where: { paperStockId: paperStock.id },
      })

      const existingSides = await prisma.paperStockSides.count({
        where: { paperStockId: paperStock.id },
      })

      // Add coating relationships if none exist
      if (existingCoatings === 0) {
        // Add all coating options to this paper stock
        for (let i = 0; i < coatings.length; i++) {
          const coating = coatings[i]

          // Skip test/invalid coatings
          if (coating.name === 'vbabsadasd') continue

          await prisma.paperStockCoating.create({
            data: {
              paperStockId: paperStock.id,
              coatingId: coating.id,
              isDefault: i === 0, // First coating as default
            },
          })
        }
      } else {
      }

      // Add sides relationships if none exist
      if (existingSides === 0) {
        // Add all sides options to this paper stock
        for (let i = 0; i < sidesOptions.length; i++) {
          const side = sidesOptions[i]

          // Skip test/invalid sides
          if (side.name === 'shsdghas') continue

          const priceMultiplier = side.name.includes('Both Sides')
            ? 1.5
            : side.name.includes('Front Only')
              ? 1.0
              : side.name.includes('Different')
                ? 1.75
                : 1.25

          await prisma.paperStockSides.create({
            data: {
              paperStockId: paperStock.id,
              sidesOptionId: side.id,
              priceMultiplier,
              isEnabled: true,
            },
          })
        }
      } else {
      }
    }

    // Verify relationships

    for (const paperStock of paperStocks) {
      const coatingCount = await prisma.paperStockCoating.count({
        where: { paperStockId: paperStock.id },
      })
      const sidesCount = await prisma.paperStockSides.count({
        where: { paperStockId: paperStock.id },
      })
    }
  } catch (error) {
    console.error('❌ Error setting up relationships:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
setupPaperRelationships()
