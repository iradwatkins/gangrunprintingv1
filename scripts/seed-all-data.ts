import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPaperStocks() {

  const paperStocks = [
    // Business Card Papers
    {
      name: '14pt Cardstock',
      category: 'Premium',
      coating: 'Uncoated',
      weight: '14pt',
      pricePerSqInch: 0.0015,
      costPerSheet: 0.08,
      finish: 'Matte',
      thickness: 0.014,
      sides: 'Double',
    },
    {
      name: '16pt Cardstock',
      category: 'Premium',
      coating: 'C2S',
      weight: '16pt',
      pricePerSqInch: 0.0018,
      costPerSheet: 0.1,
      finish: 'Gloss',
      thickness: 0.016,
      sides: 'Double',
    },
    {
      name: '32pt Triple Layer',
      category: 'Luxury',
      coating: 'Soft Touch',
      weight: '32pt',
      pricePerSqInch: 0.0045,
      costPerSheet: 0.25,
      finish: 'Soft Touch',
      thickness: 0.032,
      sides: 'Double',
    },
    {
      name: 'Silk Laminated 16pt',
      category: 'Luxury',
      coating: 'Silk',
      weight: '16pt',
      pricePerSqInch: 0.0035,
      costPerSheet: 0.2,
      finish: 'Silk',
      thickness: 0.018,
      sides: 'Double',
    },

    // Standard Papers
    {
      name: '100lb Gloss Text',
      category: 'Standard',
      coating: 'Gloss',
      weight: '100lb',
      pricePerSqInch: 0.0008,
      costPerSheet: 0.05,
      finish: 'Gloss',
      thickness: 0.008,
      sides: 'Double',
    },
    {
      name: '100lb Matte Text',
      category: 'Standard',
      coating: 'Matte',
      weight: '100lb',
      pricePerSqInch: 0.0008,
      costPerSheet: 0.05,
      finish: 'Matte',
      thickness: 0.008,
      sides: 'Double',
    },
    {
      name: '70lb Uncoated Text',
      category: 'Economy',
      coating: 'None',
      weight: '70lb',
      pricePerSqInch: 0.0005,
      costPerSheet: 0.03,
      finish: 'Uncoated',
      thickness: 0.006,
      sides: 'Double',
    },
    {
      name: '80lb Gloss Cover',
      category: 'Standard',
      coating: 'Gloss',
      weight: '80lb',
      pricePerSqInch: 0.001,
      costPerSheet: 0.06,
      finish: 'Gloss',
      thickness: 0.01,
      sides: 'Double',
    },
    {
      name: '80lb Matte Cover',
      category: 'Standard',
      coating: 'Matte',
      weight: '80lb',
      pricePerSqInch: 0.001,
      costPerSheet: 0.06,
      finish: 'Matte',
      thickness: 0.01,
      sides: 'Double',
    },

    // Specialty Papers
    {
      name: 'Kraft Paper',
      category: 'Specialty',
      coating: 'None',
      weight: '18pt',
      pricePerSqInch: 0.002,
      costPerSheet: 0.12,
      finish: 'Natural',
      thickness: 0.018,
      sides: 'Double',
      isEcoFriendly: true,
    },
    {
      name: 'Recycled Matte',
      category: 'Eco-Friendly',
      coating: 'None',
      weight: '14pt',
      pricePerSqInch: 0.0016,
      costPerSheet: 0.09,
      finish: 'Matte',
      thickness: 0.014,
      sides: 'Double',
      isEcoFriendly: true,
    },
    {
      name: 'Pearl Metallic',
      category: 'Luxury',
      coating: 'Metallic',
      weight: '16pt',
      pricePerSqInch: 0.004,
      costPerSheet: 0.22,
      finish: 'Metallic',
      thickness: 0.016,
      sides: 'Double',
    },
    {
      name: 'Linen Textured',
      category: 'Premium',
      coating: 'None',
      weight: '14pt',
      pricePerSqInch: 0.0025,
      costPerSheet: 0.14,
      finish: 'Textured',
      thickness: 0.014,
      sides: 'Double',
    },

    // Large Format Papers
    {
      name: 'Photo Paper Glossy',
      category: 'Photo',
      coating: 'Glossy',
      weight: '10mil',
      pricePerSqInch: 0.0012,
      costPerSheet: 0.15,
      finish: 'High Gloss',
      thickness: 0.01,
      sides: 'Single',
    },
    {
      name: 'Canvas Material',
      category: 'Large Format',
      coating: 'Matte',
      weight: '21mil',
      pricePerSqInch: 0.005,
      costPerSheet: 0.45,
      finish: 'Canvas',
      thickness: 0.021,
      sides: 'Single',
    },
    {
      name: '13oz Vinyl Banner',
      category: 'Large Format',
      coating: 'None',
      weight: '13oz',
      pricePerSqInch: 0.003,
      costPerSheet: 0.35,
      finish: 'Matte',
      thickness: 0.015,
      sides: 'Single',
    },
    {
      name: '18oz Heavy Duty Vinyl',
      category: 'Large Format',
      coating: 'None',
      weight: '18oz',
      pricePerSqInch: 0.004,
      costPerSheet: 0.5,
      finish: 'Matte',
      thickness: 0.02,
      sides: 'Single',
    },

    // Sticker Materials
    {
      name: 'White Vinyl Sticker',
      category: 'Stickers',
      coating: 'Gloss',
      weight: '4mil',
      pricePerSqInch: 0.0025,
      costPerSheet: 0.08,
      finish: 'Gloss',
      thickness: 0.004,
      sides: 'Single',
    },
    {
      name: 'Clear Vinyl Sticker',
      category: 'Stickers',
      coating: 'Gloss',
      weight: '4mil',
      pricePerSqInch: 0.003,
      costPerSheet: 0.1,
      finish: 'Clear',
      thickness: 0.004,
      sides: 'Single',
    },
    {
      name: 'Holographic Sticker',
      category: 'Stickers',
      coating: 'Holographic',
      weight: '4mil',
      pricePerSqInch: 0.005,
      costPerSheet: 0.15,
      finish: 'Holographic',
      thickness: 0.004,
      sides: 'Single',
    },
  ]

  for (const stock of paperStocks) {
    await prisma.paperStock.upsert({
      where: { name: stock.name },
      update: stock,
      create: stock,
    })
  }

}

