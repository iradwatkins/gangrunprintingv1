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

    // Create variant-specific content sections
    const defaultContent = getVariantSections(homepage.id, variant.type)

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

function getVariantSections(homepageVariantId: string, type: HomepageType) {
  const baseContent = [
    {
      homepageVariantId,
      sectionType: 'hero',
      content: {
        headline: getDefaultHeadline(type),
        subtext: getDefaultSubtext(type),
        badge: getDefaultBadge(type),
        ctaText: 'Start Your Order',
        ctaSecondaryText: 'Track Order',
      },
      position: 1,
      isVisible: true,
    },
  ]

  // Variant-specific content sections with different product arrangements
  switch (type) {
    case 'LIMITED_TIME_OFFER':
      return [
        {
          homepageVariantId,
          sectionType: 'urgency-banner',
          content: {
            message: '🔥 FLASH SALE: 30% OFF Everything! Ends in 24 hours!',
            backgroundColor: 'bg-red-600',
            textColor: 'text-white',
            animated: true,
          },
          position: 1,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'countdown-hero',
          content: {
            headline: 'Limited Time: 30% Off All Orders',
            subtext: 'Hurry! This exclusive offer ends soon. Get premium printing at unbeatable prices.',
            badge: '⚡ Limited Time Offer',
            ctaText: 'Shop Now - Save 30%',
            ctaSecondaryText: 'View All Deals',
            countdownTarget: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            urgencyMessage: 'Only 24 hours left!',
          },
          position: 2,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'flash-deals-grid',
          content: {
            title: '🔥 Flash Sale Products',
            subtitle: 'Massive savings - but only for today!',
            showOriginalPrices: true,
            highlightSavings: true,
            urgencyIndicators: true,
          },
          position: 3,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'urgency-stats',
          content: {
            title: 'Don\'t Wait - Others Are Buying!',
            stats: [
              { number: '847', label: 'Orders Today', animated: true, color: 'text-red-500' },
              { number: '23hrs', label: 'Sale Ends In', animated: true, color: 'text-red-500' },
              { number: '30%', label: 'Maximum Savings', animated: false, color: 'text-green-500' },
              { number: '2,341', label: 'Items Sold Today', animated: true, color: 'text-red-500' },
            ],
          },
          position: 4,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'urgency-cta',
          content: {
            title: '⏰ Last Chance - Sale Ends Tonight!',
            description: 'Don\'t miss out on these incredible savings. This 30% off sale is our biggest discount of the year and it ends at midnight tonight!',
            primaryButton: '🛒 Shop Now & Save 30%',
            secondaryButton: '⏱️ View Countdown',
            urgencyText: 'Sale ends in:',
            showCountdown: true,
          },
          position: 5,
          isVisible: true,
        },
      ]

    case 'FEATURED_PRODUCT':
      return [
        {
          homepageVariantId,
          sectionType: 'premium-hero',
          content: {
            headline: 'Premium Business Cards That Make an Impression',
            subtext: 'Discover our award-winning premium collection. Handcrafted quality meets cutting-edge design.',
            badge: '⭐ Premium Collection',
            ctaText: 'Explore Premium',
            ctaSecondaryText: 'View Gallery',
            backgroundColor: 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600',
            textColor: 'text-white',
            premium: true,
            overlay: true,
          },
          position: 1,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'product-spotlight-grid',
          content: {
            title: 'Featured Premium Products',
            subtitle: 'Our most popular luxury options, trusted by professionals worldwide',
            layout: 'premium-3-grid',
            products: [
              {
                name: 'Luxury Business Cards',
                price: '$79.99',
                originalPrice: '$99.99',
                image: '/placeholder-product-1.jpg',
                badge: 'Best Seller',
                features: ['32pt Thick Stock', 'Gold Foil', 'Spot UV Coating']
              },
              {
                name: 'Premium Marketing Flyers',
                price: '$149.99',
                originalPrice: '$179.99',
                image: '/placeholder-product-2.jpg',
                badge: 'Editor\'s Choice',
                features: ['Premium Paper', 'Full Color', 'Same Day']
              },
              {
                name: 'Executive Stationery',
                price: '$199.99',
                originalPrice: '$249.99',
                image: '/placeholder-product-3.jpg',
                badge: 'Luxury',
                features: ['Letterhead Set', 'Embossed Logo', 'Premium Finish']
              }
            ]
          },
          position: 2,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'premium-testimonials',
          content: {
            title: 'Trusted by Industry Leaders',
            testimonials: [
              {
                quote: 'The quality exceeded our expectations. These cards have become our signature.',
                author: 'Sarah Johnson',
                company: 'Fortune 500 Executive',
                rating: 5,
                avatar: '/placeholder-avatar-1.jpg'
              },
              {
                quote: 'Premium service, premium results. Worth every penny.',
                author: 'Michael Chen',
                company: 'Creative Director',
                rating: 5,
                avatar: '/placeholder-avatar-2.jpg'
              },
              {
                quote: 'The attention to detail is remarkable. Our clients are impressed.',
                author: 'Emily Rodriguez',
                company: 'Marketing Agency',
                rating: 5,
                avatar: '/placeholder-avatar-3.jpg'
              }
            ]
          },
          position: 3,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'quality-badges',
          content: {
            title: 'Premium Quality Guaranteed',
            badges: [
              { icon: '🏆', title: 'Award Winning', description: 'Industry recognized quality' },
              { icon: '♻️', title: 'Eco-Friendly', description: 'Sustainable materials' },
              { icon: '⚡', title: 'Fast Premium', description: '24-48hr turnaround' },
              { icon: '🎯', title: 'Precision Cut', description: 'Perfect finish every time' },
              { icon: '💎', title: 'Luxury Materials', description: 'Premium paper stocks' },
              { icon: '🔒', title: '100% Guarantee', description: 'Satisfaction guaranteed' }
            ]
          },
          position: 4,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'premium-cta',
          content: {
            title: 'Experience Luxury Printing',
            subtitle: 'Join thousands of professionals who trust us with their premium printing needs',
            description: 'Ready to elevate your brand? Our premium collection delivers unmatched quality and sophisticated design.',
            primaryButton: 'Shop Premium Collection',
            secondaryButton: 'Schedule Consultation',
            backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-600',
            textColor: 'text-white',
            features: [
              'Free premium design consultation',
              '100% quality guarantee',
              'Express premium delivery'
            ]
          },
          position: 5,
          isVisible: true,
        },
      ]

    case 'NEW_CUSTOMER_WELCOME':
      return [
        {
          homepageVariantId,
          sectionType: 'welcome-onboarding-hero',
          content: {
            headline: 'Welcome to Professional Printing!',
            subtext: 'New to printing? We\'ll guide you through every step. Get 25% off your first order and free design consultation.',
            badge: '🎉 New Customer Special',
            ctaText: 'Start Your First Order',
            ctaSecondaryText: 'Learn How It Works',
            backgroundColor: 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600',
            textColor: 'text-white',
            showOnboardingPreview: true,
            newCustomerOffer: '25% OFF + Free Design Help',
          },
          position: 1,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'getting-started-steps',
          content: {
            title: 'How It Works - Simple as 1, 2, 3',
            subtitle: 'We make professional printing easy for everyone',
            steps: [
              {
                number: '1',
                icon: '📋',
                title: 'Choose Your Product',
                description: 'Browse our starter-friendly options or tell us what you need',
                tip: 'Not sure? We\'ll help you choose!'
              },
              {
                number: '2',
                icon: '🎨',
                title: 'Upload or Design',
                description: 'Upload your design or work with our free design team',
                tip: 'Free design consultation included'
              },
              {
                number: '3',
                icon: '🚚',
                title: 'We Print & Deliver',
                description: 'We handle the printing and deliver to your door',
                tip: 'Track your order every step'
              }
            ]
          },
          position: 2,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'new-customer-products',
          content: {
            title: 'Perfect for First-Time Customers',
            subtitle: 'Start with these popular, beginner-friendly options',
            layout: 'beginner-2-grid',
            products: [
              {
                name: 'Starter Business Cards',
                price: '$18.74',
                originalPrice: '$24.99',
                discount: '25% OFF',
                image: '/placeholder-product-1.jpg',
                badge: 'Most Popular First Order',
                features: ['500 cards included', 'Free design review', 'Premium cardstock'],
                difficulty: 'Easy',
                timeToComplete: '2-3 business days'
              },
              {
                name: 'Basic Marketing Flyers',
                price: '$37.49',
                originalPrice: '$49.99',
                discount: '25% OFF',
                image: '/placeholder-product-2.jpg',
                badge: 'Great for Beginners',
                features: ['100 flyers included', 'Multiple sizes', 'Free design help'],
                difficulty: 'Easy',
                timeToComplete: '2-3 business days'
              }
            ]
          },
          position: 3,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'new-customer-incentives',
          content: {
            title: 'Special New Customer Benefits',
            incentives: [
              {
                icon: '💰',
                title: '25% Off First Order',
                description: 'Automatically applied at checkout for new customers',
                value: 'Up to $50 savings'
              },
              {
                icon: '🎨',
                title: 'Free Design Consultation',
                description: 'Our design team will review and optimize your files',
                value: '$75 value'
              },
              {
                icon: '📞',
                title: 'Dedicated Support',
                description: 'Personal onboarding specialist to guide you',
                value: 'Included'
              },
              {
                icon: '🔄',
                title: 'Satisfaction Guarantee',
                description: 'Not happy? We\'ll reprint or refund, no questions asked',
                value: '100% guarantee'
              }
            ]
          },
          position: 4,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'support-onboarding',
          content: {
            title: 'We\'re Here to Help You Succeed',
            subtitle: 'Questions? Our team is ready to guide you through your first order',
            supportOptions: [
              {
                method: 'Live Chat',
                availability: 'Mon-Fri 8AM-6PM',
                description: 'Instant help with design questions',
                icon: '💬'
              },
              {
                method: 'Phone Support',
                availability: '(555) 123-4567',
                description: 'Speak directly with a printing expert',
                icon: '📞'
              },
              {
                method: 'Email Help',
                availability: 'support@gangrunprinting.com',
                description: 'Send us your files for review',
                icon: '📧'
              }
            ],
            ctaText: 'Start Your First Order Now',
            ctaSecondaryText: 'Contact Support First',
            backgroundColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
            textColor: 'text-white'
          },
          position: 5,
          isVisible: true,
        },
      ]

    case 'SEASONAL_HOLIDAY':
      return [
        {
          homepageVariantId,
          sectionType: 'holiday-festive-hero',
          content: {
            headline: '🎄 Holiday Magic Starts Here! ❄️',
            subtext: 'Make this season unforgettable with custom holiday printing. From festive cards to holiday banners, we bring the magic to life.',
            badge: '🎄 Holiday Special',
            ctaText: 'Create Holiday Magic',
            ctaSecondaryText: 'Browse Holiday Designs',
            backgroundColor: 'bg-gradient-to-br from-red-600 via-green-600 to-red-700',
            textColor: 'text-white',
            festiveElements: true,
            seasonalOffer: 'Free Holiday Design Templates',
            holidayCountdown: new Date('2024-12-25').toISOString(), // Christmas
          },
          position: 1,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'seasonal-showcase',
          content: {
            title: '🎁 Festive Holiday Collection',
            subtitle: 'Everything you need to celebrate the season in style',
            layout: 'holiday-4-grid',
            products: [
              {
                name: 'Holiday Greeting Cards',
                price: '$39.99',
                originalPrice: '$49.99',
                discount: '20% OFF',
                image: '/placeholder-holiday-1.jpg',
                badge: 'Season\'s Favorite',
                features: ['Custom holiday designs', 'Premium cardstock', 'Fast holiday delivery'],
                seasonalTheme: 'Christmas',
                urgency: 'Order by Dec 15th for Christmas delivery'
              },
              {
                name: 'Festive Event Banners',
                price: '$89.99',
                originalPrice: '$109.99',
                discount: '18% OFF',
                image: '/placeholder-holiday-2.jpg',
                badge: 'Perfect for Parties',
                features: ['Weather resistant', 'Holiday themes', 'Multiple sizes'],
                seasonalTheme: 'Winter',
                urgency: 'Limited holiday inventory'
              },
              {
                name: 'New Year Invitations',
                price: '$29.99',
                originalPrice: '$39.99',
                discount: '25% OFF',
                image: '/placeholder-holiday-3.jpg',
                badge: 'Ring in 2025!',
                features: ['Elegant designs', 'RSVP options', 'Fast turnaround'],
                seasonalTheme: 'New Year',
                urgency: 'Perfect for New Year\'s events'
              },
              {
                name: 'Holiday Marketing Flyers',
                price: '$59.99',
                originalPrice: '$79.99',
                discount: '25% OFF',
                image: '/placeholder-holiday-4.jpg',
                badge: 'Business Special',
                features: ['Holiday templates', 'Bulk pricing', 'Professional quality'],
                seasonalTheme: 'Business',
                urgency: 'Boost holiday sales'
              }
            ]
          },
          position: 2,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'holiday-countdown',
          content: {
            title: '⏰ Holiday Deadlines Approaching!',
            subtitle: 'Don\'t miss out on holiday delivery - order before these dates',
            deadlines: [
              {
                holiday: 'Christmas Cards',
                deadline: 'December 15th',
                icon: '🎄',
                description: 'Last day for Christmas delivery',
                daysLeft: 25,
                urgencyLevel: 'high'
              },
              {
                holiday: 'New Year Materials',
                deadline: 'December 28th',
                icon: '🎉',
                description: 'Perfect for New Year events',
                daysLeft: 38,
                urgencyLevel: 'medium'
              },
              {
                holiday: 'Valentine\'s Day',
                deadline: 'February 10th',
                icon: '💝',
                description: 'Show love with custom designs',
                daysLeft: 82,
                urgencyLevel: 'low'
              }
            ],
            backgroundColor: 'bg-gradient-to-r from-red-500 via-green-500 to-red-600',
            textColor: 'text-white'
          },
          position: 3,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'festive-testimonials',
          content: {
            title: '🎄 Holiday Success Stories',
            subtitle: 'See how we made their holidays special',
            testimonials: [
              {
                quote: 'Our holiday cards were absolutely stunning! Everyone asked where we got them printed.',
                author: 'Jennifer Smith',
                company: 'Happy Family',
                rating: 5,
                avatar: '/placeholder-avatar-1.jpg',
                holidayType: 'Christmas Cards',
                seasonalNote: 'Ordered 200 cards, delivered perfectly on time'
              },
              {
                quote: 'The New Year banners made our corporate party unforgettable. Quality exceeded expectations!',
                author: 'Michael Rodriguez',
                company: 'Tech Innovations Inc.',
                rating: 5,
                avatar: '/placeholder-avatar-2.jpg',
                holidayType: 'Event Banners',
                seasonalNote: 'Last-minute order completed in 48 hours'
              },
              {
                quote: 'Perfect holiday marketing materials that boosted our seasonal sales by 40%!',
                author: 'Sarah Johnson',
                company: 'Local Retail Store',
                rating: 5,
                avatar: '/placeholder-avatar-3.jpg',
                holidayType: 'Marketing Materials',
                seasonalNote: 'Increased holiday foot traffic significantly'
              }
            ]
          },
          position: 4,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'seasonal-cta',
          content: {
            title: '🎁 Make This Holiday Season Magical',
            subtitle: 'Limited time holiday pricing - don\'t wait until it\'s too late!',
            description: 'Join thousands of customers who trust us with their holiday printing. Order now and make this season unforgettable.',
            primaryButton: '🎄 Start Holiday Order',
            secondaryButton: '📞 Rush Holiday Order',
            backgroundColor: 'bg-gradient-to-r from-green-600 via-red-600 to-green-700',
            textColor: 'text-white',
            holidayFeatures: [
              'Free holiday design consultation',
              'Guaranteed holiday delivery',
              'Special seasonal pricing'
            ],
            urgencyMessage: 'Holiday deadlines are approaching fast!',
            festiveDecorations: true
          },
          position: 5,
          isVisible: true,
        },
      ]

    case 'BULK_VOLUME_DISCOUNTS':
      return [
        {
          homepageVariantId,
          sectionType: 'business-volume-hero',
          content: {
            headline: '📦 Enterprise Printing Solutions',
            subtext: 'Scale your business with our volume pricing. The more you print, the more you save. Professional bulk printing for businesses that mean business.',
            badge: '📦 Volume Pricing',
            ctaText: 'Get Volume Quote',
            ctaSecondaryText: 'View Pricing Tiers',
            backgroundColor: 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900',
            textColor: 'text-white',
            businessFocus: true,
            volumeHighlight: 'Save up to 50% on bulk orders',
            minimumOrder: '500+ items',
          },
          position: 1,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'bulk-pricing-tiers',
          content: {
            title: '💼 Volume Pricing Tiers',
            subtitle: 'The more you order, the bigger your savings get',
            tiers: [
              {
                range: '500-999 items',
                discount: '15% OFF',
                badge: 'Starter',
                color: 'blue',
                features: ['Standard shipping', 'Basic support', 'Quality guarantee'],
                popularProducts: ['Business Cards', 'Flyers', 'Brochures']
              },
              {
                range: '1,000-4,999 items',
                discount: '25% OFF',
                badge: 'Business',
                color: 'green',
                features: ['Free shipping', 'Priority support', 'Free design review'],
                popularProducts: ['Marketing Materials', 'Branded Stationery', 'Event Materials'],
                popular: true
              },
              {
                range: '5,000-9,999 items',
                discount: '35% OFF',
                badge: 'Enterprise',
                color: 'purple',
                features: ['Express shipping', 'Dedicated rep', 'Custom solutions'],
                popularProducts: ['Corporate Packages', 'Large Events', 'Multi-location']
              },
              {
                range: '10,000+ items',
                discount: '50% OFF',
                badge: 'Corporate',
                color: 'gold',
                features: ['White-glove service', 'Account manager', 'Custom pricing'],
                popularProducts: ['National Campaigns', 'Franchise Systems', 'Trade Shows']
              }
            ]
          },
          position: 2,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'business-case-studies',
          content: {
            title: '🏢 Success Stories from Our Business Clients',
            subtitle: 'See how companies like yours are saving with bulk printing',
            caseStudies: [
              {
                company: 'TechStart Solutions',
                industry: 'Technology',
                orderSize: '2,500 business cards',
                savings: '$1,250 saved',
                challenge: 'Needed professional cards for 50 employees across 3 locations',
                solution: 'Bulk order with consistent branding and centralized delivery',
                result: '25% cost savings vs individual orders',
                testimonial: 'The bulk pricing made it affordable to get premium cards for our entire team.',
                logo: '/placeholder-logo-1.png'
              },
              {
                company: 'EventMax Productions',
                industry: 'Events & Marketing',
                orderSize: '10,000 marketing flyers',
                savings: '$3,500 saved',
                challenge: 'Large music festival needed promotional materials quickly',
                solution: 'Express bulk production with rush delivery',
                result: '35% savings with guaranteed festival delivery',
                testimonial: 'They handled our massive order perfectly and saved us thousands.',
                logo: '/placeholder-logo-2.png'
              },
              {
                company: 'Regional Restaurant Chain',
                industry: 'Food & Beverage',
                orderSize: '15,000 menu inserts',
                savings: '$6,000 saved',
                challenge: '12 locations needed seasonal menu updates simultaneously',
                solution: 'Coordinated bulk order with location-specific delivery',
                result: '40% cost reduction vs per-location ordering',
                testimonial: 'Streamlined our menu updates across all locations while cutting costs.',
                logo: '/placeholder-logo-3.png'
              }
            ]
          },
          position: 3,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'volume-calculator',
          content: {
            title: '🧮 Bulk Savings Calculator',
            subtitle: 'See your potential savings with volume pricing',
            calculatorConfig: {
              products: [
                { name: 'Business Cards', basePrice: 49.99, unit: '500 cards' },
                { name: 'Marketing Flyers', basePrice: 89.99, unit: '250 flyers' },
                { name: 'Brochures', basePrice: 129.99, unit: '100 brochures' },
                { name: 'Posters', basePrice: 159.99, unit: '50 posters' }
              ],
              discountTiers: [
                { min: 1, max: 499, discount: 0 },
                { min: 500, max: 999, discount: 15 },
                { min: 1000, max: 4999, discount: 25 },
                { min: 5000, max: 9999, discount: 35 },
                { min: 10000, max: 999999, discount: 50 }
              ]
            },
            features: [
              'Real-time pricing calculation',
              'Compare savings across quantities',
              'Instant quote generation',
              'No hidden fees or charges'
            ]
          },
          position: 4,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'business-cta',
          content: {
            title: '🤝 Ready to Scale Your Printing?',
            subtitle: 'Join thousands of businesses saving with our volume pricing',
            description: 'Get a custom quote for your bulk printing needs. Our enterprise team will work with you to find the perfect solution for your business.',
            primaryButton: '📊 Get Custom Quote',
            secondaryButton: '📞 Speak to Bulk Specialist',
            backgroundColor: 'bg-gradient-to-r from-slate-700 to-blue-800',
            textColor: 'text-white',
            businessFeatures: [
              'Dedicated account management',
              'Custom volume pricing',
              'Enterprise-grade support',
              'Flexible payment terms'
            ],
            urgencyMessage: 'Volume discounts start at just 500 items',
            professionalFocus: true
          },
          position: 5,
          isVisible: true,
        },
      ]

    case 'FAST_TURNAROUND':
      return [
        {
          homepageVariantId,
          sectionType: 'speed-rush-hero',
          content: {
            headline: '⚡ Lightning-Fast Printing - Same Day Available!',
            subtext: 'Need it yesterday? We understand urgent deadlines. From rush business cards to emergency banners, we deliver quality at lightning speed.',
            badge: '🚀 Rush Orders',
            ctaText: 'Order Rush Delivery',
            ctaSecondaryText: 'Check Rush Pricing',
            backgroundColor: 'bg-gradient-to-br from-orange-600 via-yellow-500 to-orange-700',
            textColor: 'text-white',
            speedAnimations: true,
            rushHighlight: 'Same-day pickup available',
            speedStats: {
              fastest: '2 hours',
              sameDay: '6 AM - 6 PM',
              nextDay: 'Guaranteed'
            },
          },
          position: 1,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'turnaround-timeline',
          content: {
            title: '⏱️ Our Speed Timeline',
            subtitle: 'Choose the turnaround time that fits your deadline',
            timeline: [
              {
                time: '2 Hours',
                label: 'Express Rush',
                description: 'Simple cards & flyers only',
                price: '+150%',
                availability: 'Mon-Fri 8AM-4PM',
                icon: '⚡',
                color: 'red',
                popular: false
              },
              {
                time: '4 Hours',
                label: 'Super Rush',
                description: 'Most products available',
                price: '+100%',
                availability: 'Mon-Fri 8AM-6PM',
                icon: '🔥',
                color: 'orange',
                popular: false
              },
              {
                time: 'Same Day',
                label: 'Rush Service',
                description: 'All products, premium quality',
                price: '+50%',
                availability: 'Order by 2PM',
                icon: '🚀',
                color: 'yellow',
                popular: true
              },
              {
                time: 'Next Day',
                label: 'Fast Track',
                description: 'Standard rush pricing',
                price: '+25%',
                availability: 'Order by 6PM',
                icon: '📦',
                color: 'green',
                popular: false
              }
            ]
          },
          position: 2,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'speed-products',
          content: {
            title: '🏃‍♂️ Rush-Ready Products',
            subtitle: 'Products available for same-day and next-day delivery',
            layout: 'speed-3-grid',
            products: [
              {
                name: 'Rush Business Cards',
                time: '2-4 hours',
                price: '$89.99',
                originalPrice: '$59.99',
                rushFee: '+$30',
                image: '/placeholder-rush-1.jpg',
                badge: 'Fastest Option',
                features: ['Premium cardstock', 'Standard designs', 'Same-day pickup'],
                speedLevel: 'express',
                availability: 'Order by 2PM'
              },
              {
                name: 'Emergency Flyers',
                time: 'Same day',
                price: '$149.99',
                originalPrice: '$99.99',
                rushFee: '+$50',
                image: '/placeholder-rush-2.jpg',
                badge: 'Most Popular',
                features: ['Full color printing', 'Rush processing', 'Evening pickup'],
                speedLevel: 'fast',
                availability: 'Order by 4PM'
              },
              {
                name: 'Express Banners',
                time: 'Next day',
                price: '$199.99',
                originalPrice: '$159.99',
                rushFee: '+$40',
                image: '/placeholder-rush-3.jpg',
                badge: 'Large Format',
                features: ['Weather resistant', 'Custom sizes', 'Fast production'],
                speedLevel: 'standard',
                availability: 'Order by 6PM'
              }
            ]
          },
          position: 3,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'fast-testimonials',
          content: {
            title: '⏰ Deadline Heroes',
            subtitle: 'Real customers who needed it fast - and got it faster',
            testimonials: [
              {
                quote: 'Needed 500 business cards for a trade show starting the next morning. They delivered them at 7 AM sharp!',
                author: 'David Kim',
                company: 'Sales Director',
                rating: 5,
                avatar: '/placeholder-avatar-1.jpg',
                rushType: 'Overnight Rush',
                deadline: 'Trade show emergency',
                timeframe: '12 hours'
              },
              {
                quote: 'My presentation banner was printed and ready in 3 hours. Saved my entire conference presentation!',
                author: 'Lisa Chen',
                company: 'Marketing Manager',
                rating: 5,
                avatar: '/placeholder-avatar-2.jpg',
                rushType: 'Same-day Express',
                deadline: 'Conference presentation',
                timeframe: '3 hours'
              },
              {
                quote: 'Last-minute event flyers needed for tonight\'s fundraiser. They made the impossible happen!',
                author: 'Michael Torres',
                company: 'Event Coordinator',
                rating: 5,
                avatar: '/placeholder-avatar-3.jpg',
                rushType: 'Emergency Service',
                deadline: 'Same-day event',
                timeframe: '5 hours'
              }
            ]
          },
          position: 4,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'rush-cta',
          content: {
            title: '🔥 Got a Deadline? We\'ve Got You Covered!',
            subtitle: 'Rush orders processed immediately - no waiting, no delays',
            description: 'Upload your files now and we\'ll start production within minutes. Same-day pickup available, or we\'ll deliver it to you.',
            primaryButton: '⚡ Start Rush Order',
            secondaryButton: '📞 Call Rush Hotline',
            backgroundColor: 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-600',
            textColor: 'text-white',
            rushFeatures: [
              'Instant file review & approval',
              'Rush production guarantee',
              'Real-time order tracking',
              'Evening & weekend pickup'
            ],
            urgencyMessage: 'Time is ticking - every minute counts!',
            speedAnimations: true,
            rushHotline: '(555) RUSH-NOW'
          },
          position: 5,
          isVisible: true,
        },
      ]

    case 'LOCAL_COMMUNITY':
      return [
        {
          homepageVariantId,
          sectionType: 'community-hero',
          content: {
            headline: '🏘️ Your Neighborhood Printing Partner',
            subtext: 'Supporting local businesses and community events since 2010. When you succeed, our community thrives together.',
            badge: '🤝 Locally Owned',
            ctaText: 'Support Local Business',
            ctaSecondaryText: 'Get Community Pricing',
            backgroundColor: 'bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-600',
            textColor: 'text-white',
            communityFocus: true,
            localBadges: [
              'Family Owned & Operated',
              'Supporting Local Since 2010',
              'Community Event Partner'
            ],
            neighborhoodStats: {
              businessesServed: '500+ Local Businesses',
              eventsSupported: '200+ Community Events',
              yearsLocal: '13+ Years in Neighborhood'
            },
          },
          position: 1,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'local-business-showcase',
          content: {
            title: '🏪 Essential Tools for Local Business Success',
            subtitle: 'Everything your neighborhood business needs to stand out and connect with customers',
            layout: 'community-4-grid',
            products: [
              {
                name: 'Local Business Cards',
                price: '$39.99',
                originalPrice: '$49.99',
                communityDiscount: '20% Local Discount',
                image: '/placeholder-local-1.jpg',
                badge: 'Community Choice',
                features: ['Premium quality', 'Local delivery', 'Same-day available'],
                businessType: 'Essential',
                localSupport: 'Free design consultation'
              },
              {
                name: 'Event Flyers',
                price: '$89.99',
                originalPrice: '$109.99',
                communityDiscount: '18% Event Discount',
                image: '/placeholder-local-2.jpg',
                badge: 'Event Ready',
                features: ['Weather resistant', 'Bulk pricing', 'Fast turnaround'],
                businessType: 'Marketing',
                localSupport: 'Event planning support'
              },
              {
                name: 'Storefront Signs',
                price: '$149.99',
                originalPrice: '$189.99',
                communityDiscount: '21% Business Discount',
                image: '/placeholder-local-3.jpg',
                badge: 'Professional',
                features: ['Custom sizing', 'Durable materials', 'Installation help'],
                businessType: 'Branding',
                localSupport: 'Site visit included'
              },
              {
                name: 'Community Banners',
                price: '$199.99',
                originalPrice: '$249.99',
                communityDiscount: '20% Nonprofit Rate',
                image: '/placeholder-local-4.jpg',
                badge: 'Community Special',
                features: ['Large format', 'Event ready', 'Multiple sizes'],
                businessType: 'Events',
                localSupport: 'Nonprofit pricing'
              }
            ]
          },
          position: 2,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'community-events',
          content: {
            title: '🎪 Proud Community Event Partner',
            subtitle: 'We don\'t just print for events - we\'re part of making them happen',
            eventGallery: [
              {
                event: 'Annual Fall Festival',
                year: '2024',
                description: 'Provided banners, programs, and vendor signs for 500+ attendees',
                image: '/placeholder-event-1.jpg',
                impact: 'Raised $15K for local schools',
                materials: ['Event banners', 'Vendor signs', 'Programs', 'Tickets']
              },
              {
                event: 'Local Business Expo',
                year: '2024',
                description: 'Designed and printed marketing materials for 50+ local vendors',
                image: '/placeholder-event-2.jpg',
                impact: '40+ new business connections made',
                materials: ['Business cards', 'Brochures', 'Table tents', 'Name badges']
              },
              {
                event: 'Charity 5K Run',
                year: '2024',
                description: 'Sponsored race materials and provided same-day rush printing',
                image: '/placeholder-event-3.jpg',
                impact: '$25K raised for local charities',
                materials: ['Race bibs', 'Finish banners', 'Sponsor signs', 'T-shirts']
              }
            ],
            communityImpact: {
              eventsPerYear: '50+',
              charitiesSupported: '12',
              localJobsCreated: '8',
              communityFunding: '$100K+ donated'
            }
          },
          position: 3,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'neighborhood-testimonials',
          content: {
            title: '💬 Voices from Our Neighborhood',
            subtitle: 'Real local business owners sharing their experiences',
            testimonials: [
              {
                quote: 'As a small cafe owner, having a local printing partner who understands our community has been invaluable. They\'ve helped us with everything from menus to event signage.',
                author: 'Maria Santos',
                company: 'Corner Café & Bakery',
                businessType: 'Restaurant',
                yearsCustomer: '5 years',
                avatar: '/placeholder-avatar-1.jpg',
                rating: 5,
                location: '3 blocks away',
                favoriteService: 'Menu printing & daily specials'
              },
              {
                quote: 'When our nonprofit needed materials for a last-minute fundraiser, they stayed late to help us meet our deadline. That\'s the kind of community support you can\'t find anywhere else.',
                author: 'Robert Chen',
                company: 'Neighborhood Watch Group',
                businessType: 'Community Organization',
                yearsCustomer: '7 years',
                avatar: '/placeholder-avatar-2.jpg',
                rating: 5,
                location: 'Local resident',
                favoriteService: 'Event banners & flyers'
              },
              {
                quote: 'They don\'t just print our real estate materials - they know our neighborhood and help us create marketing that really connects with local families.',
                author: 'Jennifer Kim',
                company: 'Hometown Realty',
                businessType: 'Real Estate',
                yearsCustomer: '4 years',
                avatar: '/placeholder-avatar-3.jpg',
                rating: 5,
                location: 'Downtown office',
                favoriteService: 'Property flyers & yard signs'
              }
            ]
          },
          position: 4,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'community-cta',
          content: {
            title: '🤝 Join Our Community of Successful Local Businesses',
            subtitle: 'Get the personal service and community support your business deserves',
            description: 'Experience the difference of working with a local printing partner who cares about your success and our community\'s growth.',
            primaryButton: '🏪 Get Community Pricing',
            secondaryButton: '☕ Schedule Coffee & Consultation',
            backgroundColor: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600',
            textColor: 'text-white',
            communityPerks: [
              '🎯 Free local business consultation',
              '🚚 Free delivery within 5 miles',
              '📅 Flexible payment terms for regulars',
              '🎪 Priority rush service for events',
              '💰 Community discount programs',
              '🤝 Nonprofit & charity special rates'
            ],
            localPromise: 'When you choose us, you\'re not just getting printing - you\'re supporting local jobs, community events, and neighborhood growth.',
            contactInfo: {
              address: '123 Main Street, Your Neighborhood',
              phone: '(555) LOCAL-PRINT',
              email: 'hello@yourneighborhood.com',
              hours: 'Mon-Fri 8AM-6PM, Sat 9AM-2PM'
            }
          },
          position: 5,
          isVisible: true,
        },
      ]

    default:
      return [
        ...baseContent,
        {
          homepageVariantId,
          sectionType: 'featured-products-3',
          content: {
            title: 'Popular Products',
            subtitle: 'Our customers\' top choices',
          },
          position: 2,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'features',
          content: {
            title: 'Why Choose Us?',
            features: getDefaultFeatures(type),
          },
          position: 3,
          isVisible: true,
        },
        {
          homepageVariantId,
          sectionType: 'cta',
          content: {
            title: 'Ready to Start Your Project?',
            description: getDefaultCTADescription(type),
            primaryButton: 'Browse Products',
            secondaryButton: 'Track Your Order',
          },
          position: 4,
          isVisible: true,
        },
      ]
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