import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createColorCriticalAddon() {
  try {
    console.log('🎨 Creating Color Critical addon...\n')

    // Create the addon
    const addon = await prisma.addOn.create({
      data: {
        name: 'Color Critical',
        description: 'Production time dependent on approval of color proof.',
        tooltipText:
          'Because of limitations with the gang run printing process, the accuracy of color reproduction is not guaranteed. Only select this option if you are looking for a specific color match custom run with proofs that will not gang up with other jobs.',
        pricingModel: 'PERCENTAGE',
        configuration: {
          percentage: 0.3, // 30% of base price
          appliesTo: 'base_price',
        },
        additionalTurnaroundDays: 2, // Color proofs require extra time
        sortOrder: 100,
        isActive: true,
        adminNotes:
          'Custom run with color proofs - does NOT gang with other jobs. Adds 30% to base price.',
      },
    })

    console.log('✅ Color Critical addon created successfully:')
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
            sortOrder: 100,
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

    console.log('\n✅ Color Critical addon setup complete!')
  } catch (error) {
    console.error('❌ Error creating Color Critical addon:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createColorCriticalAddon()
