import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedConfiguration() {
  console.log('🌱 Starting configuration seed...')

  try {
    // 1. Create Turnaround Times
    console.log('Creating turnaround times...')

    // Check if turnaround times already exist
    let sameDay = await prisma.turnaroundTime.findFirst({ where: { name: 'Same Day' } })
    if (!sameDay) {
      sameDay = await prisma.turnaroundTime.create({
        data: {
          name: 'Same Day',
          displayName: 'Same Day Rush',
          daysMin: 0,
          daysMax: 0,
          priceMultiplier: 2.5,
          isActive: true,
          sortOrder: 1,
        },
      })
    }

    let nextDay = await prisma.turnaroundTime.findFirst({ where: { name: 'Next Day' } })
    if (!nextDay) {
      nextDay = await prisma.turnaroundTime.create({
        data: {
          name: 'Next Day',
          displayName: 'Next Business Day',
          daysMin: 1,
          daysMax: 1,
          priceMultiplier: 1.75,
          isActive: true,
          sortOrder: 2,
        },
      })
    }

    let standard = await prisma.turnaroundTime.findFirst({ where: { name: '2-3 Business Days' } })
    if (!standard) {
      standard = await prisma.turnaroundTime.create({
        data: {
          name: '2-3 Business Days',
          displayName: '2-3 Business Days',
          daysMin: 2,
          daysMax: 3,
          priceMultiplier: 1.25,
          isActive: true,
          sortOrder: 3,
        },
      })
    }

    let economy = await prisma.turnaroundTime.findFirst({ where: { name: '5-7 Business Days' } })
    if (!economy) {
      economy = await prisma.turnaroundTime.create({
        data: {
          name: '5-7 Business Days',
          displayName: '5-7 Business Days (Economy)',
          daysMin: 5,
          daysMax: 7,
          priceMultiplier: 1.0,
          isActive: true,
          sortOrder: 4,
        },
      })
    }

    const turnaroundTimes = [sameDay, nextDay, standard, economy]

    // 2. Create Turnaround Time Sets
    console.log('Creating turnaround time sets...')
    const standardTurnaround = await prisma.turnaroundTimeSet.upsert({
      where: { name: 'Standard Production' },
      update: {},
      create: {
        name: 'Standard Production',
        description: 'Standard production turnaround options',
        isActive: true,
      },
    })

    const rushTurnaround = await prisma.turnaroundTimeSet.upsert({
      where: { name: 'Rush Production' },
      update: {},
      create: {
        name: 'Rush Production',
        description: 'Rush production with expedited options',
        isActive: true,
      },
    })

    // Link turnaround times to sets
    await prisma.turnaroundTimeSetItem.createMany({
      data: [
        { turnaroundTimeSetId: standardTurnaround.id, turnaroundTimeId: turnaroundTimes[2].id, isDefault: true, sortOrder: 1 },
        { turnaroundTimeSetId: standardTurnaround.id, turnaroundTimeId: turnaroundTimes[3].id, isDefault: false, sortOrder: 2 },
        { turnaroundTimeSetId: rushTurnaround.id, turnaroundTimeId: turnaroundTimes[0].id, isDefault: false, sortOrder: 1 },
        { turnaroundTimeSetId: rushTurnaround.id, turnaroundTimeId: turnaroundTimes[1].id, isDefault: true, sortOrder: 2 },
        { turnaroundTimeSetId: rushTurnaround.id, turnaroundTimeId: turnaroundTimes[2].id, isDefault: false, sortOrder: 3 },
      ],
      skipDuplicates: true,
    })

    // 3. Create Size Groups
    console.log('Creating size groups...')
    const businessCardSizes = await prisma.sizeGroup.upsert({
      where: { name: 'Business Card Sizes' },
      update: {},
      create: {
        name: 'Business Card Sizes',
        description: 'Standard business card dimensions',
        values: JSON.stringify([
          { width: 3.5, height: 2, unit: 'inches' },
          { width: 2, height: 3.5, unit: 'inches' },
          { width: 3.5, height: 2.5, unit: 'inches' },
        ]),
        defaultValue: JSON.stringify({ width: 3.5, height: 2, unit: 'inches' }),
        isActive: true,
      },
    })

    const flyerPosterSizes = await prisma.sizeGroup.upsert({
      where: { name: 'Flyer & Poster Sizes' },
      update: {},
      create: {
        name: 'Flyer & Poster Sizes',
        description: 'Common flyer and poster dimensions',
        values: JSON.stringify([
          { width: 8.5, height: 11, unit: 'inches' },
          { width: 11, height: 17, unit: 'inches' },
          { width: 12, height: 18, unit: 'inches' },
          { width: 18, height: 24, unit: 'inches' },
          { width: 24, height: 36, unit: 'inches' },
        ]),
        defaultValue: JSON.stringify({ width: 8.5, height: 11, unit: 'inches' }),
        isActive: true,
      },
    })

    const brochureSizes = await prisma.sizeGroup.upsert({
      where: { name: 'Brochure Sizes' },
      update: {},
      create: {
        name: 'Brochure Sizes',
        description: 'Standard brochure dimensions',
        values: JSON.stringify([
          { width: 8.5, height: 11, unit: 'inches' },
          { width: 8.5, height: 14, unit: 'inches' },
          { width: 11, height: 17, unit: 'inches' },
          { width: 11, height: 25.5, unit: 'inches' },
        ]),
        defaultValue: JSON.stringify({ width: 8.5, height: 11, unit: 'inches' }),
        isActive: true,
      },
    })

    const stickerSizes = await prisma.sizeGroup.upsert({
      where: { name: 'Sticker Sizes' },
      update: {},
      create: {
        name: 'Sticker Sizes',
        description: 'Popular sticker dimensions',
        values: JSON.stringify([
          { width: 2, height: 2, unit: 'inches' },
          { width: 3, height: 3, unit: 'inches' },
          { width: 4, height: 4, unit: 'inches' },
          { width: 4, height: 6, unit: 'inches' },
          { width: 5, height: 7, unit: 'inches' },
        ]),
        defaultValue: JSON.stringify({ width: 3, height: 3, unit: 'inches' }),
        isActive: true,
      },
    })

    const bannerSizes = await prisma.sizeGroup.upsert({
      where: { name: 'Banner Sizes' },
      update: {},
      create: {
        name: 'Banner Sizes',
        description: 'Standard banner dimensions',
        values: JSON.stringify([
          { width: 2, height: 6, unit: 'feet' },
          { width: 3, height: 6, unit: 'feet' },
          { width: 4, height: 8, unit: 'feet' },
          { width: 5, height: 10, unit: 'feet' },
          { width: 6, height: 12, unit: 'feet' },
        ]),
        defaultValue: JSON.stringify({ width: 3, height: 6, unit: 'feet' }),
        isActive: true,
      },
    })

    // 4. Create Quantity Groups
    console.log('Creating quantity groups...')
    const smallQuantities = await prisma.quantityGroup.upsert({
      where: { name: 'Small Quantities' },
      update: {},
      create: {
        name: 'Small Quantities',
        description: 'Small run quantities for testing and samples',
        values: JSON.stringify([25, 50, 100, 250, 500]),
        defaultValue: '100',
        isActive: true,
      },
    })

    const standardQuantities = await prisma.quantityGroup.upsert({
      where: { name: 'Standard Quantities' },
      update: {},
      create: {
        name: 'Standard Quantities',
        description: 'Standard print run quantities',
        values: JSON.stringify([250, 500, 1000, 2500, 5000]),
        defaultValue: '500',
        isActive: true,
      },
    })

    const bulkQuantities = await prisma.quantityGroup.upsert({
      where: { name: 'Bulk Quantities' },
      update: {},
      create: {
        name: 'Bulk Quantities',
        description: 'Large volume print runs',
        values: JSON.stringify([1000, 2500, 5000, 10000, 25000]),
        defaultValue: '5000',
        isActive: true,
      },
    })

    // 5. Create Paper Stock Sets
    console.log('Creating paper stock sets...')
    const standardPapers = await prisma.paperStockSet.upsert({
      where: { name: 'Standard Papers' },
      update: {},
      create: {
        name: 'Standard Papers',
        description: 'Standard paper options for most products',
        isActive: true,
      },
    })

    const premiumPapers = await prisma.paperStockSet.upsert({
      where: { name: 'Premium Papers' },
      update: {},
      create: {
        name: 'Premium Papers',
        description: 'Premium paper options with special finishes',
        isActive: true,
      },
    })

    const stickerMaterials = await prisma.paperStockSet.upsert({
      where: { name: 'Sticker Materials' },
      update: {},
      create: {
        name: 'Sticker Materials',
        description: 'Adhesive materials for stickers',
        isActive: true,
      },
    })

    // Get existing paper stocks
    const paperStocks = await prisma.paperStock.findMany()

    // Link paper stocks to sets
    if (paperStocks.length > 0) {
      // Standard Papers set
      const standardStockIds = paperStocks
        .filter(ps => ps.finish === 'Matte' || ps.finish === 'Gloss')
        .slice(0, 3)

      for (let i = 0; i < standardStockIds.length; i++) {
        await prisma.paperStockSetItem.create({
          data: {
            paperStockSetId: standardPapers.id,
            paperStockId: standardStockIds[i].id,
            isDefault: i === 0,
            sortOrder: i + 1,
          },
        }).catch(() => {}) // Ignore duplicates
      }

      // Premium Papers set
      const premiumStockIds = paperStocks
        .filter(ps => ps.weight >= 110)
        .slice(0, 3)

      for (let i = 0; i < premiumStockIds.length; i++) {
        await prisma.paperStockSetItem.create({
          data: {
            paperStockSetId: premiumPapers.id,
            paperStockId: premiumStockIds[i].id,
            isDefault: i === 0,
            sortOrder: i + 1,
          },
        }).catch(() => {}) // Ignore duplicates
      }

      // Sticker Materials set - use any available stocks for now
      const stickerStockIds = paperStocks.slice(0, 2)

      for (let i = 0; i < stickerStockIds.length; i++) {
        await prisma.paperStockSetItem.create({
          data: {
            paperStockSetId: stickerMaterials.id,
            paperStockId: stickerStockIds[i].id,
            isDefault: i === 0,
            sortOrder: i + 1,
          },
        }).catch(() => {}) // Ignore duplicates
      }
    }

    // 6. Create AddOn Sets
    console.log('Creating addon sets...')
    const designServices = await prisma.addOnSet.upsert({
      where: { name: 'Design Services' },
      update: {},
      create: {
        name: 'Design Services',
        description: 'Professional design and setup services',
        isActive: true,
      },
    })

    const finishingOptions = await prisma.addOnSet.upsert({
      where: { name: 'Finishing Options' },
      update: {},
      create: {
        name: 'Finishing Options',
        description: 'Special finishing and coating options',
        isActive: true,
      },
    })

    // Get existing addons
    const addOns = await prisma.addOn.findMany()

    // Link addons to sets
    if (addOns.length > 0) {
      const designAddons = addOns.filter(a =>
        a.name.toLowerCase().includes('design') ||
        a.name.toLowerCase().includes('proof')
      ).slice(0, 3)

      for (let i = 0; i < designAddons.length; i++) {
        await prisma.addOnSetItem.create({
          data: {
            addOnSetId: designServices.id,
            addOnId: designAddons[i].id,
            isDefault: false,
            sortOrder: i + 1,
          },
        }).catch(() => {}) // Ignore duplicates
      }

      const finishingAddons = addOns.filter(a =>
        a.name.toLowerCase().includes('coating') ||
        a.name.toLowerCase().includes('laminate') ||
        a.name.toLowerCase().includes('foil')
      ).slice(0, 3)

      for (let i = 0; i < finishingAddons.length; i++) {
        await prisma.addOnSetItem.create({
          data: {
            addOnSetId: finishingOptions.id,
            addOnId: finishingAddons[i].id,
            isDefault: false,
            sortOrder: i + 1,
          },
        }).catch(() => {}) // Ignore duplicates
      }
    }

    // 7. Link products to configuration groups
    console.log('Linking products to configuration groups...')
    const products = await prisma.product.findMany()

    for (const product of products) {
      const name = product.name.toLowerCase()

      // Determine appropriate size group
      let sizeGroupId = flyerPosterSizes.id // default
      if (name.includes('business card')) sizeGroupId = businessCardSizes.id
      else if (name.includes('sticker')) sizeGroupId = stickerSizes.id
      else if (name.includes('brochure')) sizeGroupId = brochureSizes.id
      else if (name.includes('banner')) sizeGroupId = bannerSizes.id
      else if (name.includes('poster')) sizeGroupId = flyerPosterSizes.id
      else if (name.includes('flyer')) sizeGroupId = flyerPosterSizes.id

      // Determine appropriate quantity group
      let quantityGroupId = standardQuantities.id // default
      if (name.includes('business card')) quantityGroupId = standardQuantities.id
      else if (name.includes('sticker')) quantityGroupId = smallQuantities.id
      else if (name.includes('banner')) quantityGroupId = smallQuantities.id
      else if (name.includes('poster')) quantityGroupId = bulkQuantities.id

      // Determine appropriate paper stock set
      let paperStockSetId = standardPapers.id // default
      if (name.includes('sticker')) paperStockSetId = stickerMaterials.id
      else if (name.includes('premium')) paperStockSetId = premiumPapers.id

      // Determine appropriate turnaround set
      const turnaroundSetId = name.includes('rush') ? rushTurnaround.id : standardTurnaround.id

      // Determine appropriate addon set
      const addOnSetId = name.includes('premium') ? finishingOptions.id : designServices.id

      // Create associations
      await prisma.productSizeGroup.create({
        data: {
          productId: product.id,
          sizeGroupId: sizeGroupId,
        },
      }).catch(() => {}) // Ignore if already exists

      await prisma.productQuantityGroup.create({
        data: {
          productId: product.id,
          quantityGroupId: quantityGroupId,
        },
      }).catch(() => {}) // Ignore if already exists

      await prisma.productPaperStockSet.create({
        data: {
          productId: product.id,
          paperStockSetId: paperStockSetId,
          isDefault: true,
        },
      }).catch(() => {}) // Ignore if already exists

      await prisma.productTurnaroundTimeSet.create({
        data: {
          productId: product.id,
          turnaroundTimeSetId: turnaroundSetId,
          isDefault: true,
        },
      }).catch(() => {}) // Ignore if already exists

      await prisma.productAddOnSet.create({
        data: {
          productId: product.id,
          addOnSetId: addOnSetId,
          isDefault: false,
        },
      }).catch(() => {}) // Ignore if already exists

      console.log(`✅ Configured product: ${product.name}`)
    }

    console.log('✨ Configuration seed completed successfully!')

    // Display summary
    const summary = await prisma.product.findMany({
      select: {
        name: true,
        _count: {
          select: {
            productSizeGroups: true,
            productQuantityGroups: true,
            productPaperStockSets: true,
            productTurnaroundTimeSets: true,
            productAddOnSets: true,
          },
        },
      },
    })

    console.log('\n📊 Configuration Summary:')
    summary.forEach(p => {
      console.log(`\n${p.name}:`)
      console.log(`  Size Groups: ${p._count.productSizeGroups}`)
      console.log(`  Quantity Groups: ${p._count.productQuantityGroups}`)
      console.log(`  Paper Stock Sets: ${p._count.productPaperStockSets}`)
      console.log(`  Turnaround Sets: ${p._count.productTurnaroundTimeSets}`)
      console.log(`  AddOn Sets: ${p._count.productAddOnSets}`)
    })

  } catch (error) {
    console.error('❌ Configuration seed failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute the seed
seedConfiguration()
  .then(() => {
    console.log('🎉 Configuration seed completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💀 Configuration seed failed:', error)
    process.exit(1)
  })