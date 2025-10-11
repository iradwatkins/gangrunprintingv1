import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createHoleDrillingAddon() {
  try {
    console.log('🕳️  Creating Hole Drilling addon...\n')

    // Create the main addon with CUSTOM pricing model
    // Pricing structure:
    // 1 hole = $1, 2 holes = $2, 3 = $3, 4 = $4, 5 = $5
    // All binder punches (2/3/4/5 hole) = $1 each
    const addon = await prisma.addOn.create({
      data: {
        name: 'Hole Drilling',
        description: 'Professional hole drilling service for your print products.',
        tooltipText: '$20.00 + $.02/hole - Add custom hole drilling to your order.',
        pricingModel: 'CUSTOM',
        configuration: {
          baseFee: 20,
          perHoleRate: 0.02,
          holePricing: {
            '1': 1.0,
            '2': 2.0,
            '3': 3.0,
            '4': 4.0,
            '5': 5.0,
            '2 Hole Binder Punch': 1.0,
            '3 Hole Binder Punch': 1.0,
            '4 Hole Binder Punch': 1.0,
            '5 Hole Binder Punch': 1.0,
          },
        },
        additionalTurnaroundDays: 1,
        sortOrder: 103,
        isActive: true,
        adminNotes:
          'Hole drilling with variable pricing: 1-5 holes = $1-$5, Binder punches = $1 each. Base fee $20 + $0.02/hole per piece.',
      },
    })

    console.log('✅ Hole Drilling addon created:')
    console.log(JSON.stringify(addon, null, 2))

    // Create Number of Holes sub-option
    const numberOfHolesSubOption = await prisma.addOnSubOption.create({
      data: {
        addOnId: addon.id,
        name: 'Number of Holes',
        optionType: 'SELECT',
        options: [
          '1',
          '2',
          '3',
          '4',
          '5',
          '2 Hole Binder Punch',
          '3 Hole Binder Punch',
          '4 Hole Binder Punch',
          '5 Hole Binder Punch',
        ],
        defaultValue: '1',
        isRequired: true,
        affectsPricing: true,
        tooltipText: 'Select how many hole drills you need on your order.',
        displayOrder: 0,
      },
    })

    console.log('\n✅ Number of Holes sub-option created')

    // Create Position of Holes sub-option
    const positionSubOption = await prisma.addOnSubOption.create({
      data: {
        addOnId: addon.id,
        name: 'Position of Holes',
        optionType: 'TEXT',
        options: null,
        defaultValue: '',
        isRequired: false,
        affectsPricing: false,
        tooltipText: 'Enter the required position of the holes. For example, 1 inch from the top.',
        displayOrder: 1,
      },
    })

    console.log('✅ Position of Holes sub-option created')

    // Create Size of Holes sub-option
    const sizeSubOption = await prisma.addOnSubOption.create({
      data: {
        addOnId: addon.id,
        name: 'Size of Holes',
        optionType: 'SELECT',
        options: ['1/8"', '3/16"', '1/4"', '5/16" (Standard)', '3/8"', '7/16"', '1/2"', '1.375"'],
        defaultValue: '5/16" (Standard)',
        isRequired: true,
        affectsPricing: false,
        tooltipText: 'Select the size of the hole(s) you need on your order.',
        displayOrder: 2,
      },
    })

    console.log('✅ Size of Holes sub-option created')

    // Associate with addon sets
    const addonSets = await prisma.addOnSet.findMany({
      where: { isActive: true },
    })

    console.log(`\n📦 Found ${addonSets.length} addon sets`)

    for (const set of addonSets) {
      try {
        await prisma.addOnSetItem.create({
          data: {
            addOnSetId: set.id,
            addOnId: addon.id,
            displayPosition: 'IN_DROPDOWN',
            isDefault: false,
            sortOrder: 103,
          },
        })
        console.log(`   ✅ Associated with: ${set.name}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Already associated with: ${set.name}`)
        }
      }
    }

    console.log('\n✅ Hole Drilling addon setup complete!')
    console.log('\n📋 Pricing Structure:')
    console.log('   1 hole = $1.00')
    console.log('   2 holes = $2.00')
    console.log('   3 holes = $3.00')
    console.log('   4 holes = $4.00')
    console.log('   5 holes = $5.00')
    console.log('   2 Hole Binder Punch = $1.00')
    console.log('   3 Hole Binder Punch = $1.00')
    console.log('   4 Hole Binder Punch = $1.00')
    console.log('   5 Hole Binder Punch = $1.00')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createHoleDrillingAddon()
