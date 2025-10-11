import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createBlankEnvelopesAddon() {
  try {
    console.log('✉️  Creating Blank Envelopes addon...\n')

    // Create the addon
    const addon = await prisma.addOn.create({
      data: {
        name: 'Blank Envelopes',
        description: 'Add blank envelopes to your order.',
        tooltipText:
          '$0.25/piece - Add matching blank envelopes to your order. Choose from multiple sizes.',
        pricingModel: 'PER_UNIT',
        configuration: {
          pricePerUnit: 0.25,
          unitType: 'piece',
        },
        additionalTurnaroundDays: 0,
        sortOrder: 102,
        isActive: true,
        adminNotes: 'Blank envelopes addon - customer selects size, priced at $0.25 per envelope',
      },
    })

    console.log('✅ Blank Envelopes addon created successfully:')
    console.log(JSON.stringify(addon, null, 2))

    // Create the envelope size sub-option
    const subOption = await prisma.addOnSubOption.create({
      data: {
        addOnId: addon.id,
        name: 'Envelope Size',
        optionType: 'SELECT',
        options: [
          'No Envelopes',
          '4 Bar (5.125x3.625)',
          'A2 (5.75x4.375)',
          'A4 (4.25x6.25)',
          'A7 (7.25x5.25)',
          'A9 (8.75x5.75)',
        ],
        defaultValue: '4 Bar (5.125x3.625)',
        isRequired: true,
        affectsPricing: true,
        tooltipText:
          'Select the envelope size that matches your product. No Envelopes option available if you do not need envelopes.',
        displayOrder: 0,
      },
    })

    console.log('\n✅ Envelope Size sub-option created:')
    console.log(JSON.stringify(subOption, null, 2))

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
            sortOrder: 102,
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

    console.log('\n✅ Blank Envelopes addon setup complete!')
  } catch (error) {
    console.error('❌ Error creating Blank Envelopes addon:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createBlankEnvelopesAddon()
