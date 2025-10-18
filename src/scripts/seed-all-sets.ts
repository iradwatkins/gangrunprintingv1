#!/usr/bin/env tsx
/**
 * COMPREHENSIVE SETS SEED SCRIPT
 *
 * Seeds all "Set" models:
 * - Paper Stock Sets + PaperStockSetItems
 * - Add-on Sets + AddOnSetItems
 * - Design Options + Design Sets + DesignSetItems
 * - Turnaround Times + Turnaround Time Sets + TurnaroundTimeSetItems
 *
 * Created: October 17, 2025
 * Purpose: Ensure all configuration sets are available for products
 *
 * Run with: npx tsx src/scripts/seed-all-sets.ts
 */

import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

/**
 * Seed Paper Stock Sets
 */
async function seedPaperStockSets() {
  console.log('📦 Seeding Paper Stock Sets...')

  // Get all paper stocks to reference
  const paperStocks = await prisma.paperStock.findMany()
  const paperStockMap = Object.fromEntries(paperStocks.map((p) => [p.name, p.id]))

  const paperStockSets = [
    {
      name: 'Standard Business Card Papers',
      description: 'Common paper stocks for business cards',
      items: ['14pt Cardstock', '16pt Cardstock', '32pt Triple Layer'],
    },
    {
      name: 'Flyer Papers',
      description: 'Paper stocks suitable for flyers and brochures',
      items: ['100lb Gloss Text', '100lb Matte Text', '80lb Gloss Cover', '80lb Matte Cover'],
    },
    {
      name: 'Large Format Papers',
      description: 'Papers for posters and banners',
      items: ['Photo Paper Glossy', '13oz Vinyl Banner'],
    },
    {
      name: 'Sticker Materials',
      description: 'Vinyl materials for stickers',
      items: ['White Vinyl Sticker', 'Clear Vinyl Sticker', 'Holographic Sticker'],
    },
  ]

  let setCount = 0
  let itemCount = 0

  for (const setData of paperStockSets) {
    const set = await prisma.paperStockSet.upsert({
      where: { name: setData.name },
      update: { description: setData.description, updatedAt: new Date() },
      create: {
        id: createId(),
        name: setData.name,
        description: setData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    setCount++

    // Add items to the set
    for (let i = 0; i < setData.items.length; i++) {
      const paperStockId = paperStockMap[setData.items[i]]
      if (paperStockId) {
        await prisma.paperStockSetItem.upsert({
          where: {
            paperStockSetId_paperStockId: {
              paperStockSetId: set.id,
              paperStockId: paperStockId,
            },
          },
          update: {
            isDefault: i === 0,
            sortOrder: i,
            updatedAt: new Date(),
          },
          create: {
            id: createId(),
            paperStockSetId: set.id,
            paperStockId: paperStockId,
            isDefault: i === 0,
            sortOrder: i,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        itemCount++
      }
    }
  }

  console.log(`   ✅ ${setCount} paper stock sets with ${itemCount} items seeded`)
  return { setCount, itemCount }
}

/**
 * Seed Add-on Sets
 */
async function seedAddOnSets() {
  console.log('🎁 Seeding Add-on Sets...')

  // Get all add-ons to reference
  const addOns = await prisma.addOn.findMany()
  const addOnMap = Object.fromEntries(addOns.map((a) => [a.name, a.id]))

  const addOnSets = [
    {
      name: 'Business Card Enhancements',
      description: 'Popular add-ons for business cards',
      items: ['Rounded Corners', 'Spot UV Coating', 'Foil Stamping'],
    },
    {
      name: 'Print Finishing Options',
      description: 'Finishing touches for printed materials',
      items: ['Lamination', 'Perforation', 'Die Cutting', 'Hole Drilling'],
    },
    {
      name: 'Premium Upgrades',
      description: 'High-end enhancement options',
      items: ['Foil Stamping', 'Embossing/Debossing', 'Spot UV Coating', 'White Ink Printing'],
    },
    {
      name: 'Service Add-ons',
      description: 'Additional services',
      items: ['Design Services', 'Rush Production', 'Numbering'],
    },
  ]

  let setCount = 0
  let itemCount = 0

  for (const setData of addOnSets) {
    const set = await prisma.addOnSet.upsert({
      where: { name: setData.name },
      update: { description: setData.description, updatedAt: new Date() },
      create: {
        id: createId(),
        name: setData.name,
        description: setData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    setCount++

    // Add items to the set
    for (let i = 0; i < setData.items.length; i++) {
      const addOnId = addOnMap[setData.items[i]]
      if (addOnId) {
        await prisma.addOnSetItem.upsert({
          where: {
            addOnSetId_addOnId: {
              addOnSetId: set.id,
              addOnId: addOnId,
            },
          },
          update: {
            displayPosition: 'IN_DROPDOWN' as const,
            isDefault: i === 0,
            sortOrder: i,
            updatedAt: new Date(),
          },
          create: {
            id: createId(),
            addOnSetId: set.id,
            addOnId: addOnId,
            displayPosition: 'IN_DROPDOWN' as const,
            isDefault: i === 0,
            sortOrder: i,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        itemCount++
      }
    }
  }

  console.log(`   ✅ ${setCount} add-on sets with ${itemCount} items seeded`)
  return { setCount, itemCount }
}

/**
 * Seed Design Options and Design Sets
 */
async function seedDesignOptionsAndSets() {
  console.log('🎨 Seeding Design Options & Sets...')

  const designOptions = [
    {
      name: 'Upload Your Own Artwork',
      code: 'upload_own',
      description: 'Upload your print-ready artwork',
      tooltipText: 'Provide your own camera-ready artwork files (PDF, AI, EPS, PSD)',
      pricingType: 'FLAT' as const,
      requiresSideSelection: false,
      basePrice: 0,
      sortOrder: 1,
    },
    {
      name: 'Minor Design Changes',
      code: 'minor_changes',
      description: 'Small tweaks to existing artwork',
      tooltipText: 'Text changes, color adjustments, minor layout modifications',
      pricingType: 'FLAT' as const,
      requiresSideSelection: false,
      basePrice: 25.0,
      sortOrder: 2,
    },
    {
      name: 'Major Design Changes',
      code: 'major_changes',
      description: 'Significant design work needed',
      tooltipText: 'Complete redesign, new layout, extensive modifications',
      pricingType: 'FLAT' as const,
      requiresSideSelection: false,
      basePrice: 75.0,
      sortOrder: 3,
    },
    {
      name: 'Professional Design - One Side',
      code: 'design_one_side',
      description: 'Custom design for one side',
      tooltipText: 'Our designers create a custom design for one side of your product',
      pricingType: 'SIDE_BASED' as const,
      requiresSideSelection: true,
      sideOnePrice: 150.0,
      sortOrder: 4,
    },
    {
      name: 'Professional Design - Two Sides',
      code: 'design_two_sides',
      description: 'Custom design for both sides',
      tooltipText: 'Our designers create custom designs for both sides of your product',
      pricingType: 'SIDE_BASED' as const,
      requiresSideSelection: true,
      sideOnePrice: 150.0,
      sideTwoPrice: 100.0,
      sortOrder: 5,
    },
  ]

  let optionCount = 0
  for (const option of designOptions) {
    await prisma.designOption.upsert({
      where: { code: option.code },
      update: { ...option, updatedAt: new Date() },
      create: {
        id: createId(),
        ...option,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    optionCount++
  }

  // Create Design Sets
  const designSets = [
    {
      name: 'Standard Design Options',
      description: 'Common design service options',
      items: ['upload_own', 'minor_changes', 'major_changes'],
    },
    {
      name: 'Full Service Design',
      description: 'Complete design service options including professional design',
      items: [
        'upload_own',
        'minor_changes',
        'major_changes',
        'design_one_side',
        'design_two_sides',
      ],
    },
  ]

  let setCount = 0
  let itemCount = 0

  // Get all design options to reference
  const allDesignOptions = await prisma.designOption.findMany()
  const designOptionMap = Object.fromEntries(allDesignOptions.map((d) => [d.code, d.id]))

  for (const setData of designSets) {
    const set = await prisma.designSet.upsert({
      where: { name: setData.name },
      update: { description: setData.description, updatedAt: new Date() },
      create: {
        id: createId(),
        name: setData.name,
        description: setData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    setCount++

    // Add items to the set
    for (let i = 0; i < setData.items.length; i++) {
      const designOptionId = designOptionMap[setData.items[i]]
      if (designOptionId) {
        await prisma.designSetItem.upsert({
          where: {
            designSetId_designOptionId: {
              designSetId: set.id,
              designOptionId: designOptionId,
            },
          },
          update: {
            isDefault: i === 0,
            sortOrder: i,
            updatedAt: new Date(),
          },
          create: {
            id: createId(),
            designSetId: set.id,
            designOptionId: designOptionId,
            isDefault: i === 0,
            sortOrder: i,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        itemCount++
      }
    }
  }

  console.log(
    `   ✅ ${optionCount} design options + ${setCount} design sets with ${itemCount} items seeded`
  )
  return { optionCount, setCount, itemCount }
}

/**
 * Seed Turnaround Times and Turnaround Time Sets
 */
async function seedTurnaroundTimesAndSets() {
  console.log('⏰ Seeding Turnaround Times & Sets...')

  const turnaroundTimes = [
    {
      name: 'Economy',
      displayName: 'Economy (7-10 Days)',
      description: 'Standard production time at the lowest cost',
      daysMin: 7,
      daysMax: 10,
      pricingModel: 'PERCENTAGE' as const,
      priceMultiplier: 1.0, // No markup - base price
      sortOrder: 1,
    },
    {
      name: 'Standard',
      displayName: 'Standard (5-7 Days)',
      description: 'Reliable turnaround time',
      daysMin: 5,
      daysMax: 7,
      pricingModel: 'PERCENTAGE' as const,
      priceMultiplier: 1.1, // 10% markup
      sortOrder: 2,
    },
    {
      name: 'Fast',
      displayName: 'Fast (3-4 Days)',
      description: 'Expedited production',
      daysMin: 3,
      daysMax: 4,
      pricingModel: 'PERCENTAGE' as const,
      priceMultiplier: 1.3, // 30% markup
      sortOrder: 3,
    },
    {
      name: 'Faster',
      displayName: 'Faster (2-3 Days)',
      description: 'Priority production',
      daysMin: 2,
      daysMax: 3,
      pricingModel: 'PERCENTAGE' as const,
      priceMultiplier: 1.5, // 50% markup
      sortOrder: 4,
    },
    {
      name: 'Crazy Fast',
      displayName: 'Crazy Fast (1-2 Days)',
      description: 'Maximum priority rush service',
      daysMin: 1,
      daysMax: 2,
      pricingModel: 'PERCENTAGE' as const,
      priceMultiplier: 2.0, // 100% markup (double the price)
      sortOrder: 5,
    },
  ]

  let timeCount = 0
  for (const time of turnaroundTimes) {
    // Check if turnaround time already exists by name
    const existing = await prisma.turnaroundTime.findFirst({
      where: { name: time.name },
    })

    if (existing) {
      // Update existing
      await prisma.turnaroundTime.update({
        where: { id: existing.id },
        data: { ...time, updatedAt: new Date() },
      })
    } else {
      // Create new
      await prisma.turnaroundTime.create({
        data: {
          id: createId(),
          ...time,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    }
    timeCount++
  }

  // Create Turnaround Time Sets
  const turnaroundSets = [
    {
      name: 'Standard Turnaround Options',
      description: 'Common turnaround time options',
      items: ['Economy', 'Standard', 'Fast'],
    },
    {
      name: 'All Turnaround Options',
      description: 'Complete range including rush options',
      items: ['Economy', 'Standard', 'Fast', 'Faster', 'Crazy Fast'],
    },
    {
      name: 'Rush Only',
      description: 'Expedited turnaround times only',
      items: ['Fast', 'Faster', 'Crazy Fast'],
    },
  ]

  let setCount = 0
  let itemCount = 0

  // Get all turnaround times to reference
  const allTurnaroundTimes = await prisma.turnaroundTime.findMany()
  const turnaroundTimeMap = Object.fromEntries(allTurnaroundTimes.map((t) => [t.name, t.id]))

  for (const setData of turnaroundSets) {
    const set = await prisma.turnaroundTimeSet.upsert({
      where: { name: setData.name },
      update: { description: setData.description, updatedAt: new Date() },
      create: {
        id: createId(),
        name: setData.name,
        description: setData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    setCount++

    // Add items to the set
    for (let i = 0; i < setData.items.length; i++) {
      const turnaroundTimeId = turnaroundTimeMap[setData.items[i]]
      if (turnaroundTimeId) {
        await prisma.turnaroundTimeSetItem.upsert({
          where: {
            turnaroundTimeSetId_turnaroundTimeId: {
              turnaroundTimeSetId: set.id,
              turnaroundTimeId: turnaroundTimeId,
            },
          },
          update: {
            isDefault: i === 0,
            sortOrder: i,
            updatedAt: new Date(),
          },
          create: {
            id: createId(),
            turnaroundTimeSetId: set.id,
            turnaroundTimeId: turnaroundTimeId,
            isDefault: i === 0,
            sortOrder: i,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        itemCount++
      }
    }
  }

  console.log(
    `   ✅ ${timeCount} turnaround times + ${setCount} turnaround sets with ${itemCount} items seeded`
  )
  return { timeCount, setCount, itemCount }
}

/**
 * Main Seeding Function
 */
async function main() {
  try {
    console.log('🌱 COMPREHENSIVE SETS SEED SCRIPT')
    console.log('='.repeat(80))
    console.log('')

    const paperStockResults = await seedPaperStockSets()
    console.log('')

    const addOnResults = await seedAddOnSets()
    console.log('')

    const designResults = await seedDesignOptionsAndSets()
    console.log('')

    const turnaroundResults = await seedTurnaroundTimesAndSets()
    console.log('')

    console.log('='.repeat(80))
    console.log('✅ SEED COMPLETE - SUMMARY')
    console.log('='.repeat(80))
    console.log(`   Paper Stock Sets:        ${paperStockResults.setCount}`)
    console.log(`   Paper Stock Set Items:   ${paperStockResults.itemCount}`)
    console.log(`   Add-on Sets:             ${addOnResults.setCount}`)
    console.log(`   Add-on Set Items:        ${addOnResults.itemCount}`)
    console.log(`   Design Options:          ${designResults.optionCount}`)
    console.log(`   Design Sets:             ${designResults.setCount}`)
    console.log(`   Design Set Items:        ${designResults.itemCount}`)
    console.log(`   Turnaround Times:        ${turnaroundResults.timeCount}`)
    console.log(`   Turnaround Time Sets:    ${turnaroundResults.setCount}`)
    console.log(`   Turnaround Set Items:    ${turnaroundResults.itemCount}`)
    console.log('='.repeat(80))

    return {
      success: true,
    }
  } catch (error: any) {
    console.error('❌ Error seeding sets:', error)
    return {
      success: false,
      error: error.message,
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
main()
  .then((result) => {
    if (result.success) {
      console.log('\n✅ Success: All sets seeded')
      process.exit(0)
    } else {
      console.error(`\n❌ Failed: ${result.error}`)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
