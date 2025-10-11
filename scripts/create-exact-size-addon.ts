import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createExactSizeAddon() {
  try {
    console.log('📏 Creating Exact Size addon...\n')

    // Create the addon
    const addon = await prisma.addOn.create({
      data: {
        name: 'Exact Size',
        description: 'Ensures your order is cut to the exact size you ordered.',
        tooltipText:
          'Some products and paper types will be undersized by 1/8 of an inch during the cutting process. If it is critical that your order is the exact size you ordered please ensure this option is selected.',
        pricingModel: 'PERCENTAGE',
        configuration: {
          percentage: 0.3, // 30% of base price
          appliesTo: 'base_price',
        },
        additionalTurnaroundDays: 1, // Extra precision cutting requires additional time
        sortOrder: 101,
        isActive: true,
        adminNotes:
          'Precision cutting to exact dimensions - prevents undersizing. Adds 30% to base price.',
      },
    })

    console.log('✅ Exact Size addon created successfully:')
    console.log(JSON.stringify(addon, null, 2))

    // Find all addon sets to associate with
    const addonSets = await prisma.addOnSet.findMany({
      where: {
        isActive: true,
      },
    })

    console.log(`\n📦 Found ${addonSets.length} addon sets`)

    // Associate with each addon set
    for (const set of addonSets) {
      try {
        const setItem = await prisma.addOnSetItem.create({
          data: {
            addOnSetId: set.id,
            addOnId: addon.id,
            displayPosition: 'IN_DROPDOWN',
            isDefault: false,
            sortOrder: 101,
          },
        })
        console.log(`   ✅ Associated with: ${set.name}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Already associated with: ${set.name}`)
        } else {
          console.log(`   ❌ Failed to associate with: ${set.name}`)
        }
      }
    }

    console.log('\n✅ Exact Size addon setup complete!')
  } catch (error) {
    console.error('❌ Error creating Exact Size addon:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createExactSizeAddon()
