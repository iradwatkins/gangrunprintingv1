import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDoorHangerAddon() {
  try {
    console.log('🚪 Creating Door Hanger Die Cut addon...\n')

    // Create the addon with CUSTOM pricing
    // Formula: $90 + ($0.03 × quantity)
    const addon = await prisma.addOn.create({
      data: {
        name: 'Door Hanger Die Cut',
        description: 'Professional die-cut finishing for door hanger flyers with hole and slit.',
        tooltipText:
          '$90.00 + $.03/piece - This is the finishing selection that will make the hole and slit in your door hanger flyer allowing it to be hung on a doorknob.',
        pricingModel: 'CUSTOM',
        configuration: {
          baseFee: 90,
          perPieceRate: 0.03,
        },
        additionalTurnaroundDays: 2,
        sortOrder: 106,
        isActive: true,
        adminNotes:
          'Door hanger die cut pricing: $90 + ($0.03 × quantity). Adds hole and slit for doorknob hanging.',
      },
    })

    console.log('✅ Door Hanger Die Cut addon created successfully:')
    console.log(JSON.stringify(addon, null, 2))

    // Create Slit Position sub-option
    const slitPositionSubOption = await prisma.addOnSubOption.create({
      data: {
        addOnId: addon.id,
        name: 'Slit Position',
        optionType: 'SELECT',
        options: ['No Preference', 'Front Left', 'Back Left'],
        defaultValue: 'No Preference',
        isRequired: false,
        affectsPricing: false,
        tooltipText: 'Select the position you would like the doorhanger slits to be.',
        displayOrder: 0,
      },
    })

    console.log('\n✅ Slit Position sub-option created')

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
            sortOrder: 106,
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

    console.log('\n✅ Door Hanger Die Cut addon setup complete!')
    console.log('\n📋 Pricing Examples:')
    console.log('   500 pieces:   $90 + ($0.03 × 500) = $90 + $15 = $105.00')
    console.log('   1000 pieces:  $90 + ($0.03 × 1000) = $90 + $30 = $120.00')
    console.log('   2500 pieces:  $90 + ($0.03 × 2500) = $90 + $75 = $165.00')
    console.log('   5000 pieces:  $90 + ($0.03 × 5000) = $90 + $150 = $240.00')
  } catch (error) {
    console.error('❌ Error creating Door Hanger Die Cut addon:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDoorHangerAddon()
