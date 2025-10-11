import { PrismaClient, PricingModel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating Wafer Seal addon...')

  // Find the "Add-Ons" addon set
  const addOnSet = await prisma.addOnSet.findFirst({
    where: { name: 'Add-Ons' },
  })

  if (!addOnSet) {
    throw new Error('Add-Ons set not found')
  }

  // Create the Wafer Seal addon
  const waferSeal = await prisma.addOn.create({
    data: {
      name: 'Wafer Seal',
      description: 'Wafer seals are adhesive seals used to keep folded materials closed.',
      tooltipText:
        '$25.00 + $.02/piece - Wafer seals are adhesive seals used to keep folded materials closed.',
      pricingModel: PricingModel.CUSTOM,
      configuration: {
        baseFee: 25,
        perPieceRate: 0.02,
      },
      additionalTurnaroundDays: 1,
      isActive: true,
    },
  })

  console.log('Created Wafer Seal addon:', waferSeal.id)

  // Create "How Many Seals?" sub-option
  const howManySeals = await prisma.addOnSubOption.create({
    data: {
      addOnId: waferSeal.id,
      name: 'How Many Seals?',
      optionType: 'NUMBER',
      isRequired: true,
      affectsPricing: false,
      displayOrder: 1,
    },
  })

  console.log('Created "How Many Seals?" sub-option:', howManySeals.id)

  // Create "Where Do You Want the Seals?" sub-option
  const whereSeals = await prisma.addOnSubOption.create({
    data: {
      addOnId: waferSeal.id,
      name: 'Where Do You Want the Seals?',
      optionType: 'TEXT',
      isRequired: true,
      affectsPricing: false,
      displayOrder: 2,
    },
  })

  console.log('Created "Where Do You Want the Seals?" sub-option:', whereSeals.id)

  // Associate with Add-Ons set
  const lastItem = await prisma.addOnSetItem.findFirst({
    where: { addOnSetId: addOnSet.id },
    orderBy: { sortOrder: 'desc' },
  })

  const newSortOrder = (lastItem?.sortOrder || 0) + 1

  await prisma.addOnSetItem.create({
    data: {
      addOnSetId: addOnSet.id,
      addOnId: waferSeal.id,
      sortOrder: newSortOrder,
    },
  })

  console.log('Associated Wafer Seal with Add-Ons set')
  console.log('\n✅ Wafer Seal addon created successfully!')
  console.log('\nPricing: $25.00 + $0.02/piece')
  console.log('Additional turnaround: +1 business day')
  console.log('\nSub-options:')
  console.log('1. How Many Seals? (NUMBER input)')
  console.log('2. Where Do You Want the Seals? (TEXT input)')

  console.log('\n📊 Example pricing:')
  console.log('500 pieces: $25 + (500 × $0.02) = $35.00')
  console.log('1000 pieces: $25 + (1000 × $0.02) = $45.00')
  console.log('2500 pieces: $25 + (2500 × $0.02) = $75.00')
  console.log('5000 pieces: $25 + (5000 × $0.02) = $125.00')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
