/**
 * Production Data Seeder for GangRun Printing
 * This script seeds REAL production data including:
 * - Bobby Watkins admin account
 * - Real printing products with actual pricing
 * - Add-ons with ABOVE/IN/BELOW dropdown positions
 * - Sub-options for thorough testing
 */

import { PrismaClient, UserRole, DisplayPosition, PricingModel, OptionType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting production data seeding...')

  // 1. Create Bobby Watkins Customer Account
  console.log('Creating Bobby Watkins customer account...')

  const bobbyUser = await prisma.user.upsert({
    where: { email: 'appvillagellc@gmail.com' },
    update: {},
    create: {
      email: 'appvillagellc@gmail.com',
      name: 'Bobby Watkins',
      role: UserRole.CUSTOMER,
      emailVerified: true,
      phoneNumber: '404-668-2401',
      marketingOptIn: true,
      smsOptIn: true,
      isBroker: false,
    }
  })

  console.log(`✅ Created customer: ${bobbyUser.email}`)

  // 1.5. Create Ira Watkins Admin User
  console.log('Creating Ira Watkins admin user...')
  const adminUser = await prisma.user.upsert({
    where: { email: 'iradwatkins@gmail.com' },
    update: {},
    create: {
      email: 'iradwatkins@gmail.com',
      name: 'Ira Watkins',
      role: UserRole.ADMIN,
      emailVerified: true,
      phoneNumber: '555-123-4567',
      marketingOptIn: false,
      smsOptIn: false,
      isBroker: false,
    }
  })

  console.log(`✅ Created admin user: ${adminUser.email}`)

  // 2. Create Product Categories
  console.log('Creating product categories...')
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { slug: 'business-cards' },
      update: {},
      create: {
        name: 'Business Cards',
        slug: 'business-cards',
        description: 'Professional business cards with various paper options',
        sortOrder: 1,
        isActive: true
      }
    }),
    prisma.productCategory.upsert({
      where: { slug: 'flyers' },
      update: {},
      create: {
        name: 'Flyers',
        slug: 'flyers',
        description: 'High-quality flyers for marketing and promotions',
        sortOrder: 2,
        isActive: true
      }
    }),
    prisma.productCategory.upsert({
      where: { slug: 'brochures' },
      update: {},
      create: {
        name: 'Brochures',
        slug: 'brochures',
        description: 'Folded brochures for detailed product information',
        sortOrder: 3,
        isActive: true
      }
    })
  ])

  // 3. Create Coating Options
  console.log('Creating coating options...')
  const coatings = await Promise.all([
    prisma.coatingOption.upsert({
      where: { name: 'Gloss' },
      update: {},
      create: { name: 'Gloss', description: 'High-gloss finish' }
    }),
    prisma.coatingOption.upsert({
      where: { name: 'Matte' },
      update: {},
      create: { name: 'Matte', description: 'Non-reflective matte finish' }
    }),
    prisma.coatingOption.upsert({
      where: { name: 'UV Coating' },
      update: {},
      create: { name: 'UV Coating', description: 'Ultra-violet protective coating' }
    }),
    prisma.coatingOption.upsert({
      where: { name: 'Soft Touch' },
      update: {},
      create: { name: 'Soft Touch', description: 'Velvety soft-touch lamination' }
    })
  ])

  // 4. Create Sides Options
  console.log('Creating sides options...')
  const sidesOptions = await Promise.all([
    prisma.sidesOption.upsert({
      where: { code: '4-0' },
      update: {},
      create: {
        name: 'Front Only (4/0)',
        code: '4-0',
        description: 'Full color front, blank back'
      }
    }),
    prisma.sidesOption.upsert({
      where: { code: '4-4' },
      update: {},
      create: {
        name: 'Double Sided (4/4)',
        code: '4-4',
        description: 'Full color both sides'
      }
    })
  ])

  // 5. Create Real Paper Stocks with Actual Pricing
  console.log('Creating real paper stocks...')
  const paperStocks = await Promise.all([
    prisma.paperStock.upsert({
      where: { name: '14pt Uncoated Cardstock' },
      update: {},
      create: {
        name: '14pt Uncoated Cardstock',
        pricePerSqInch: 0.0015,
        weight: 0.014,
        tooltipText: 'Thick, durable cardstock with natural feel',
        isActive: true
      }
    }),
    prisma.paperStock.upsert({
      where: { name: '16pt Coated Gloss' },
      update: {},
      create: {
        name: '16pt Coated Gloss',
        pricePerSqInch: 0.0018,
        weight: 0.016,
        tooltipText: 'Premium glossy finish for vibrant colors',
        isActive: true
      }
    }),
    prisma.paperStock.upsert({
      where: { name: '16pt Matte Finish' },
      update: {},
      create: {
        name: '16pt Matte Finish',
        pricePerSqInch: 0.0018,
        weight: 0.016,
        tooltipText: 'Elegant matte finish, easy to write on',
        isActive: true
      }
    }),
    prisma.paperStock.upsert({
      where: { name: '32pt Triple Layer' },
      update: {},
      create: {
        name: '32pt Triple Layer',
        pricePerSqInch: 0.0045,
        weight: 0.032,
        tooltipText: 'Ultra-thick luxury cardstock',
        isActive: true
      }
    }),
    prisma.paperStock.upsert({
      where: { name: '100lb Text Weight' },
      update: {},
      create: {
        name: '100lb Text Weight',
        pricePerSqInch: 0.0008,
        weight: 0.008,
        tooltipText: 'Standard text weight for flyers',
        isActive: true
      }
    }),
    prisma.paperStock.upsert({
      where: { name: 'Premium Silk Laminated' },
      update: {},
      create: {
        name: 'Premium Silk Laminated',
        pricePerSqInch: 0.0035,
        weight: 0.018,
        tooltipText: 'Silk laminated with premium feel',
        isActive: true
      }
    })
  ])

  // 6. Create Paper Stock Sets
  console.log('Creating paper stock sets...')
  let paperStockSet = await prisma.paperStockSet.findUnique({
    where: { name: 'Business Card Papers' }
  })

  if (!paperStockSet) {
    paperStockSet = await prisma.paperStockSet.create({
      data: {
        name: 'Business Card Papers',
        description: 'Premium paper options for business cards',
        sortOrder: 1,
        isActive: true,
        PaperStockSetItem: {
          create: [
            { paperStockId: paperStocks[0].id, isDefault: false, sortOrder: 1 },
            { paperStockId: paperStocks[1].id, isDefault: true, sortOrder: 2 },
            { paperStockId: paperStocks[2].id, isDefault: false, sortOrder: 3 },
            { paperStockId: paperStocks[3].id, isDefault: false, sortOrder: 4 },
            { paperStockId: paperStocks[5].id, isDefault: false, sortOrder: 5 }
          ]
        }
      }
    })
  }

  // 7. Create Standard Sizes
  console.log('Creating standard sizes...')
  const sizes = await Promise.all([
    prisma.standardSize.upsert({
      where: { name: 'business-card-standard' },
      update: {},
      create: {
        name: 'business-card-standard',
        displayName: '3.5" x 2" (Standard)',
        width: 3.5,
        height: 2,
        preCalculatedValue: 7,
        sortOrder: 1,
        isActive: true
      }
    }),
    prisma.standardSize.upsert({
      where: { name: 'flyer-full' },
      update: {},
      create: {
        name: 'flyer-full',
        displayName: '8.5" x 11" (Letter)',
        width: 8.5,
        height: 11,
        preCalculatedValue: 93.5,
        sortOrder: 2,
        isActive: true
      }
    }),
    prisma.standardSize.upsert({
      where: { name: 'flyer-half' },
      update: {},
      create: {
        name: 'flyer-half',
        displayName: '5.5" x 8.5" (Half Page)',
        width: 5.5,
        height: 8.5,
        preCalculatedValue: 46.75,
        sortOrder: 3,
        isActive: true
      }
    }),
    prisma.standardSize.upsert({
      where: { name: 'postcard' },
      update: {},
      create: {
        name: 'postcard',
        displayName: '4" x 6" (Postcard)',
        width: 4,
        height: 6,
        preCalculatedValue: 24,
        sortOrder: 4,
        isActive: true
      }
    })
  ])

  // 8. Create Size Groups
  console.log('Creating size groups...')
  const sizeGroup = await prisma.sizeGroup.upsert({
    where: { name: 'Standard Print Sizes' },
    update: {
      description: 'Common print sizes',
      values: JSON.stringify(sizes.map(s => s.id)),
      defaultValue: sizes[0].id,
      sortOrder: 1,
      isActive: true
    },
    create: {
      name: 'Standard Print Sizes',
      description: 'Common print sizes',
      values: JSON.stringify(sizes.map(s => s.id)),
      defaultValue: sizes[0].id,
      sortOrder: 1,
      isActive: true
    }
  })

  // 9. Create Standard Quantities
  console.log('Creating standard quantities...')
  const quantities = await Promise.all([
    prisma.standardQuantity.upsert({
      where: { displayValue: 100 },
      update: {},
      create: { displayValue: 100, calculationValue: 100, sortOrder: 1, isActive: true }
    }),
    prisma.standardQuantity.upsert({
      where: { displayValue: 250 },
      update: {},
      create: { displayValue: 250, calculationValue: 250, sortOrder: 2, isActive: true }
    }),
    prisma.standardQuantity.upsert({
      where: { displayValue: 500 },
      update: {},
      create: { displayValue: 500, calculationValue: 500, sortOrder: 3, isActive: true }
    }),
    prisma.standardQuantity.upsert({
      where: { displayValue: 1000 },
      update: {},
      create: { displayValue: 1000, calculationValue: 1000, sortOrder: 4, isActive: true }
    }),
    prisma.standardQuantity.upsert({
      where: { displayValue: 2500 },
      update: {},
      create: { displayValue: 2500, calculationValue: 2500, sortOrder: 5, isActive: true }
    }),
    prisma.standardQuantity.upsert({
      where: { displayValue: 5000 },
      update: {},
      create: { displayValue: 5000, calculationValue: 5000, sortOrder: 6, isActive: true }
    })
  ])

  // 10. Create Quantity Groups
  const quantityGroup = await prisma.quantityGroup.upsert({
    where: { name: 'Standard Quantities' },
    update: {
      description: 'Common order quantities',
      values: JSON.stringify(quantities.map(q => q.id)),
      defaultValue: quantities[2].id, // 500 as default
      sortOrder: 1,
      isActive: true
    },
    create: {
      name: 'Standard Quantities',
      description: 'Common order quantities',
      values: JSON.stringify(quantities.map(q => q.id)),
      defaultValue: quantities[2].id, // 500 as default
      sortOrder: 1,
      isActive: true
    }
  })

  // 11. Create Add-Ons with ABOVE/IN/BELOW Positions
  console.log('Creating add-ons with proper display positions...')

  // ABOVE DROPDOWN ADD-ON
  const rushProductionAddOn = await prisma.addOn.create({
    data: {
      name: 'Rush Production',
      description: 'Get your order 50% faster with rush production',
      tooltipText: 'Reduces production time from 5-7 days to 2-3 days',
      pricingModel: PricingModel.PERCENTAGE,
      configuration: { percentage: 50 },
      additionalTurnaroundDays: -3,
      sortOrder: 1,
      isActive: true,
      adminNotes: 'Shows ABOVE dropdown'
    }
  })

  // IN DROPDOWN ADD-ONS with SUB-OPTIONS
  const uvCoatingAddOn = await prisma.addOn.create({
    data: {
      name: 'UV Spot Coating',
      description: 'Add glossy UV coating to specific areas',
      tooltipText: 'Highlight logos or text with spot UV coating',
      pricingModel: PricingModel.PER_UNIT,
      configuration: { pricePerSqInch: 0.15 },
      sortOrder: 2,
      isActive: true,
      adminNotes: 'Shows IN dropdown with sub-options',
      addOnSubOptions: {
        create: [
          {
            name: 'Coverage Area',
            optionType: 'SELECT',
            options: ["Full Coverage", "Logo Only", "Text Only", "Custom"],
            defaultValue: "Logo Only",
            isRequired: true,
            affectsPricing: true,
            tooltipText: 'Select which areas to apply UV coating',
            displayOrder: 1
          },
          {
            name: 'Coating Thickness',
            optionType: 'RADIO',
            options: ["Standard (1 mil)", "Thick (2 mil)", "Extra Thick (3 mil)"],
            defaultValue: "Standard (1 mil)",
            isRequired: false,
            affectsPricing: true,
            tooltipText: 'Choose coating thickness',
            displayOrder: 2
          }
        ]
      }
    }
  })

  const foilStampingAddOn = await prisma.addOn.create({
    data: {
      name: 'Foil Stamping',
      description: 'Add metallic foil accents to your design',
      tooltipText: 'Premium metallic foil in various colors',
      pricingModel: PricingModel.PER_UNIT,
      configuration: { pricePerSqInch: 0.25 },
      sortOrder: 3,
      isActive: true,
      adminNotes: 'Shows IN dropdown with color selection',
      addOnSubOptions: {
        create: {
          name: 'Foil Color',
          optionType: 'SELECT',
          options: ["Gold", "Silver", "Rose Gold", "Holographic", "Copper", "Black"],
          defaultValue: "Gold",
          isRequired: true,
          affectsPricing: false,
          tooltipText: 'Choose your foil color',
          displayOrder: 1
        }
      }
    }
  })

  // BELOW DROPDOWN ADD-ONS
  const roundedCornersAddOn = await prisma.addOn.create({
    data: {
      name: 'Rounded Corners',
      description: 'Add rounded corners to your cards',
      tooltipText: 'Professional rounded corner finish',
      pricingModel: PricingModel.FLAT,
      configuration: { flatFee: 15 },
      sortOrder: 4,
      isActive: true,
      adminNotes: 'Shows BELOW dropdown'
    }
  })

  const dieCuttingAddOn = await prisma.addOn.create({
    data: {
      name: 'Die Cutting',
      description: 'Custom shape cutting for unique designs',
      tooltipText: 'Cut your cards into custom shapes',
      pricingModel: PricingModel.CUSTOM,
      configuration: {
        basePrice: 45,
        complexityMultiplier: {
          circle: 1,
          oval: 1.2,
          custom: 1.5
        }
      },
      sortOrder: 5,
      isActive: true,
      adminNotes: 'Shows BELOW dropdown with shape options',
      addOnSubOptions: {
        create: [
          {
            name: 'Shape Type',
            optionType: 'SELECT',
            options: ["Circle", "Oval", "Square with Rounded Corners", "Custom Shape"],
            defaultValue: "Circle",
            isRequired: true,
            affectsPricing: true,
            tooltipText: 'Select the die cut shape',
            displayOrder: 1
          },
          {
            name: 'Upload Die Line',
            optionType: 'FILE',
            isRequired: false,
            affectsPricing: false,
            tooltipText: 'Upload your custom die line file (PDF or AI)',
            displayOrder: 2
          }
        ]
      }
    }
  })

  // 12. Create Add-On Sets with Display Positions
  console.log('Creating add-on sets with display positions...')
  const businessCardAddOnSet = await prisma.addOnSet.create({
    data: {
      name: 'Business Card Add-Ons',
      description: 'Premium finishing options for business cards',
      sortOrder: 1,
      isActive: true,
      addOnSetItems: {
        create: [
          {
            addOnId: rushProductionAddOn.id,
            displayPosition: DisplayPosition.ABOVE_DROPDOWN,
            isDefault: false,
            sortOrder: 1
          },
          {
            addOnId: uvCoatingAddOn.id,
            displayPosition: DisplayPosition.IN_DROPDOWN,
            isDefault: false,
            sortOrder: 2
          },
          {
            addOnId: foilStampingAddOn.id,
            displayPosition: DisplayPosition.IN_DROPDOWN,
            isDefault: false,
            sortOrder: 3
          },
          {
            addOnId: roundedCornersAddOn.id,
            displayPosition: DisplayPosition.BELOW_DROPDOWN,
            isDefault: false,
            sortOrder: 4
          },
          {
            addOnId: dieCuttingAddOn.id,
            displayPosition: DisplayPosition.BELOW_DROPDOWN,
            isDefault: false,
            sortOrder: 5
          }
        ]
      }
    }
  })

  // 13. Create Turnaround Times
  console.log('Creating turnaround times...')
  const turnaroundTimes = await Promise.all([
    prisma.turnaroundTime.create({
      data: {
        name: 'standard',
        displayName: 'Standard (5-7 business days)',
        description: 'Regular production time',
        daysMin: 5,
        daysMax: 7,
        pricingModel: PricingModel.FLAT,
        basePrice: 0,
        priceMultiplier: 1.0,
        isActive: true,
        sortOrder: 1
      }
    }),
    prisma.turnaroundTime.create({
      data: {
        name: 'rush',
        displayName: 'Rush (2-3 business days)',
        description: '50% faster production',
        daysMin: 2,
        daysMax: 3,
        pricingModel: PricingModel.PERCENTAGE,
        basePrice: 0,
        priceMultiplier: 1.5,
        isActive: true,
        sortOrder: 2
      }
    }),
    prisma.turnaroundTime.create({
      data: {
        name: 'express',
        displayName: 'Express (Next business day)',
        description: 'Next day production',
        daysMin: 1,
        daysMax: 1,
        pricingModel: PricingModel.PERCENTAGE,
        basePrice: 0,
        priceMultiplier: 2.0,
        isActive: true,
        sortOrder: 3
      }
    })
  ])

  const turnaroundTimeSet = await prisma.turnaroundTimeSet.create({
    data: {
      name: 'Standard Turnaround Options',
      description: 'Production speed options',
      isActive: true,
      sortOrder: 1,
      TurnaroundTimeSetItem: {
        create: turnaroundTimes.map((tt, index) => ({
          turnaroundTimeId: tt.id,
          isDefault: index === 0,
          sortOrder: index + 1
        }))
      }
    }
  })

  // 14. Create Real Products
  console.log('Creating real products with actual pricing...')

  // Business Cards
  const standardBusinessCard = await prisma.product.create({
    data: {
      name: 'Standard Business Cards',
      slug: 'standard-business-cards',
      sku: 'BC-STD-001',
      description: 'Professional business cards with standard paper options',
      shortDescription: '3.5" x 2" business cards',
      categoryId: categories[0].id,
      basePrice: 49.99,
      setupFee: 0,
      productionTime: 5,
      isActive: true,
      isFeatured: false,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 5000,
      rushAvailable: true,
      rushDays: 2,
      rushFee: 25,
      productPaperStockSets: {
        create: {
          paperStockSetId: paperStockSet.id,
          isDefault: true,
          sortOrder: 1
        }
      },
      productSizeGroups: {
        create: {
          sizeGroupId: sizeGroup.id
        }
      },
      productQuantityGroups: {
        create: {
          quantityGroupId: quantityGroup.id
        }
      },
      productAddOnSets: {
        create: {
          addOnSetId: businessCardAddOnSet.id,
          isDefault: true,
          sortOrder: 1
        }
      },
      productTurnaroundTimeSets: {
        create: {
          turnaroundTimeSetId: turnaroundTimeSet.id,
          isDefault: true
        }
      },
      pricingTiers: {
        create: [
          { minQuantity: 100, maxQuantity: 249, unitPrice: 0.50, setupFee: 0 },
          { minQuantity: 250, maxQuantity: 499, unitPrice: 0.40, setupFee: 0 },
          { minQuantity: 500, maxQuantity: 999, unitPrice: 0.30, setupFee: 0 },
          { minQuantity: 1000, maxQuantity: 2499, unitPrice: 0.25, setupFee: 0 },
          { minQuantity: 2500, maxQuantity: 4999, unitPrice: 0.20, setupFee: 0 },
          { minQuantity: 5000, maxQuantity: null, unitPrice: 0.15, setupFee: 0 }
        ]
      }
    }
  })

  const premiumBusinessCard = await prisma.product.create({
    data: {
      name: 'Premium Business Cards',
      slug: 'premium-business-cards',
      sku: 'BC-PRM-001',
      description: 'Premium business cards with UV coating and luxury finishes',
      shortDescription: '3.5" x 2" premium cards with UV coating',
      categoryId: categories[0].id,
      basePrice: 69.99,
      setupFee: 0,
      productionTime: 5,
      isActive: true,
      isFeatured: true,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 5000,
      rushAvailable: true,
      rushDays: 2,
      rushFee: 35,
      productPaperStockSets: {
        create: {
          paperStockSetId: paperStockSet.id,
          isDefault: true,
          sortOrder: 1
        }
      },
      productSizeGroups: {
        create: {
          sizeGroupId: sizeGroup.id
        }
      },
      productQuantityGroups: {
        create: {
          quantityGroupId: quantityGroup.id
        }
      },
      productAddOnSets: {
        create: {
          addOnSetId: businessCardAddOnSet.id,
          isDefault: true,
          sortOrder: 1
        }
      },
      productTurnaroundTimeSets: {
        create: {
          turnaroundTimeSetId: turnaroundTimeSet.id,
          isDefault: true
        }
      },
      pricingTiers: {
        create: [
          { minQuantity: 100, maxQuantity: 249, unitPrice: 0.70, setupFee: 0 },
          { minQuantity: 250, maxQuantity: 499, unitPrice: 0.56, setupFee: 0 },
          { minQuantity: 500, maxQuantity: 999, unitPrice: 0.42, setupFee: 0 },
          { minQuantity: 1000, maxQuantity: 2499, unitPrice: 0.35, setupFee: 0 },
          { minQuantity: 2500, maxQuantity: 4999, unitPrice: 0.28, setupFee: 0 },
          { minQuantity: 5000, maxQuantity: null, unitPrice: 0.21, setupFee: 0 }
        ]
      }
    }
  })

  const luxuryBusinessCard = await prisma.product.create({
    data: {
      name: 'Luxury Business Cards',
      slug: 'luxury-business-cards',
      sku: 'BC-LUX-001',
      description: 'Ultra-premium 32pt triple layer business cards with soft-touch finish',
      shortDescription: '3.5" x 2" luxury 32pt cards',
      categoryId: categories[0].id,
      basePrice: 149.99,
      setupFee: 25,
      productionTime: 7,
      isActive: true,
      isFeatured: true,
      gangRunEligible: false,
      rushAvailable: true,
      rushDays: 3,
      rushFee: 75,
      productPaperStockSets: {
        create: {
          paperStockSetId: paperStockSet.id,
          isDefault: true,
          sortOrder: 1
        }
      },
      productSizeGroups: {
        create: {
          sizeGroupId: sizeGroup.id
        }
      },
      productQuantityGroups: {
        create: {
          quantityGroupId: quantityGroup.id
        }
      },
      productAddOnSets: {
        create: {
          addOnSetId: businessCardAddOnSet.id,
          isDefault: true,
          sortOrder: 1
        }
      },
      productTurnaroundTimeSets: {
        create: {
          turnaroundTimeSetId: turnaroundTimeSet.id,
          isDefault: true
        }
      },
      pricingTiers: {
        create: [
          { minQuantity: 100, maxQuantity: 249, unitPrice: 1.50, setupFee: 25 },
          { minQuantity: 250, maxQuantity: 499, unitPrice: 1.20, setupFee: 25 },
          { minQuantity: 500, maxQuantity: 999, unitPrice: 0.90, setupFee: 25 },
          { minQuantity: 1000, maxQuantity: 2499, unitPrice: 0.75, setupFee: 25 },
          { minQuantity: 2500, maxQuantity: 4999, unitPrice: 0.60, setupFee: 25 },
          { minQuantity: 5000, maxQuantity: null, unitPrice: 0.45, setupFee: 25 }
        ]
      }
    }
  })

  // Flyers
  const fullColorFlyers = await prisma.product.create({
    data: {
      name: 'Full Color Flyers',
      slug: 'full-color-flyers',
      sku: 'FL-FC-001',
      description: 'High-quality 8.5" x 11" flyers with vibrant full-color printing',
      shortDescription: '8.5" x 11" full color flyers',
      categoryId: categories[1].id,
      basePrice: 89.99,
      setupFee: 0,
      productionTime: 3,
      isActive: true,
      isFeatured: true,
      gangRunEligible: true,
      minGangQuantity: 100,
      maxGangQuantity: 10000,
      rushAvailable: true,
      rushDays: 1,
      rushFee: 45,
      pricingTiers: {
        create: [
          { minQuantity: 100, maxQuantity: 249, unitPrice: 0.90, setupFee: 0 },
          { minQuantity: 250, maxQuantity: 499, unitPrice: 0.72, setupFee: 0 },
          { minQuantity: 500, maxQuantity: 999, unitPrice: 0.54, setupFee: 0 },
          { minQuantity: 1000, maxQuantity: 2499, unitPrice: 0.45, setupFee: 0 },
          { minQuantity: 2500, maxQuantity: 4999, unitPrice: 0.36, setupFee: 0 },
          { minQuantity: 5000, maxQuantity: null, unitPrice: 0.27, setupFee: 0 }
        ]
      }
    }
  })

  console.log('✅ Production data seeding complete!')
  console.log(`
  Created:
  - 1 Customer (Bobby Watkins - appvillagellc@gmail.com)
  - 1 Admin User (Ira Watkins - iradwatkins@gmail.com)
  - 3 Product Categories
  - 6 Paper Stocks
  - 5 Add-Ons (with ABOVE/IN/BELOW positions)
  - 4 Products with real pricing
  - Complete pricing tiers
  - Sub-options for UV Coating, Foil Stamping, and Die Cutting
  `)

  // 15. Create sample customer for testing
  console.log('Creating test customer account...')
  const testCustomer = await prisma.user.create({
    data: {
      email: 'customer@test.com',
      name: 'Test Customer',
      role: UserRole.CUSTOMER,
      emailVerified: true,
      phoneNumber: '312-555-0100',
      marketingOptIn: true,
      smsOptIn: false
    }
  })

  console.log(`✅ Test customer created: ${testCustomer.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })