import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createHalfScoreAddon() {
  try {
    console.log('📏 Creating Half Score addon...\n')

    // Create the addon
    const addon = await prisma.addOn.create({
      data: {
        name: 'Half Score',
        description: 'Add a half score crease to your print products for easy folding.',
        tooltipText:
          '$17.00 + $.01/piece - Add a professional scoring line for clean, precise folds.',
        pricingModel: 'CUSTOM',
        configuration: {
          baseFee: 17,
          perPieceRate: 0.01,
        },
        additionalTurnaroundDays: 1,
        sortOrder: 104,
        isActive: true,
        adminNotes:
          'Half score pricing: $17 + ($0.01 × quantity). Example: 500 pieces = $17 + $5 = $22',
      },
    })

    console.log('✅ Half Score addon created successfully:')
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
            sortOrder: 104,
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

    console.log('\n✅ Half Score addon setup complete!')
    console.log('\n📋 Pricing Examples:')
    console.log('   500 pieces:   $17 + ($0.01 × 500) = $22.00')
    console.log('   1000 pieces:  $17 + ($0.01 × 1000) = $27.00')
    console.log('   2500 pieces:  $17 + ($0.01 × 2500) = $42.00')
    console.log('   5000 pieces:  $17 + ($0.01 × 5000) = $67.00')
  } catch (error) {
    console.error('❌ Error creating Half Score addon:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createHalfScoreAddon()
