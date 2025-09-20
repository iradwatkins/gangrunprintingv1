import { PrismaClient, HomepageType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding homepage variants...')

  const homepageVariants = [
    {
      name: 'Limited Time Offer',
      type: 'LIMITED_TIME_OFFER' as HomepageType,
      description: 'Promote time-sensitive deals and urgent offers',
      sortOrder: 1,
      isActive: true, // Set the first one as active by default
    },
    {
      name: 'Featured Product Spotlight',
      type: 'FEATURED_PRODUCT' as HomepageType,
      description: 'Highlight specific products and special pricing',
      sortOrder: 2,
    },
    {
      name: 'New Customer Welcome',
      type: 'NEW_CUSTOMER_WELCOME' as HomepageType,
      description: 'Welcome new customers with discounts and onboarding',
      sortOrder: 3,
    },
    {
      name: 'Seasonal/Holiday Campaign',
      type: 'SEASONAL_HOLIDAY' as HomepageType,
      description: 'Themed content for holidays and seasonal events',
      sortOrder: 4,
    },
    {
      name: 'Bulk/Volume Discounts',
      type: 'BULK_VOLUME_DISCOUNTS' as HomepageType,
      description: 'Emphasize volume pricing and bulk order benefits',
      sortOrder: 5,
    },
    {
      name: 'Fast Turnaround Emphasis',
      type: 'FAST_TURNAROUND' as HomepageType,
      description: 'Highlight speed and rush order capabilities',
      sortOrder: 6,
    },
    {
      name: 'Local Community Special',
      type: 'LOCAL_COMMUNITY' as HomepageType,
      description: 'Focus on local community and regional services',
      sortOrder: 7,
    },
  ]

  for (const variant of homepageVariants) {
    const homepage = await prisma.homepageVariant.upsert({
      where: { name: variant.name },
      update: variant,
      create: variant,
    })

    // Create default content sections for each homepage variant
    const defaultContent = [
      {
        homepageVariantId: homepage.id,
        sectionType: 'hero',
        position: 1,
        content: {
          headline: getDefaultHeadline(variant.type),
          subtext: getDefaultSubtext(variant.type),
          ctaText: 'Start Your Order',
          ctaSecondaryText: 'Track Order',
          badge: getDefaultBadge(variant.type),
        },
      },
      {
        homepageVariantId: homepage.id,
        sectionType: 'features',
        position: 2,
        content: {
          title: 'Why Choose GangRun Printing?',
          features: getDefaultFeatures(variant.type),
        },
      },
      {
        homepageVariantId: homepage.id,
        sectionType: 'cta',
        position: 3,
        content: {
          title: 'Ready to Start Your Project?',
          description: getDefaultCTADescription(variant.type),
          primaryButton: 'Browse Products',
          secondaryButton: 'Track Your Order',
        },
      },
    ]

    for (const content of defaultContent) {
      await prisma.homepageContent.upsert({
        where: {
          homepageVariantId_sectionType: {
            homepageVariantId: content.homepageVariantId,
            sectionType: content.sectionType,
          },
        },
        update: content,
        create: content,
      })
    }

    console.log(`Created homepage variant: ${variant.name}`)
  }

  console.log('Homepage variants seeding completed!')
}

function getDefaultHeadline(type: HomepageType): string {
  switch (type) {
    case 'LIMITED_TIME_OFFER':
      return 'Limited Time: 30% Off All Orders'
    case 'FEATURED_PRODUCT':
      return 'Premium Business Cards Starting at $19.99'
    case 'NEW_CUSTOMER_WELCOME':
      return 'Welcome! Get 25% Off Your First Order'
    case 'SEASONAL_HOLIDAY':
      return 'Holiday Special: Festive Printing Solutions'
    case 'BULK_VOLUME_DISCOUNTS':
      return 'Bulk Orders, Big Savings - Up to 50% Off'
    case 'FAST_TURNAROUND':
      return 'Same-Day Printing Available'
    case 'LOCAL_COMMUNITY':
      return 'Your Local Printing Partner'
    default:
      return 'Professional Printing Made Simple'
  }
}

