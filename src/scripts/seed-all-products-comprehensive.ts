#!/usr/bin/env tsx
/**
 * COMPREHENSIVE PRODUCT SEED SCRIPT
 *
 * This script seeds ALL product-related data to ensure nothing is lost.
 * Based on user requirement: "make sure all the current product addon are also added
 * to a product seed. quantity, size, addon, design, etc... everything."
 *
 * Created: October 17, 2025
 * Purpose: Prevent product data loss (products keep disappearing)
 *
 * Run with: npx tsx src/scripts/seed-all-products-comprehensive.ts
 */

import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

interface SeedResult {
  success: boolean
  error?: string
  counts: {
    categories: number
    paperStocks: number
    sizeGroups: number
    quantityGroups: number
    addOns: number
    sidesOptions: number
    coatingOptions: number
    products: number
    productPaperStocks: number
    productSizeGroups: number
    productQuantityGroups: number
    productAddOns: number
    pricingTiers: number
  }
}

/**
 * Seed Product Categories
 */
async function seedCategories() {
  console.log('📁 Seeding Product Categories...')
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

  let count = 0
  for (const category of categories) {
    await prisma.productCategory.upsert({
      where: { id: category.id },
      update: { ...category, updatedAt: new Date() },
      create: { ...category, createdAt: new Date(), updatedAt: new Date() },
    })
    count++
  }

  console.log(`   ✅ ${count} categories seeded`)
  return count
}

/**
 * Seed Paper Stocks
 */
async function seedPaperStocks() {
  console.log('📄 Seeding Paper Stocks...')
  const paperStocks = [
    // Business Card Papers
    {
      name: '14pt Cardstock',
      tooltipText: 'Premium uncoated cardstock with matte finish',
      weight: 0.0014,
      pricePerSqInch: 0.0015,
      vendorPricePerSqInch: 0.001,
      markupType: 'PERCENTAGE' as const,
      markupValue: 50,
    },
    {
      name: '16pt Cardstock',
      tooltipText: 'Premium gloss cardstock for vibrant colors',
      weight: 0.0016,
      pricePerSqInch: 0.0018,
      vendorPricePerSqInch: 0.0012,
      markupType: 'PERCENTAGE' as const,
      markupValue: 50,
    },
    {
      name: '32pt Triple Layer',
      tooltipText: 'Ultra-premium soft touch luxury cardstock',
      weight: 0.0032,
      pricePerSqInch: 0.0045,
      vendorPricePerSqInch: 0.003,
      markupType: 'PERCENTAGE' as const,
      markupValue: 50,
    },

    // Standard Papers
    {
      name: '100lb Gloss Text',
      tooltipText: 'Standard gloss text weight paper',
      weight: 0.0008,
      pricePerSqInch: 0.0008,
      vendorPricePerSqInch: 0.0005,
      markupType: 'PERCENTAGE' as const,
      markupValue: 60,
    },
    {
      name: '100lb Matte Text',
      tooltipText: 'Standard matte text weight paper',
      weight: 0.0008,
      pricePerSqInch: 0.0008,
      vendorPricePerSqInch: 0.0005,
      markupType: 'PERCENTAGE' as const,
      markupValue: 60,
    },
    {
      name: '70lb Uncoated Text',
      tooltipText: 'Economy uncoated text paper',
      weight: 0.0006,
      pricePerSqInch: 0.0005,
      vendorPricePerSqInch: 0.0003,
      markupType: 'PERCENTAGE' as const,
      markupValue: 66,
    },
    {
      name: '80lb Gloss Cover',
      tooltipText: 'Standard gloss cover weight',
      weight: 0.001,
      pricePerSqInch: 0.001,
      vendorPricePerSqInch: 0.0007,
      markupType: 'PERCENTAGE' as const,
      markupValue: 43,
    },
    {
      name: '80lb Matte Cover',
      tooltipText: 'Standard matte cover weight',
      weight: 0.001,
      pricePerSqInch: 0.001,
      vendorPricePerSqInch: 0.0007,
      markupType: 'PERCENTAGE' as const,
      markupValue: 43,
    },

    // Large Format Papers
    {
      name: 'Photo Paper Glossy',
      tooltipText: 'High gloss photo paper for vivid prints',
      weight: 0.001,
      pricePerSqInch: 0.0012,
      vendorPricePerSqInch: 0.0008,
      markupType: 'PERCENTAGE' as const,
      markupValue: 50,
    },
    {
      name: '13oz Vinyl Banner',
      tooltipText: 'Standard vinyl banner material',
      weight: 0.0015,
      pricePerSqInch: 0.003,
      vendorPricePerSqInch: 0.002,
      markupType: 'PERCENTAGE' as const,
      markupValue: 50,
    },

    // Sticker Materials
    {
      name: 'White Vinyl Sticker',
      tooltipText: 'Durable white vinyl with gloss finish',
      weight: 0.0004,
      pricePerSqInch: 0.0025,
      vendorPricePerSqInch: 0.0017,
      markupType: 'PERCENTAGE' as const,
      markupValue: 47,
    },
    {
      name: 'Clear Vinyl Sticker',
      tooltipText: 'Clear vinyl for see-through designs',
      weight: 0.0004,
      pricePerSqInch: 0.003,
      vendorPricePerSqInch: 0.002,
      markupType: 'PERCENTAGE' as const,
      markupValue: 50,
    },
    {
      name: 'Holographic Sticker',
      tooltipText: 'Eye-catching holographic finish',
      weight: 0.0004,
      pricePerSqInch: 0.005,
      vendorPricePerSqInch: 0.0033,
      markupType: 'PERCENTAGE' as const,
      markupValue: 51,
    },
  ]

  let count = 0
  for (const stock of paperStocks) {
    await prisma.paperStock.upsert({
      where: { name: stock.name },
      update: { ...stock, updatedAt: new Date() },
      create: {
        id: createId(),
        ...stock,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    count++
  }

  console.log(`   ✅ ${count} paper stocks seeded`)
  return count
}

/**
 * Seed Size Groups
 */
async function seedSizeGroups() {
  console.log('📐 Seeding Size Groups...')
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

  let count = 0
  for (const group of sizeGroups) {
    await prisma.sizeGroup.upsert({
      where: { name: group.name },
      update: { ...group, updatedAt: new Date() },
      create: {
        id: createId(),
        ...group,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    count++
  }

  console.log(`   ✅ ${count} size groups seeded`)
  return count
}

/**
 * Seed Quantity Groups
 */
async function seedQuantityGroups() {
  console.log('🔢 Seeding Quantity Groups...')
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

  let count = 0
  for (const group of quantityGroups) {
    await prisma.quantityGroup.upsert({
      where: { name: group.name },
      update: { ...group, updatedAt: new Date() },
      create: {
        id: createId(),
        ...group,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    count++
  }

  console.log(`   ✅ ${count} quantity groups seeded`)
  return count
}

/**
 * Seed Add-Ons
 */
async function seedAddOns() {
  console.log('🎨 Seeding Add-Ons...')
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

  let count = 0
  for (const addOn of addOns) {
    await prisma.addOn.upsert({
      where: { name: addOn.name },
      update: { ...addOn, updatedAt: new Date() },
      create: {
        id: createId(),
        ...addOn,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    count++
  }

  console.log(`   ✅ ${count} add-ons seeded`)
  return count
}

/**
 * Seed Sides and Coating Options
 */
async function seedSidesAndCoatings() {
  console.log('🎨 Seeding Sides & Coating Options...')

  // Sides options
  const sidesOptions = [
    {
      name: 'Single Sided (4/0)',
      code: '4/0',
      description: 'Full color front, blank back',
    },
    {
      name: 'Double Sided (4/4)',
      code: '4/4',
      description: 'Full color both sides',
    },
    {
      name: 'Front Color, Back B&W (4/1)',
      code: '4/1',
      description: 'Full color front, black & white back',
    },
    {
      name: 'Black & White Both Sides (1/1)',
      code: '1/1',
      description: 'Black & white both sides',
    },
  ]

  let sidesCount = 0
  for (const option of sidesOptions) {
    await prisma.sidesOption.upsert({
      where: { code: option.code },
      update: { ...option, updatedAt: new Date() },
      create: {
        id: createId(),
        ...option,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    sidesCount++
  }

  // Coating options
  const coatingOptions = [
    { name: 'No Coating', description: 'Uncoated finish' },
    { name: 'Matte Coating', description: 'Non-reflective smooth finish' },
    { name: 'Gloss Coating', description: 'Shiny reflective finish' },
    { name: 'High Gloss UV', description: 'Ultra-shiny UV coating' },
    { name: 'Soft Touch', description: 'Velvet-like texture' },
    { name: 'Aqueous Coating', description: 'Water-based protective coating' },
  ]

  let coatingCount = 0
  for (const option of coatingOptions) {
    await prisma.coatingOption.upsert({
      where: { name: option.name },
      update: { ...option, updatedAt: new Date() },
      create: {
        id: createId(),
        ...option,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    coatingCount++
  }

  console.log(`   ✅ ${sidesCount} sides options + ${coatingCount} coating options seeded`)
  return { sidesCount, coatingCount }
}

/**
 * Seed Products with All Relations
 */
async function seedProducts() {
  console.log('🎁 Seeding Products with Full Configurations...')

  // Get references to existing data
  const categories = await prisma.productCategory.findMany()
  const paperStocks = await prisma.paperStock.findMany()
  const sizeGroups = await prisma.sizeGroup.findMany()
  const quantityGroups = await prisma.quantityGroup.findMany()
  const addOns = await prisma.addOn.findMany()

  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c.id]))
  const sizeGroupMap = Object.fromEntries(sizeGroups.map((s) => [s.name, s.id]))
  const quantityGroupMap = Object.fromEntries(quantityGroups.map((q) => [q.name, q.id]))
  const paperStockMap = Object.fromEntries(paperStocks.map((p) => [p.name, p.id]))
  const addOnMap = Object.fromEntries(addOns.map((a) => [a.name, a.id]))

  const products = [
    {
      name: 'Standard Business Cards',
      slug: 'standard-business-cards',
      sku: 'BC-STD-001',
      description: 'Professional business cards with full-color printing on premium card stock',
      shortDescription: 'Classic business cards for networking',
      categoryId: categoryMap['Business Cards'],
      basePrice: 19.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 250,
      maxGangQuantity: 5000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 25.0,
      isFeatured: true,
      sizeGroupId: sizeGroupMap['Business Card Sizes'],
      quantityGroupId: quantityGroupMap['Business Card Quantities'],
      paperStocks: ['14pt Cardstock', '16pt Cardstock'],
      addOns: ['Rounded Corners', 'Spot UV Coating', 'Foil Stamping'],
    },
    {
      name: 'Full Color Flyers',
      slug: 'full-color-flyers',
      sku: 'FLY-STD-001',
      description: 'Eye-catching flyers perfect for promotions, events, and marketing campaigns',
      shortDescription: 'Vibrant promotional flyers',
      categoryId: categoryMap['Flyers & Brochures'],
      basePrice: 29.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 10000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 35.0,
      isFeatured: true,
      sizeGroupId: sizeGroupMap['Flyer Sizes'],
      quantityGroupId: quantityGroupMap['Flyer Quantities'],
      paperStocks: ['100lb Gloss Text', '100lb Matte Text', '80lb Gloss Cover'],
      addOns: ['Perforation', 'Die Cutting'],
    },
    {
      name: 'Marketing Postcards',
      slug: 'marketing-postcards',
      sku: 'PC-STD-001',
      description: 'Direct mail postcards for targeted marketing campaigns',
      shortDescription: 'Direct mail marketing postcards',
      categoryId: categoryMap['Postcards'],
      basePrice: 24.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 10000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 30.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Postcard Sizes'],
      quantityGroupId: quantityGroupMap['Postcard Quantities'],
      paperStocks: ['14pt Cardstock', '16pt Cardstock'],
      addOns: ['Perforation'],
    },
    {
      name: 'Large Format Posters',
      slug: 'large-format-posters',
      sku: 'POS-LRG-001',
      description: 'High-impact posters for displays, events, and advertising',
      shortDescription: 'Eye-catching display posters',
      categoryId: categoryMap['Posters'],
      basePrice: 14.99,
      setupFee: 0,
      productionTime: 2,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 20.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Poster Sizes'],
      quantityGroupId: quantityGroupMap['Poster Quantities'],
      paperStocks: ['Photo Paper Glossy'],
      addOns: ['Lamination'],
    },
    {
      name: 'Vinyl Banners',
      slug: 'vinyl-banners',
      sku: 'BAN-VIN-001',
      description: 'Durable vinyl banners for indoor and outdoor advertising',
      shortDescription: 'Weather-resistant vinyl banners',
      categoryId: categoryMap['Banners & Signs'],
      basePrice: 39.99,
      setupFee: 0,
      productionTime: 3,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 45.0,
      isFeatured: false,
      sizeGroupId: sizeGroupMap['Banner Sizes'],
      quantityGroupId: quantityGroupMap['Banner Quantities'],
      paperStocks: ['13oz Vinyl Banner'],
      addOns: ['Hole Drilling'],
    },
    {
      name: 'Die-Cut Stickers',
      slug: 'die-cut-stickers',
      sku: 'STK-DIE-001',
      description: 'Custom die-cut stickers in any shape with waterproof vinyl',
      shortDescription: 'Custom shape vinyl stickers',
      categoryId: categoryMap['Stickers & Labels'],
      basePrice: 34.99,
      setupFee: 25.0,
      productionTime: 5,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 2,
      rushFee: 35.0,
      isFeatured: true,
      sizeGroupId: sizeGroupMap['Sticker Sizes'],
      quantityGroupId: quantityGroupMap['Sticker Quantities'],
      paperStocks: ['White Vinyl Sticker', 'Clear Vinyl Sticker', 'Holographic Sticker'],
      addOns: ['Lamination', 'Die Cutting'],
    },
  ]

  let productCount = 0
  let paperStockLinkCount = 0
  let sizeGroupLinkCount = 0
  let quantityGroupLinkCount = 0
  let addOnLinkCount = 0
  let pricingTierCount = 0

  for (const productData of products) {
    try {
      const { paperStocks: paperStockNames, addOns: addOnNames, sizeGroupId, quantityGroupId, ...productInfo } = productData

      // Create the product
      const product = await prisma.product.upsert({
        where: { slug: productInfo.slug },
        update: { ...productInfo, updatedAt: new Date() },
        create: {
          id: createId(),
          ...productInfo,
          isActive: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      productCount++

      // Link size group
      if (sizeGroupId) {
        await prisma.productSizeGroup.upsert({
          where: {
            productId_sizeGroupId: {
              productId: product.id,
              sizeGroupId: sizeGroupId,
            },
          },
          update: { updatedAt: new Date() },
          create: {
            id: createId(),
            productId: product.id,
            sizeGroupId: sizeGroupId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        sizeGroupLinkCount++
      }

      // Link quantity group
      if (quantityGroupId) {
        await prisma.productQuantityGroup.upsert({
          where: {
            productId_quantityGroupId: {
              productId: product.id,
              quantityGroupId: quantityGroupId,
            },
          },
          update: { updatedAt: new Date() },
          create: {
            id: createId(),
            productId: product.id,
            quantityGroupId: quantityGroupId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })
        quantityGroupLinkCount++
      }

      // Link paper stocks
      if (paperStockNames && paperStockNames.length > 0) {
        for (let i = 0; i < paperStockNames.length; i++) {
          const paperStockId = paperStockMap[paperStockNames[i]]
          if (paperStockId) {
            await prisma.productPaperStock.upsert({
              where: {
                productId_paperStockId: {
                  productId: product.id,
                  paperStockId: paperStockId,
                },
              },
              update: {
                isDefault: i === 0,
                additionalCost: 0,
              },
              create: {
                id: createId(),
                productId: product.id,
                paperStockId: paperStockId,
                isDefault: i === 0,
                additionalCost: 0,
              },
            })
            paperStockLinkCount++
          }
        }
      }

      // Link add-ons
      if (addOnNames && addOnNames.length > 0) {
        for (const addOnName of addOnNames) {
          const addOnId = addOnMap[addOnName]
          if (addOnId) {
            await prisma.productAddOn.upsert({
              where: {
                productId_addOnId: {
                  productId: product.id,
                  addOnId: addOnId,
                },
              },
              update: { updatedAt: new Date() },
              create: {
                id: createId(),
                productId: product.id,
                addOnId: addOnId,
                isMandatory: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            })
            addOnLinkCount++
          }
        }
      }

      // Create pricing tiers
      const pricingTiers = [
        { minQuantity: 1, maxQuantity: 99, unitPrice: productInfo.basePrice * 1.5 },
        { minQuantity: 100, maxQuantity: 249, unitPrice: productInfo.basePrice * 1.3 },
        { minQuantity: 250, maxQuantity: 499, unitPrice: productInfo.basePrice * 1.1 },
        { minQuantity: 500, maxQuantity: 999, unitPrice: productInfo.basePrice },
        { minQuantity: 1000, maxQuantity: 2499, unitPrice: productInfo.basePrice * 0.9 },
        { minQuantity: 2500, maxQuantity: 4999, unitPrice: productInfo.basePrice * 0.8 },
        { minQuantity: 5000, maxQuantity: null, unitPrice: productInfo.basePrice * 0.7 },
      ]

      for (const tier of pricingTiers) {
        const tierId = `${product.id}-${tier.minQuantity}`
        const now = new Date()
        await prisma.pricingTier.upsert({
          where: {
            productId_minQuantity: {
              productId: product.id,
              minQuantity: tier.minQuantity,
            },
          },
          update: {
            ...tier,
            updatedAt: now,
          },
          create: {
            id: tierId,
            ...tier,
            productId: product.id,
            setupFee: productInfo.setupFee || 0,
            createdAt: now,
            updatedAt: now,
          },
        })
        pricingTierCount++
      }

      console.log(`   ✓ ${product.name}`)
    } catch (error) {
      console.error(`   ✗ Error creating product ${productData.name}:`, error)
    }
  }

  console.log(`   ✅ ${productCount} products seeded`)
  console.log(`      - ${paperStockLinkCount} paper stock links`)
  console.log(`      - ${sizeGroupLinkCount} size group links`)
  console.log(`      - ${quantityGroupLinkCount} quantity group links`)
  console.log(`      - ${addOnLinkCount} add-on links`)
  console.log(`      - ${pricingTierCount} pricing tiers`)

  return {
    productCount,
    paperStockLinkCount,
    sizeGroupLinkCount,
    quantityGroupLinkCount,
    addOnLinkCount,
    pricingTierCount,
  }
}

/**
 * Main Seeding Function
 */
async function main(): Promise<SeedResult> {
  try {
    console.log('🌱 COMPREHENSIVE PRODUCT SEED SCRIPT')
    console.log('=' .repeat(80))
    console.log('')

    const categoryCount = await seedCategories()
    console.log('')

    const paperStockCount = await seedPaperStocks()
    console.log('')

    const sizeGroupCount = await seedSizeGroups()
    console.log('')

    const quantityGroupCount = await seedQuantityGroups()
    console.log('')

    const addOnCount = await seedAddOns()
    console.log('')

    const { sidesCount, coatingCount } = await seedSidesAndCoatings()
    console.log('')

    const {
      productCount,
      paperStockLinkCount,
      sizeGroupLinkCount,
      quantityGroupLinkCount,
      addOnLinkCount,
      pricingTierCount,
    } = await seedProducts()
    console.log('')

    console.log('=' .repeat(80))
    console.log('✅ SEED COMPLETE - SUMMARY')
    console.log('=' .repeat(80))
    console.log(`   Categories:              ${categoryCount}`)
    console.log(`   Paper Stocks:            ${paperStockCount}`)
    console.log(`   Size Groups:             ${sizeGroupCount}`)
    console.log(`   Quantity Groups:         ${quantityGroupCount}`)
    console.log(`   Add-Ons:                 ${addOnCount}`)
    console.log(`   Sides Options:           ${sidesCount}`)
    console.log(`   Coating Options:         ${coatingCount}`)
    console.log(`   Products:                ${productCount}`)
    console.log(`   Product-Paper Stock:     ${paperStockLinkCount}`)
    console.log(`   Product-Size Group:      ${sizeGroupLinkCount}`)
    console.log(`   Product-Quantity Group:  ${quantityGroupLinkCount}`)
    console.log(`   Product-Add-On:          ${addOnLinkCount}`)
    console.log(`   Pricing Tiers:           ${pricingTierCount}`)
    console.log('=' .repeat(80))

    return {
      success: true,
      counts: {
        categories: categoryCount,
        paperStocks: paperStockCount,
        sizeGroups: sizeGroupCount,
        quantityGroups: quantityGroupCount,
        addOns: addOnCount,
        sidesOptions: sidesCount,
        coatingOptions: coatingCount,
        products: productCount,
        productPaperStocks: paperStockLinkCount,
        productSizeGroups: sizeGroupLinkCount,
        productQuantityGroups: quantityGroupLinkCount,
        productAddOns: addOnLinkCount,
        pricingTiers: pricingTierCount,
      },
    }
  } catch (error: any) {
    console.error('❌ Error seeding database:', error)
    return {
      success: false,
      error: error.message,
      counts: {
        categories: 0,
        paperStocks: 0,
        sizeGroups: 0,
        quantityGroups: 0,
        addOns: 0,
        sidesOptions: 0,
        coatingOptions: 0,
        products: 0,
        productPaperStocks: 0,
        productSizeGroups: 0,
        productQuantityGroups: 0,
        productAddOns: 0,
        pricingTiers: 0,
      },
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
main()
  .then((result) => {
    if (result.success) {
      console.log('\n✅ Success: All product data seeded')
      process.exit(0)
    } else {
      console.error(`\n❌ Failed: ${result.error}`)
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
