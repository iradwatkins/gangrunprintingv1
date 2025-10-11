import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Complete the New York product with ALL SEO/LLM optimization elements
 * This will be the master template for all 200 city products
 */

async function main() {
  console.log('🎯 Completing New York product with full SEO/LLM optimization...\n')

  const nyProduct = await prisma.product.findUnique({
    where: { slug: 'postcards-4x6-new-york-ny' },
    include: { City: true },
  })

  if (!nyProduct) {
    console.error('❌ New York product not found!')
    process.exit(1)
  }

  // Step 1: Add comprehensive city-specific description
  const description = `Professional 4x6 postcards designed for businesses and individuals in New York, NY. Our premium cardstock postcards are perfect for direct mail marketing campaigns, event announcements, real estate promotions, and personal greetings throughout the New York metropolitan area.

We understand the competitive New York market and deliver high-quality, eye-catching postcards that help your message stand out. Whether you're reaching customers in Manhattan, Brooklyn, Queens, the Bronx, or Staten Island, our 4x6 postcards are sized perfectly for USPS mail automation and deliver maximum impact.

Available in 14pt and 16pt premium C2S cardstock with multiple coating options. Fast turnaround times and competitive pricing for New York businesses. Orders ship directly to your New York location with tracking included.`

  const shortDescription = `High-quality 4x6 postcards for New York, NY. Premium cardstock, fast turnaround, perfect for direct mail marketing and business promotion in the NYC area.`

  // Step 2: Create comprehensive FAQ for LLM/SEO optimization
  const seoFaqs = [
    {
      question: 'What paper stocks are available for 4x6 postcards in New York?',
      answer:
        'We offer two premium cardstock options for New York customers: 14pt C2S (Coated Two Sides) Cardstock and 16pt C2S Cardstock. Both provide excellent durability and print quality for direct mail campaigns. The 16pt option is thicker and more premium, ideal for high-end marketing materials.',
    },
    {
      question: 'How long does it take to print and ship postcards to New York, NY?',
      answer:
        'We offer four turnaround options: Economy (10% markup, 7-10 business days), Fast (30% markup, 5-7 business days), Faster (50% markup, 3-5 business days), and Crazy Fast (100% markup, 1-2 business days). All orders ship with tracking to your New York address.',
    },
    {
      question: 'What quantities can I order for New York postcard mailings?',
      answer:
        "We offer flexible quantities perfect for any New York business: 100, 250, 500, 1,000, 2,500, 5,000, and 10,000 postcards. Whether you're a small business in Brooklyn or a large corporation in Manhattan, we have the right quantity for your needs.",
    },
    {
      question: 'Can I add corner rounding or other finishing options?',
      answer:
        'Yes! We offer several professional finishing options including corner rounding for a premium look, UV coating for extra protection, aqueous coating for a professional finish, and design services if you need help creating your artwork. These options help your New York postcards stand out in the mailbox.',
    },
    {
      question: 'Are these postcards USPS compliant for mailing in New York?',
      answer:
        'Absolutely! Our 4x6 postcards meet all USPS size requirements for postcards and qualify for standard postcard mailing rates. This makes them cost-effective for direct mail campaigns throughout New York City and surrounding areas.',
    },
    {
      question: 'What file format should I use for my postcard design?',
      answer:
        'We accept high-resolution PDF files with embedded fonts and images. Your design should be 4.25" x 6.25" (including 0.125" bleed on all sides) at 300 DPI minimum. We also offer design services if you need professional help creating your New York postcard campaign.',
    },
    {
      question: 'Do you ship to all five boroughs of New York City?',
      answer:
        'Yes! We ship to Manhattan, Brooklyn, Queens, the Bronx, Staten Island, and all surrounding New York areas. All orders include tracking and are shipped via reliable carriers to ensure safe delivery to your New York location.',
    },
    {
      question: 'Can I get a proof before printing my New York postcard order?',
      answer:
        'Yes, we offer a digital proof add-on service. This allows you to review your postcard design before we go to press, ensuring everything looks perfect for your New York marketing campaign. The proof turnaround is typically 24-48 hours.',
    },
    {
      question: "What's the price difference between 14pt and 16pt cardstock?",
      answer:
        'The 16pt cardstock is slightly more expensive due to its premium thickness and quality. Both options provide excellent print quality, but 16pt feels more substantial and premium in hand - perfect for high-end New York businesses wanting to make a strong impression.',
    },
    {
      question: 'Can I reorder the same postcards for future New York mailings?',
      answer:
        'Yes! We keep your design files on record, making reordering quick and easy. Simply contact us with your previous order number, and we can rush your repeat order for your next New York marketing campaign.',
    },
  ]

  // Step 3: Update the product with all SEO elements
  await prisma.product.update({
    where: { id: nyProduct.id },
    data: {
      description,
      shortDescription,
      seoFaqs,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Added comprehensive description')
  console.log('✅ Added short description for meta tags')
  console.log(`✅ Added ${seoFaqs.length} SEO-optimized FAQs\n`)

  // Step 4: Verify the complete product
  const completeProduct = await prisma.product.findUnique({
    where: { id: nyProduct.id },
    include: {
      ProductCategory: true,
      City: true,
      ProductPaperStockSet: {
        include: {
          PaperStockSet: {
            include: {
              PaperStockSetItem: {
                include: { PaperStock: true },
              },
            },
          },
        },
      },
      ProductSizeGroup: {
        include: { SizeGroup: true },
      },
      ProductQuantityGroup: {
        include: { QuantityGroup: true },
      },
      ProductTurnaroundTimeSet: {
        include: {
          TurnaroundTimeSet: {
            include: {
              TurnaroundTimeSetItem: {
                include: { TurnaroundTime: true },
              },
            },
          },
        },
      },
      ProductAddOnSet: {
        include: {
          AddOnSet: {
            include: {
              AddOnSetItem: {
                include: { AddOn: true },
              },
            },
          },
        },
      },
    },
  })

  console.log('📊 COMPLETE PRODUCT AUDIT:\n')
  console.log('🎯 Product Information:')
  console.log(`   Name: ${completeProduct?.name}`)
  console.log(`   Slug: ${completeProduct?.slug}`)
  console.log(`   City: ${completeProduct?.City?.name}, ${completeProduct?.City?.stateCode}`)
  console.log(
    `   Category: ${completeProduct?.ProductCategory?.name} (Hidden: ${completeProduct?.ProductCategory?.isHidden})`
  )
  console.log(`   Base Price: $${completeProduct?.basePrice}`)
  console.log(`   Description: ${description.substring(0, 100)}...`)
  console.log(`   Short Desc: ${shortDescription.substring(0, 80)}...`)

  console.log('\n📦 Product Configuration:')
  console.log(
    `   Paper Stocks: ${completeProduct?.ProductPaperStockSet[0]?.PaperStockSet?.PaperStockSetItem.length || 0} options`
  )
  console.log(`   Sizes: ${completeProduct?.ProductSizeGroup[0]?.SizeGroup?.values}`)
  console.log(`   Quantities: ${completeProduct?.ProductQuantityGroup[0]?.QuantityGroup?.values}`)
  console.log(
    `   Turnaround Times: ${completeProduct?.ProductTurnaroundTimeSet[0]?.TurnaroundTimeSet?.TurnaroundTimeSetItem.length || 0} options`
  )
  console.log(
    `   Add-Ons: ${completeProduct?.ProductAddOnSet[0]?.AddOnSet?.AddOnSetItem.length || 0} options`
  )

  console.log('\n🔍 SEO/LLM Elements:')
  console.log(`   FAQs: ${seoFaqs.length} questions`)
  console.log(`   Description Length: ${description.length} characters`)
  console.log(`   Keywords: postcards, New York, NY, direct mail, marketing, cardstock`)

  console.log('\n📋 FAQ Preview:')
  seoFaqs.slice(0, 3).forEach((faq, i) => {
    console.log(`\n   ${i + 1}. ${faq.question}`)
    console.log(`      ${faq.answer.substring(0, 100)}...`)
  })

  console.log('\n\n✨ NEW YORK PRODUCT IS NOW COMPLETE!\n')
  console.log('✅ Product URL: https://gangrunprinting.com/products/postcards-4x6-new-york-ny')
  console.log('✅ Ready for SEO/LLM optimization')
  console.log('✅ Ready to clone to remaining 199 cities\n')

  console.log('📝 Next Steps:')
  console.log('   1. View the product on the website')
  console.log('   2. Verify all elements display correctly')
  console.log('   3. Check FAQs render with schema markup')
  console.log('   4. Clone configuration to remaining cities\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
