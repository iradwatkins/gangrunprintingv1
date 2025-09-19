import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupPaperRelationships() {
  console.log('🔧 Setting up paper stock relationships with coatings and sides...\n')

  try {
    // Get all paper stocks
    const paperStocks = await prisma.paperStock.findMany()
    const coatings = await prisma.coatingOption.findMany()
    const sidesOptions = await prisma.sidesOption.findMany()

    console.log(`Found ${paperStocks.length} paper stocks`)
    console.log(`Found ${coatings.length} coating options`)
    console.log(`Found ${sidesOptions.length} sides options\n`)

    // For each paper stock, create relationships
    for (const paperStock of paperStocks) {
      console.log(`📄 Configuring: ${paperStock.name}`)

      // Check existing relationships
      const existingCoatings = await prisma.paperStockCoating.count({
        where: { paperStockId: paperStock.id }
      })

      const existingSides = await prisma.paperStockSides.count({
        where: { paperStockId: paperStock.id }
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
              isDefault: i === 0 // First coating as default
            }
          })
        }
        console.log(`   ✅ Added ${coatings.length - 1} coating options`)
      } else {
        console.log(`   ⏭️  Already has ${existingCoatings} coating options`)
      }

      // Add sides relationships if none exist
      if (existingSides === 0) {
        // Add all sides options to this paper stock
        for (let i = 0; i < sidesOptions.length; i++) {
          const side = sidesOptions[i]

          // Skip test/invalid sides
          if (side.name === 'shsdghas') continue

          const priceMultiplier =
            side.name.includes('Both Sides') ? 1.5 :
            side.name.includes('Front Only') ? 1.0 :
            side.name.includes('Different') ? 1.75 : 1.25

          await prisma.paperStockSides.create({
            data: {
              paperStockId: paperStock.id,
              sidesOptionId: side.id,
              priceMultiplier,
              isEnabled: true
            }
          })
        }
        console.log(`   ✅ Added ${sidesOptions.length - 1} sides options`)
      } else {
        console.log(`   ⏭️  Already has ${existingSides} sides options`)
      }
    }

    // Verify relationships
    console.log('\n📊 Verification:')
    for (const paperStock of paperStocks) {
      const coatingCount = await prisma.paperStockCoating.count({
        where: { paperStockId: paperStock.id }
      })
      const sidesCount = await prisma.paperStockSides.count({
        where: { paperStockId: paperStock.id }
      })

      console.log(`${paperStock.name}: ${coatingCount} coatings, ${sidesCount} sides`)
    }

    console.log('\n✅ Paper stock relationships configured successfully!')

  } catch (error) {
    console.error('❌ Error setting up relationships:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
setupPaperRelationships()