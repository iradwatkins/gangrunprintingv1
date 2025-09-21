import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPaperStockSets() {
  console.log('🌱 Seeding Paper Stock Sets...')

  try {
    // First, ensure we have paper stocks
    const paperStocks = await prisma.paperStock.findMany()
    console.log(`Found ${paperStocks.length} paper stocks`)

    // Create Paper Stock Sets
    const paperStockSets = [
      {
        name: 'Standard Cardstock Set',
        description: 'Premium cardstock options for business cards and postcards',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Premium Paper Set',
        description: 'High-quality paper options for marketing materials',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Economy Paper Set',
        description: 'Budget-friendly paper options',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Marketing Materials Set',
        description: 'Paper stocks ideal for flyers and brochures',
        isActive: true,
        sortOrder: 4,
      },
      {
        name: 'Large Format Set',
        description: 'Paper options for posters and banners',
        isActive: true,
        sortOrder: 5,
      },
      {
        name: 'Specialty Papers',
        description: 'Unique and textured paper options',
        isActive: true,
        sortOrder: 6,
      },
    ]

    // Create or update Paper Stock Sets
    for (const setData of paperStockSets) {
      const set = await prisma.paperStockSet.upsert({
        where: { name: setData.name },
        update: setData,
        create: setData,
      })
      console.log(`✅ Created/Updated Paper Stock Set: ${set.name}`)

      // Add some paper stocks to each set if available
      if (paperStocks.length > 0) {
        // Add first few paper stocks to this set
        const stocksToAdd = paperStocks.slice(0, 3)
        for (let i = 0; i < stocksToAdd.length; i++) {
          await prisma.paperStockSetItem.upsert({
            where: {
              paperStockSetId_paperStockId: {
                paperStockSetId: set.id,
                paperStockId: stocksToAdd[i].id,
              },
            },
            update: {
              sortOrder: i + 1,
            },
            create: {
              paperStockSetId: set.id,
              paperStockId: stocksToAdd[i].id,
              sortOrder: i + 1,
            },
          })
        }
        console.log(`  Added ${stocksToAdd.length} paper stocks to set`)
      }
    }

    console.log('✅ Paper Stock Sets seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding Paper Stock Sets:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  seedPaperStockSets()
    .then(() => {
      console.log('✨ Seed completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seed failed:', error)
      process.exit(1)
    })
    .finally(() => {
      prisma.$disconnect()
    })
}

export default seedPaperStockSets