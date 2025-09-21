import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAddOnSets() {
  console.log('🌱 Seeding AddOn Sets...')

  try {
    // First, get existing add-ons
    const addOns = await prisma.addOn.findMany()
    console.log(`Found ${addOns.length} add-ons`)

    // Create AddOn Sets
    const addOnSets = [
      {
        name: 'Premium Business Card Add-ons',
        description: 'Enhancement options for business cards',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Marketing Materials Add-ons',
        description: 'Add-ons for flyers, brochures, and marketing materials',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Finishing Options',
        description: 'Professional finishing and coating options',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Packaging & Delivery',
        description: 'Bundling, packaging, and delivery options',
        isActive: true,
        sortOrder: 4,
      },
      {
        name: 'Design Services',
        description: 'Professional design and proofing services',
        isActive: true,
        sortOrder: 5,
      },
      {
        name: 'Large Format Add-ons',
        description: 'Special options for posters and banners',
        isActive: true,
        sortOrder: 6,
      },
      {
        name: 'EDDM Services',
        description: 'Every Door Direct Mail processing and postage',
        isActive: true,
        sortOrder: 7,
      },
      {
        name: 'Rush Production',
        description: 'Expedited production and shipping options',
        isActive: true,
        sortOrder: 8,
      },
    ]

    // Create or update AddOn Sets
    for (const setData of addOnSets) {
      const set = await prisma.addOnSet.upsert({
        where: { name: setData.name },
        update: setData,
        create: setData,
      })
      console.log(`✅ Created/Updated AddOn Set: ${set.name}`)

      // Add some add-ons to each set if available
      if (addOns.length > 0) {
        // Add appropriate add-ons based on set name
        let addOnsToAdd = []

        if (set.name.includes('Business Card')) {
          addOnsToAdd = addOns.filter(a =>
            a.name.includes('Rounded') ||
            a.name.includes('Foil') ||
            a.name.includes('Spot UV') ||
            a.name.includes('Lamination')
          ).slice(0, 4)
        } else if (set.name.includes('Finishing')) {
          addOnsToAdd = addOns.filter(a =>
            a.name.includes('Folding') ||
            a.name.includes('Score') ||
            a.name.includes('Perforation') ||
            a.name.includes('Hole')
          ).slice(0, 4)
        } else if (set.name.includes('Packaging')) {
          addOnsToAdd = addOns.filter(a =>
            a.name.includes('Banding') ||
            a.name.includes('Shrink') ||
            a.name.includes('Postal')
          ).slice(0, 3)
        } else if (set.name.includes('Design')) {
          addOnsToAdd = addOns.filter(a =>
            a.name.includes('Design') ||
            a.name.includes('Proof') ||
            a.name.includes('QR')
          ).slice(0, 3)
        } else if (set.name.includes('EDDM')) {
          addOnsToAdd = addOns.filter(a =>
            a.name.includes('EDDM') ||
            a.name.includes('Postal')
          ).slice(0, 2)
        } else {
          // Default: add first 3 add-ons
          addOnsToAdd = addOns.slice(0, 3)
        }

        for (let i = 0; i < addOnsToAdd.length; i++) {
          await prisma.addOnSetItem.upsert({
            where: {
              addOnSetId_addOnId: {
                addOnSetId: set.id,
                addOnId: addOnsToAdd[i].id,
              },
            },
            update: {
              sortOrder: i + 1,
            },
            create: {
              addOnSetId: set.id,
              addOnId: addOnsToAdd[i].id,
              sortOrder: i + 1,
            },
          })
        }
        console.log(`  Added ${addOnsToAdd.length} add-ons to set`)
      }
    }

    console.log('✅ AddOn Sets seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding AddOn Sets:', error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  seedAddOnSets()
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

export default seedAddOnSets