function getDefaultSubtext(type: HomepageType): string {
  switch (type) {
    case 'LIMITED_TIME_OFFER':
      return 'Hurry! This exclusive offer ends soon. Get premium printing at unbeatable prices.'
    case 'FEATURED_PRODUCT':
      return 'Discover our most popular product with premium quality and fast turnaround times.'
    case 'NEW_CUSTOMER_WELCOME':
      return 'Start your printing journey with us and enjoy special new customer pricing.'
    case 'SEASONAL_HOLIDAY':
      return 'Celebrate the season with custom holiday printing that captures the festive spirit.'
    case 'BULK_VOLUME_DISCOUNTS':
      return 'The more you order, the more you save. Perfect for businesses and large events.'
    case 'FAST_TURNAROUND':
      return 'Need it fast? We deliver quality printing in record time without compromising quality.'
    case 'LOCAL_COMMUNITY':
      return 'Supporting local businesses and community events with reliable printing services.'
    default:
      return 'High-quality printing services with fast turnaround times. From business cards to banners, we bring your ideas to life.'
  }
}

function getDefaultBadge(type: HomepageType): string {
  switch (type) {
    case 'LIMITED_TIME_OFFER':
      return '⚡ Limited Time Offer'
    case 'FEATURED_PRODUCT':
      return '⭐ Most Popular'
    case 'NEW_CUSTOMER_WELCOME':
      return '🎉 New Customer Special'
    case 'SEASONAL_HOLIDAY':
      return '🎄 Holiday Special'
    case 'BULK_VOLUME_DISCOUNTS':
      return '📦 Bulk Savings'
    case 'FAST_TURNAROUND':
      return '🚀 Same Day Available'
    case 'LOCAL_COMMUNITY':
      return '🏘️ Local Community'
    default:
      return '⚡ Same Day Printing Available'
  }
}

function getDefaultFeatures(type: HomepageType): Array<{title: string, description: string}> {
  const baseFeatures = [
    { title: 'Quality Guarantee', description: '100% satisfaction or we\'ll reprint for free' },
    { title: 'Expert Support', description: 'Free design consultation and file review' },
  ]

  const typeSpecificFeatures = {
    'LIMITED_TIME_OFFER': [
      { title: 'Limited Time Pricing', description: 'Exclusive discounts for a short time only' },
      { title: 'All Products Included', description: 'Savings apply to our entire product range' },
    ],
    'FEATURED_PRODUCT': [
      { title: 'Premium Quality', description: 'Our highest quality materials and finishes' },
      { title: 'Fast Production', description: 'Quick turnaround for featured items' },
    ],
    'NEW_CUSTOMER_WELCOME': [
      { title: 'New Customer Discount', description: 'Special pricing for first-time customers' },
      { title: 'Design Assistance', description: 'Free design help to get you started' },
    ],
    'SEASONAL_HOLIDAY': [
      { title: 'Holiday Themes', description: 'Seasonal templates and design options' },
      { title: 'Gift Options', description: 'Perfect for holiday promotions and gifts' },
    ],
    'BULK_VOLUME_DISCOUNTS': [
      { title: 'Volume Pricing', description: 'Bigger orders mean bigger savings' },
      { title: 'Business Solutions', description: 'Perfect for corporate and event needs' },
    ],
    'FAST_TURNAROUND': [
      { title: 'Rush Options', description: 'Same-day and next-day printing available' },
      { title: 'Priority Production', description: 'Your order gets fast-track processing' },
    ],
    'LOCAL_COMMUNITY': [
      { title: 'Local Delivery', description: 'Free delivery within our service area' },
      { title: 'Community Support', description: 'Supporting local businesses and events' },
    ],
  }

  return [...baseFeatures, ...(typeSpecificFeatures[type] || typeSpecificFeatures['LIMITED_TIME_OFFER'])]
}

function getDefaultCTADescription(type: HomepageType): string {
  switch (type) {
    case 'LIMITED_TIME_OFFER':
      return 'Don\'t miss out on these limited-time savings. Start your order today!'
    case 'FEATURED_PRODUCT':
      return 'Experience our premium quality and fast service. Order your featured products now!'
    case 'NEW_CUSTOMER_WELCOME':
      return 'Join thousands of satisfied customers. Start with our new customer discount!'
    case 'SEASONAL_HOLIDAY':
      return 'Make this season special with custom printing that celebrates the moment.'
    case 'BULK_VOLUME_DISCOUNTS':
      return 'Ready for your bulk order? Get a quote and discover your savings potential.'
    case 'FAST_TURNAROUND':
      return 'Need it fast? Upload your files and we\'ll get your order in production immediately.'
    case 'LOCAL_COMMUNITY':
      return 'Support local and get exceptional service. Contact us for community pricing.'
    default:
      return 'Choose from our wide selection of products and upload your design. Our team is ready to bring your vision to life.'
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })