import { PrismaClient, PricingModel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating/Updating Folding addon...')

  // Find the "Add-Ons" addon set
  const addOnSet = await prisma.addOnSet.findFirst({
    where: { name: 'Add-Ons' },
  })

  if (!addOnSet) {
    throw new Error('Add-Ons set not found')
  }

  // Create or update the Folding addon
  const folding = await prisma.addOn.upsert({
    where: { name: 'Folding' },
    create: {
      name: 'Folding',
      description:
        'Please select this option if you would like your print job folded. There are several different methods for folding your print job so please be sure to choose the right one.',
      tooltipText:
        '$20.00 + $.01/piece - Please select this option if you would like your print job folded. There are several different methods for folding your print job so please be sure to choose the right one.',
      pricingModel: PricingModel.CUSTOM,
      configuration: {
        baseFee: 20,
        perPieceRate: 0.01,
      },
      additionalTurnaroundDays: 2,
      isActive: true,
    },
    update: {
      description:
        'Please select this option if you would like your print job folded. There are several different methods for folding your print job so please be sure to choose the right one.',
      tooltipText:
        '$20.00 + $.01/piece - Please select this option if you would like your print job folded. There are several different methods for folding your print job so please be sure to choose the right one.',
      pricingModel: PricingModel.CUSTOM,
      configuration: {
        baseFee: 20,
        perPieceRate: 0.01,
      },
      additionalTurnaroundDays: 2,
      isActive: true,
    },
  })

  console.log('Upserted Folding addon:', folding.id)

  // Delete existing sub-options for this addon
  await prisma.addOnSubOption.deleteMany({
    where: { addOnId: folding.id },
  })

  console.log('Deleted old sub-options')

  // Create the Fold Type sub-option with separator for admin
  const foldType = await prisma.addOnSubOption.create({
    data: {
      addOnId: folding.id,
      name: 'Fold Type',
      optionType: 'SELECT',
      isRequired: true,
      affectsPricing: false,
      options: [
        '-- Select One --',
        'Half Fold (2 Panel)',
        'Half Fold then Half Fold (4 Panel)',
        'Half Fold then Tri Fold (6 Panel)',
        'Tri Fold (3 Panel)',
        'Z Fold (3 Panel)',
        'Double Parallel Fold (4 Panel)',
        'Double Parallel Reverse Fold (4 Panel)',
        'Gate Fold (3 Panel)',
        'Double Gate Fold (4 Panel)',
        'Roll Fold (4 Panel)',
        'Accordion Fold (4 Panel)',
        '--- BROCHURE ---',
        'Brochure - Half Fold (2 Panel)',
        'Brochure - Half Fold then Half Fold (4 Panel)',
        'Brochure - Half Fold then Tri Fold (6 Panel)',
        'Brochure - Tri Fold (3 Panel)',
        'Brochure - Z Fold (3 Panel)',
        'Brochure - Double Parallel Fold (4 Panel)',
        'Brochure - Double Parallel Reverse Fold (4 Panel)',
        'Brochure - Gate Fold (3 Panel)',
        'Brochure - Double Gate Fold (4 Panel)',
        'Brochure - Roll Fold (4 Panel)',
        'Brochure - Accordion Fold (4 Panel)',
      ],
      defaultValue: '-- Select One --',
      displayOrder: 1,
    },
  })

  console.log('Created Fold Type sub-option:', foldType.id)

  // Associate with Add-Ons set (only if not already associated)
  const existingAssociation = await prisma.addOnSetItem.findFirst({
    where: {
      addOnSetId: addOnSet.id,
      addOnId: folding.id,
    },
  })

  if (!existingAssociation) {
    const lastItem = await prisma.addOnSetItem.findFirst({
      where: { addOnSetId: addOnSet.id },
      orderBy: { sortOrder: 'desc' },
    })

    const newSortOrder = (lastItem?.sortOrder || 0) + 1

    await prisma.addOnSetItem.create({
      data: {
        addOnSetId: addOnSet.id,
        addOnId: folding.id,
        sortOrder: newSortOrder,
      },
    })

    console.log('Associated Folding with Add-Ons set')
  } else {
    console.log('Folding already associated with Add-Ons set')
  }

  console.log('Associated Folding with Add-Ons set')
  console.log('\n✅ Folding addon created successfully!')
  console.log('\nPricing: $20.00 + $0.01/piece')
  console.log('Additional turnaround: +2 business days')
  console.log('\nFold options:')
  console.log('- Regular folds (11 options)')
  console.log('- --- BROCHURE --- (separator - admin only sees this)')
  console.log('- Brochure folds (11 options)')
  console.log('\nCustomers will see all options but "BROCHURE" text is just a separator')

  console.log('\n📊 Example pricing:')
  console.log('500 pieces: $20 + (500 × $0.01) = $25.00')
  console.log('1000 pieces: $20 + (1000 × $0.01) = $30.00')
  console.log('2500 pieces: $20 + (2500 × $0.01) = $45.00')
  console.log('5000 pieces: $20 + (5000 × $0.01) = $70.00')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