async function seedSizeGroups() {

  const sizeGroups = [
    {
      name: 'Business Card Sizes',
      description: 'Standard and custom business card dimensions',
      values: '2x3.5,2.5x2.5,2x2,custom',
      defaultValue: '2x3.5',
    },
    {
      name: 'Flyer Sizes',
      description: 'Common flyer and handout sizes',
      values: '4x6,5x7,5.5x8.5,8.5x11,11x17,custom',
      defaultValue: '8.5x11',
    },
    {
      name: 'Poster Sizes',
      description: 'Standard poster dimensions',
      values: '11x17,12x18,16x20,18x24,24x36,custom',
      defaultValue: '18x24',
    },
    {
      name: 'Banner Sizes',
      description: 'Indoor and outdoor banner sizes',
      values: '2x4,2x6,3x6,3x8,4x8,4x10,custom',
      defaultValue: '3x6',
    },
    {
      name: 'Sticker Sizes',
      description: 'Die-cut and standard sticker sizes',
      values: '1x1,2x2,3x3,4x4,4x6,custom',
      defaultValue: '3x3',
    },
    {
      name: 'Postcard Sizes',
      description: 'USPS standard postcard sizes',
      values: '4x6,4.25x5.5,5x7,6x9,6x11,custom',
      defaultValue: '4x6',
    },
    {
      name: 'Brochure Sizes',
      description: 'Folded brochure dimensions (flat size)',
      values: '8.5x11,8.5x14,11x17,11x25.5,custom',
      defaultValue: '8.5x11',
    },
    {
      name: 'Envelope Sizes',
      description: 'Standard envelope dimensions',
      values: '#10 (4.125x9.5),A2 (4.375x5.75),A6 (4.75x6.5),A7 (5.25x7.25),custom',
      defaultValue: '#10 (4.125x9.5)',
    },
    {
      name: 'Label Sizes',
      description: 'Common label dimensions',
      values: '1x2.625,2x4,3x5,4x6,custom',
      defaultValue: '2x4',
    },
    {
      name: 'Yard Sign Sizes',
      description: 'Standard yard sign dimensions',
      values: '12x18,18x24,24x18,24x36,custom',
      defaultValue: '18x24',
    },
  ]

  for (const group of sizeGroups) {
    await prisma.sizeGroup.upsert({
      where: { name: group.name },
      update: group,
      create: group,
    })
  }

}

async function seedQuantityGroups() {

  const quantityGroups = [
    {
      name: 'Business Card Quantities',
      description: 'Standard business card order quantities',
      values: '100,250,500,1000,2500,5000,10000,custom',
      defaultValue: '500',
    },
    {
      name: 'Flyer Quantities',
      description: 'Common flyer print runs',
      values: '25,50,100,250,500,1000,2500,5000,custom',
      defaultValue: '500',
    },
    {
      name: 'Poster Quantities',
      description: 'Poster order quantities',
      values: '1,5,10,25,50,100,250,custom',
      defaultValue: '10',
    },
    {
      name: 'Banner Quantities',
      description: 'Banner order options',
      values: '1,2,3,5,10,25,custom',
      defaultValue: '1',
    },
    {
      name: 'Sticker Quantities',
      description: 'Sticker sheet or individual quantities',
      values: '50,100,250,500,1000,2500,5000,custom',
      defaultValue: '250',
    },
    {
      name: 'Postcard Quantities',
      description: 'Direct mail postcard quantities',
      values: '50,100,250,500,1000,2500,5000,10000,custom',
      defaultValue: '500',
    },
    {
      name: 'Brochure Quantities',
      description: 'Brochure print quantities',
      values: '25,50,100,250,500,1000,2500,custom',
      defaultValue: '250',
    },
    {
      name: 'T-Shirt Quantities',
      description: 'Apparel order quantities',
      values: '1,6,12,24,48,72,144,custom',
      defaultValue: '12',
    },
    {
      name: 'Envelope Quantities',
      description: 'Envelope order quantities',
      values: '100,250,500,1000,2500,custom',
      defaultValue: '500',
    },
    {
      name: 'Label Quantities',
      description: 'Label roll or sheet quantities',
      values: '250,500,1000,2500,5000,10000,custom',
      defaultValue: '1000',
    },
  ]

  for (const group of quantityGroups) {
    await prisma.quantityGroup.upsert({
      where: { name: group.name },
      update: group,
      create: group,
    })
  }

}

async function seedAddOns() {

  const addOns = [
    {
      name: 'Rounded Corners',
      description: 'Add rounded corners to your prints',
      tooltipText: 'Give your prints a modern, polished look with rounded corners',
      pricingModel: 'FLAT' as const,
      configuration: {
        basePrice: 5.0,
        radiusOptions: ['1/8"', '1/4"', '3/8"', '1/2"'],
      },
      sortOrder: 1,
    },
    {
      name: 'Hole Drilling',
      description: 'Add holes for hanging or binding',
      tooltipText: 'Perfect for documents that need to be filed or hung',
      pricingModel: 'PER_UNIT' as const,
      configuration: {
        pricePerHole: 0.1,
        positions: ['Top Center', 'Top Corners', '3-Hole Punch', 'Custom'],
      },
      sortOrder: 2,
    },
    {
      name: 'Foil Stamping',
      description: 'Add metallic foil accents',
      tooltipText: 'Premium metallic finish for logos and text',
      pricingModel: 'PERCENTAGE' as const,
      configuration: {
        percentageMarkup: 35,
        colors: ['Gold', 'Silver', 'Rose Gold', 'Copper', 'Black'],
        minimumCharge: 25.0,
      },
      additionalTurnaroundDays: 2,
      sortOrder: 3,
    },
    {
      name: 'Spot UV Coating',
      description: 'Glossy coating on specific areas',
      tooltipText: 'Creates contrast and highlights important elements',
      pricingModel: 'PERCENTAGE' as const,
      configuration: {
        percentageMarkup: 25,
        minimumCharge: 20.0,
      },
      additionalTurnaroundDays: 1,
      sortOrder: 4,
    },
    {
      name: 'Embossing/Debossing',
      description: 'Raised or recessed impressions',
      tooltipText: 'Add tactile dimension to your design',
      pricingModel: 'FLAT' as const,
      configuration: {
        basePrice: 50.0,
        types: ['Emboss', 'Deboss', 'Both'],
      },
      additionalTurnaroundDays: 3,
      sortOrder: 5,
    },
    {
      name: 'Die Cutting',
      description: 'Custom shaped cutting',
      tooltipText: 'Cut your prints into custom shapes',
      pricingModel: 'CUSTOM' as const,
      configuration: {
        setupFee: 75.0,
        perUnitPrice: 0.15,
        complexity: ['Simple', 'Moderate', 'Complex'],
      },
      additionalTurnaroundDays: 2,
      sortOrder: 6,
    },
    {
      name: 'Lamination',
      description: 'Protective plastic coating',
      tooltipText: 'Protects against moisture, tears, and fading',
      pricingModel: 'PER_UNIT' as const,
      configuration: {
        pricePerSqInch: 0.002,
        types: ['Gloss', 'Matte', 'Soft Touch'],
        thickness: ['3mil', '5mil', '10mil'],
      },
      sortOrder: 7,
    },
    {
      name: 'Perforation',
      description: 'Add tear-away perforated lines',
      tooltipText: 'Perfect for tickets, coupons, and tear-off sections',
      pricingModel: 'PER_UNIT' as const,
      configuration: {
        pricePerLine: 5.0,
        patterns: ['Straight', 'Micro-perf'],
      },
      sortOrder: 8,
    },
    {
      name: 'Numbering',
      description: 'Sequential numbering for tracking',
      tooltipText: 'Add sequential numbers for tickets, invoices, etc.',
      pricingModel: 'PER_UNIT' as const,
      configuration: {
        pricePerThousand: 15.0,
        startNumber: 1,
        prefix: '',
        suffix: '',
      },
      sortOrder: 9,
    },
    {
      name: 'Rush Production',
      description: 'Expedited printing and shipping',
      tooltipText: 'Get your order faster with priority production',
      pricingModel: 'PERCENTAGE' as const,
      configuration: {
        percentageMarkup: 50,
        turnaroundDays: [1, 2, 3],
      },
      additionalTurnaroundDays: -2,
      sortOrder: 10,
    },
    {
      name: 'Design Services',
      description: 'Professional design assistance',
      tooltipText: 'Let our designers help create your perfect print',
      pricingModel: 'FLAT' as const,
      configuration: {
        hourlyRate: 75.0,
        packages: {
          'Basic Touch-up': 25.0,
          'Layout Design': 150.0,
          'Full Design': 300.0,
        },
      },
      sortOrder: 11,
    },
    {
      name: 'White Ink Printing',
      description: 'White ink on dark or transparent materials',
      tooltipText: 'Essential for printing on dark papers or clear materials',
      pricingModel: 'PERCENTAGE' as const,
      configuration: {
        percentageMarkup: 20,
        minimumCharge: 15.0,
      },
      sortOrder: 12,
    },
  ]

  for (const addOn of addOns) {
    await prisma.addOn.upsert({
      where: { name: addOn.name },
      update: addOn,
      create: addOn,
    })
  }

}

async function seedCategories() {

  const categories = [
    {
      id: 'business-cards',
      name: 'Business Cards',
      slug: 'business-cards',
      description: 'Professional business cards in various styles',
      sortOrder: 1,
    },
    {
      id: 'flyers',
      name: 'Flyers & Brochures',
      slug: 'flyers',
      description: 'Marketing flyers and brochures',
      sortOrder: 2,
    },
    {
      id: 'postcards',
      name: 'Postcards',
      slug: 'postcards',
      description: 'Direct mail and promotional postcards',
      sortOrder: 3,
    },
    {
      id: 'posters',
      name: 'Posters',
      slug: 'posters',
      description: 'Large format posters',
      sortOrder: 4,
    },
    {
      id: 'banners',
      name: 'Banners & Signs',
      slug: 'banners',
      description: 'Indoor and outdoor signage',
      sortOrder: 5,
    },
    {
      id: 'stickers',
      name: 'Stickers & Labels',
      slug: 'stickers',
      description: 'Custom stickers and labels',
      sortOrder: 6,
    },
    {
      id: 'apparel',
      name: 'Apparel',
      slug: 'apparel',
      description: 'Custom printed clothing',
      sortOrder: 7,
    },
    {
      id: 'marketing',
      name: 'Marketing Materials',
      slug: 'marketing',
      description: 'Various marketing materials',
      sortOrder: 8,
    },
    {
      id: 'packaging',
      name: 'Packaging',
      slug: 'packaging',
      description: 'Custom packaging solutions',
      sortOrder: 9,
    },
    {
      id: 'large-format',
      name: 'Large Format',
      slug: 'large-format',
      description: 'Wide format printing',
      sortOrder: 10,
    },
  ]

  for (const category of categories) {
    await prisma.productCategory.upsert({
      where: { id: category.id },
      update: { ...category, updatedAt: new Date() },
      create: { ...category, createdAt: new Date(), updatedAt: new Date() },
    })
  }

}

async function seedSidesAndCoatings() {

  // Sides options
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
      name: 'Front Color, Back B&W (4/1)',
      code: '4/1',
      description: 'Full color front, black & white back',
      isDefault: false,
    },
    {
      name: 'Black & White Both Sides (1/1)',
      code: '1/1',
      description: 'Black & white both sides',
      isDefault: false,
    },
  ]

  for (const option of sidesOptions) {
    await prisma.sidesOption.upsert({
      where: { code: option.code },
      update: option,
      create: option,
    })
  }

  // Coating options
  const coatingOptions = [
    { name: 'No Coating', description: 'Uncoated finish' },
    { name: 'Matte Coating', description: 'Non-reflective smooth finish', additionalCost: 0.0002 },
    { name: 'Gloss Coating', description: 'Shiny reflective finish', additionalCost: 0.0002 },
    { name: 'High Gloss UV', description: 'Ultra-shiny UV coating', additionalCost: 0.0005 },
    { name: 'Soft Touch', description: 'Velvet-like texture', additionalCost: 0.0008 },
    {
      name: 'Aqueous Coating',
      description: 'Water-based protective coating',
      additionalCost: 0.0003,
    },
  ]

  for (const option of coatingOptions) {
    await prisma.coatingOption.upsert({
      where: { name: option.name },
      update: option,
      create: option,
    })
  }

}

async function main() {
  try {

    await seedCategories()
    await seedPaperStocks()
    await seedSizeGroups()
    await seedQuantityGroups()
    await seedAddOns()
    await seedSidesAndCoatings()

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
