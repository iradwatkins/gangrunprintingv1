#!/usr/bin/env node

/**
 * Script to update database with base paper stocks, sides options, and coating options
 * This will remove all existing options and create only the specified base options
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Base Paper Stocks Configuration
const basePaperStocks = [
  {
    id: 'paper_16pt_c2s_cardstock',
    name: '16pt C2S Cardstock',
    weight: 0.016,
    pricePerSqInch: 0.0018,
    tooltipText: 'Premium 16pt coated cardstock - our most popular option',
    isActive: true,
  },
  {
    id: 'paper_9pt_c2s_cardstock',
    name: '9pt C2S Cardstock',
    weight: 0.009,
    pricePerSqInch: 0.0012,
    tooltipText: 'Lightweight 9pt coated cardstock - economical choice',
    isActive: true,
  },
  {
    id: 'paper_100lb_uncoated_cover',
    name: '100 lb Uncoated Cover (14pt)',
    weight: 0.014,
    pricePerSqInch: 0.0016,
    tooltipText: 'Premium uncoated cover stock - natural feel and look',
    isActive: true,
  },
  {
    id: 'paper_100lb_gloss_text',
    name: '100 lb Gloss Text',
    weight: 0.0074,
    pricePerSqInch: 0.001,
    tooltipText: 'Heavy gloss text paper - ideal for brochures and flyers',
    isActive: true,
  },
  {
    id: 'paper_60lb_offset',
    name: '60 lb Offset',
    weight: 0.0044,
    pricePerSqInch: 0.0008,
    tooltipText: 'Standard offset paper - perfect for letterheads and forms',
    isActive: true,
  },
  {
    id: 'paper_12pt_c2s_cardstock',
    name: '12pt C2S Cardstock',
    weight: 0.012,
    pricePerSqInch: 0.0014,
    tooltipText: 'Standard 12pt coated cardstock - versatile and durable',
    isActive: true,
  },
  {
    id: 'paper_14pt_c2s_cardstock',
    name: '14pt C2S Cardstock',
    weight: 0.014,
    pricePerSqInch: 0.0016,
    tooltipText: 'Medium weight 14pt coated cardstock - great for business cards',
    isActive: true,
  },
]

// Base Sides Options Configuration
const baseSidesOptions = [
  {
    id: 'sides_different_both',
    name: 'Different Image both sides',
    code: 'DIFFERENT_BOTH',
    description: 'Upload different images for front and back',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sides_front_only',
    name: 'Image front side only/blank Back',
    code: 'FRONT_ONLY',
    description: 'Print on front side only, back remains blank',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sides_same_both',
    name: 'Same Image Both sides',
    code: 'SAME_BOTH',
    description: 'Same image printed on both front and back',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sides_your_front_our_back',
    name: 'Your Image Front/ Our image Back',
    code: 'YOUR_FRONT_OUR_BACK',
    description: 'Your custom image on front, our design on back',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Base Coating Options Configuration
const baseCoatingOptions = [
  {
    id: 'coating_high_gloss_uv',
    name: 'High Gloss UV',
    description: 'Ultra high gloss UV coating on both sides',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'coating_high_gloss_uv_one_side',
    name: 'High Gloss UV on ONE SIDE',
    description: 'High gloss UV coating on front side only',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'coating_gloss_aqueous',
    name: 'Gloss Aqueous',
    description: 'Environmentally friendly gloss aqueous coating',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'coating_matte_aqueous',
    name: 'Matte Aqueous',
    description: 'Environmentally friendly matte aqueous coating',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function updateDatabase() {
  try {
    log('========================================', 'cyan')
    log('Starting Base Options Update', 'cyan')
    log('========================================', 'cyan')

    // Step 1: Delete existing paper stocks
    log('\n📝 Deleting existing paper stocks...', 'yellow')

    // First, check for relationships
    const paperStockRelations = await prisma.productPaperStock.count()
    if (paperStockRelations > 0) {
      log(`⚠️  Warning: ${paperStockRelations} products are using existing paper stocks`, 'yellow')
      log('Deleting product-paper stock relationships first...', 'yellow')
      await prisma.productPaperStock.deleteMany()
    }

    // Delete paper stock relationships
    await prisma.paperStockCoating.deleteMany()
    await prisma.paperStockSides.deleteMany()
    await prisma.paperStockSetItem.deleteMany()

    // Delete all paper stocks
    const deletedPaperStocks = await prisma.paperStock.deleteMany()
    log(`✅ Deleted ${deletedPaperStocks.count} existing paper stocks`, 'green')

    // Step 2: Create new paper stocks
    log('\n📝 Creating new paper stocks...', 'yellow')
    for (const stock of basePaperStocks) {
      await prisma.paperStock.create({
        data: {
          ...stock,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      log(`✅ Created: ${stock.name}`, 'green')
    }

    // Step 3: Delete existing sides options
    log('\n🔄 Deleting existing sides options...', 'yellow')

    // Delete relationships first
    await prisma.paperStockSides.deleteMany()

    const deletedSides = await prisma.sidesOption.deleteMany()
    log(`✅ Deleted ${deletedSides.count} existing sides options`, 'green')

    // Step 4: Create new sides options
    log('\n🔄 Creating new sides options...', 'yellow')
    for (const side of baseSidesOptions) {
      await prisma.sidesOption.create({
        data: side,
      })
      log(`✅ Created: ${side.name}`, 'green')
    }

    // Step 5: Delete existing coating options
    log('\n✨ Deleting existing coating options...', 'yellow')

    // Delete relationships first
    await prisma.paperStockCoating.deleteMany()

    const deletedCoatings = await prisma.coatingOption.deleteMany()
    log(`✅ Deleted ${deletedCoatings.count} existing coating options`, 'green')

    // Step 6: Create new coating options
    log('\n✨ Creating new coating options...', 'yellow')
    for (const coating of baseCoatingOptions) {
      await prisma.coatingOption.create({
        data: coating,
      })
      log(`✅ Created: ${coating.name}`, 'green')
    }

    // Step 7: Create default relationships for paper stocks
    log('\n🔗 Creating default relationships...', 'yellow')

    // Add all coating options to all paper stocks
    for (const stock of basePaperStocks) {
      for (const coating of baseCoatingOptions) {
        await prisma.paperStockCoating.create({
          data: {
            paperStockId: stock.id,
            coatingId: coating.id,
            isDefault: coating.id === 'coating_gloss_aqueous', // Set Gloss Aqueous as default
          },
        })
      }
    }
    log('✅ Created coating relationships for all paper stocks', 'green')

    // Add all sides options to all paper stocks
    for (const stock of basePaperStocks) {
      for (const side of baseSidesOptions) {
        await prisma.paperStockSides.create({
          data: {
            paperStockId: stock.id,
            sidesOptionId: side.id,
            priceMultiplier: side.id === 'sides_different_both' ? 1.2 : 1.0,
            isEnabled: true,
          },
        })
      }
    }
    log('✅ Created sides relationships for all paper stocks', 'green')

    // Summary
    log('\n========================================', 'cyan')
    log('Update Complete!', 'cyan')
    log('========================================', 'cyan')

    log('\n📊 Summary:', 'blue')
    log(`✅ Paper Stocks: ${basePaperStocks.length} created`, 'green')
    log(`✅ Sides Options: ${baseSidesOptions.length} created`, 'green')
    log(`✅ Coating Options: ${baseCoatingOptions.length} created`, 'green')

    // Verify the updates
    const finalPaperStocks = await prisma.paperStock.count()
    const finalSides = await prisma.sidesOption.count()
    const finalCoatings = await prisma.coatingOption.count()

    log('\n📋 Final Database State:', 'blue')
    log(`Paper Stocks: ${finalPaperStocks}`, 'green')
    log(`Sides Options: ${finalSides}`, 'green')
    log(`Coating Options: ${finalCoatings}`, 'green')
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateDatabase()
  .then(() => {
    log('\n✨ All base options have been successfully updated!', 'green')
    process.exit(0)
  })
  .catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, 'red')
    process.exit(1)
  })
