import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting add-ons and paper stocks seed...')

  // Create Paper Stocks
  const paperStocks = [
    {
      name: '100lb Gloss Text',
      category: 'Text',
      coating: 'Gloss',
      weight: '100lb',
      finish: 'Smooth',
      costPerSheet: 0.05,
      priceMultiplier: 1.0,
      thickness: 0.005,
      opacity: 95,
      brightness: 92,
      isEcoFriendly: false,
      isActive: true,
    },
    {
      name: '100lb Matte Text',
      category: 'Text',
      coating: 'Matte',
      weight: '100lb',
      finish: 'Smooth',
      costPerSheet: 0.05,
      priceMultiplier: 1.0,
      thickness: 0.005,
      opacity: 95,
      brightness: 90,
      isEcoFriendly: false,
      isActive: true,
    },
    {
      name: '14pt Gloss Cover',
      category: 'Cover',
      coating: 'Gloss',
      weight: '14pt',
      finish: 'Smooth',
      costPerSheet: 0.08,
      priceMultiplier: 1.2,
      thickness: 0.014,
      opacity: 99,
      brightness: 94,
      isEcoFriendly: false,
      isActive: true,
    },
    {
      name: '14pt Matte Cover',
      category: 'Cover',
      coating: 'Matte',
      weight: '14pt',
      finish: 'Smooth',
      costPerSheet: 0.08,
      priceMultiplier: 1.2,
      thickness: 0.014,
      opacity: 99,
      brightness: 92,
      isEcoFriendly: false,
      isActive: true,
    },
    {
      name: '16pt Gloss Cover',
      category: 'Cover',
      coating: 'Gloss',
      weight: '16pt',
      finish: 'Smooth',
      costPerSheet: 0.1,
      priceMultiplier: 1.3,
      thickness: 0.016,
      opacity: 100,
      brightness: 95,
      isEcoFriendly: false,
      isActive: true,
    },
    {
      name: '16pt Matte Cover',
      category: 'Cover',
      coating: 'Matte',
      weight: '16pt',
      finish: 'Smooth',
      costPerSheet: 0.1,
      priceMultiplier: 1.3,
      thickness: 0.016,
      opacity: 100,
      brightness: 93,
      isEcoFriendly: false,
      isActive: true,
    },
    {
      name: '100% Recycled Matte',
      category: 'Eco',
      coating: 'Matte',
      weight: '14pt',
      finish: 'Natural',
      costPerSheet: 0.12,
      priceMultiplier: 1.4,
      thickness: 0.014,
      opacity: 96,
      brightness: 88,
      isEcoFriendly: true,
      isActive: true,
    },
  ]

  for (const stock of paperStocks) {
    const created = await prisma.paperStock.upsert({
      where: { name: stock.name },
      update: stock,
      create: stock,
    })
    console.log(`✓ Upserted paper stock: ${created.name}`)
  }

  // Create Coating Options
  const coatingOptions = [
    {
      name: 'No Coating',
      description: 'Uncoated paper finish',
      additionalCost: 0,
    },
    {
      name: 'UV Coating',
      description: 'High gloss UV coating for extra shine and protection',
      additionalCost: 0.15,
    },
    {
      name: 'Aqueous Coating',
      description: 'Water-based coating for protection',
      additionalCost: 0.1,
    },
    {
      name: 'Soft Touch',
      description: 'Velvety soft touch lamination',
      additionalCost: 0.25,
    },
  ]

  for (const coating of coatingOptions) {
    const created = await prisma.coatingOption.upsert({
      where: { name: coating.name },
      update: coating,
      create: coating,
    })
    console.log(`✓ Upserted coating option: ${created.name}`)
  }

  // Create Sides Options
  const sidesOptions = [
    {
      name: 'Single Sided (4/0)',
      code: '4/0',
      description: 'Full color front, blank back',
      isDefault: false,
    },
    {
      name: 'Double Sided (4/4)',
      code: '4/4',
      description: 'Full color both sides',
      isDefault: true,
    },
    {
      name: 'Black & White Single (1/0)',
      code: '1/0',
      description: 'Black ink front, blank back',
      isDefault: false,
    },
    {
      name: 'Black & White Double (1/1)',
      code: '1/1',
      description: 'Black ink both sides',
      isDefault: false,
    },
  ]

  for (const side of sidesOptions) {
    const created = await prisma.sidesOption.upsert({
      where: { name: side.name },
      update: side,
      create: side,
    })
    console.log(`✓ Upserted sides option: ${created.name}`)
  }

  // Create Add-ons
  const addOns = [
    {
      name: 'Rounded Corners',
      description: 'Round the corners of your prints',
      tooltipText: 'Add rounded corners for a professional, modern look',
      pricingModel: 'FLAT',
      configuration: {
        flatFee: 15.0,
        radius: ['1/8"', '1/4"', '3/8"', '1/2"'],
      },
      additionalTurnaroundDays: 1,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Folding',
      description: 'Professional folding services',
      tooltipText: 'We offer various folding options for brochures and flyers',
      pricingModel: 'PER_UNIT',
      configuration: {
        perUnit: 0.05,
        types: ['Half Fold', 'Tri-Fold', 'Z-Fold', 'Gate Fold'],
      },
      additionalTurnaroundDays: 1,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Hole Drilling',
      description: 'Add holes for binders or hanging',
      tooltipText: 'Standard 3-hole punch or custom hole placement',
      pricingModel: 'FLAT',
      configuration: {
        flatFee: 20.0,
        options: ['3-Hole Punch', '2-Hole Punch', 'Custom'],
      },
      additionalTurnaroundDays: 1,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Perforation',
      description: 'Add tear-away perforations',
      tooltipText: 'Create tear-off coupons or response cards',
      pricingModel: 'FLAT',
      configuration: {
        flatFee: 25.0,
        placement: ['Horizontal', 'Vertical', 'Custom'],
      },
      additionalTurnaroundDays: 1,
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Scoring',
      description: 'Pre-score for easy folding',
      tooltipText: 'Scoring creates a crease for clean, professional folds',
      pricingModel: 'PER_UNIT',
      configuration: {
        perUnit: 0.03,
        lines: [1, 2, 3, 4],
      },
      additionalTurnaroundDays: 1,
      sortOrder: 5,
      isActive: true,
    },
    {
      name: 'Numbering',
      description: 'Sequential numbering for tickets or forms',
      tooltipText: 'Add sequential numbers for tracking',
      pricingModel: 'PER_UNIT',
      configuration: {
        perUnit: 0.1,
        startNumber: 1,
        placement: ['Top Right', 'Bottom Right', 'Custom'],
      },
      additionalTurnaroundDays: 2,
      sortOrder: 6,
      isActive: true,
    },
    {
      name: 'Foil Stamping',
      description: 'Add metallic foil accents',
      tooltipText: 'Premium metallic foil in gold, silver, or custom colors',
      pricingModel: 'PERCENTAGE',
      configuration: {
        percentage: 25,
        colors: ['Gold', 'Silver', 'Rose Gold', 'Copper', 'Custom'],
      },
      additionalTurnaroundDays: 3,
      sortOrder: 7,
      isActive: true,
    },
    {
      name: 'Spot UV',
      description: 'Selective UV coating for emphasis',
      tooltipText: 'Add glossy UV coating to specific areas',
      pricingModel: 'PERCENTAGE',
      configuration: {
        percentage: 20,
        coverage: ['Logo Only', 'Text Only', 'Custom Pattern'],
      },
      additionalTurnaroundDays: 2,
      sortOrder: 8,
      isActive: true,
    },
  ]

  for (const addOn of addOns) {
    const created = await prisma.addOn.upsert({
      where: { name: addOn.name },
      update: addOn,
      create: addOn,
    })
    console.log(`✓ Upserted add-on: ${created.name}`)
  }

  console.log('✅ Add-ons and paper stocks seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
