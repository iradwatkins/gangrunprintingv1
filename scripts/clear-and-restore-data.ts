import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const prisma = new PrismaClient()

async function clearAndRestoreData() {
  console.log('🗑️  Starting data cleanup and restoration process...')

  try {
    // Phase 1: Clear existing data in correct order (respecting foreign key constraints)
    console.log('\n📝 Phase 1: Clearing existing data...')

    // Clear product-related associations first
    await prisma.productAddOnSet.deleteMany()
    console.log('✅ Cleared ProductAddOnSet')

    await prisma.addOnSetItem.deleteMany()
    console.log('✅ Cleared AddOnSetItem')

    await prisma.addOnSet.deleteMany()
    console.log('✅ Cleared AddOnSet')

    await prisma.productAddOn.deleteMany()
    console.log('✅ Cleared ProductAddOn')

    await prisma.addOn.deleteMany()
    console.log('✅ Cleared AddOn')

    await prisma.productTurnaroundTimeSet.deleteMany()
    console.log('✅ Cleared ProductTurnaroundTimeSet')

    await prisma.turnaroundTimeSetItem.deleteMany()
    console.log('✅ Cleared TurnaroundTimeSetItem')

    await prisma.turnaroundTimeSet.deleteMany()
    console.log('✅ Cleared TurnaroundTimeSet')

    await prisma.turnaroundTime.deleteMany()
    console.log('✅ Cleared TurnaroundTime')

    await prisma.productPaperStockSet.deleteMany()
    console.log('✅ Cleared ProductPaperStockSet')

    await prisma.paperStockSetItem.deleteMany()
    console.log('✅ Cleared PaperStockSetItem')

    await prisma.paperStockSet.deleteMany()
    console.log('✅ Cleared PaperStockSet')

    await prisma.paperStock.deleteMany()
    console.log('✅ Cleared PaperStock')

    await prisma.productQuantityGroup.deleteMany()
    console.log('✅ Cleared ProductQuantityGroup')

    await prisma.standardQuantity.deleteMany()
    console.log('✅ Cleared StandardQuantity')

    await prisma.quantityGroup.deleteMany()
    console.log('✅ Cleared QuantityGroup')

    await prisma.productSizeGroup.deleteMany()
    console.log('✅ Cleared ProductSizeGroup')

    await prisma.standardSize.deleteMany()
    console.log('✅ Cleared StandardSize')

    await prisma.sizeGroup.deleteMany()
    console.log('✅ Cleared SizeGroup')

    // Clear product related tables before products
    await prisma.productImage.deleteMany()
    console.log('✅ Cleared ProductImage')

    await prisma.productOption.deleteMany()
    console.log('✅ Cleared ProductOption')

    await prisma.productPricingConfig.deleteMany()
    console.log('✅ Cleared ProductPricingConfig')

    await prisma.productSize.deleteMany()
    console.log('✅ Cleared ProductSize')

    await prisma.productQuantity.deleteMany()
    console.log('✅ Cleared ProductQuantity')

    await prisma.productPaperStock.deleteMany()
    console.log('✅ Cleared ProductPaperStock')

    await prisma.product.deleteMany()
    console.log('✅ Cleared Product')

    await prisma.productCategory.deleteMany()
    console.log('✅ Cleared ProductCategory')

    console.log('\n✅ All specified tables have been cleared!')

    // Phase 2: Create foundation data
    console.log('\n📝 Phase 2: Creating foundation data...')

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
    console.log(`✅ Created ${categories.length} product categories`)

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
    console.log(`✅ Created ${paperStocks.length} paper stocks (including UltraThick)`)

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
    console.log('✅ Created Paper Stock Set with UltraThick option')

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
    console.log('✅ Created Quantity Group with standard quantities')

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
    console.log('✅ Created Size Group with standard sizes')

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
    console.log('✅ Created Turnaround Time Set')

    console.log('\n✨ Data restoration complete!')
    console.log('📝 Next step: Running addon creation scripts...')

  } catch (error) {
    console.error('❌ Error during data restoration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearAndRestoreData()
  .then(() => {
    console.log('\n✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })