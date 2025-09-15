import { PrismaClient, PricingModel } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAddOns() {
  console.log('Seeding add-ons...')

  const addOnsData = [
    {
      name: 'Digital Proof',
      description: 'Digital proof for approval before production',
      tooltipText: 'We will email you a digital proof for your approval before production begins.',
      pricingModel: 'FLAT' as PricingModel,
      configuration: { price: 5.00 },
      additionalTurnaroundDays: 0,
      sortOrder: 1,
      isActive: true,
      adminNotes: 'Email proof to customer before production'
    },
    {
      name: 'Our Tagline',
      description: '5% discount for including our tagline',
      tooltipText: 'Add our company tagline to your design for a 5% discount on base printing costs.',
      pricingModel: 'PERCENTAGE' as PricingModel,
      configuration: { 
        percentage: -5.0, // Negative for discount
        appliesTo: 'base_price',
        hiddenForBrokers: true
      },
      additionalTurnaroundDays: 0,
      sortOrder: 2,
      isActive: true,
      adminNotes: 'Hidden for brokers with assigned discount. Discount applies before turnaround markup.'
    },
    {
      name: 'Perforation',
      description: 'Perforation service with custom positioning',
      tooltipText: 'Add perforations to make tear-off sections. Setup fee plus per-piece charge.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: { 
        setupFee: 20.00,
        pricePerPiece: 0.01
      },
      additionalTurnaroundDays: 1,
      sortOrder: 3,
      isActive: true,
      adminNotes: 'Requires position specification from customer'
    },
    {
      name: 'Score Only',
      description: 'Scoring service for easy folding',
      tooltipText: 'Score lines make folding easier and more professional. Price based on number of scores.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: { 
        setupFee: 17.00,
        pricePerScorePerPiece: 0.01
      },
      additionalTurnaroundDays: 1,
      sortOrder: 4,
      isActive: true,
      adminNotes: 'Price varies by number of score lines'
    },
    {
      name: 'Folding',
      description: 'Professional folding service',
      tooltipText: 'Professional folding service. Text paper and card stock have different pricing.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: { 
        textPaper: { setupFee: 0.17, pricePerPiece: 0.01 },
        cardStock: { setupFee: 0.34, pricePerPiece: 0.02, includesBasicScore: true },
        minSize: { width: 5, height: 6 }
      },
      additionalTurnaroundDays: 3,
      sortOrder: 5,
      isActive: true,
      adminNotes: 'Text Paper: $0.17 + $0.01/piece. Card Stock: $0.34 + $0.02/piece (includes score). Min 5x6.'
    },
    {
      name: 'Design Services',
      description: 'Custom design services',
      tooltipText: 'Choose from upload your own artwork or custom design services.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: { 
        uploadArtwork: { price: 0, turnaroundHours: 0 },
        standardOneSide: { price: 90.00, turnaroundHours: 72 },
        standardTwoSides: { price: 135.00, turnaroundHours: 72 },
        rushOneSide: { price: 160.00, turnaroundHours: 36 },
        rushTwoSides: { price: 240.00, turnaroundHours: 36 },
        minorChanges: { price: 22.50, turnaroundHours: 24 },
        majorChanges: { price: 45.00, turnaroundHours: 48 }
      },
      additionalTurnaroundDays: 0,
      sortOrder: 6,
      isActive: true,
      adminNotes: 'Design time is separate from print production.'
    },
    {
      name: 'Exact Size',
      description: 'Exact size cutting service',
      tooltipText: 'Cut to your exact specifications with precision. 12.5% markup on base price.',
      pricingModel: 'PERCENTAGE' as PricingModel,
      configuration: { 
        percentage: 12.5,
        appliesTo: 'adjusted_base_price'
      },
      additionalTurnaroundDays: 0,
      sortOrder: 7,
      isActive: true,
      adminNotes: '12.5% markup on adjusted base price'
    },
    {
      name: 'Banding',
      description: 'Banding service for bundled delivery',
      tooltipText: 'Band your materials in bundles for easy distribution.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: { 
        pricePerBundle: 0.75,
        defaultItemsPerBundle: 100
      },
      additionalTurnaroundDays: 1,
      sortOrder: 8,
      isActive: true,
      adminNotes: 'Customer specifies band type and bundle size'
    },
    {
      name: 'Shrink Wrapping',
      description: 'Shrink wrapping for protection',
      tooltipText: 'Protect your materials with shrink wrapping.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: { 
        pricePerBundle: 0.30
      },
      additionalTurnaroundDays: 1,
      sortOrder: 9,
      isActive: true,
      adminNotes: 'Customer specifies items per bundle'
    },
    {
      name: 'QR Code',
      description: 'QR Code generation and placement',
      tooltipText: 'We will create and place a QR code on your design.',
      pricingModel: 'FLAT' as PricingModel,
      configuration: { 
        price: 5.00,
        adminGenerated: true
      },
      additionalTurnaroundDays: 0,
      sortOrder: 10,
      isActive: true,
      adminNotes: 'Admin manually creates QR code from customer content.'
    },
    {
      name: 'Postal Delivery (DDU)',
      description: 'Direct delivery to post office',
      tooltipText: 'We deliver directly to the post office for EDDM campaigns.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: { 
        pricePerBox: 30.00,
        eddmOnly: true
      },
      additionalTurnaroundDays: 1,
      sortOrder: 11,
      isActive: true,
      adminNotes: 'For EDDM-eligible products only.'
    },
    {
      name: 'EDDM Process & Postage',
      description: 'Complete EDDM processing and postage',
      tooltipText: 'Full EDDM service including postage. Mandatory paper banding included.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: { 
        setupFee: 50.00,
        pricePerPiece: 0.239,
        mandatoryBanding: true,
        eddmOnly: true
      },
      additionalTurnaroundDays: 2,
      sortOrder: 12,
      isActive: true,
      adminNotes: 'Mandatory Paper Banding auto-selected. For EDDM-eligible products only.'
    },
    {
      name: 'Hole Drilling',
      description: 'Hole drilling service',
      tooltipText: 'Add holes for binding or hanging.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: { 
        setupFee: 20.00,
        customHolesPricePerHolePerPiece: 0.02,
        binderPunchPricePerPiece: 0.01
      },
      additionalTurnaroundDays: 1,
      sortOrder: 13,
      isActive: true,
      adminNotes: 'Custom holes 1-5: $0.02 per hole per piece. Binder punch: $0.01 per piece.'
    }
  ]

  for (const addOn of addOnsData) {
    try {
      await prisma.addOn.upsert({
        where: { name: addOn.name },
        update: addOn,
        create: addOn
      })
      console.log(`✓ Seeded add-on: ${addOn.name}`)
    } catch (error) {
      console.error(`Error seeding add-on ${addOn.name}:`, error)
    }
  }

  // Add sub-options for complex add-ons
  const perforationAddOn = await prisma.addOn.findUnique({
    where: { name: 'Perforation' }
  })

  if (perforationAddOn) {
    await prisma.addOnSubOption.createMany({
      data: [
        {
          addOnId: perforationAddOn.id,
          name: 'Orientation',
          optionType: 'dropdown',
          options: ['Vertical', 'Horizontal'],
          isRequired: true,
          affectsPricing: false,
          tooltipText: 'Choose perforation orientation',
          displayOrder: 1
        },
        {
          addOnId: perforationAddOn.id,
          name: 'Position',
          optionType: 'text_input',
          isRequired: true,
          affectsPricing: false,
          tooltipText: 'Specify where you want the perforation (e.g., "2 inches from left")',
          displayOrder: 2
        }
      ],
      skipDuplicates: true
    })
  }

  const scoreAddOn = await prisma.addOn.findUnique({
    where: { name: 'Score Only' }
  })

  if (scoreAddOn) {
    await prisma.addOnSubOption.createMany({
      data: [
        {
          addOnId: scoreAddOn.id,
          name: 'Number of Scores',
          optionType: 'dropdown',
          options: ['1', '2', '3', '4', '5'],
          defaultValue: '1',
          isRequired: true,
          affectsPricing: true,
          tooltipText: 'Number of score lines needed',
          displayOrder: 1
        },
        {
          addOnId: scoreAddOn.id,
          name: 'Score Positions',
          optionType: 'text_input',
          isRequired: true,
          affectsPricing: false,
          tooltipText: 'Specify positions (e.g., "3.5 inches from left, 7 inches from left")',
          displayOrder: 2
        }
      ],
      skipDuplicates: true
    })
  }

  const foldingAddOn = await prisma.addOn.findUnique({
    where: { name: 'Folding' }
  })

  if (foldingAddOn) {
    await prisma.addOnSubOption.createMany({
      data: [
        {
          addOnId: foldingAddOn.id,
          name: 'Fold Type',
          optionType: 'dropdown',
          options: ['Half Fold', 'Tri Fold', 'Z Fold', 'Gate Fold', 'Double Parallel Fold', 'Roll Fold'],
          defaultValue: 'Half Fold',
          isRequired: true,
          affectsPricing: false,
          tooltipText: 'Choose the type of fold for your project',
          displayOrder: 1
        }
      ],
      skipDuplicates: true
    })
  }

  console.log('Add-ons seeding completed!')
}

seedAddOns()
  .catch((e) => {
    console.error('Error seeding add-ons:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })