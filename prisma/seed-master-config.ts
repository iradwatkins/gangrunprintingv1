/**
 * ============================================================================
 * MASTER CONFIGURATION SEED FILE
 * ============================================================================
 *
 * This file consolidates ALL product configuration data for GangRun Printing.
 * It uses upsert operations to be idempotent - safe to run multiple times.
 *
 * SECTIONS:
 * 1. Product Categories
 * 2. Coating Options
 * 3. Sides Options
 * 4. Paper Stocks
 * 5. Paper Stock Sets (groups of paper stocks for products)
 * 6. Quantity Groups
 * 7. Size Groups
 * 8. Add-ons (18 product enhancement options)
 * 9. Add-on Sets (groups of add-ons for products)
 *
 * USAGE:
 *   npx tsx prisma/seed-master-config.ts
 *
 * This preserves all existing data while updating/creating new entries.
 * ============================================================================
 */

import { PrismaClient, PricingModel, DisplayPosition } from '@prisma/client'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

// Helper function to generate unique IDs
function generateId(prefix: string = ''): string {
  const timestamp = Date.now()
  const random = randomBytes(4).toString('hex')
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}

async function main() {
  console.log('🌱 Starting master configuration seed...\n')

  // ============================================================================
  // 1. PRODUCT CATEGORIES
  // ============================================================================
  console.log('📂 Seeding Product Categories...')

  // Updated from database on ${new Date().toISOString()}
  const categoriesData = [
    {
      id: 'cat_landing_page_groups',
      name: 'Landing Page Folder',
      slug: 'landing-page-groups',
      description: '',
      sortOrder: 0,
      isHidden: true,
    },
    {
      id: 'cat_banner',
      name: 'Banner',
      slug: 'banner',
      description: 'Banner printing services',
      sortOrder: 1,
    },
    {
      id: 'cat_booklet',
      name: 'Booklet',
      slug: 'booklet',
      description: 'Booklet printing services',
      sortOrder: 2,
    },
    {
      id: 'cat_bookmark',
      name: 'Bookmark',
      slug: 'bookmark',
      description: 'Bookmark printing services',
      sortOrder: 3,
    },
    {
      id: 'cat_brochure',
      name: 'Brochure',
      slug: 'brochure',
      description: 'Brochure printing services',
      sortOrder: 4,
    },
    {
      id: 'cat_bumper_sticker',
      name: 'Bumper Sticker',
      slug: 'bumper-sticker',
      description: 'Bumper Sticker printing services',
      sortOrder: 5,
    },
    {
      id: 'cat_business_card',
      name: 'Business Card',
      slug: 'business-card',
      description: 'Business Card printing services',
      sortOrder: 6,
    },
    {
      id: 'cat_business_card_sharing',
      name: 'Business Card Sharing',
      slug: 'business-card-sharing',
      description: 'Business Card Sharing printing services',
      sortOrder: 7,
    },
    {
      id: 'cat_calendar',
      name: 'Calendar',
      slug: 'calendar',
      description: 'Calendar printing services',
      sortOrder: 8,
    },
    {
      id: 'cat_catalog',
      name: 'Catalog',
      slug: 'catalog',
      description: 'Catalog printing services',
      sortOrder: 9,
    },
    {
      id: 'cat_custom_flyers',
      name: 'Custom Flyers',
      slug: 'custom-flyers',
      description: 'Custom Flyers printing services',
      sortOrder: 10,
    },
    {
      id: 'cat_custom_t_shirt',
      name: 'Custom T-shirt',
      slug: 'custom-t-shirt',
      description: 'Custom T-shirt printing services',
      sortOrder: 11,
    },
    {
      id: 'cat_flyer',
      name: 'Flyer',
      slug: 'flyer',
      description: 'Flyer printing services',
      sortOrder: 11,
    },
    {
      id: 'cat_die_cut_flyer',
      name: 'Die Cut Flyer',
      slug: 'die-cut-flyer',
      description: 'Die Cut Flyer printing services',
      sortOrder: 12,
    },
    {
      id: 'cat_door_hanger',
      name: 'Door Hanger',
      slug: 'door-hanger',
      description: 'Door Hanger printing services',
      sortOrder: 13,
    },
    {
      id: 'cat_folded_business_card',
      name: 'Folded Business Card',
      slug: 'folded-business-card',
      description: 'Folded Business Card printing services',
      sortOrder: 13,
    },
    {
      id: 'cat_drink_coaster',
      name: 'Drink Coaster',
      slug: 'drink-coaster',
      description: 'Drink Coaster printing services',
      sortOrder: 14,
    },
    {
      id: 'cat_eddm_postcard',
      name: 'EDDM Postcard',
      slug: 'eddm-postcard',
      description: 'EDDM Postcard printing services',
      sortOrder: 15,
    },
    {
      id: 'cat_envelope',
      name: 'Envelope',
      slug: 'envelope',
      description: 'Envelope printing services',
      sortOrder: 16,
    },
    {
      id: 'cat_flyer_sharing',
      name: 'Flyer Sharing',
      slug: 'flyer-sharing',
      description: 'Flyer Sharing printing services',
      sortOrder: 17,
    },
    {
      id: 'cat_foil_business_card',
      name: 'Foil Business Card',
      slug: 'foil-business-card',
      description: 'Foil Business Card printing services',
      sortOrder: 18,
    },
    {
      id: 'cat_foldable_business_card',
      name: 'Foldable Business Card',
      slug: 'foldable-business-card',
      description: 'Foldable Business Card printing services',
      sortOrder: 19,
    },
    {
      id: 'cat_folded_card',
      name: 'Folded Card',
      slug: 'folded-card',
      description: 'Folded Card printing services',
      sortOrder: 20,
    },
    {
      id: 'cat_greeting_card',
      name: 'Greeting Card',
      slug: 'greeting-card',
      description: 'Greeting Card printing services',
      sortOrder: 21,
    },
    {
      id: 'cat_hang_tag',
      name: 'Hang tag',
      slug: 'hang-tag',
      description: 'Hang Tag printing services',
      sortOrder: 22,
    },
    {
      id: 'cat_newsletter',
      name: 'Newsletter',
      slug: 'newsletter',
      description: 'Newsletter printing services',
      sortOrder: 22,
    },
    {
      id: 'cat_invitation',
      name: 'Invitation',
      slug: 'invitation',
      description: 'Invitation printing services',
      sortOrder: 23,
    },
    {
      id: 'cat_letterhead',
      name: 'Letterhead',
      slug: 'letterhead',
      description: 'Letterhead printing services',
      sortOrder: 24,
    },
    {
      id: 'cat_magazine',
      name: 'Magazine',
      slug: 'magazine',
      description: 'Magazine printing services',
      sortOrder: 25,
    },
    {
      id: 'cat_magnet',
      name: 'Magnet',
      slug: 'magnet',
      description: 'Magnet printing services',
      sortOrder: 26,
    },
    {
      id: 'cat_membership_card',
      name: 'Membership Card',
      slug: 'membership-card',
      description: 'Membership Card printing services',
      sortOrder: 27,
    },
    {
      id: 'cat_poster_short_run_1_50',
      name: 'Poster - Short Run (1-50)',
      slug: 'poster-short-run-1-50',
      description: 'Poster - Short Run (1-50) printing services',
      sortOrder: 27,
    },
    {
      id: 'cat_menu',
      name: 'Menu',
      slug: 'menu',
      description: 'Menu printing services',
      sortOrder: 28,
    },
    {
      id: 'cat_notepad',
      name: 'Notepad',
      slug: 'notepad',
      description: 'Notepad printing services',
      sortOrder: 29,
    },
    {
      id: 'cat_placemat',
      name: 'Placemat',
      slug: 'placemat',
      description: 'Placemat printing services',
      sortOrder: 30,
    },
    {
      id: 'cat_pocket_folder',
      name: 'Pocket Folder',
      slug: 'pocket-folder',
      description: 'Pocket Folder printing services',
      sortOrder: 31,
    },
    {
      id: 'cat_roll_sticker',
      name: 'Roll Sticker',
      slug: 'roll-sticker',
      description: 'Roll Sticker printing services',
      sortOrder: 31,
    },
    {
      id: 'cat_postcard',
      name: 'Postcard',
      slug: 'postcard',
      description: 'Postcard printing services',
      sortOrder: 32,
    },
    {
      id: 'cat_poster',
      name: 'Poster',
      slug: 'poster',
      description: 'Poster printing services',
      sortOrder: 33,
    },
    {
      id: 'cat_special_shaped_flyer',
      name: 'Special Shaped Flyer',
      slug: 'special-shaped-flyer',
      description: 'Special Shaped Flyer printing services',
      sortOrder: 33,
    },
    {
      id: 'cat_poster_short_run_1_25',
      name: 'Poster – Short Run (1-25)',
      slug: 'poster-short-run-1-25',
      description: 'Poster – Short Run (1-25) printing services',
      sortOrder: 34,
    },
    {
      id: 'cat_table_tent_card',
      name: 'Table Tent Card',
      slug: 'table-tent-card',
      description: 'Table Tent Card printing services',
      sortOrder: 34,
    },
    {
      id: 'cat_rack_card',
      name: 'Rack card',
      slug: 'rack-card',
      description: 'Rack Card printing services',
      sortOrder: 35,
    },
    {
      id: 'cat_ticket',
      name: 'Ticket',
      slug: 'ticket',
      description: 'Ticket printing services',
      sortOrder: 35,
    },
    {
      id: 'cat_rip_card',
      name: 'Rip Card',
      slug: 'rip-card',
      description: 'Rip Card printing services',
      sortOrder: 36,
    },
    {
      id: 'cat_rip_door_hanger',
      name: 'Rip Door Hanger',
      slug: 'rip-door-hanger',
      description: 'Rip Door Hanger printing services',
      sortOrder: 37,
    },
    {
      id: 'cat_role_sticker',
      name: 'Role Sticker',
      slug: 'role-sticker',
      description: 'Role Sticker printing services',
      sortOrder: 38,
    },
    {
      id: 'cat_sales_sheet',
      name: 'Sales Sheet',
      slug: 'sales-sheet',
      description: 'Sales Sheet printing services',
      sortOrder: 39,
    },
    {
      id: 'cat_sticker',
      name: 'Sticker',
      slug: 'sticker',
      description: 'Sticker printing services',
      sortOrder: 40,
    },
    {
      id: 'cat_tablet_tent',
      name: 'Tablet Tent',
      slug: 'tablet-tent',
      description: 'Tablet Tent printing services',
      sortOrder: 41,
    },
    {
      id: 'cat_tear_off_flyer',
      name: 'Tear Off Flyer',
      slug: 'tear-off-flyer',
      description: 'Tear Off Flyer printing services',
      sortOrder: 42,
    },
    {
      id: 'cat_tickets',
      name: 'Tickets',
      slug: 'tickets',
      description: 'Tickets printing services',
      sortOrder: 43,
    },
    {
      id: 'cat_wrapping_paper',
      name: 'Wrapping paper',
      slug: 'wrapping-paper',
      description: 'Wrapping paper printing services',
      sortOrder: 44,
    },
    {
      id: 'cat_wristband',
      name: 'Wristband',
      slug: 'wristband',
      description: 'Wristband printing services',
      sortOrder: 45,
    },
    {
      id: 'usili3t1sq2pnejzef5wuaiq',
      name: '200 Cities - Postcards',
      slug: '200-cities-postcards',
      description:
        'Hidden category for city-specific postcard products. Not visible in navigation but products are SEO-friendly and searchable.',
      sortOrder: 9999,
      isHidden: true,
      parentCategoryId: 'cat_landing_page_groups',
    },
  ]

  let categoryCount = 0
  for (const category of categoriesData) {
    await prisma.productCategory.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
        isHidden: category.isHidden || false,
        parentCategoryId: category.parentCategoryId || null,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
        isHidden: category.isHidden || false,
        parentCategoryId: category.parentCategoryId || null,
        isActive: true,
      },
    })
    categoryCount++
  }
  console.log(`✓ Seeded ${categoryCount} product categories\n`)

  // ============================================================================
  // 2. COATING OPTIONS
  // ============================================================================
  console.log('🎨 Seeding Coating Options...')

  const coatingOptions = [
    { name: 'NO Coating', description: 'Uncoated natural finish' },
    { name: 'Gloss Aqueous', description: 'Standard glossy coating with good durability' },
    { name: 'Matte Aqueous', description: 'Non-reflective matte coating' },
    { name: 'High Gloss UV', description: 'Premium UV coating with maximum shine' },
    { name: 'High Gloss UV on ONE SIDE', description: 'UV coating applied to front side only' },
    { name: 'Printer Paper', description: 'Standard uncoated office paper finish' },
  ]

  let coatingCount = 0
  for (const coating of coatingOptions) {
    await prisma.coatingOption.upsert({
      where: { name: coating.name },
      update: { description: coating.description },
      create: {
        id: generateId('coating'),
        ...coating,
      },
    })
    coatingCount++
  }
  console.log(`✓ Seeded ${coatingCount} coating options\n`)

  // ============================================================================
  // 3. SIDES OPTIONS
  // ============================================================================
  console.log('🔄 Seeding Sides Options...')

  const sidesOptions = [
    {
      name: 'Image One Side Only (4/0)',
      code: 'one_sided_40',
      description: 'Single-sided printing with image on front only',
    },
    {
      name: 'Two Different Images (4/4)',
      code: 'two_sided_44',
      description: 'Double-sided printing with different images on each side',
    },
    {
      name: 'Same Image Both Sides (4/4)',
      code: 'same_image_both_sides_44',
      description: 'Double-sided printing with identical image on both sides',
    },
    {
      name: 'Your Image Front/ Our Image Back',
      code: 'your_image_front_our_image_back',
      description: 'Custom front with branded back',
    },
  ]

  let sidesCount = 0
  for (const sides of sidesOptions) {
    await prisma.sidesOption.upsert({
      where: { code: sides.code },
      update: {
        name: sides.name,
        description: sides.description,
      },
      create: {
        id: generateId('sides'),
        ...sides,
      },
    })
    sidesCount++
  }
  console.log(`✓ Seeded ${sidesCount} sides options\n`)

  // ============================================================================
  // 4. PAPER STOCKS
  // ============================================================================
  console.log('📄 Seeding Paper Stocks...')

  const paperStocks = [
    // Postcard Stocks
    {
      name: '9pt C2S Cardstock',
      pricePerSqInch: 0.001,
      weight: 0.0015,
      tooltipText: 'Lightweight cardstock - economical option for postcards and mailers',
      isActive: true,
    },
    {
      name: '12pt C2S Cardstock',
      pricePerSqInch: 0.0012,
      weight: 0.002,
      tooltipText: 'Standard postcard stock - good balance of quality and affordability',
      isActive: true,
    },
    {
      name: '14pt C2S Cardstock',
      pricePerSqInch: 0.0013,
      weight: 0.0025,
      tooltipText: 'Premium thick cardstock - popular for business cards and postcards',
      isActive: true,
    },
    {
      name: '16pt C2S Cardstock',
      pricePerSqInch: 0.0015,
      weight: 0.003,
      tooltipText: 'Extra thick premium cardstock - luxury feel for high-end products',
      isActive: true,
    },

    // Text/Flyer Stocks
    {
      name: '60 lb Offset',
      pricePerSqInch: 0.0008,
      weight: 0.0012,
      tooltipText: 'Standard text weight paper - ideal for flyers and everyday printing',
      isActive: true,
    },
    {
      name: '100 lb Gloss Text',
      pricePerSqInch: 0.001,
      weight: 0.0018,
      tooltipText: 'Glossy text paper - great for brochures and full-color documents',
      isActive: true,
    },

    // Cover Stocks
    {
      name: '100 lb Uncoated Cover (14pt)',
      pricePerSqInch: 0.0013,
      weight: 0.0025,
      tooltipText: 'Thick uncoated cover stock - perfect for natural finish products',
      isActive: true,
    },
  ]

  let paperStockCount = 0
  for (const stock of paperStocks) {
    await prisma.paperStock.upsert({
      where: { name: stock.name },
      update: {
        pricePerSqInch: stock.pricePerSqInch,
        weight: stock.weight,
        tooltipText: stock.tooltipText,
        isActive: stock.isActive,
      },
      create: {
        id: generateId('paper'),
        ...stock,
      },
    })
    paperStockCount++
  }
  console.log(`✓ Seeded ${paperStockCount} paper stocks\n`)

  // ============================================================================
  // 5. PAPER STOCK SETS
  // ============================================================================
  console.log('📦 Seeding Paper Stock Sets...')

  // First, create the sets
  const paperStockSets = [
    {
      name: 'Postcard Paper Options',
      description: 'Standard paper stocks for postcards and mailers',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Business Card Paper Options',
      description: 'Premium cardstocks for business cards',
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Flyer Paper Options',
      description: 'Text and cover stocks for flyers and handouts',
      sortOrder: 3,
      isActive: true,
    },
  ]

  for (const set of paperStockSets) {
    await prisma.paperStockSet.upsert({
      where: { name: set.name },
      update: {
        description: set.description,
        sortOrder: set.sortOrder,
        isActive: set.isActive,
      },
      create: {
        id: generateId('paperset'),
        ...set,
      },
    })
  }

  // Now link paper stocks to sets
  const postcardSet = await prisma.paperStockSet.findUnique({
    where: { name: 'Postcard Paper Options' },
  })
  const businessCardSet = await prisma.paperStockSet.findUnique({
    where: { name: 'Business Card Paper Options' },
  })
  const flyerSet = await prisma.paperStockSet.findUnique({
    where: { name: 'Flyer Paper Options' },
  })

  if (postcardSet) {
    const stocks = ['12pt C2S Cardstock', '14pt C2S Cardstock', '16pt C2S Cardstock']
    for (let i = 0; i < stocks.length; i++) {
      const paperStock = await prisma.paperStock.findUnique({
        where: { name: stocks[i] },
      })
      if (paperStock) {
        await prisma.paperStockSetItem.upsert({
          where: {
            paperStockSetId_paperStockId: {
              paperStockSetId: postcardSet.id,
              paperStockId: paperStock.id,
            },
          },
          update: {
            sortOrder: i,
            isDefault: i === 0,
          },
          create: {
            id: generateId('pssitem'),
            paperStockSetId: postcardSet.id,
            paperStockId: paperStock.id,
            sortOrder: i,
            isDefault: i === 0,
          },
        })
      }
    }
  }

  if (businessCardSet) {
    const stocks = ['14pt C2S Cardstock', '16pt C2S Cardstock']
    for (let i = 0; i < stocks.length; i++) {
      const paperStock = await prisma.paperStock.findUnique({
        where: { name: stocks[i] },
      })
      if (paperStock) {
        await prisma.paperStockSetItem.upsert({
          where: {
            paperStockSetId_paperStockId: {
              paperStockSetId: businessCardSet.id,
              paperStockId: paperStock.id,
            },
          },
          update: {
            sortOrder: i,
            isDefault: i === 0,
          },
          create: {
            id: generateId('pssitem'),
            paperStockSetId: businessCardSet.id,
            paperStockId: paperStock.id,
            sortOrder: i,
            isDefault: i === 0,
          },
        })
      }
    }
  }

  if (flyerSet) {
    const stocks = ['60 lb Offset', '100 lb Gloss Text', '100 lb Uncoated Cover (14pt)']
    for (let i = 0; i < stocks.length; i++) {
      const paperStock = await prisma.paperStock.findUnique({
        where: { name: stocks[i] },
      })
      if (paperStock) {
        await prisma.paperStockSetItem.upsert({
          where: {
            paperStockSetId_paperStockId: {
              paperStockSetId: flyerSet.id,
              paperStockId: paperStock.id,
            },
          },
          update: {
            sortOrder: i,
            isDefault: i === 0,
          },
          create: {
            id: generateId('pssitem'),
            paperStockSetId: flyerSet.id,
            paperStockId: paperStock.id,
            sortOrder: i,
            isDefault: i === 0,
          },
        })
      }
    }
  }

  console.log(`✓ Seeded ${paperStockSets.length} paper stock sets with items\n`)

  // ============================================================================
  // 6. QUANTITY GROUPS
  // ============================================================================
  console.log('🔢 Seeding Quantity Groups...')

  const quantityGroups = [
    {
      name: 'Business Card Quantities',
      description: 'Standard quantities for business cards',
      values: '100,250,500,1000,2500,5000,10000,custom',
      defaultValue: '500',
      customMin: 100,
      customMax: 50000,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Postcard Quantities',
      description: 'Common postcard print runs',
      values: '50,100,250,500,1000,2500,5000,custom',
      defaultValue: '500',
      customMin: 25,
      customMax: 25000,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Flyer Quantities',
      description: 'Standard flyer quantities',
      values: '25,50,100,250,500,1000,2500,5000,custom',
      defaultValue: '250',
      customMin: 25,
      customMax: 50000,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Brochure Quantities',
      description: 'Brochure print run options',
      values: '25,50,100,250,500,1000,2500,custom',
      defaultValue: '250',
      customMin: 25,
      customMax: 10000,
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Poster Quantities',
      description: 'Large format poster quantities',
      values: '1,5,10,25,50,100,250,custom',
      defaultValue: '10',
      customMin: 1,
      customMax: 1000,
      sortOrder: 5,
      isActive: true,
    },
  ]

  let quantityGroupCount = 0
  for (const group of quantityGroups) {
    await prisma.quantityGroup.upsert({
      where: { name: group.name },
      update: {
        description: group.description,
        values: group.values,
        defaultValue: group.defaultValue,
        customMin: group.customMin,
        customMax: group.customMax,
        sortOrder: group.sortOrder,
        isActive: group.isActive,
      },
      create: {
        id: generateId('qtygroup'),
        ...group,
      },
    })
    quantityGroupCount++
  }
  console.log(`✓ Seeded ${quantityGroupCount} quantity groups\n`)

  // ============================================================================
  // 7. SIZE GROUPS
  // ============================================================================
  console.log('📏 Seeding Size Groups...')

  const sizeGroups = [
    {
      name: 'Business Card Sizes',
      description: 'Standard and custom sizes for business cards',
      values: '2x3.5,2.125x3.375,2.5x2.5,1.75x3.5,custom',
      defaultValue: '2x3.5',
      customMinWidth: 1.5,
      customMaxWidth: 3.5,
      customMinHeight: 1.5,
      customMaxHeight: 3.5,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Postcard Sizes',
      description: 'Common postcard and mailer sizes',
      values: '4x6,5x7,5.5x8.5,6x9,6x11,8.5x11,custom',
      defaultValue: '4x6',
      customMinWidth: 3.5,
      customMaxWidth: 11,
      customMinHeight: 3.5,
      customMaxHeight: 11,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Flyer Sizes',
      description: 'Standard flyer and handout sizes',
      values: '4x6,5.5x8.5,8.5x11,8.5x14,11x17,custom',
      defaultValue: '8.5x11',
      customMinWidth: 4,
      customMaxWidth: 17,
      customMinHeight: 4,
      customMaxHeight: 17,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Brochure Sizes',
      description: 'Tri-fold and bi-fold brochure sizes',
      values: '8.5x11,8.5x14,11x17,11x25.5,custom',
      defaultValue: '8.5x11',
      customMinWidth: 8,
      customMaxWidth: 25.5,
      customMinHeight: 8,
      customMaxHeight: 17,
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Poster Sizes',
      description: 'Large format poster sizes',
      values: '11x17,12x18,16x20,18x24,20x30,24x36,27x40,custom',
      defaultValue: '18x24',
      customMinWidth: 11,
      customMaxWidth: 48,
      customMinHeight: 11,
      customMaxHeight: 96,
      sortOrder: 5,
      isActive: true,
    },
  ]

  let sizeGroupCount = 0
  for (const group of sizeGroups) {
    await prisma.sizeGroup.upsert({
      where: { name: group.name },
      update: {
        description: group.description,
        values: group.values,
        defaultValue: group.defaultValue,
        customMinWidth: group.customMinWidth,
        customMaxWidth: group.customMaxWidth,
        customMinHeight: group.customMinHeight,
        customMaxHeight: group.customMaxHeight,
        sortOrder: group.sortOrder,
        isActive: group.isActive,
      },
      create: {
        id: generateId('sizegroup'),
        ...group,
      },
    })
    sizeGroupCount++
  }
  console.log(`✓ Seeded ${sizeGroupCount} size groups\n`)

  // ============================================================================
  // 8. ADD-ONS (18 Product Enhancement Options)
  // ============================================================================
  console.log('✨ Seeding Add-ons...')

  const addOns = [
    // 1. Design Services - Upload or custom design
    {
      name: 'Design',
      description: 'Upload artwork or request custom design services',
      tooltipText:
        'Choose from upload your own artwork or custom design services. Design time is separate from print production.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        uploadArtwork: { price: 0, turnaroundHours: 0 },
        standardOneSide: { price: 90.0, turnaroundHours: 72 },
        standardTwoSides: { price: 135.0, turnaroundHours: 72 },
        rushOneSide: { price: 160.0, turnaroundHours: 36 },
        rushTwoSides: { price: 240.0, turnaroundHours: 36 },
      },
      additionalTurnaroundDays: 0,
      sortOrder: 1,
      isActive: true,
    },

    // 2. Digital Proof - $5.00 flat
    {
      name: 'Digital Proof',
      description: 'Review and approve before production',
      tooltipText:
        'We will email you a digital proof for your approval before production begins. This helps ensure your order is exactly as you want it.',
      pricingModel: 'FLAT' as PricingModel,
      configuration: { price: 5.0 },
      additionalTurnaroundDays: 0,
      sortOrder: 2,
      isActive: true,
    },

    // 3. GRP Tagline - 5% discount
    {
      name: 'GRP Tagline',
      description: '5% discount for including our tagline',
      tooltipText:
        'Add our company tagline to your design for a 5% discount on base printing costs.',
      pricingModel: 'PERCENTAGE' as PricingModel,
      configuration: {
        percentage: -5,
        appliesTo: 'base_paper_print_price',
        hiddenForBrokers: true,
      },
      additionalTurnaroundDays: 0,
      sortOrder: 3,
      isActive: true,
      adminNotes: 'Hidden for brokers with assigned discount.',
    },

    // 4. Color Critical - Guaranteed color matching
    {
      name: 'Color Critical',
      description: 'Guaranteed precise color matching',
      tooltipText:
        'Premium color matching service ensures your brand colors are printed exactly right. Includes proofing.',
      pricingModel: 'PERCENTAGE' as PricingModel,
      configuration: {
        percentage: 10,
        appliesTo: 'base_price',
      },
      additionalTurnaroundDays: 1,
      sortOrder: 4,
      isActive: true,
    },

    // 5. Exact Size - 12.5% markup
    {
      name: 'Exact Size',
      description: 'Cut to your exact specifications',
      tooltipText: 'Precision cutting to your exact size requirements. 12.5% markup on base price.',
      pricingModel: 'PERCENTAGE' as PricingModel,
      configuration: {
        percentage: 12.5,
        appliesTo: 'adjusted_base_price',
      },
      additionalTurnaroundDays: 0,
      sortOrder: 5,
      isActive: true,
    },

    // 6. Folding - Complex pricing
    {
      name: 'Folding',
      description: 'Professional folding service',
      tooltipText:
        'Professional folding service. Text paper and card stock have different pricing.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        textPaper: { setupFee: 0.17, perUnit: 0.01 },
        cardStock: { setupFee: 0.34, perUnit: 0.02, includesBasicScore: true },
        minSize: { width: 5, height: 6 },
        foldTypes: [
          'Half Fold',
          'Tri Fold',
          'Z Fold',
          'Gate Fold',
          'Double Parallel Fold',
          'Roll Fold',
        ],
      },
      additionalTurnaroundDays: 3,
      sortOrder: 6,
      isActive: true,
    },

    // 7. Score - Scoring for folding
    {
      name: 'Score',
      description: 'Scoring service for easy folding',
      tooltipText:
        'Score lines make folding easier and more professional. Price based on number of scores.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        setupFee: 17.0,
        perScorePerUnit: 0.01,
      },
      additionalTurnaroundDays: 1,
      sortOrder: 7,
      isActive: true,
    },

    // 8. Half Score - Half-depth scoring
    {
      name: 'Half Score',
      description: 'Partial depth scoring',
      tooltipText: 'Half-depth score lines for delicate materials or special folding needs.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        setupFee: 20.0,
        perScorePerUnit: 0.015,
      },
      additionalTurnaroundDays: 1,
      sortOrder: 8,
      isActive: true,
    },

    // 9. Perforation - Tear-off sections
    {
      name: 'Perforation',
      description: 'Perforation for tear-off sections',
      tooltipText: 'Add perforations to make tear-off sections. Setup fee plus per-piece charge.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        setupFee: 20.0,
        perUnit: 0.01,
      },
      additionalTurnaroundDays: 1,
      sortOrder: 9,
      isActive: true,
    },

    // 10. Corner Rounding
    {
      name: 'Corner Rounding',
      description: 'Rounded corners for professional look',
      tooltipText: 'Add rounded corners for a professional, modern look',
      pricingModel: 'FLAT' as PricingModel,
      configuration: {
        price: 15.0,
        radius: ['1/8"', '1/4"', '3/8"', '1/2"'],
      },
      additionalTurnaroundDays: 1,
      sortOrder: 10,
      isActive: true,
    },

    // 11. Hole Drilling
    {
      name: 'Hole Drilling',
      description: 'Hole drilling for binding or hanging',
      tooltipText:
        'Add holes for binding or hanging. Custom holes 1-5 add $0.02 per hole per piece. Binder punch options add $0.01 per piece.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        setupFee: 20.0,
        customHolesPerHolePerUnit: 0.02,
        binderPunchPerUnit: 0.01,
        holeOptions: ['1', '2', '3', '4', '5', '3-Hole Binder Punch', '2-Hole Binder Punch'],
      },
      additionalTurnaroundDays: 1,
      sortOrder: 11,
      isActive: true,
    },

    // 12. Banding - Bundle wrapping
    {
      name: 'Banding',
      description: 'Band materials in bundles',
      tooltipText:
        'Band your materials in bundles for easy distribution. Choose band type and bundle size.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        perBundle: 0.75,
        defaultItemsPerBundle: 100,
        bandTypes: ['Paper Bands', 'Rubber Bands'],
      },
      additionalTurnaroundDays: 1,
      sortOrder: 12,
      isActive: true,
    },

    // 13. Shrink Wrapping
    {
      name: 'Shrink Wrapping',
      description: 'Shrink wrapping for protection',
      tooltipText: 'Protect your materials with shrink wrapping. Specify items per bundle.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        perBundle: 0.3,
        defaultItemsPerBundle: 100,
      },
      additionalTurnaroundDays: 1,
      sortOrder: 13,
      isActive: true,
    },

    // 14. Variable Data - Personalization
    {
      name: 'Variable Data',
      description: 'Personalized printing (names, addresses, etc)',
      tooltipText:
        'Add personalized information to each piece. Upload your data file and we handle the rest.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        setupFee: 25.0,
        perUnit: 0.05,
      },
      additionalTurnaroundDays: 2,
      sortOrder: 14,
      isActive: true,
    },

    // 15. QR Code Generation
    {
      name: 'QR Code',
      description: 'QR Code generation and placement',
      tooltipText:
        'We will create and place a QR code on your design. You provide the content/URL.',
      pricingModel: 'FLAT' as PricingModel,
      configuration: {
        price: 5.0,
        adminGenerated: true,
      },
      additionalTurnaroundDays: 0,
      sortOrder: 15,
      isActive: true,
    },

    // 16. Blank Envelopes
    {
      name: 'Blank Envelopes',
      description: 'Add matching blank envelopes',
      tooltipText: 'Add blank envelopes to match your printed pieces. Sold in bundles of 25.',
      pricingModel: 'CUSTOM' as PricingModel,
      configuration: {
        pricePerBundle: 5.0,
        bundleSize: 25,
      },
      additionalTurnaroundDays: 0,
      sortOrder: 16,
      isActive: true,
    },

    // 17. Wafer Seal - Envelope sealing
    {
      name: 'Wafer Seal',
      description: 'Adhesive envelope sealing',
      tooltipText: 'Seal envelopes with adhesive wafer seals',
      pricingModel: 'PER_UNIT' as PricingModel,
      configuration: {
        perUnit: 0.05,
      },
      additionalTurnaroundDays: 1,
      sortOrder: 17,
      isActive: true,
    },

    // 18. Stock Die Cut - Pre-made die cut shapes
    {
      name: 'Stock Diecut',
      description: 'Pre-made die cut shapes',
      tooltipText: 'Choose from our library of standard die cut shapes',
      pricingModel: 'PERCENTAGE' as PricingModel,
      configuration: {
        percentage: 15,
        appliesTo: 'base_price',
      },
      additionalTurnaroundDays: 2,
      sortOrder: 18,
      isActive: true,
    },

    // 19. Door Hanger Die Cut - Special door hanger shape
    {
      name: 'Door Hanger Die Cut',
      description: 'Die cut door hanger shape',
      tooltipText: 'Custom door hanger die cut with handle opening',
      pricingModel: 'FLAT' as PricingModel,
      configuration: {
        price: 25.0,
      },
      additionalTurnaroundDays: 2,
      sortOrder: 19,
      isActive: true,
    },
  ]

  let addOnCount = 0
  for (const addOn of addOns) {
    await prisma.addOn.upsert({
      where: { name: addOn.name },
      update: {
        description: addOn.description,
        tooltipText: addOn.tooltipText,
        pricingModel: addOn.pricingModel,
        configuration: addOn.configuration,
        additionalTurnaroundDays: addOn.additionalTurnaroundDays,
        sortOrder: addOn.sortOrder,
        isActive: addOn.isActive,
        adminNotes: addOn.adminNotes,
      },
      create: {
        id: generateId('addon'),
        ...addOn,
      },
    })
    addOnCount++
  }
  console.log(`✓ Seeded ${addOnCount} add-ons\n`)

  // ============================================================================
  // 9. ADD-ON SETS (Groups of Add-ons for Products)
  // ============================================================================
  console.log('📦 Seeding Add-on Sets...')

  const addOnSets = [
    {
      name: 'Standard Add-ons',
      description: 'Common add-ons for most products',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Premium Add-ons',
      description: 'Advanced finishing options',
      sortOrder: 2,
      isActive: true,
    },
  ]

  for (const set of addOnSets) {
    await prisma.addOnSet.upsert({
      where: { name: set.name },
      update: {
        description: set.description,
        sortOrder: set.sortOrder,
        isActive: set.isActive,
      },
      create: {
        id: generateId('addonset'),
        ...set,
      },
    })
  }

  // Link add-ons to sets
  const standardSet = await prisma.addOnSet.findUnique({
    where: { name: 'Standard Add-ons' },
  })
  const premiumSet = await prisma.addOnSet.findUnique({
    where: { name: 'Premium Add-ons' },
  })

  if (standardSet) {
    const standardAddOns = ['Design', 'Digital Proof', 'Folding', 'Score', 'Perforation']
    for (let i = 0; i < standardAddOns.length; i++) {
      const addOn = await prisma.addOn.findUnique({
        where: { name: standardAddOns[i] },
      })
      if (addOn) {
        await prisma.addOnSetItem.upsert({
          where: {
            addOnSetId_addOnId: {
              addOnSetId: standardSet.id,
              addOnId: addOn.id,
            },
          },
          update: {
            displayPosition: 'IN_DROPDOWN' as DisplayPosition,
            isDefault: false,
            sortOrder: i,
          },
          create: {
            id: generateId('aosetitem'),
            addOnSetId: standardSet.id,
            addOnId: addOn.id,
            displayPosition: 'IN_DROPDOWN' as DisplayPosition,
            isDefault: false,
            sortOrder: i,
          },
        })
      }
    }
  }

  if (premiumSet) {
    const premiumAddOns = [
      'Color Critical',
      'Exact Size',
      'Corner Rounding',
      'Hole Drilling',
      'Variable Data',
    ]
    for (let i = 0; i < premiumAddOns.length; i++) {
      const addOn = await prisma.addOn.findUnique({
        where: { name: premiumAddOns[i] },
      })
      if (addOn) {
        await prisma.addOnSetItem.upsert({
          where: {
            addOnSetId_addOnId: {
              addOnSetId: premiumSet.id,
              addOnId: addOn.id,
            },
          },
          update: {
            displayPosition: 'IN_DROPDOWN' as DisplayPosition,
            isDefault: false,
            sortOrder: i,
          },
          create: {
            id: generateId('aosetitem'),
            addOnSetId: premiumSet.id,
            addOnId: addOn.id,
            displayPosition: 'IN_DROPDOWN' as DisplayPosition,
            isDefault: false,
            sortOrder: i,
          },
        })
      }
    }
  }

  console.log(`✓ Seeded ${addOnSets.length} add-on sets with items\n`)

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('┌────────────────────────────────────────────────┐')
  console.log('│         MASTER SEED COMPLETED                  │')
  console.log('├────────────────────────────────────────────────┤')
  console.log(`│ Categories:         ${categoryCount.toString().padEnd(25)} │`)
  console.log(`│ Coating Options:    ${coatingCount.toString().padEnd(25)} │`)
  console.log(`│ Sides Options:      ${sidesCount.toString().padEnd(25)} │`)
  console.log(`│ Paper Stocks:       ${paperStockCount.toString().padEnd(25)} │`)
  console.log(`│ Paper Stock Sets:   ${paperStockSets.length.toString().padEnd(25)} │`)
  console.log(`│ Quantity Groups:    ${quantityGroupCount.toString().padEnd(25)} │`)
  console.log(`│ Size Groups:        ${sizeGroupCount.toString().padEnd(25)} │`)
  console.log(`│ Add-ons:            ${addOnCount.toString().padEnd(25)} │`)
  console.log(`│ Add-on Sets:        ${addOnSets.length.toString().padEnd(25)} │`)
  console.log('└────────────────────────────────────────────────┘')
  console.log('\n✅ All configuration data successfully seeded!')
  console.log('\n📝 Note: Run this script anytime to refresh configuration data.')
  console.log('   It safely updates existing entries and creates new ones.\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding master configuration:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
