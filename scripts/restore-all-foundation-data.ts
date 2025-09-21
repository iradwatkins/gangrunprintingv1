import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function restoreAllFoundationData() {

  console.log('=' .repeat(60))

  console.log('=' .repeat(60))

  try {
    // 1. Restore Paper Stocks

    const paperStocks = [
      {
        name: '14pt Cardstock',
        weight: 0.014,
        pricePerSqInch: 0.0015,
        tooltipText: 'Premium uncoated cardstock, perfect for business cards',
        isActive: true,
      },
      {
        name: '16pt Cardstock',
        weight: 0.016,
        pricePerSqInch: 0.0018,
        tooltipText: 'Extra thick premium cardstock with excellent durability',
        isActive: true,
      },
      {
        name: '100lb Gloss Text',
        weight: 0.007,
        pricePerSqInch: 0.001,
        tooltipText: 'Glossy finish text weight paper, ideal for flyers',
        isActive: true,
      },
      {
        name: '100lb Matte Text',
        weight: 0.007,
        pricePerSqInch: 0.001,
        tooltipText: 'Smooth matte finish text weight paper',
        isActive: true,
      },
      {
        name: '80lb Gloss Text',
        weight: 0.0054,
        pricePerSqInch: 0.0008,
        tooltipText: 'Standard glossy paper for everyday printing',
        isActive: true,
      },
      {
        name: '80lb Matte Text',
        weight: 0.0054,
        pricePerSqInch: 0.0008,
        tooltipText: 'Standard matte paper for professional documents',
        isActive: true,
      },
      {
        name: '70lb Uncoated Text',
        weight: 0.0047,
        pricePerSqInch: 0.0007,
        tooltipText: 'Natural feel uncoated paper, easy to write on',
        isActive: true,
      },
      {
        name: '24pt Trifecta Green Triple-Layered',
        weight: 0.024,
        pricePerSqInch: 0.0025,
        tooltipText: 'Eco-friendly triple-layered cardstock with colored core',
        isActive: true,
      },
      {
        name: '32pt Uncoated Black EDGE',
        weight: 0.032,
        pricePerSqInch: 0.003,
        tooltipText: 'Ultra-thick cardstock with distinctive black edge',
        isActive: true,
      },
      {
        name: 'Synthetic Waterproof',
        weight: 0.01,
        pricePerSqInch: 0.0035,
        tooltipText: 'Tear-resistant and waterproof synthetic material',
        isActive: true,
      },
      {
        name: 'Kraft Paper',
        weight: 0.011,
        pricePerSqInch: 0.0012,
        tooltipText: 'Natural brown kraft paper with organic texture',
        isActive: true,
      },
      {
        name: 'Pearl Metallic',
        weight: 0.012,
        pricePerSqInch: 0.002,
        tooltipText: 'Shimmering pearl finish for elegant designs',
        isActive: true,
      },
      {
        name: 'Soft Touch Laminated',
        weight: 0.016,
        pricePerSqInch: 0.0022,
        tooltipText: 'Velvety soft-touch lamination for premium feel',
        isActive: true,
      },
    ]

    for (const paperStock of paperStocks) {
      await prisma.paperStock.upsert({
        where: { name: paperStock.name },
        update: paperStock,
        create: paperStock,
      })
    }

    // 2. Create Paper Stock Sets

    const paperStockSets = [
      {
        name: 'Standard Cardstock Set',
        description: 'Premium cardstock options for business cards',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Marketing Materials Set',
        description: 'Paper options for flyers and brochures',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Premium Specialty Set',
        description: 'Unique and luxury paper options',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Eco-Friendly Set',
        description: 'Sustainable and recycled paper options',
        isActive: true,
        sortOrder: 4,
      },
      {
        name: 'Large Format Set',
        description: 'Papers suitable for posters and banners',
        isActive: true,
        sortOrder: 5,
      },
    ]

    for (const setData of paperStockSets) {
      const set = await prisma.paperStockSet.upsert({
        where: { name: setData.name },
        update: setData,
        create: setData,
      })

      // Add paper stocks to sets
      let stocksToAdd = []
      if (set.name.includes('Standard Cardstock')) {
        stocksToAdd = ['14pt Cardstock', '16pt Cardstock', '24pt Trifecta Green Triple-Layered', '32pt Uncoated Black EDGE']
      } else if (set.name.includes('Marketing Materials')) {
        stocksToAdd = ['100lb Gloss Text', '100lb Matte Text', '80lb Gloss Text', '80lb Matte Text', '70lb Uncoated Text']
      } else if (set.name.includes('Premium Specialty')) {
        stocksToAdd = ['Synthetic Waterproof', 'Pearl Metallic', 'Soft Touch Laminated', '32pt Uncoated Black EDGE']
      } else if (set.name.includes('Eco-Friendly')) {
        stocksToAdd = ['Kraft Paper', '24pt Trifecta Green Triple-Layered', '70lb Uncoated Text']
      } else if (set.name.includes('Large Format')) {
        stocksToAdd = ['100lb Gloss Text', '100lb Matte Text', 'Synthetic Waterproof']
      }

      for (let i = 0; i < stocksToAdd.length; i++) {
        const stock = await prisma.paperStock.findFirst({
          where: { name: stocksToAdd[i] }
        })
        if (stock) {
          await prisma.paperStockSetItem.upsert({
            where: {
              paperStockSetId_paperStockId: {
                paperStockSetId: set.id,
                paperStockId: stock.id,
              },
            },
            update: { sortOrder: i + 1 },
            create: {
              paperStockSetId: set.id,
              paperStockId: stock.id,
              sortOrder: i + 1,
            },
          })
        }
      }
    }

    // 3. Restore ALL Add-ons (19 total including special ones)

    // First restore the special add-ons with conditional fields
    const cornerRounding = await prisma.addOn.upsert({
      where: { name: 'Corner Rounding' },
      update: {
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'corner_rounding',
          basePrice: 20,
          pricePerPiece: 0.01,
          displayPrice: '$20.00 + $0.01/piece',
          conditionalFields: {
            cornerType: {
              label: 'ROUNDED CORNERS',
              type: 'select',
              options: [
                'All Four',
                'Top Two',
                'Bottom Two',
                'Top Left',
                'Top Right',
                'Bottom Left',
                'Bottom Right',
                'Top Left and Bottom Right',
                'Top Right and Bottom Left'
              ],
              required: true,
              displayType: 'dropdown'
            }
          }
        },
        tooltipText: 'Add rounded corners for a professional, modern look',
        isActive: true,
      },
      create: {
        name: 'Corner Rounding',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'corner_rounding',
          basePrice: 20,
          pricePerPiece: 0.01,
          displayPrice: '$20.00 + $0.01/piece',
          conditionalFields: {
            cornerType: {
              label: 'ROUNDED CORNERS',
              type: 'select',
              options: [
                'All Four',
                'Top Two',
                'Bottom Two',
                'Top Left',
                'Top Right',
                'Bottom Left',
                'Bottom Right',
                'Top Left and Bottom Right',
                'Top Right and Bottom Left'
              ],
              required: true,
              displayType: 'dropdown'
            }
          }
        },
        tooltipText: 'Add rounded corners for a professional, modern look',
        isActive: true,
      },
    })

    const variableData = await prisma.addOn.upsert({
      where: { name: 'Variable Data Printing' },
      update: {
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'variable_data',
          basePrice: 60,
          pricePerPiece: 0.02,
          displayPrice: '$60.00 + $0.02/piece',
          conditionalFields: {
            dataFields: {
              label: 'Variable Fields',
              type: 'multiselect',
              options: [
                'Name Personalization',
                'Sequential Numbering',
                'Unique QR Codes',
                'Custom Addresses',
                'Personalized Images',
                'Variable Barcodes'
              ],
              required: true,
              displayType: 'checkboxes'
            }
          }
        },
        tooltipText: 'Print unique information on each piece',
        isActive: true,
      },
      create: {
        name: 'Variable Data Printing',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'variable_data',
          basePrice: 60,
          pricePerPiece: 0.02,
          displayPrice: '$60.00 + $0.02/piece',
          conditionalFields: {
            dataFields: {
              label: 'Variable Fields',
              type: 'multiselect',
              options: [
                'Name Personalization',
                'Sequential Numbering',
                'Unique QR Codes',
                'Custom Addresses',
                'Personalized Images',
                'Variable Barcodes'
              ],
              required: true,
              displayType: 'checkboxes'
            }
          }
        },
        tooltipText: 'Print unique information on each piece',
        isActive: true,
      },
    })

    // Restore Perforation addon
    const perforation = await prisma.addOn.upsert({
      where: { name: 'Perforation' },
      update: {
        pricingModel: 'FLAT',
        configuration: {
          type: 'perforation',
          basePrice: 25,
          displayPrice: '$25.00',
          conditionalFields: {
            perforationType: {
              label: 'Perforation Type',
              type: 'select',
              options: [
                'Horizontal',
                'Vertical',
                'Both (Cross)',
                'Custom Pattern'
              ],
              required: true,
              displayType: 'dropdown'
            },
            perforationPosition: {
              label: 'Position from Edge',
              type: 'text',
              placeholder: 'e.g., 3.5 inches from top',
              required: true,
              displayType: 'input'
            }
          }
        },
        tooltipText: 'Add tear-away perforations for coupons or tickets',
        isActive: true,
      },
      create: {
        name: 'Perforation',
        pricingModel: 'FLAT',
        configuration: {
          type: 'perforation',
          basePrice: 25,
          displayPrice: '$25.00',
          conditionalFields: {
            perforationType: {
              label: 'Perforation Type',
              type: 'select',
              options: [
                'Horizontal',
                'Vertical',
                'Both (Cross)',
                'Custom Pattern'
              ],
              required: true,
              displayType: 'dropdown'
            },
            perforationPosition: {
              label: 'Position from Edge',
              type: 'text',
              placeholder: 'e.g., 3.5 inches from top',
              required: true,
              displayType: 'input'
            }
          }
        },
        tooltipText: 'Add tear-away perforations for coupons or tickets',
        isActive: true,
      },
    })

    // Restore Banding addon
    const banding = await prisma.addOn.upsert({
      where: { name: 'Banding' },
      update: {
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'banding',
          basePrice: 15,
          pricePerBundle: 0.50,
          displayPrice: '$15.00 + $0.50/bundle',
          conditionalFields: {
            bundleSize: {
              label: 'Cards per Bundle',
              type: 'select',
              options: ['25', '50', '100', '250', '500'],
              required: true,
              displayType: 'dropdown'
            },
            bandType: {
              label: 'Band Type',
              type: 'select',
              options: ['Paper Band', 'Elastic Band', 'Shrink Wrap'],
              required: true,
              displayType: 'dropdown'
            }
          }
        },
        tooltipText: 'Bundle cards together for easy distribution',
        isActive: true,
      },
      create: {
        name: 'Banding',
        pricingModel: 'CUSTOM',
        configuration: {
          type: 'banding',
          basePrice: 15,
          pricePerBundle: 0.50,
          displayPrice: '$15.00 + $0.50/bundle',
          conditionalFields: {
            bundleSize: {
              label: 'Cards per Bundle',
              type: 'select',
              options: ['25', '50', '100', '250', '500'],
              required: true,
              displayType: 'dropdown'
            },
            bandType: {
              label: 'Band Type',
              type: 'select',
              options: ['Paper Band', 'Elastic Band', 'Shrink Wrap'],
              required: true,
              displayType: 'dropdown'
            }
          }
        },
        tooltipText: 'Bundle cards together for easy distribution',
        isActive: true,
      },
    })

    // Now restore the standard add-ons
    const standardAddOns = [
      {
        name: 'Matte Finish',
        pricingModel: 'PERCENTAGE',
        configuration: { percentageValue: 10 },
        tooltipText: 'Smooth, non-reflective coating that reduces glare',
        isActive: true,
      },
      {
        name: 'Gloss Finish',
        pricingModel: 'PERCENTAGE',
        configuration: { percentageValue: 10 },
        tooltipText: 'High-gloss coating for vibrant colors and protection',
        isActive: true,
      },
      {
        name: 'Spot UV Coating',
        pricingModel: 'FLAT',
        configuration: { price: 50 },
        tooltipText: 'Glossy coating on specific areas for contrast',
        isActive: true,
      },
      {
        name: 'Foil Stamping',
        pricingModel: 'FLAT',
        configuration: { price: 75 },
        tooltipText: 'Metallic foil application for premium appeal',
        isActive: true,
      },
      {
        name: 'Embossing',
        pricingModel: 'FLAT',
        configuration: { price: 60 },
        tooltipText: 'Raised design elements for tactile effect',
        isActive: true,
      },
      {
        name: 'Die Cutting',
        pricingModel: 'FLAT',
        configuration: { price: 100 },
        tooltipText: 'Custom shapes and cutouts',
        isActive: true,
      },
      {
        name: 'Folding',
        pricingModel: 'PER_UNIT',
        configuration: { pricePerUnit: 0.05 },
        tooltipText: 'Professional folding for brochures and cards',
        isActive: true,
      },
      {
        name: 'Scoring',
        pricingModel: 'FLAT',
        configuration: { price: 20 },
        tooltipText: 'Crease lines for clean, easy folding',
        isActive: true,
      },
      {
        name: 'Hole Drilling',
        pricingModel: 'PER_UNIT',
        configuration: { pricePerUnit: 0.02 },
        tooltipText: 'Holes for hanging or binding',
        isActive: true,
      },
      {
        name: 'Sequential Numbering',
        pricingModel: 'PER_UNIT',
        configuration: { pricePerUnit: 0.03 },
        tooltipText: 'Unique sequential numbers on each piece',
        isActive: true,
      },
      {
        name: 'Shrink Wrapping',
        pricingModel: 'CUSTOM',
        configuration: { pricePerBundle: 2 },
        tooltipText: 'Protective plastic wrapping for bundles',
        isActive: true,
      },
      {
        name: 'Rush Production',
        pricingModel: 'PERCENTAGE',
        configuration: { percentageValue: 25 },
        tooltipText: 'Expedited production for urgent orders',
        isActive: true,
      },
      {
        name: 'Design Services',
        pricingModel: 'FLAT',
        configuration: { price: 150 },
        tooltipText: 'Professional design assistance',
        isActive: true,
      },
      {
        name: 'QR Code Generation',
        pricingModel: 'FLAT',
        configuration: { price: 25 },
        tooltipText: 'Create and integrate QR codes',
        isActive: true,
      },
      {
        name: 'EDDM Processing',
        pricingModel: 'PER_UNIT',
        configuration: { pricePerUnit: 0.19 },
        tooltipText: 'Every Door Direct Mail preparation and postage',
        isActive: true,
      },
    ]

    for (const addon of standardAddOns) {
      await prisma.addOn.upsert({
        where: { name: addon.name },
        update: addon,
        create: addon,
      })
    }

    // 4. Create Add-on Sets

    const addOnSets = [
      {
        name: 'Premium Business Card Add-ons',
        description: 'Enhancement options for business cards',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Marketing Materials Add-ons',
        description: 'Add-ons for flyers, brochures, and marketing materials',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Finishing Options',
        description: 'Professional finishing and coating options',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Packaging & Delivery',
        description: 'Bundling, packaging, and delivery options',
        isActive: true,
        sortOrder: 4,
      },
      {
        name: 'Design Services',
        description: 'Professional design and proofing services',
        isActive: true,
        sortOrder: 5,
      },
      {
        name: 'Large Format Add-ons',
        description: 'Special options for posters and banners',
        isActive: true,
        sortOrder: 6,
      },
      {
        name: 'EDDM Services',
        description: 'Every Door Direct Mail processing and postage',
        isActive: true,
        sortOrder: 7,
      },
      {
        name: 'Rush Production',
        description: 'Expedited production and shipping options',
        isActive: true,
        sortOrder: 8,
      },
    ]

    for (const setData of addOnSets) {
      const set = await prisma.addOnSet.upsert({
        where: { name: setData.name },
        update: setData,
        create: setData,
      })

      // Configure display positions for Premium Business Card Add-ons
      if (set.name === 'Premium Business Card Add-ons') {
        // Corner Rounding - ABOVE_DROPDOWN
        await prisma.addOnSetItem.upsert({
          where: {
            addOnSetId_addOnId: {
              addOnSetId: set.id,
              addOnId: cornerRounding.id
            }
          },
          update: {
            displayPosition: 'ABOVE_DROPDOWN',
            sortOrder: 1
          },
          create: {
            addOnSetId: set.id,
            addOnId: cornerRounding.id,
            displayPosition: 'ABOVE_DROPDOWN',
            sortOrder: 1
          }
        })

        // Variable Data - BELOW_DROPDOWN
        await prisma.addOnSetItem.upsert({
          where: {
            addOnSetId_addOnId: {
              addOnSetId: set.id,
              addOnId: variableData.id
            }
          },
          update: {
            displayPosition: 'BELOW_DROPDOWN',
            sortOrder: 10
          },
          create: {
            addOnSetId: set.id,
            addOnId: variableData.id,
            displayPosition: 'BELOW_DROPDOWN',
            sortOrder: 10
          }
        })

        // Add other relevant addons to dropdown
        const dropdownAddons = ['Matte Finish', 'Gloss Finish', 'Spot UV Coating', 'Foil Stamping']
        for (let i = 0; i < dropdownAddons.length; i++) {
          const addon = await prisma.addOn.findFirst({ where: { name: dropdownAddons[i] } })
          if (addon) {
            await prisma.addOnSetItem.upsert({
              where: {
                addOnSetId_addOnId: {
                  addOnSetId: set.id,
                  addOnId: addon.id
                }
              },
              update: {
                displayPosition: 'IN_DROPDOWN',
                sortOrder: i + 2
              },
              create: {
                addOnSetId: set.id,
                addOnId: addon.id,
                displayPosition: 'IN_DROPDOWN',
                sortOrder: i + 2
              }
            })
          }
        }
      }

      // Configure display positions for Marketing Materials
      if (set.name === 'Marketing Materials Add-ons') {
        // Add Variable Data with BELOW_DROPDOWN position
        await prisma.addOnSetItem.upsert({
          where: {
            addOnSetId_addOnId: {
              addOnSetId: set.id,
              addOnId: variableData.id
            }
          },
          update: {
            displayPosition: 'BELOW_DROPDOWN',
            sortOrder: 10
          },
          create: {
            addOnSetId: set.id,
            addOnId: variableData.id,
            displayPosition: 'BELOW_DROPDOWN',
            sortOrder: 10
          }
        })

        // Add Perforation with ABOVE_DROPDOWN
        await prisma.addOnSetItem.upsert({
          where: {
            addOnSetId_addOnId: {
              addOnSetId: set.id,
              addOnId: perforation.id
            }
          },
          update: {
            displayPosition: 'ABOVE_DROPDOWN',
            sortOrder: 1
          },
          create: {
            addOnSetId: set.id,
            addOnId: perforation.id,
            displayPosition: 'ABOVE_DROPDOWN',
            sortOrder: 1
          }
        })
      }
    }

    // 5. Restore Quantity Groups

    const quantityGroups = [
      {
        name: 'Standard Quantities',
        description: 'Common print quantities for most products',
        values: '25,50,100,250,500,1000,2500,5000,10000',
        defaultValue: '100',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Business Card Quantities',
        description: 'Typical quantities for business cards',
        values: '100,250,500,1000,2500,5000',
        defaultValue: '500',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Large Format Quantities',
        description: 'Quantities for posters and banners',
        values: '1,5,10,25,50,100,250,500',
        defaultValue: '10',
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'Custom Quantity',
        description: 'Enter any quantity you need',
        values: 'custom',
        defaultValue: '1',
        customMin: 1,
        customMax: 1000000,
        sortOrder: 4,
        isActive: true,
      },
    ]

    for (const group of quantityGroups) {
      await prisma.quantityGroup.upsert({
        where: { name: group.name },
        update: group,
        create: group,
      })
    }

    // 6. Restore Size Groups

    const sizeGroups = [
      {
        name: 'Business Card Sizes',
        description: 'Standard business card dimensions',
        values: '2"x3.5",3.5"x2",2.5"x2.5"',
        defaultValue: '2"x3.5"',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Postcard Sizes',
        description: 'Common postcard dimensions',
        values: '4"x6",5"x7",6"x9",6"x11"',
        defaultValue: '4"x6"',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Flyer Sizes',
        description: 'Standard flyer dimensions',
        values: '5.5"x8.5",8.5"x11",11"x17"',
        defaultValue: '8.5"x11"',
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'Large Format Sizes',
        description: 'Poster and banner sizes',
        values: '12"x18",18"x24",24"x36"',
        defaultValue: '18"x24"',
        sortOrder: 4,
        isActive: true,
      },
      {
        name: 'Square Sizes',
        description: 'Square format options',
        values: '3"x3",4"x4",5"x5",6"x6"',
        defaultValue: '4"x4"',
        sortOrder: 5,
        isActive: true,
      },
      {
        name: 'Custom Size',
        description: 'Enter custom dimensions',
        values: 'custom',
        defaultValue: 'custom',
        customMinWidth: 1,
        customMaxWidth: 48,
        customMinHeight: 1,
        customMaxHeight: 96,
        sortOrder: 6,
        isActive: true,
      },
    ]

    for (const group of sizeGroups) {
      await prisma.sizeGroup.upsert({
        where: { name: group.name },
        update: group,
        create: group,
      })
    }

    // 7. Restore Turnaround Times

    const turnaroundTimes = [
      { name: 'Economy', businessDays: 10, sortOrder: 1, isActive: true, priceMultiplier: 0.9 },
      { name: 'Standard', businessDays: 7, sortOrder: 2, isActive: true, priceMultiplier: 1 },
      { name: 'Fast', businessDays: 5, sortOrder: 3, isActive: true, priceMultiplier: 1.15 },
      { name: 'Faster', businessDays: 3, sortOrder: 4, isActive: true, priceMultiplier: 1.3 },
      { name: 'Fastest', businessDays: 1, sortOrder: 5, isActive: true, priceMultiplier: 1.5 },
    ]

    for (const turnaround of turnaroundTimes) {
      await prisma.turnaroundTime.upsert({
        where: { name: turnaround.name },
        update: turnaround,
        create: turnaround,
      })
    }

    // 8. Create Turnaround Time Sets

    const turnaroundTimeSets = [
      {
        name: 'Standard Turnaround',
        description: 'Regular production schedule options',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Business Card Turnaround',
        description: 'Fast turnaround options for business cards',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Marketing Materials Turnaround',
        description: 'Flexible timing for marketing campaigns',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Large Format Turnaround',
        description: 'Production schedule for posters and banners',
        isActive: true,
        sortOrder: 4,
      },
      {
        name: 'EDDM Turnaround',
        description: 'Mailing preparation and processing times',
        isActive: true,
        sortOrder: 5,
      },
      {
        name: 'Rush Service',
        description: 'Expedited production for urgent orders',
        isActive: true,
        sortOrder: 6,
      },
    ]

    const allTurnaroundTimes = await prisma.turnaroundTime.findMany()

    for (const setData of turnaroundTimeSets) {
      const set = await prisma.turnaroundTimeSet.upsert({
        where: { name: setData.name },
        update: setData,
        create: setData,
      })

      // Add appropriate turnaround times based on set name
      let timesToAdd = []
      if (set.name.includes('Business Card')) {
        timesToAdd = allTurnaroundTimes
      } else if (set.name.includes('Rush')) {
        timesToAdd = allTurnaroundTimes.filter(t =>
          t.name === 'Fast' || t.name === 'Faster' || t.name === 'Fastest'
        )
      } else if (set.name.includes('Large Format')) {
        timesToAdd = allTurnaroundTimes.filter(t => t.name !== 'Fastest')
      } else if (set.name.includes('EDDM')) {
        timesToAdd = allTurnaroundTimes.filter(t =>
          t.name === 'Economy' || t.name === 'Fast'
        )
      } else {
        timesToAdd = allTurnaroundTimes
      }

      for (let i = 0; i < timesToAdd.length; i++) {
        await prisma.turnaroundTimeSetItem.upsert({
          where: {
            turnaroundTimeSetId_turnaroundTimeId: {
              turnaroundTimeSetId: set.id,
              turnaroundTimeId: timesToAdd[i].id,
            },
          },
          update: {
            sortOrder: i + 1,
            isDefault: i === 0,
          },
          create: {
            turnaroundTimeSetId: set.id,
            turnaroundTimeId: timesToAdd[i].id,
            sortOrder: i + 1,
            isDefault: i === 0,
          },
        })
      }
    }

    // 9. Link Products to Sets

    const products = await prisma.product.findMany()

    for (const product of products) {

      // Link Paper Stock Sets
      if (product.name.includes('Business Card')) {
        const standardSet = await prisma.paperStockSet.findFirst({
          where: { name: 'Standard Cardstock Set' }
        })
        if (standardSet) {
          await prisma.productPaperStockSet.upsert({
            where: {
              productId_paperStockSetId: {
                productId: product.id,
                paperStockSetId: standardSet.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              paperStockSetId: standardSet.id
            }
          })
        }

        // Link to Premium Business Card Add-ons
        const premiumAddons = await prisma.addOnSet.findFirst({
          where: { name: 'Premium Business Card Add-ons' }
        })
        if (premiumAddons) {
          await prisma.productAddOnSet.upsert({
            where: {
              productId_addOnSetId: {
                productId: product.id,
                addOnSetId: premiumAddons.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              addOnSetId: premiumAddons.id
            }
          })
        }

        // Link to Business Card Turnaround
        const bcTurnaround = await prisma.turnaroundTimeSet.findFirst({
          where: { name: 'Business Card Turnaround' }
        })
        if (bcTurnaround) {
          await prisma.productTurnaroundTimeSet.upsert({
            where: {
              productId_turnaroundTimeSetId: {
                productId: product.id,
                turnaroundTimeSetId: bcTurnaround.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              turnaroundTimeSetId: bcTurnaround.id
            }
          })
        }
      } else if (product.name.includes('Flyer')) {
        const marketingSet = await prisma.paperStockSet.findFirst({
          where: { name: 'Marketing Materials Set' }
        })
        if (marketingSet) {
          await prisma.productPaperStockSet.upsert({
            where: {
              productId_paperStockSetId: {
                productId: product.id,
                paperStockSetId: marketingSet.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              paperStockSetId: marketingSet.id
            }
          })
        }

        const marketingAddons = await prisma.addOnSet.findFirst({
          where: { name: 'Marketing Materials Add-ons' }
        })
        if (marketingAddons) {
          await prisma.productAddOnSet.upsert({
            where: {
              productId_addOnSetId: {
                productId: product.id,
                addOnSetId: marketingAddons.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              addOnSetId: marketingAddons.id
            }
          })
        }

        const marketingTurnaround = await prisma.turnaroundTimeSet.findFirst({
          where: { name: 'Marketing Materials Turnaround' }
        })
        if (marketingTurnaround) {
          await prisma.productTurnaroundTimeSet.upsert({
            where: {
              productId_turnaroundTimeSetId: {
                productId: product.id,
                turnaroundTimeSetId: marketingTurnaround.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              turnaroundTimeSetId: marketingTurnaround.id
            }
          })
        }
      } else if (product.name.includes('Poster')) {
        const largeFormatSet = await prisma.paperStockSet.findFirst({
          where: { name: 'Large Format Set' }
        })
        if (largeFormatSet) {
          await prisma.productPaperStockSet.upsert({
            where: {
              productId_paperStockSetId: {
                productId: product.id,
                paperStockSetId: largeFormatSet.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              paperStockSetId: largeFormatSet.id
            }
          })
        }

        const largeAddons = await prisma.addOnSet.findFirst({
          where: { name: 'Large Format Add-ons' }
        })
        if (largeAddons) {
          await prisma.productAddOnSet.upsert({
            where: {
              productId_addOnSetId: {
                productId: product.id,
                addOnSetId: largeAddons.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              addOnSetId: largeAddons.id
            }
          })
        }

        const largeTurnaround = await prisma.turnaroundTimeSet.findFirst({
          where: { name: 'Large Format Turnaround' }
        })
        if (largeTurnaround) {
          await prisma.productTurnaroundTimeSet.upsert({
            where: {
              productId_turnaroundTimeSetId: {
                productId: product.id,
                turnaroundTimeSetId: largeTurnaround.id
              }
            },
            update: {},
            create: {
              productId: product.id,
              turnaroundTimeSetId: largeTurnaround.id
            }
          })
        }
      }
    }

    // Final verification
    console.log('\n' + '=' .repeat(60))

    console.log('=' .repeat(60))

    const finalCounts = {
      products: await prisma.product.count(),
      categories: await prisma.productCategory.count(),
      paperStocks: await prisma.paperStock.count(),
      paperStockSets: await prisma.paperStockSet.count(),
      quantityGroups: await prisma.quantityGroup.count(),
      sizeGroups: await prisma.sizeGroup.count(),
      addOns: await prisma.addOn.count(),
      addOnSets: await prisma.addOnSet.count(),
      turnaroundTimes: await prisma.turnaroundTime.count(),
      turnaroundTimeSets: await prisma.turnaroundTimeSet.count(),
    }

    for (const [key, count] of Object.entries(finalCounts)) {

    }

    console.log('\n' + '=' .repeat(60))

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error during restoration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the restoration
restoreAllFoundationData()
  .then(() => {

    process.exit(0)
  })
  .catch((error) => {
    console.error('Restoration failed:', error)
    process.exit(1)
  })