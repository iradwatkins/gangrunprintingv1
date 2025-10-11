const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function populatePaperStockData() {
  console.log('Starting to populate paper stock data...')

  try {
    // Create coating options
    const coatingOptions = [
      {
        name: 'No Coating',
        description: 'Uncoated paper with natural texture',
      },
      {
        name: 'Gloss Coating',
        description: 'High-gloss finish for vibrant colors',
      },
      {
        name: 'Matte Coating',
        description: 'Non-reflective smooth finish',
      },
      {
        name: 'Satin Coating',
        description: 'Semi-gloss finish between matte and gloss',
      },
      {
        name: 'UV Coating',
        description: 'Ultra-violet coating for extra protection and shine',
      },
    ]

    console.log('Creating coating options...')
    for (const coating of coatingOptions) {
      try {
        await prisma.coatingOption.create({
          data: {
            id: `coating_${coating.name.toLowerCase().replace(/\s+/g, '_')}`,
            name: coating.name,
            description: coating.description,
            updatedAt: new Date(),
          },
        })
        console.log(`Created coating: ${coating.name}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Coating ${coating.name} already exists, skipping...`)
        } else {
          throw error
        }
      }
    }

    // Create sides options
    const sidesOptions = [
      {
        name: 'Single Side',
        code: '1S',
        description: 'Printing on one side only',
      },
      {
        name: 'Double Sided',
        code: '2S',
        description: 'Printing on both sides',
      },
      {
        name: 'Front Only',
        code: 'FRONT',
        description: 'Front side printing only',
      },
      {
        name: 'Back Only',
        code: 'BACK',
        description: 'Back side printing only',
      },
    ]

    console.log('Creating sides options...')
    for (const sides of sidesOptions) {
      try {
        await prisma.sidesOption.create({
          data: {
            id: `sides_${sides.code.toLowerCase()}`,
            name: sides.name,
            code: sides.code,
            description: sides.description,
            updatedAt: new Date(),
          },
        })
        console.log(`Created sides option: ${sides.name} (${sides.code})`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Sides option ${sides.name} already exists, skipping...`)
        } else {
          throw error
        }
      }
    }

    // Get created options for relationships
    const coatings = await prisma.coatingOption.findMany()
    const sides = await prisma.sidesOption.findMany()

    // Create paper stocks
    const paperStocks = [
      {
        name: '16pt C2S Cardstock',
        weight: 0.0035,
        pricePerSqInch: 0.0045,
        tooltipText: 'Premium coated cardstock, ideal for business cards and postcards',
        isActive: true,
        coatings: ['gloss_coating', 'matte_coating', 'uv_coating'],
        defaultCoating: 'gloss_coating',
        sides: ['1s', '2s'],
        sidesMultipliers: { '1s': 1.0, '2s': 1.75 },
      },
      {
        name: '14pt C2S Cardstock',
        weight: 0.003,
        pricePerSqInch: 0.0035,
        tooltipText: 'Medium weight coated cardstock for various marketing materials',
        isActive: true,
        coatings: ['gloss_coating', 'matte_coating', 'satin_coating'],
        defaultCoating: 'matte_coating',
        sides: ['1s', '2s'],
        sidesMultipliers: { '1s': 1.0, '2s': 1.75 },
      },
      {
        name: '100lb Text Uncoated',
        weight: 0.0025,
        pricePerSqInch: 0.003,
        tooltipText: 'Natural uncoated paper for letterheads and stationery',
        isActive: true,
        coatings: ['no_coating'],
        defaultCoating: 'no_coating',
        sides: ['1s', '2s', 'front', 'back'],
        sidesMultipliers: { '1s': 1.0, '2s': 1.5, front: 1.0, back: 1.0 },
      },
      {
        name: '80lb Cover Stock',
        weight: 0.0028,
        pricePerSqInch: 0.0032,
        tooltipText: 'Versatile cover stock for brochures and presentations',
        isActive: true,
        coatings: ['gloss_coating', 'matte_coating', 'no_coating'],
        defaultCoating: 'gloss_coating',
        sides: ['1s', '2s'],
        sidesMultipliers: { '1s': 1.0, '2s': 1.6 },
      },
      {
        name: '20pt Ultra Board',
        weight: 0.0055,
        pricePerSqInch: 0.0065,
        tooltipText: 'Ultra-thick premium board for luxury business cards',
        isActive: true,
        coatings: ['matte_coating', 'satin_coating', 'uv_coating'],
        defaultCoating: 'satin_coating',
        sides: ['1s', '2s'],
        sidesMultipliers: { '1s': 1.0, '2s': 2.0 },
      },
      {
        name: '12pt Gloss Cover',
        weight: 0.0022,
        pricePerSqInch: 0.0025,
        tooltipText: 'Lightweight glossy stock for flyers and inserts',
        isActive: true,
        coatings: ['gloss_coating'],
        defaultCoating: 'gloss_coating',
        sides: ['1s', '2s'],
        sidesMultipliers: { '1s': 1.0, '2s': 1.4 },
      },
    ]

    console.log('Creating paper stocks...')
    const createdStocks = []
    for (const stock of paperStocks) {
      try {
        // Find coating and sides by their IDs/names
        const stockCoatings = coatings.filter(
          (c) =>
            stock.coatings.includes(c.id) ||
            stock.coatings.includes(c.name.toLowerCase().replace(/\s+/g, '_'))
        )
        const stockSides = sides.filter(
          (s) => stock.sides.includes(s.id) || stock.sides.includes(s.code.toLowerCase())
        )

        const paperStock = await prisma.paperStock.create({
          data: {
            id: `paper_${stock.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: stock.name,
            weight: stock.weight,
            pricePerSqInch: stock.pricePerSqInch,
            tooltipText: stock.tooltipText,
            isActive: stock.isActive,
            updatedAt: new Date(),
            paperStockCoatings: {
              create: stockCoatings.map((coating) => ({
                coatingId: coating.id,
                isDefault:
                  coating.id === stock.defaultCoating ||
                  coating.name.toLowerCase().replace(/\s+/g, '_') === stock.defaultCoating,
              })),
            },
            paperStockSides: {
              create: stockSides.map((side) => ({
                sidesOptionId: side.id,
                priceMultiplier:
                  stock.sidesMultipliers[side.id] ||
                  stock.sidesMultipliers[side.code.toLowerCase()] ||
                  1.0,
                isEnabled: true,
              })),
            },
          },
        })

        createdStocks.push(paperStock)
        console.log(`Created paper stock: ${stock.name}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Paper stock ${stock.name} already exists, skipping...`)
        } else {
          console.error(`Error creating paper stock ${stock.name}:`, error)
        }
      }
    }

    // Create paper stock sets (groups)
    const paperStockSets = [
      {
        name: 'Business Card Papers',
        description: 'Premium paper options for business cards',
        paperStocks: ['16pt C2S Cardstock', '14pt C2S Cardstock', '20pt Ultra Board'],
        defaultStock: '16pt C2S Cardstock',
      },
      {
        name: 'Flyer & Poster Papers',
        description: 'Lightweight options for flyers and posters',
        paperStocks: ['12pt Gloss Cover', '14pt C2S Cardstock', '80lb Cover Stock'],
        defaultStock: '12pt Gloss Cover',
      },
      {
        name: 'Stationery Papers',
        description: 'Professional paper for letterheads and stationery',
        paperStocks: ['100lb Text Uncoated', '80lb Cover Stock'],
        defaultStock: '100lb Text Uncoated',
      },
      {
        name: 'Premium Collection',
        description: 'High-end paper stocks for luxury projects',
        paperStocks: ['20pt Ultra Board', '16pt C2S Cardstock'],
        defaultStock: '20pt Ultra Board',
      },
    ]

    console.log('Creating paper stock sets...')
    for (const [index, set] of paperStockSets.entries()) {
      try {
        // Get all paper stocks from the database to find the IDs
        const allStocks = await prisma.paperStock.findMany()

        const setStocks = allStocks.filter((stock) => set.paperStocks.includes(stock.name))
        const defaultStock = allStocks.find((stock) => stock.name === set.defaultStock)

        if (setStocks.length === 0) {
          console.log(`No matching stocks found for set: ${set.name}, skipping...`)
          continue
        }

        await prisma.paperStockSet.create({
          data: {
            id: `set_${set.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: set.name,
            description: set.description,
            sortOrder: index,
            isActive: true,
            updatedAt: new Date(),
            PaperStockSetItem: {
              create: setStocks.map((stock, stockIndex) => ({
                id: `setitem_${set.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${stock.id}`,
                paperStockId: stock.id,
                isDefault: defaultStock ? stock.id === defaultStock.id : stockIndex === 0,
                sortOrder: stockIndex,
                updatedAt: new Date(),
              })),
            },
          },
        })

        console.log(`Created paper stock set: ${set.name}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Paper stock set ${set.name} already exists, skipping...`)
        } else {
          console.error(`Error creating paper stock set ${set.name}:`, error)
        }
      }
    }

    console.log('Paper stock data population completed successfully!')

    // Test the APIs
    console.log('\nTesting APIs...')
    const stocksCount = await prisma.paperStock.count()
    const setsCount = await prisma.paperStockSet.count()
    const coatingsCount = await prisma.coatingOption.count()
    const sidesCount = await prisma.sidesOption.count()

    console.log(`Created ${stocksCount} paper stocks`)
    console.log(`Created ${setsCount} paper stock sets`)
    console.log(`Created ${coatingsCount} coating options`)
    console.log(`Created ${sidesCount} sides options`)
  } catch (error) {
    console.error('Error populating paper stock data:', error)
    throw error
  }
}

async function main() {
  try {
    await populatePaperStockData()
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
