import { PrismaClient, PricingModel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating Score addon...')

  // Find the "Add-Ons" addon set
  const addOnSet = await prisma.addOnSet.findFirst({
    where: { name: 'Add-Ons' },
  })

  if (!addOnSet) {
    throw new Error('Add-Ons set not found')
  }

  // Create the Score addon
  const score = await prisma.addOn.create({
    data: {
      name: 'Score',
      description:
        'Score creates a crease in your print job making it easier to fold without cracking the ink.',
      tooltipText:
        '$17.00 + $.01/piece - Score creates a crease in your print job making it easier to fold without cracking the ink.',
      pricingModel: PricingModel.CUSTOM,
      configuration: {
        baseFee: 17,
        perPieceRate: 0.01,
      },
      additionalTurnaroundDays: 1,
      isActive: true,
    },
  })

  console.log('Created Score addon:', score.id)

  // Associate with Add-Ons set
  const lastItem = await prisma.addOnSetItem.findFirst({
    where: { addOnSetId: addOnSet.id },
    orderBy: { sortOrder: 'desc' },
  })

  const newSortOrder = (lastItem?.sortOrder || 0) + 1

  await prisma.addOnSetItem.create({
    data: {
      addOnSetId: addOnSet.id,
      addOnId: score.id,
      sortOrder: newSortOrder,
    },
  })

  console.log('Associated Score with Add-Ons set')
  console.log('\n✅ Score addon created successfully!')
  console.log('\nPricing: $17.00 + $0.01/piece')
  console.log('Additional turnaround: +1 business day')

  console.log('\n📊 Example pricing:')
  console.log('500 pieces: $17 + (500 × $0.01) = $22.00')
  console.log('1000 pieces: $17 + (1000 × $0.01) = $27.00')
  console.log('2500 pieces: $17 + (2500 × $0.01) = $42.00')
  console.log('5000 pieces: $17 + (5000 × $0.01) = $67.00')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
