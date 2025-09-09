import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting add-ons seed with correct pricing from documentation...')

  // Create Add-ons with correct pricing from documentation
  const addOns = [
    // 1. Digital Proof - $5.00 Fixed Fee
    {
      name: 'Digital Proof',
      description: 'Digital proof for approval before production',
      tooltipText: 'We will email you a digital proof for your approval before production begins. This helps ensure your order is exactly as you want it.',
      pricingModel: 'FLAT',
      configuration: {
        price: 5.00
      },
      additionalTurnaroundDays: 0,
      sortOrder: 1,
      isActive: true
    },
    // 2. Our Tagline - 5% discount off Base_Paper_Print_Price
    {
      name: 'Our Tagline',
      description: '5% discount for including our tagline',
      tooltipText: 'Add our company tagline to your design for a 5% discount on base printing costs.',
      pricingModel: 'PERCENTAGE',
      configuration: {
        percentage: -5, // Negative for discount
        appliesTo: 'base_paper_print_price',
        hiddenForBrokers: true
      },
      additionalTurnaroundDays: 0,
      sortOrder: 2,
      isActive: true,
      adminNotes: 'Hidden for brokers with assigned discount. Discount applies before turnaround markup.'
    },
    // 3. Perforation - $20.00 Fixed Fee + $0.01/piece
    {
      name: 'Perforation',
      description: 'Perforation service with custom positioning',
      tooltipText: 'Add perforations to make tear-off sections. Setup fee plus per-piece charge.',
      pricingModel: 'CUSTOM',
      configuration: {
        setupFee: 20.00,
        perUnit: 0.01,
        subOptions: ['Number (Vertical/Horizontal)', 'Position']
      },
      additionalTurnaroundDays: 1,
      sortOrder: 3,
      isActive: true
    },
    // 4. Score Only - $17.00 Fixed Fee + ($0.01 * Number of Scores)/piece
    {
      name: 'Score Only',
      description: 'Scoring service for easy folding',
      tooltipText: 'Score lines make folding easier and more professional. Price based on number of scores.',
      pricingModel: 'CUSTOM',
      configuration: {
        setupFee: 17.00,
        perScorePerUnit: 0.01,
        subOptions: ['How many scores (1-5)', 'Score Position']
      },
      additionalTurnaroundDays: 1,
      sortOrder: 4,
      isActive: true
    },
    // 5. Folding - Complex pricing based on paper type
    {
      name: 'Folding',
      description: 'Professional folding service',
      tooltipText: 'Professional folding service. Text paper and card stock have different pricing. Card stock includes mandatory basic scoring.',
      pricingModel: 'CUSTOM',
      configuration: {
        textPaper: {
          setupFee: 0.17,
          perUnit: 0.01
        },
        cardStock: {
          setupFee: 0.34,
          perUnit: 0.02,
          includesBasicScore: true
        },
        minSize: { width: 5, height: 6 },
        foldTypes: ['Half Fold', 'Tri Fold', 'Z Fold', 'Gate Fold', 'Double Parallel Fold', 'Roll Fold']
      },
      additionalTurnaroundDays: 3,
      sortOrder: 5,
      isActive: true,
      adminNotes: 'Text Paper: $0.17 + $0.01/piece. Card Stock: $0.34 + $0.02/piece (includes mandatory basic score). Min print size 5x6.'
    },
    // 6. Design Services - Multi-tier pricing
    {
      name: 'Design Services',
      description: 'Custom design services',
      tooltipText: 'Choose from upload your own artwork or custom design services. Design time is separate from print production.',
      pricingModel: 'CUSTOM',
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
    // 7. Exact Size - +12.5% markup on Adjusted_Base_Price
    {
      name: 'Exact Size',
      description: 'Exact size cutting service',
      tooltipText: 'Cut to your exact specifications with precision. 12.5% markup on base price.',
      pricingModel: 'PERCENTAGE',
      configuration: {
        percentage: 12.5,
        appliesTo: 'adjusted_base_price'
      },
      additionalTurnaroundDays: 0,
      sortOrder: 7,
      isActive: true
    },
    // 8. Banding - $0.75/bundle
    {
      name: 'Banding',
      description: 'Banding service for bundled delivery',
      tooltipText: 'Band your materials in bundles for easy distribution. Choose band type and bundle size.',
      pricingModel: 'CUSTOM',
      configuration: {
        perBundle: 0.75,
        defaultItemsPerBundle: 100,
        bandTypes: ['Paper Bands', 'Rubber Bands']
      },
      additionalTurnaroundDays: 1,
      sortOrder: 8,
      isActive: true
    },
    // 9. Shrink Wrapping - $0.30/bundle
    {
      name: 'Shrink Wrapping',
      description: 'Shrink wrapping for protection',
      tooltipText: 'Protect your materials with shrink wrapping. Specify items per bundle.',
      pricingModel: 'CUSTOM',
      configuration: {
        perBundle: 0.30
      },
      additionalTurnaroundDays: 1,
      sortOrder: 9,
      isActive: true
    },
    // 10. QR Code - $5.00 Fixed Fee
    {
      name: 'QR Code',
      description: 'QR Code generation and placement',
      tooltipText: 'We will create and place a QR code on your design. You provide the content/URL.',
      pricingModel: 'FLAT',
      configuration: {
        price: 5.00,
        adminGenerated: true
      },
      additionalTurnaroundDays: 0,
      sortOrder: 10,
      isActive: true,
      adminNotes: 'Admin manually creates QR code from customer content.'
    },
    // 11. Postal Delivery (DDU) - $30.00/box
    {
      name: 'Postal Delivery (DDU)',
      description: 'Direct delivery to post office',
      tooltipText: 'We deliver directly to the post office for EDDM campaigns. Price per shipping box.',
      pricingModel: 'CUSTOM',
      configuration: {
        perBox: 30.00,
        eddmOnly: true
      },
      additionalTurnaroundDays: 1,
      sortOrder: 11,
      isActive: true,
      adminNotes: 'For EDDM-eligible products only. Printer handles post office delivery.'
    },
    // 12. EDDM Process & Postage - $50.00 Fixed Fee + $0.239/piece
    {
      name: 'EDDM Process & Postage',
      description: 'Complete EDDM processing and postage',
      tooltipText: 'Full EDDM service including postage. Mandatory paper banding included in service.',
      pricingModel: 'CUSTOM',
      configuration: {
        setupFee: 50.00,
        perUnit: 0.239,
        mandatoryBanding: true,
        eddmOnly: true
      },
      additionalTurnaroundDays: 2,
      sortOrder: 12,
      isActive: true,
      adminNotes: 'Mandatory Paper Banding auto-selected and costed. For EDDM-eligible products only.'
    },
    // 13. Hole Drilling - $20.00 Fixed Fee + variable per-piece
    {
      name: 'Hole Drilling',
      description: 'Hole drilling service',
      tooltipText: 'Add holes for binding or hanging. Custom holes 1-5 add $0.02 per hole per piece. Binder punch options add $0.01 per piece.',
      pricingModel: 'CUSTOM',
      configuration: {
        setupFee: 20.00,
        customHolesPerHolePerUnit: 0.02,
        binderPunchPerUnit: 0.01,
        holeOptions: ['1', '2', '3', '4', '5', '3-Hole Binder Punch', '2-Hole Binder Punch']
      },
      additionalTurnaroundDays: 1,
      sortOrder: 13,
      isActive: true
    },
    // 14. Rounded Corners - As mentioned in original seed
    {
      name: 'Rounded Corners',
      description: 'Round the corners of your prints',
      tooltipText: 'Add rounded corners for a professional, modern look',
      pricingModel: 'FLAT',
      configuration: {
        price: 15.00,
        radius: ['1/8"', '1/4"', '3/8"', '1/2"']
      },
      additionalTurnaroundDays: 1,
      sortOrder: 14,
      isActive: true
    },
    // 15. Numbering - Sequential numbering
    {
      name: 'Numbering',
      description: 'Sequential numbering for tickets or forms',
      tooltipText: 'Add sequential numbers for tracking',
      pricingModel: 'PER_UNIT',
      configuration: {
        perUnit: 0.10,
        startNumber: 1,
        placement: ['Top Right', 'Bottom Right', 'Custom']
      },
      additionalTurnaroundDays: 2,
      sortOrder: 15,
      isActive: true
    },
    // 16. Foil Stamping - Premium metallic foil
    {
      name: 'Foil Stamping',
      description: 'Add metallic foil accents',
      tooltipText: 'Premium metallic foil in gold, silver, or custom colors',
      pricingModel: 'PERCENTAGE',
      configuration: {
        percentage: 25,
        colors: ['Gold', 'Silver', 'Rose Gold', 'Copper', 'Custom']
      },
      additionalTurnaroundDays: 3,
      sortOrder: 16,
      isActive: true
    },
    // 17. Spot UV - Selective UV coating
    {
      name: 'Spot UV',
      description: 'Selective UV coating for emphasis',
      tooltipText: 'Add glossy UV coating to specific areas',
      pricingModel: 'PERCENTAGE',
      configuration: {
        percentage: 20,
        coverage: ['Logo Only', 'Text Only', 'Custom Pattern']
      },
      additionalTurnaroundDays: 2,
      sortOrder: 17,
      isActive: true
    }
  ]

  // Delete existing add-ons to start fresh with correct pricing
  console.log('Clearing existing add-ons...')
  await prisma.addOn.deleteMany()

  for (const addOn of addOns) {
    const created = await prisma.addOn.create({
      data: addOn
    })
    console.log(`✓ Created add-on: ${created.name} with correct pricing`)
  }

  console.log('✅ Add-ons seed with correct pricing completed successfully!')
  console.log(`Created ${addOns.length} add-ons with accurate pricing from documentation`)
}

main()
  .catch((e) => {
    console.error('Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })