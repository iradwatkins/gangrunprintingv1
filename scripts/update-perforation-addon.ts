import { PrismaClient, PricingModel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Updating Perforation addon...')

  // Update the Perforation addon
  const perforation = await prisma.addOn.update({
    where: { name: 'Perforation' },
    data: {
      description:
        'A straight row of tiny holes punched in the paper so that a part can be torn off easily. This perforation row goes completely across the sheet from one side to the other.',
      tooltipText:
        '$20.00 + $.01/piece - A straight row of tiny holes punched in the paper so that a part can be torn off easily. This perforation row goes completely across the sheet from one side to the other.',
      pricingModel: PricingModel.CUSTOM,
      configuration: {
        baseFee: 20,
        perPieceRate: 0.01,
      },
      additionalTurnaroundDays: 1,
      isActive: true,
    },
  })

  console.log('Updated Perforation addon:', perforation.id)

  // Delete existing sub-options
  await prisma.addOnSubOption.deleteMany({
    where: { addOnId: perforation.id },
  })

  console.log('Deleted old sub-options')

  // Create "How Many Vertical" sub-option
  const howManyVertical = await prisma.addOnSubOption.create({
    data: {
      addOnId: perforation.id,
      name: 'How Many Vertical',
      optionType: 'NUMBER',
      isRequired: true,
      affectsPricing: false,
      defaultValue: '0',
      tooltipText: 'Select the number of vertical perforation rows that you need.',
      displayOrder: 1,
    },
  })

  console.log('Created "How Many Vertical" sub-option:', howManyVertical.id)

  // Create "Vertical Position" sub-option
  const verticalPosition = await prisma.addOnSubOption.create({
    data: {
      addOnId: perforation.id,
      name: 'Vertical Position',
      optionType: 'TEXT',
      isRequired: false,
      affectsPricing: false,
      tooltipText:
        'Enter the position of the vertical perforation. For example, 2 inches from the right front.',
      displayOrder: 2,
    },
  })

  console.log('Created "Vertical Position" sub-option:', verticalPosition.id)

  // Create "How Many Horizontal" sub-option
  const howManyHorizontal = await prisma.addOnSubOption.create({
    data: {
      addOnId: perforation.id,
      name: 'How Many Horizontal',
      optionType: 'NUMBER',
      isRequired: true,
      affectsPricing: false,
      defaultValue: '1',
      tooltipText: 'Select the number of horizontal perforation rows that you need.',
      displayOrder: 3,
    },
  })

  console.log('Created "How Many Horizontal" sub-option:', howManyHorizontal.id)

  // Create "Horizontal Position" sub-option
  const horizontalPosition = await prisma.addOnSubOption.create({
    data: {
      addOnId: perforation.id,
      name: 'Horizontal Position',
      optionType: 'TEXT',
      isRequired: false,
      affectsPricing: false,
      defaultValue: '2" from bottom',
      tooltipText:
        'Enter the position of the horizontal perforation. For example, 2 inches from the top front.',
      displayOrder: 4,
    },
  })

  console.log('Created "Horizontal Position" sub-option:', horizontalPosition.id)

  console.log('\n✅ Perforation addon updated successfully!')
  console.log('\nPricing: $20.00 + $0.01/piece')
  console.log('Additional turnaround: +1 business day')
  console.log('\nSub-options:')
  console.log('1. How Many Vertical (NUMBER, default: 0)')
  console.log('2. Vertical Position (TEXT, optional)')
  console.log('3. How Many Horizontal (NUMBER, default: 1)')
  console.log('4. Horizontal Position (TEXT, default: "2" from bottom")')

  console.log('\n📊 Example pricing:')
  console.log('500 pieces: $20 + (500 × $0.01) = $25.00')
  console.log('1000 pieces: $20 + (1000 × $0.01) = $30.00')
  console.log('2500 pieces: $20 + (2500 × $0.01) = $45.00')
  console.log('5000 pieces: $20 + (5000 × $0.01) = $70.00')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
