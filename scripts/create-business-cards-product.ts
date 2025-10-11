/**
 * Create Business Cards Product
 * Priority: HIGHEST - Most ordered print product
 *
 * Standard Business Card: 3.5" x 2" (horizontal) or 2" x 3.5" (vertical)
 * Paper stocks: Multiple cardstock options
 * Quantities: 100, 250, 500, 1000, 2500, 5000
 * Turnarounds: Economy, Fast, Faster, Crazy Fast
 * Addons: All 18 addons available
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏗️  Creating Business Cards Product...\n')

  try {
    // 1. Get Business Card category
    const category = await prisma.productCategory.findFirst({
      where: { slug: 'business-card' },
    })

    if (!category) {
      throw new Error('Business Card category not found')
    }
    console.log('✅ Category found:', category.name)

    // 2. Create Size Group for Business Cards
    console.log('\n📏 Creating Business Cards Size Group...')

    const sizeGroup = await prisma.sizeGroup.upsert({
      where: { name: 'Business Cards - Standard' },
      update: {
        updatedAt: new Date(),
      },
      create: {
        id: 'sg_business_cards_standard',
        name: 'Business Cards - Standard',
        description: 'Standard business card sizes',
        values: '3.5x2,2x3.5', // Horizontal and vertical
        defaultValue: '3.5x2',
        sortOrder: 1,
        isActive: true,
        updatedAt: new Date(),
      },
    })
    console.log('✅ Size Group created:', sizeGroup.name)

    // 3. Get Quantity Group (standard print quantities)
    console.log('\n📊 Finding Quantity Group...')

    const quantityGroup = await prisma.quantityGroup.findFirst({
      where: {
        isActive: true,
        values: { contains: '100' }, // Find one with standard quantities
      },
    })

    if (!quantityGroup) {
      throw new Error('No suitable quantity group found')
    }
    console.log('✅ Quantity Group found:', quantityGroup.name)
    console.log('   Quantities:', quantityGroup.values)

    // 4. Get Paper Stock Set (cardstock options)
    console.log('\n📄 Finding Paper Stock Set...')

    let paperStockSet = await prisma.paperStockSet.findFirst({
      where: {
        name: { contains: 'Cardstock' },
        isActive: true,
      },
    })

    // If no cardstock set exists, create one
    if (!paperStockSet) {
      console.log('⚠️  No cardstock set found, creating one...')

      // Get cardstock paper stocks
      const cardstocks = await prisma.paperStock.findMany({
        where: {
          name: { contains: 'Cardstock' },
          isActive: true,
        },
        take: 5,
      })

      if (cardstocks.length === 0) {
        throw new Error('No cardstock paper stocks found in database')
      }

      paperStockSet = await prisma.paperStockSet.create({
        data: {
          id: 'pss_business_cards_cardstock',
          name: 'Business Cards - Cardstock Options',
          description: 'Premium cardstock options for business cards',
          isActive: true,
        },
      })

      // Link paper stocks to set
      for (let i = 0; i < cardstocks.length; i++) {
        await prisma.paperStockSetItem.create({
          data: {
            paperStockSetId: paperStockSet.id,
            paperStockId: cardstocks[i].id,
            isDefault: i === 0, // First one is default
            sortOrder: i + 1,
          },
        })
      }

      console.log(`✅ Created Paper Stock Set with ${cardstocks.length} options`)
    } else {
      console.log('✅ Paper Stock Set found:', paperStockSet.name)
    }

    // 5. Get Turnaround Time Set
    console.log('\n⏱️  Finding Turnaround Time Set...')

    let turnaroundSet = await prisma.turnaroundTimeSet.findFirst({
      where: { isActive: true },
    })

    if (!turnaroundSet) {
      console.log('⚠️  No turnaround set found, creating one...')

      const turnarounds = await prisma.turnaroundTime.findMany({
        where: { isActive: true },
        orderBy: { priceMultiplier: 'asc' },
      })

      if (turnarounds.length === 0) {
        throw new Error('No turnaround times found in database')
      }

      turnaroundSet = await prisma.turnaroundTimeSet.create({
        data: {
          id: 'tts_standard',
          name: 'Standard Turnaround Options',
          description: 'Economy, Fast, Faster, Crazy Fast',
          isActive: true,
        },
      })

      // Link turnarounds to set
      for (let i = 0; i < turnarounds.length; i++) {
        await prisma.turnaroundTimeSetItem.create({
          data: {
            turnaroundTimeSetId: turnaroundSet.id,
            turnaroundTimeId: turnarounds[i].id,
            isDefault: i === 0,
            sortOrder: i + 1,
          },
        })
      }

      console.log(`✅ Created Turnaround Set with ${turnarounds.length} options`)
    } else {
      console.log('✅ Turnaround Time Set found:', turnaroundSet.name)
    }

    // 6. Get AddOn Set (all 18 addons)
    console.log('\n🔧 Finding AddOn Set...')

    let addonSet = await prisma.addOnSet.findFirst({
      where: { isActive: true },
    })

    if (!addonSet) {
      console.log('⚠️  No addon set found, creating one...')

      const addons = await prisma.addOn.findMany({
        where: { isActive: true },
      })

      if (addons.length === 0) {
        throw new Error('No addons found in database')
      }

      addonSet = await prisma.addOnSet.create({
        data: {
          id: 'aos_all_addons',
          name: 'All Available AddOns',
          description: 'Complete set of 18 addons',
          isActive: true,
        },
      })

      // Link addons to set
      for (let i = 0; i < addons.length; i++) {
        await prisma.addOnSetItem.create({
          data: {
            addOnSetId: addonSet.id,
            addOnId: addons[i].id,
            isDefault: addons[i].isMandatory || false,
            sortOrder: i + 1,
          },
        })
      }

      console.log(`✅ Created AddOn Set with ${addons.length} addons`)
    } else {
      console.log('✅ AddOn Set found:', addonSet.name)
    }

    // 7. Get Coating and Sides Options
    console.log('\n🎨 Finding Coating and Sides Options...')

    const coatingOptions = await prisma.coatingOption.findMany()
    const sidesOptions = await prisma.sidesOption.findMany()

    console.log(`✅ Found ${coatingOptions.length} coating options`)
    console.log(`✅ Found ${sidesOptions.length} sides options`)

    // 8. Create the Business Cards Product
    console.log('\n🎯 Creating Business Cards Product...')

    const product = await prisma.product.create({
      data: {
        id: 'prod_business_cards_standard',
        name: 'Business Cards - Standard',
        slug: 'business-cards-standard',
        sku: 'BC-STANDARD-3.5X2',
        description: `Professional business cards printed on premium cardstock. Make a lasting first impression with high-quality business cards that showcase your brand. Perfect for networking events, trade shows, and everyday business interactions.

Features:
• Standard size: 3.5" x 2" (horizontal) or 2" x 3.5" (vertical)
• Multiple cardstock options from 10pt to 16pt
• Full-color printing (4/4 CMYK)
• Multiple turnaround times available
• Optional coatings: UV, Aqueous, Soft Touch
• Rounded corners available
• Quantities from 100 to 5,000+

Business cards are essential for any professional. Whether you're starting a new business or refreshing your brand, our high-quality business cards help you make the right impression.`,
        categoryId: category.id,
        basePrice: 19.99, // Starting price for 100 cards
        productionTime: 5, // Base production time in days (Economy)
        isActive: true,
        updatedAt: new Date(),
        metadata: {
          keywords: ['business cards', 'networking', 'professional', 'branding'],
          features: [
            'Premium cardstock options',
            'Full-color printing',
            'Multiple finishing options',
            'Fast turnaround times',
            'Professional quality',
          ],
          seoTitle: 'Business Cards - Professional Printing | GangRun Printing',
          seoDescription:
            'Order high-quality business cards online. Multiple cardstock options, fast turnaround times, and professional finishing. Starting at $19.99 for 100 cards.',
          seoFaqs: [
            {
              question: 'What is the standard business card size?',
              answer:
                'The standard business card size in the US is 3.5" x 2" (horizontal). We also offer 2" x 3.5" (vertical) orientation.',
            },
            {
              question: 'What paper stocks do you offer for business cards?',
              answer:
                'We offer multiple premium cardstock options ranging from 10pt to 16pt thickness, including glossy and matte finishes.',
            },
            {
              question: 'How long does it take to print business cards?',
              answer:
                'We offer multiple turnaround times: Economy (5-7 business days), Fast (3-4 business days), Faster (2-3 business days), and Crazy Fast (1-2 business days).',
            },
            {
              question: 'What is the minimum quantity for business cards?',
              answer:
                'Our minimum quantity for business cards is 100. We also offer 250, 500, 1000, 2500, and 5000 quantity options.',
            },
            {
              question: 'Can I add rounded corners to my business cards?',
              answer:
                'Yes! Rounded corners are available as an addon option during the order process. This gives your cards a modern, professional look.',
            },
          ],
        },
      },
    })

    console.log('✅ Product created:', product.name)
    console.log('   Slug:', product.slug)
    console.log('   ID:', product.id)

    // 9. Link Product to Configuration Sets
    console.log('\n🔗 Linking Product to Configuration Sets...')

    await prisma.productPaperStockSet.create({
      data: {
        productId: product.id,
        paperStockSetId: paperStockSet.id,
        isDefault: true,
      },
    })
    console.log('✅ Linked to Paper Stock Set')

    await prisma.productQuantityGroup.create({
      data: {
        productId: product.id,
        quantityGroupId: quantityGroup.id,
        isDefault: true,
      },
    })
    console.log('✅ Linked to Quantity Group')

    await prisma.productSizeGroup.create({
      data: {
        productId: product.id,
        sizeGroupId: sizeGroup.id,
        isDefault: true,
      },
    })
    console.log('✅ Linked to Size Group')

    await prisma.productTurnaroundTimeSet.create({
      data: {
        productId: product.id,
        turnaroundTimeSetId: turnaroundSet.id,
        isDefault: true,
      },
    })
    console.log('✅ Linked to Turnaround Time Set')

    await prisma.productAddOnSet.create({
      data: {
        productId: product.id,
        addOnSetId: addonSet.id,
      },
    })
    console.log('✅ Linked to AddOn Set')

    // Link coating options
    for (const coating of coatingOptions) {
      await prisma.productCoatingOption.create({
        data: {
          productId: product.id,
          coatingOptionId: coating.id,
        },
      })
    }
    console.log('✅ Linked Coating Options')

    // Link sides options
    for (const sides of sidesOptions) {
      await prisma.productSidesOption.create({
        data: {
          productId: product.id,
          sidesOptionId: sides.id,
        },
      })
    }
    console.log('✅ Linked Sides Options')

    console.log('\n' + '='.repeat(60))
    console.log('✅ SUCCESS! Business Cards Product Created')
    console.log('='.repeat(60))
    console.log('\n📋 Product Summary:')
    console.log(`   Name: ${product.name}`)
    console.log(`   URL: https://gangrunprinting.com/products/${product.slug}`)
    console.log(`   Category: ${category.name}`)
    console.log(`   Status: ${product.isActive ? 'Active' : 'Inactive'}`)
    console.log(`\n✅ Configuration Complete:`)
    console.log(`   ✓ Paper Stocks: ${paperStockSet.name}`)
    console.log(`   ✓ Quantities: ${quantityGroup.values}`)
    console.log(`   ✓ Sizes: ${sizeGroup.values}`)
    console.log(`   ✓ Turnarounds: ${turnaroundSet.name}`)
    console.log(`   ✓ Coatings: ${coatingOptions.length} options`)
    console.log(`   ✓ Sides: ${sidesOptions.length} options`)
    console.log(`   ✓ AddOns: ${addonSet.name}`)
    console.log('\n🎯 Next Steps:')
    console.log('   1. Upload product images via admin panel')
    console.log('   2. Test product configuration in browser')
    console.log('   3. Verify pricing calculation')
    console.log('   4. Test add to cart functionality')
    console.log('   5. Complete a test order')
    console.log('\n🌐 Admin URL: https://gangrunprinting.com/admin/products')
    console.log('🛒 Product URL: https://gangrunprinting.com/products/business-cards-standard')
  } catch (error) {
    console.error('\n❌ Error creating Business Cards product:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
