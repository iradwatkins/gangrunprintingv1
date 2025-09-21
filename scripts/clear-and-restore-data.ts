import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

async function clearAndRestoreData() {

  try {
    // Phase 1: Clear existing data in correct order (respecting foreign key constraints)

    // Clear product-related associations first
    await prisma.productAddOnSet.deleteMany()

    await prisma.addOnSetItem.deleteMany()

    await prisma.addOnSet.deleteMany()

    await prisma.productAddOn.deleteMany()

    await prisma.addOn.deleteMany()

    await prisma.productTurnaroundTimeSet.deleteMany()

    await prisma.turnaroundTimeSetItem.deleteMany()

    await prisma.turnaroundTimeSet.deleteMany()

    await prisma.turnaroundTime.deleteMany()

    await prisma.productPaperStockSet.deleteMany()

    await prisma.paperStockSetItem.deleteMany()

    await prisma.paperStockSet.deleteMany()

    await prisma.paperStock.deleteMany()

    await prisma.productQuantityGroup.deleteMany()

    await prisma.standardQuantity.deleteMany()

    await prisma.quantityGroup.deleteMany()

    await prisma.productSizeGroup.deleteMany()

    await prisma.standardSize.deleteMany()

    await prisma.sizeGroup.deleteMany()

    // Clear product related tables before products
    await prisma.productImage.deleteMany()

    await prisma.productOption.deleteMany()

    await prisma.productPricingConfig.deleteMany()

    await prisma.productSize.deleteMany()

    await prisma.productQuantity.deleteMany()

    await prisma.productPaperStock.deleteMany()

    await prisma.product.deleteMany()

    await prisma.productCategory.deleteMany()

    // Phase 2: Create foundation data

    // Create Product Categories
    const now = new Date()
    const categories = await Promise.all([
      prisma.productCategory.create({
        data: {
          id: createId(),
          name: 'Business Cards',
          description: 'Professional business cards with multiple finish options',
          slug: 'business-cards',
          sortOrder: 1,
          isActive: true,
          updatedAt: now
        }
      }),
      prisma.productCategory.create({
        data: {
          id: createId(),
          name: 'Flyers',
          description: 'High-quality flyers for marketing and promotions',
          slug: 'flyers',
          sortOrder: 2,
          isActive: true,
          updatedAt: now
        }
      }),
      prisma.productCategory.create({
        data: {
          id: createId(),
          name: 'Posters',
          description: 'Large format posters for maximum impact',
          slug: 'posters',
          sortOrder: 3,
          isActive: true,
          updatedAt: now
        }
      }),
      prisma.productCategory.create({
        data: {
          id: createId(),
          name: 'Brochures',
          description: 'Professional brochures for business presentations',
          slug: 'brochures',
          sortOrder: 4,
          isActive: true,
          updatedAt: now
        }
      })
    ])

    // Create Paper Stocks
    const paperStocks = await Promise.all([
      prisma.paperStock.create({
        data: {
          name: '14pt Card Stock',
          weight: 0.0014,  // Weight in pounds per square inch
          pricePerSqInch: 0.001,
          tooltipText: 'Standard business card thickness',
          isActive: true
        }
      }),
      prisma.paperStock.create({
        data: {
          name: '16pt Card Stock',
          weight: 0.0016,
          pricePerSqInch: 0.0011,
          tooltipText: 'Premium thickness for business cards',
          isActive: true
        }
      }),
      prisma.paperStock.create({
        data: {
          name: '32pt UltraThick',
          weight: 0.0032,
          pricePerSqInch: 0.0015,
          tooltipText: 'Extra thick premium card stock',
          isActive: true
        }
      }),
      prisma.paperStock.create({
        data: {
          name: '100lb Gloss Text',
          weight: 0.001,
          pricePerSqInch: 0.0008,
          tooltipText: 'Standard flyer paper',
          isActive: true
        }
      })
    ])

    // Create Paper Stock Sets
    const paperStockSet = await prisma.paperStockSet.create({
      data: {
        name: 'Premium Card Stock Options',
        description: 'Premium paper options including UltraThick',
        sortOrder: 1,
        isActive: true,
        paperStockItems: {
          create: paperStocks.map((ps, index) => ({
            paperStockId: ps.id,
            isDefault: index === 0,
            sortOrder: index
          }))
        }
      }
    })

    // Create Standard Quantities first
    const quantities = await Promise.all([
      prisma.standardQuantity.create({
        data: {
          value: 100,
          displayValue: 100,
          displayName: '100',
          sortOrder: 1
        }
      }),
      prisma.standardQuantity.create({
        data: {
          value: 250,
          displayValue: 250,
          displayName: '250',
          sortOrder: 2
        }
      }),
      prisma.standardQuantity.create({
        data: {
          value: 500,
          displayValue: 500,
          displayName: '500',
          sortOrder: 3
        }
      }),
      prisma.standardQuantity.create({
        data: {
          value: 1000,
          displayValue: 1000,
          displayName: '1000',
          sortOrder: 4
        }
      }),
      prisma.standardQuantity.create({
        data: {
          value: 2500,
          displayValue: 2500,
          displayName: '2500',
          sortOrder: 5
        }
      })
    ])

    // Create Quantity Groups
    const quantityGroup = await prisma.quantityGroup.create({
      data: {
        name: 'Standard Print Quantities',
        description: 'Common print run quantities',
        values: '100,250,500,1000,2500',
        defaultValue: '500',
        sortOrder: 1,
        isActive: true
      }
    })

    // Create Standard Sizes first
    const sizes = await Promise.all([
      prisma.standardSize.create({
        data: {
          value: '3.5x2',
          displayName: '3.5" x 2" (Business Card)',
          widthInches: 3.5,
          heightInches: 2,
          sortOrder: 1
        }
      }),
      prisma.standardSize.create({
        data: {
          value: '8.5x11',
          displayName: '8.5" x 11" (Letter)',
          widthInches: 8.5,
          heightInches: 11,
          sortOrder: 2
        }
      }),
      prisma.standardSize.create({
        data: {
          value: '11x17',
          displayName: '11" x 17" (Tabloid)',
          widthInches: 11,
          heightInches: 17,
          sortOrder: 3
        }
      }),
      prisma.standardSize.create({
        data: {
          value: '18x24',
          displayName: '18" x 24" (Poster)',
          widthInches: 18,
          heightInches: 24,
          sortOrder: 4
        }
      })
    ])

    // Create Size Groups
    const sizeGroup = await prisma.sizeGroup.create({
      data: {
        name: 'Standard Print Sizes',
        description: 'Common print sizes',
        values: '3.5" x 2" (Business Card),8.5" x 11" (Letter),11" x 17" (Tabloid),18" x 24" (Poster)',
        defaultValue: '3.5" x 2" (Business Card)',
        sortOrder: 1,
        isActive: true
      }
    })

    // Create Turnaround Times
    const turnaroundTimeSet = await prisma.turnaroundTimeSet.create({
      data: {
        name: 'Standard Production Times',
        description: 'Available production turnaround times',
        sortOrder: 1,
        isActive: true,
        turnaroundTimes: {
          create: [
            {
              turnaroundTime: {
                create: {
                  name: 'Standard (5-7 days)',
                  businessDays: 7,
                  priceMultiplier: 1.0,
                  isDefault: true,
                  sortOrder: 1,
                  isActive: true
                }
              },
              isDefault: true,
              sortOrder: 1
            },
            {
              turnaroundTime: {
                create: {
                  name: 'Rush (3-4 days)',
                  businessDays: 4,
                  priceMultiplier: 1.25,
                  isDefault: false,
                  sortOrder: 2,
                  isActive: true
                }
              },
              isDefault: false,
              sortOrder: 2
            },
            {
              turnaroundTime: {
                create: {
                  name: 'Express (1-2 days)',
                  businessDays: 2,
                  priceMultiplier: 1.5,
                  isDefault: false,
                  sortOrder: 3,
                  isActive: true
                }
              },
              isDefault: false,
              sortOrder: 3
            }
          ]
        }
      }
    })

  } catch (error) {
    console.error('❌ Error during data restoration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearAndRestoreData()
  .then(() => {

    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })