const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function restorePaperStocks() {
  try {
    console.log('Restoring paper stocks data...')

    // First, create basic coating options and sides options if they don't exist
    const coatingOptions = [
      { id: 'coating_no_coating', name: 'No Coating', description: 'Uncoated paper' },
      { id: 'coating_gloss_coating', name: 'Gloss', description: 'High-gloss finish' },
      { id: 'coating_matte_coating', name: 'Matte', description: 'Non-reflective finish' },
      { id: 'coating_satin_coating', name: 'Satin', description: 'Semi-gloss finish' },
      { id: 'coating_uv_coating', name: 'UV', description: 'UV coating for protection' },
      { id: 'coating_aqueous', name: 'Aqueous', description: 'Water-based coating' },
      { id: 'coating_soft_touch', name: 'Soft Touch', description: 'Velvet texture coating' },
      { id: 'coating_pearlescent', name: 'Pearlescent', description: 'Pearl finish coating' },
    ]

    const sidesOptions = [
      { id: 'sides_1s', name: 'Single Side', code: '1S', description: 'Single sided printing' },
      { id: 'sides_2s', name: 'Double Sided', code: '2S', description: 'Double sided printing' },
    ]

    // Create coating options (only if they don't exist)
    for (const coating of coatingOptions) {
      try {
        await prisma.coatingOption.upsert({
          where: { id: coating.id },
          update: {},
          create: {
            ...coating,
            updatedAt: new Date()
          }
        })
      } catch (error) {
        // Skip if already exists
      }
    }

    // Create sides options (only if they don't exist)
    for (const sides of sidesOptions) {
      try {
        await prisma.sidesOption.upsert({
          where: { id: sides.id },
          update: {},
          create: {
            ...sides,
            updatedAt: new Date()
          }
        })
      } catch (error) {
        // Skip if already exists
      }
    }

    // Paper stocks data adapted from the comprehensive seed file
    const paperStocks = [
      // Business Card Stocks
      {
        id: 'paper_14pt_gloss_cover',
        name: '14pt Gloss Cover',
        pricePerSqInch: 0.0012,
        tooltipText: 'Our most popular business card stock - thick and durable with a glossy finish',
        weight: 0.014,
        isActive: true,
        coatings: ['coating_gloss_coating'],
        defaultCoating: 'coating_gloss_coating',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.5 }
      },
      {
        id: 'paper_14pt_matte_cover',
        name: '14pt Matte Cover',
        pricePerSqInch: 0.0012,
        tooltipText: 'Professional matte finish - no glare, easy to write on',
        weight: 0.014,
        isActive: true,
        coatings: ['coating_matte_coating'],
        defaultCoating: 'coating_matte_coating',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.5 }
      },
      {
        id: 'paper_16pt_premium_cover',
        name: '16pt Premium Cover',
        pricePerSqInch: 0.0015,
        tooltipText: 'Extra thick premium stock with UV coating for maximum impact',
        weight: 0.016,
        isActive: true,
        coatings: ['coating_uv_coating', 'coating_gloss_coating'],
        defaultCoating: 'coating_uv_coating',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.5 }
      },
      {
        id: 'paper_32pt_suede',
        name: '32pt Suede',
        pricePerSqInch: 0.003,
        tooltipText: 'Luxury suede finish - ultra-thick with velvet-like texture',
        weight: 0.032,
        isActive: true,
        coatings: ['coating_soft_touch'],
        defaultCoating: 'coating_soft_touch',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.5 }
      },
      {
        id: 'paper_32pt_ultrathick',
        name: '32pt UltraThick',
        pricePerSqInch: 0.0028,
        tooltipText: 'Ultra-thick premium cardstock for luxury business cards',
        weight: 0.032,
        isActive: true,
        coatings: ['coating_matte_coating', 'coating_gloss_coating'],
        defaultCoating: 'coating_matte_coating',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.5 }
      },

      // Flyer/Brochure Stocks
      {
        id: 'paper_100lb_gloss_text',
        name: '100lb Gloss Text',
        pricePerSqInch: 0.0008,
        tooltipText: 'Standard flyer stock - good quality at an affordable price',
        weight: 0.007,
        isActive: true,
        coatings: ['coating_gloss_coating'],
        defaultCoating: 'coating_gloss_coating',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.4 }
      },
      {
        id: 'paper_100lb_matte_text',
        name: '100lb Matte Text',
        pricePerSqInch: 0.0008,
        tooltipText: 'Matte finish for reduced glare - ideal for text-heavy designs',
        weight: 0.007,
        isActive: true,
        coatings: ['coating_matte_coating'],
        defaultCoating: 'coating_matte_coating',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.4 }
      },
      {
        id: 'paper_80lb_gloss_cover',
        name: '80lb Gloss Cover',
        pricePerSqInch: 0.0011,
        tooltipText: 'Thick cover stock for premium flyers and handouts',
        weight: 0.009,
        isActive: true,
        coatings: ['coating_gloss_coating'],
        defaultCoating: 'coating_gloss_coating',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.45 }
      },

      // Poster/Large Format Stocks
      {
        id: 'paper_12pt_c2s_poster',
        name: '12pt C2S Poster',
        pricePerSqInch: 0.001,
        tooltipText: 'Standard poster stock with satin finish - good for indoor use',
        weight: 0.012,
        isActive: true,
        coatings: ['coating_satin_coating'],
        defaultCoating: 'coating_satin_coating',
        sides: ['sides_1s'],
        sidesMultipliers: { sides_1s: 1.0 }
      },

      // Eco-Friendly Options
      {
        id: 'paper_recycled_14pt',
        name: '100% Recycled 14pt',
        pricePerSqInch: 0.0013,
        tooltipText: '100% post-consumer recycled content with eco-friendly coating',
        weight: 0.014,
        isActive: true,
        coatings: ['coating_aqueous'],
        defaultCoating: 'coating_aqueous',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.5 }
      },

      // Specialty Stocks
      {
        id: 'paper_metallic_pearl',
        name: 'Metallic Pearl',
        pricePerSqInch: 0.0024,
        tooltipText: 'Shimmering pearl finish for elegant designs',
        weight: 0.014,
        isActive: true,
        coatings: ['coating_pearlescent'],
        defaultCoating: 'coating_pearlescent',
        sides: ['sides_1s', 'sides_2s'],
        sidesMultipliers: { sides_1s: 1.0, sides_2s: 1.5 }
      },
    ]

    console.log('Creating paper stocks...')
    const createdStocks = []

    for (const stock of paperStocks) {
      try {
        const paperStock = await prisma.paperStock.create({
          data: {
            id: stock.id,
            name: stock.name,
            pricePerSqInch: stock.pricePerSqInch,
            tooltipText: stock.tooltipText,
            weight: stock.weight,
            isActive: stock.isActive,
            updatedAt: new Date(),
            paperStockCoatings: {
              create: stock.coatings.map(coatingId => ({
                coatingId: coatingId,
                isDefault: coatingId === stock.defaultCoating
              }))
            },
            paperStockSides: {
              create: stock.sides.map(sidesId => ({
                sidesOptionId: sidesId,
                priceMultiplier: stock.sidesMultipliers[sidesId] || 1.0,
                isEnabled: true
              }))
            }
          }
        })

        createdStocks.push(paperStock)
        console.log(`✓ Created paper stock: ${stock.name}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Paper stock ${stock.name} already exists, skipping...`)
        } else {
          console.error(`Error creating paper stock ${stock.name}:`, error)
        }
      }
    }

    // Create paper stock sets
    const paperStockSets = [
      {
        id: 'set_business_cards',
        name: 'Business Card Papers',
        description: 'Premium paper options for business cards',
        paperStocks: ['paper_14pt_gloss_cover', 'paper_14pt_matte_cover', 'paper_16pt_premium_cover', 'paper_32pt_ultrathick'],
        defaultStock: 'paper_14pt_gloss_cover'
      },
      {
        id: 'set_flyers_brochures',
        name: 'Flyer & Brochure Papers',
        description: 'Quality options for marketing materials',
        paperStocks: ['paper_100lb_gloss_text', 'paper_100lb_matte_text', 'paper_80lb_gloss_cover'],
        defaultStock: 'paper_100lb_gloss_text'
      },
      {
        id: 'set_premium_collection',
        name: 'Premium Collection',
        description: 'High-end paper stocks for luxury projects',
        paperStocks: ['paper_32pt_suede', 'paper_16pt_premium_cover', 'paper_metallic_pearl'],
        defaultStock: 'paper_32pt_suede'
      },
      {
        id: 'set_eco_friendly',
        name: 'Eco-Friendly Papers',
        description: 'Environmentally conscious paper options',
        paperStocks: ['paper_recycled_14pt'],
        defaultStock: 'paper_recycled_14pt'
      },
    ]

    console.log('Creating paper stock sets...')
    for (const [index, set] of paperStockSets.entries()) {
      try {
        await prisma.paperStockSet.create({
          data: {
            id: set.id,
            name: set.name,
            description: set.description,
            sortOrder: index,
            isActive: true,
            updatedAt: new Date(),
            PaperStockSetItem: {
              create: set.paperStocks.map((stockId, stockIndex) => ({
                id: `setitem_${set.id}_${stockId}`,
                paperStockId: stockId,
                isDefault: stockId === set.defaultStock,
                sortOrder: stockIndex,
                updatedAt: new Date()
              }))
            }
          }
        })

        console.log(`✓ Created paper stock set: ${set.name}`)
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Paper stock set ${set.name} already exists, skipping...`)
        } else {
          console.error(`Error creating paper stock set ${set.name}:`, error)
        }
      }
    }

    console.log('\n✅ Paper stocks data restoration completed successfully!')

    // Test the APIs
    console.log('\nTesting data counts...')
    const stocksCount = await prisma.paperStock.count()
    const setsCount = await prisma.paperStockSet.count()
    const coatingsCount = await prisma.coatingOption.count()
    const sidesCount = await prisma.sidesOption.count()

    console.log(`Paper Stocks: ${stocksCount}`)
    console.log(`Paper Stock Sets: ${setsCount}`)
    console.log(`Coating Options: ${coatingsCount}`)
    console.log(`Sides Options: ${sidesCount}`)

  } catch (error) {
    console.error('Error restoring paper stocks data:', error)
    throw error
  }
}

async function main() {
  try {
    await restorePaperStocks()
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()