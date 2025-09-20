'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Package,
  Clock,
  Shield,
  Star,
  CheckCircle,
  Zap,
  Users,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ContentSection {
  id: string
  sectionType: string
  content: any
  position: number
  isVisible: boolean
}

interface HomepageVariant {
  id: string
  name: string
  type: string
  description: string | null
  isActive: boolean
  isEnabled: boolean
  content: ContentSection[]
}

const productCategories = [
  {
    title: 'Business Cards',
    description: 'Premium quality cards that make lasting impressions',
    image: '/images/products/business-cards.jpg',
    href: '/products?category=business-cards',
    popular: true,
  },
  {
    title: 'Flyers & Brochures',
    description: 'Eye-catching marketing materials for your campaigns',
    image: '/images/products/flyers.jpg',
    href: '/products?category=flyers',
    popular: false,
  },
  {
    title: 'Banners & Signs',
    description: 'Large format printing for maximum visibility',
    image: '/images/products/banners.jpg',
    href: '/products?category=banners',
    popular: false,
  },
  {
    title: 'Stickers & Labels',
    description: 'Custom die-cut stickers for any purpose',
    image: '/images/products/stickers.jpg',
    href: '/products?category=stickers',
    popular: true,
  },
  {
    title: 'Apparel',
    description: 'Custom printed t-shirts and merchandise',
    image: '/images/products/apparel.jpg',
    href: '/products?category=apparel',
    popular: false,
  },
  {
    title: 'Postcards',
    description: 'Direct mail and promotional postcards',
    image: '/images/products/postcards.jpg',
    href: '/products?category=postcards',
    popular: false,
  },
]

// Variant-specific product data
const variantProducts = {
  LIMITED_TIME_OFFER: [
    {
      name: 'Premium Business Cards',
      price: 'Starting at $19.99',
      originalPrice: '$29.99',
      image: '/images/business-cards.jpg',
      badge: 'SAVE $10',
      urgent: true,
    },
    {
      name: 'Custom Flyers',
      price: 'Starting at $34.99',
      originalPrice: '$49.99',
      image: '/images/flyers.jpg',
      badge: 'SAVE $15',
      urgent: true,
    },
  ],
  FEATURED_PRODUCT: [
    {
      name: 'Premium Business Cards',
      price: 'Starting at $29.99',
      image: '/images/business-cards.jpg',
      badge: 'Most Popular',
      featured: true,
    },
    {
      name: 'Custom Flyers',
      price: 'Starting at $49.99',
      image: '/images/flyers.jpg',
      badge: 'Best Quality',
    },
    {
      name: 'Vinyl Banners',
      price: 'Starting at $89.99',
      image: '/images/banners.jpg',
      badge: 'Durable',
    },
    {
      name: 'Die-Cut Stickers',
      price: 'Starting at $24.99',
      image: '/images/stickers.jpg',
      badge: 'Waterproof',
    },
  ],
  NEW_CUSTOMER_WELCOME: [
    {
      name: 'Starter Business Cards',
      price: 'Starting at $22.49',
      originalPrice: '$29.99',
      image: '/images/business-cards.jpg',
      badge: 'Perfect for Starters',
      newCustomer: true,
    },
    {
      name: 'Simple Flyers',
      price: 'Starting at $37.49',
      originalPrice: '$49.99',
      image: '/images/flyers.jpg',
      badge: 'Easy to Design',
      newCustomer: true,
    },
    {
      name: 'Basic Postcards',
      price: 'Starting at $18.74',
      originalPrice: '$24.99',
      image: '/images/postcards.jpg',
      badge: 'Great First Project',
      newCustomer: true,
    },
  ],
  SEASONAL_HOLIDAY: [
    {
      name: 'Holiday Cards',
      price: 'Starting at $34.99',
      image: '/images/business-cards.jpg',
      badge: '🎄 Holiday Special',
      seasonal: true,
    },
    {
      name: 'Event Invitations',
      price: 'Starting at $44.99',
      image: '/images/flyers.jpg',
      badge: '🎉 Party Ready',
      seasonal: true,
    },
    {
      name: 'Gift Tags & Labels',
      price: 'Starting at $19.99',
      image: '/images/stickers.jpg',
      badge: '🎁 Festive',
      seasonal: true,
    },
  ],
  BULK_VOLUME_DISCOUNTS: [
    {
      name: 'Bulk Business Cards',
      price: 'Starting at $19.99',
      bulkPrice: '1000+ qty',
      image: '/images/business-cards.jpg',
      badge: 'Volume Discount',
      bulk: true,
    },
    {
      name: 'Corporate Flyers',
      price: 'Starting at $39.99',
      bulkPrice: '500+ qty',
      image: '/images/flyers.jpg',
      badge: 'Bulk Savings',
      bulk: true,
    },
    {
      name: 'Marketing Materials',
      price: 'Starting at $69.99',
      bulkPrice: '250+ qty',
      image: '/images/banners.jpg',
      badge: 'Business Package',
      bulk: true,
    },
    {
      name: 'Branded Stickers',
      price: 'Starting at $14.99',
      bulkPrice: '1000+ qty',
      image: '/images/stickers.jpg',
      badge: 'Volume Pricing',
      bulk: true,
    },
  ],
  FAST_TURNAROUND: [
    {
      name: 'Rush Business Cards',
      price: 'Starting at $39.99',
      image: '/images/business-cards.jpg',
      badge: '24hr Delivery',
      rush: true,
    },
    {
      name: 'Express Flyers',
      price: 'Starting at $59.99',
      image: '/images/flyers.jpg',
      badge: 'Same Day',
      rush: true,
    },
  ],
  LOCAL_COMMUNITY: [
    {
      name: 'Community Event Cards',
      price: 'Starting at $24.99',
      image: '/images/business-cards.jpg',
      badge: 'Local Favorite',
      community: true,
    },
    {
      name: 'Neighborhood Flyers',
      price: 'Starting at $44.99',
      image: '/images/flyers.jpg',
      badge: 'Community Special',
      community: true,
    },
    {
      name: 'Local Business Signs',
      price: 'Starting at $79.99',
      image: '/images/banners.jpg',
      badge: 'Support Local',
      community: true,
    },
  ],
}

// Variant-specific categories
const variantCategories = {
  LIMITED_TIME_OFFER: [
    { ...productCategories[0], badge: '30% OFF', urgent: true },
    { ...productCategories[1], badge: '25% OFF', urgent: true },
    { ...productCategories[3], badge: '35% OFF', urgent: true },
  ],
  FEATURED_PRODUCT: [
    { ...productCategories[0], badge: 'Featured' },
    { ...productCategories[1], badge: 'Popular' },
    { ...productCategories[2], badge: 'Trending' },
    { ...productCategories[3], badge: 'Best Seller' },
  ],
  NEW_CUSTOMER_WELCOME: [
    { ...productCategories[0], badge: 'Great Start' },
    { ...productCategories[1], badge: 'Easy to Use' },
    { ...productCategories[5], badge: 'Beginner Friendly' },
  ],
  SEASONAL_HOLIDAY: [
    { ...productCategories[0], badge: '🎄 Holiday' },
    { ...productCategories[1], badge: '🎉 Festive' },
    { ...productCategories[5], badge: '🎁 Seasonal' },
  ],
  BULK_VOLUME_DISCOUNTS: [
    { ...productCategories[0], badge: 'Bulk Discount' },
    { ...productCategories[1], badge: 'Volume Pricing' },
    { ...productCategories[2], badge: 'Business Solutions' },
    { ...productCategories[4], badge: 'Corporate Orders' },
  ],
  FAST_TURNAROUND: [
    { ...productCategories[0], badge: 'Same Day' },
    { ...productCategories[1], badge: 'Rush Available' },
    { ...productCategories[3], badge: '24hr Service' },
  ],
  LOCAL_COMMUNITY: [
    { ...productCategories[0], badge: 'Local Business' },
    { ...productCategories[1], badge: 'Community Events' },
    { ...productCategories[2], badge: 'Neighborhood' },
  ],
}

const featuredProducts = [
  {
    name: 'Premium Business Cards',
    price: 'Starting at $29.99',
    image: '/images/business-cards.jpg',
    badge: 'Most Popular',
  },
  {
    name: 'Custom Flyers',
    price: 'Starting at $49.99',
    image: '/images/flyers.jpg',
    badge: 'Fast Turnaround',
  },
  {
    name: 'Vinyl Banners',
    price: 'Starting at $89.99',
    image: '/images/banners.jpg',
    badge: 'Durable',
  },
  {
    name: 'Die-Cut Stickers',
    price: 'Starting at $24.99',
    image: '/images/stickers.jpg',
    badge: 'Waterproof',
  },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'Tech Solutions Inc.',
    content:
      'GangRun Printing exceeded our expectations! The quality is outstanding and delivery was faster than promised.',
    rating: 5,
    avatar: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Small Business Owner',
    company: "Chen's Restaurant",
    content:
      "Best printing service I've used. The colors are vibrant and the customer service is exceptional.",
    rating: 5,
    avatar: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Event Coordinator',
    company: 'Elite Events',
    content: 'Our event materials looked absolutely professional. Will definitely order again!',
    rating: 5,
    avatar: 'ER',
  },
]

// Variant-specific theme configurations
const variantThemes = {
  LIMITED_TIME_OFFER: {
    primaryColor: 'from-red-500/20 to-orange-500/20',
    accentColor: 'border-red-500/20 bg-red-50 text-red-700',
    urgencyClass: 'animate-pulse',
    badgeClass: 'bg-red-500 text-white',
    gradientClass: 'from-red-500/10 via-orange-500/5 to-background',
    heroGradient: 'from-red-500/15 via-orange-500/10 to-background',
  },
  FEATURED_PRODUCT: {
    primaryColor: 'from-blue-500/20 to-indigo-500/20',
    accentColor: 'border-blue-500/20 bg-blue-50 text-blue-700',
    urgencyClass: '',
    badgeClass: 'bg-blue-500 text-white',
    gradientClass: 'from-blue-500/10 via-indigo-500/5 to-background',
    heroGradient: 'from-blue-500/15 via-indigo-500/10 to-background',
  },
  NEW_CUSTOMER_WELCOME: {
    primaryColor: 'from-green-500/20 to-emerald-500/20',
    accentColor: 'border-green-500/20 bg-green-50 text-green-700',
    urgencyClass: '',
    badgeClass: 'bg-green-500 text-white',
    gradientClass: 'from-green-500/10 via-emerald-500/5 to-background',
    heroGradient: 'from-green-500/15 via-emerald-500/10 to-background',
  },
  SEASONAL_HOLIDAY: {
    primaryColor: 'from-purple-500/20 to-pink-500/20',
    accentColor: 'border-purple-500/20 bg-purple-50 text-purple-700',
    urgencyClass: '',
    badgeClass: 'bg-purple-500 text-white',
    gradientClass: 'from-purple-500/10 via-pink-500/5 to-background',
    heroGradient: 'from-purple-500/15 via-pink-500/10 to-background',
  },
  BULK_VOLUME_DISCOUNTS: {
    primaryColor: 'from-yellow-500/20 to-amber-500/20',
    accentColor: 'border-yellow-500/20 bg-yellow-50 text-yellow-700',
    urgencyClass: '',
    badgeClass: 'bg-yellow-500 text-white',
    gradientClass: 'from-yellow-500/10 via-amber-500/5 to-background',
    heroGradient: 'from-yellow-500/15 via-amber-500/10 to-background',
  },
  FAST_TURNAROUND: {
    primaryColor: 'from-cyan-500/20 to-teal-500/20',
    accentColor: 'border-cyan-500/20 bg-cyan-50 text-cyan-700',
    urgencyClass: 'animate-bounce',
    badgeClass: 'bg-cyan-500 text-white',
    gradientClass: 'from-cyan-500/10 via-teal-500/5 to-background',
    heroGradient: 'from-cyan-500/15 via-teal-500/10 to-background',
  },
  LOCAL_COMMUNITY: {
    primaryColor: 'from-slate-500/20 to-gray-500/20',
    accentColor: 'border-slate-500/20 bg-slate-50 text-slate-700',
    urgencyClass: '',
    badgeClass: 'bg-slate-500 text-white',
    gradientClass: 'from-slate-500/10 via-gray-500/5 to-background',
    heroGradient: 'from-slate-500/15 via-gray-500/10 to-background',
  },
}

const getVariantTheme = (variantType: string) => {
  return variantThemes[variantType as keyof typeof variantThemes] || variantThemes.LIMITED_TIME_OFFER
}

export default function Home() {
  const [homepage, setHomepage] = useState<HomepageVariant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveHomepage()
  }, [])

  const fetchActiveHomepage = async () => {
    try {
      const response = await fetch('/api/home-pages/active')
      if (response.ok) {
        const data = await response.json()
        setHomepage(data)
      } else {
        console.warn('No active homepage found, using fallback content')
      }
    } catch (error) {
      console.error('Error fetching active homepage:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderDynamicSection = (section: ContentSection) => {
    if (!section.isVisible) return null

    const { content } = section
    const theme = getVariantTheme(homepage?.type || '')

    switch (section.sectionType) {
      case 'hero':
        return (
          <section key={section.id} className={`relative overflow-hidden bg-gradient-to-br ${theme.heroGradient}`}>
            <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
            <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 xl:py-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-8 animate-slide-up">
                  {content.badge && (
                    <Badge className={`inline-flex items-center gap-1 px-3 py-1 ${theme.badgeClass} ${theme.urgencyClass}`}>
                      <Zap className="w-3 h-3" />
                      {content.badge}
                    </Badge>
                  )}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
                    {content.headline || 'Professional Printing'}
                    <span className="text-primary"> Made Simple</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground">
                    {content.subtext || 'High-quality printing services with fast turnaround times. From business cards to banners, we bring your ideas to life.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild className="group" size="lg">
                      <Link href="/products">
                        <Package className="mr-2 h-5 w-5" />
                        {content.ctaText || 'Start Your Order'}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/track">{content.ctaSecondaryText || 'Track Order'}</Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="text-xs sm:text-sm">Free Design Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <span className="text-xs sm:text-sm">100% Satisfaction</span>
                    </div>
                  </div>
                </div>
                <div className="relative order-first lg:order-last">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 p-4 sm:p-6 md:p-8">
                      {['Business Cards', 'Flyers', 'Banners', 'Stickers'].map((item, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-4 transform hover:scale-105 transition-transform"
                        >
                          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded mb-1 sm:mb-2" />
                          <p className="text-xs sm:text-sm font-medium text-center">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )

      case 'features':
        return (
          <section key={section.id} className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  {content.title || 'Why Choose GangRun Printing?'}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  We combine quality, speed, and service to deliver exceptional printing solutions
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {content.features?.map((feature: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${theme.primaryColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {getFeatureIcon(index)}
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'cta':
        return (
          <section key={section.id} className={`py-12 sm:py-16 lg:py-20 bg-gradient-to-r ${theme.gradientClass}`}>
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">
                {content.title || 'Ready to Start Your Project?'}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                {content.description || 'Choose from our wide selection of products and upload your design. Our team is ready to bring your vision to life.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="group" size="lg">
                  <Link href="/products">
                    <Package className="mr-2 h-5 w-5" />
                    {content.primaryButton || 'Browse Products'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/track">{content.secondaryButton || 'Track Your Order'}</Link>
                </Button>
              </div>
            </div>
          </section>
        )

      case 'featured-products-2':
      case 'featured-products-3':
      case 'featured-products-4':
        return renderFeaturedProducts(section, content)

      case 'product-categories':
        return renderProductCategories(section, content)

      case 'testimonials':
        return renderTestimonials(section, content)

      case 'quick-stats':
        return renderQuickStats(section, content)

      // LIMITED_TIME_OFFER specific sections
      case 'urgency-banner':
        return renderUrgencyBanner(section, content)

      case 'countdown-hero':
        return renderCountdownHero(section, content)

      case 'flash-deals-grid':
        return renderFlashDealsGrid(section, content)

      case 'urgency-stats':
        return renderUrgencyStats(section, content)

      case 'urgency-cta':
        return renderUrgencyCTA(section, content)

      case 'premium-hero':
        return renderPremiumHero(section, content)
      case 'product-spotlight-grid':
        return renderProductSpotlightGrid(section, content)
      case 'premium-testimonials':
        return renderPremiumTestimonials(section, content)
      case 'quality-badges':
        return renderQualityBadges(section, content)
      case 'premium-cta':
        return renderPremiumCTA(section, content)

      case 'welcome-onboarding-hero':
        return renderWelcomeOnboardingHero(section, content)
      case 'getting-started-steps':
        return renderGettingStartedSteps(section, content)
      case 'new-customer-products':
        return renderNewCustomerProducts(section, content)
      case 'new-customer-incentives':
        return renderNewCustomerIncentives(section, content)
      case 'support-onboarding':
        return renderSupportOnboarding(section, content)

      case 'holiday-festive-hero':
        return renderHolidayFestiveHero(section, content)
      case 'seasonal-showcase':
        return renderSeasonalShowcase(section, content)
      case 'holiday-countdown':
        return renderHolidayCountdown(section, content)
      case 'festive-testimonials':
        return renderFestiveTestimonials(section, content)
      case 'seasonal-cta':
        return renderSeasonalCTA(section, content)

      case 'business-volume-hero':
        return renderBusinessVolumeHero(section, content)
      case 'bulk-pricing-tiers':
        return renderBulkPricingTiers(section, content)
      case 'business-case-studies':
        return renderBusinessCaseStudies(section, content)
      case 'volume-calculator':
        return renderVolumeCalculator(section, content)
      case 'business-cta':
        return renderBusinessCTA(section, content)

      case 'speed-rush-hero':
        return renderSpeedRushHero(section, content)
      case 'turnaround-timeline':
        return renderTurnaroundTimeline(section, content)
      case 'speed-products':
        return renderSpeedProducts(section, content)
      case 'fast-testimonials':
        return renderFastTestimonials(section, content)
      case 'rush-cta':
        return renderRushCTA(section, content)

      // LOCAL_COMMUNITY specific sections
      case 'community-hero':
        return renderCommunityHero(section, content)
      case 'local-business-showcase':
        return renderLocalBusinessShowcase(section, content)
      case 'community-events':
        return renderCommunityEvents(section, content)
      case 'neighborhood-testimonials':
        return renderNeighborhoodTestimonials(section, content)
      case 'community-cta':
        return renderCommunityCTA(section, content)

      default:
        return null
    }
  }

  // LIMITED_TIME_OFFER specific rendering functions
  const renderUrgencyBanner = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`${content.backgroundColor || 'bg-red-600'} ${content.textColor || 'text-white'} py-3 text-center relative overflow-hidden`}>
        <div className={`absolute inset-0 ${content.animated ? 'animate-pulse' : ''}`}></div>
        <div className="container mx-auto px-4 relative z-10">
          <p className="font-bold text-lg animate-bounce">
            {content.message || '🔥 FLASH SALE: Limited Time Only!'}
          </p>
        </div>
      </section>
    )
  }

  const renderCountdownHero = (section: ContentSection, content: any) => {
    const theme = getVariantTheme(homepage?.type || '')
    return (
      <section key={section.id} className={`relative overflow-hidden bg-gradient-to-br ${theme.heroGradient} py-16 lg:py-24`}>
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {content.badge && (
              <Badge className={`inline-flex items-center gap-1 px-4 py-2 text-lg ${theme.badgeClass} ${theme.urgencyClass}`}>
                <Zap className="w-4 h-4" />
                {content.badge}
              </Badge>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              {content.headline || 'Limited Time Offer'}
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              {content.subtext || 'Don\'t miss out on this incredible deal!'}
            </p>

            {/* Countdown Timer */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto">
              <p className="text-2xl font-bold mb-4 text-red-600">
                {content.urgencyMessage || 'Sale Ends In:'}
              </p>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="text-2xl font-bold text-red-600" id="countdown-days">00</div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="text-2xl font-bold text-red-600" id="countdown-hours">23</div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="text-2xl font-bold text-red-600" id="countdown-minutes">59</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="text-2xl font-bold text-red-600" id="countdown-seconds">59</div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="group bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4" size="lg">
                <Package className="mr-2 h-5 w-5" />
                {content.ctaText || 'Shop Now'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                {content.ctaSecondaryText || 'View All Deals'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderFlashDealsGrid = (section: ContentSection, content: any) => {
    const variantType = homepage?.type
    const products = variantProducts[variantType as keyof typeof variantProducts] || []
    const theme = getVariantTheme(variantType || '')

    return (
      <section key={section.id} className="py-16 bg-gradient-to-b from-red-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-red-600">
              {content.title || '🔥 Flash Sale Products'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.subtitle || 'Massive savings - but only for today!'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product: any, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-red-200 hover:border-red-400 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-sm font-bold animate-pulse">
                  {product.badge}
                </div>

                <div className={`aspect-square bg-gradient-to-br ${theme.primaryColor} rounded-t-lg flex items-center justify-center relative`}>
                  <Package className="h-16 w-16 text-primary/40" />
                  {content.urgencyIndicators && (
                    <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                      🔥 HOT DEAL
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-red-600">{product.price}</span>
                      {product.originalPrice && content.showOriginalPrices && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                    {content.highlightSavings && product.originalPrice && (
                      <div className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded font-medium">
                        💰 Save $10
                      </div>
                    )}
                  </div>
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                    🛒 Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderUrgencyStats = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className="py-12 bg-red-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {content.title || 'Don\'t Wait - Act Now!'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.stats?.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold ${stat.color || 'text-white'} ${stat.animated ? 'animate-pulse' : ''}`}>
                  {stat.number}
                </div>
                <div className="text-sm text-red-100 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderUrgencyCTA = (section: ContentSection, content: any) => {
    const theme = getVariantTheme(homepage?.type || '')
    return (
      <section key={section.id} className="py-16 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {content.title || '⏰ Last Chance!'}
          </h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto opacity-90">
            {content.description || 'Don\'t miss out on this incredible offer!'}
          </p>

          {content.showCountdown && (
            <div className="mb-8">
              <p className="text-xl font-semibold mb-4">{content.urgencyText || 'Sale ends in:'}</p>
              <div className="inline-flex gap-4 bg-white/20 backdrop-blur rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">23</div>
                  <div className="text-sm">HRS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">59</div>
                  <div className="text-sm">MIN</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">59</div>
                  <div className="text-sm">SEC</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="group bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4 font-bold" size="lg">
              {content.primaryButton || '🛒 Shop Now & Save'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              {content.secondaryButton || '⏱️ View Countdown'}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // FEATURED_PRODUCT specific rendering functions
  const renderPremiumHero = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`relative overflow-hidden ${content.backgroundColor || 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600'} ${content.textColor || 'text-white'} min-h-[600px] flex items-center`}>
        {content.overlay && (
          <div className="absolute inset-0 bg-black/20 z-10" />
        )}
        <div className="absolute inset-0 bg-grid-white/[0.05] -z-0" />
        <div className="container mx-auto px-4 py-16 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {content.badge && (
                <Badge className="inline-flex items-center gap-1 px-4 py-2 bg-white/20 text-white border-white/30">
                  <Star className="w-4 h-4" />
                  {content.badge}
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {content.headline || 'Premium Collection'}
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                {content.subtext || 'Experience luxury printing with our premium collection'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="group bg-white text-blue-900 hover:bg-blue-50 text-lg px-8 py-4 font-semibold" size="lg">
                  {content.ctaText || 'Explore Premium'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                  {content.ctaSecondaryText || 'View Gallery'}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl transform rotate-6 opacity-20"></div>
              <div className="relative bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">99%</div>
                    <div className="text-sm opacity-90">Client Satisfaction</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">24hr</div>
                    <div className="text-sm opacity-90">Premium Delivery</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">10k+</div>
                    <div className="text-sm opacity-90">Premium Orders</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">5★</div>
                    <div className="text-sm opacity-90">Quality Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderProductSpotlightGrid = (section: ContentSection, content: any) => {
    const products = content.products || []
    return (
      <section key={section.id} className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || 'Featured Premium Products'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'Discover our premium collection'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product: any, index: number) => (
              <div key={index} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200">
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-blue-600 text-white font-semibold px-3 py-1">
                    {product.badge || 'Premium'}
                  </Badge>
                </div>
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 p-8 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Product Image</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-slate-400 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  <div className="space-y-2 mb-6">
                    {product.features?.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold group">
                    Order Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderPremiumTestimonials = (section: ContentSection, content: any) => {
    const testimonials = content.testimonials || []
    return (
      <section key={section.id} className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {content.title || 'Trusted by Industry Leaders'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-lg text-slate-200 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-slate-200 font-semibold">
                      {testimonial.author?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-400">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderQualityBadges = (section: ContentSection, content: any) => {
    const badges = content.badges || []
    return (
      <section key={section.id} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || 'Premium Quality Guaranteed'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {badges.map((badge: any, index: number) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <span className="text-2xl">{badge.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderPremiumCTA = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`py-20 ${content.backgroundColor || 'bg-gradient-to-r from-blue-600 to-purple-600'} ${content.textColor || 'text-white'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            {content.title || 'Experience Luxury Printing'}
          </h2>
          <p className="text-xl mb-2 opacity-90 max-w-2xl mx-auto">
            {content.subtitle || 'Join thousands of professionals who trust us'}
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
            {content.description || 'Ready to elevate your brand?'}
          </p>

          {content.features && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 text-sm">
              {content.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {feature}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="group bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 font-bold" size="lg">
              {content.primaryButton || 'Shop Premium Collection'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              {content.secondaryButton || 'Schedule Consultation'}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // NEW_CUSTOMER_WELCOME specific rendering functions
  const renderWelcomeOnboardingHero = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`relative overflow-hidden ${content.backgroundColor || 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600'} ${content.textColor || 'text-white'} min-h-[600px] flex items-center`}>
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {content.badge && (
                <Badge className="inline-flex items-center gap-1 px-4 py-2 bg-white/20 text-white border-white/30">
                  <UserPlus className="w-4 h-4" />
                  {content.badge}
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {content.headline || 'Welcome to Professional Printing!'}
              </h1>
              <p className="text-xl text-green-100 leading-relaxed">
                {content.subtext || 'New to printing? We\'ll guide you through every step.'}
              </p>
              {content.newCustomerOffer && (
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                  <div className="text-lg font-semibold mb-2">New Customer Special:</div>
                  <div className="text-2xl font-bold">{content.newCustomerOffer}</div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="group bg-white text-green-900 hover:bg-green-50 text-lg px-8 py-4 font-semibold" size="lg">
                  {content.ctaText || 'Start Your First Order'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                  {content.ctaSecondaryText || 'Learn How It Works'}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <div className="text-lg font-semibold">Why New Customers Love Us</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Easy 3-step process</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Free design consultation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>100% satisfaction guarantee</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Personal support team</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderGettingStartedSteps = (section: ContentSection, content: any) => {
    const steps = content.steps || []
    return (
      <section key={section.id} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || 'How It Works'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'Simple process for everyone'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step: any, index: number) => (
              <div key={index} className="text-center relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-green-200 -translate-x-1/2 z-0"></div>
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center text-2xl relative">
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                    <span>{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 mb-3 leading-relaxed">
                    {step.description}
                  </p>
                  {step.tip && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="text-sm text-green-700 font-medium">
                        💡 {step.tip}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderNewCustomerProducts = (section: ContentSection, content: any) => {
    const products = content.products || []
    return (
      <section key={section.id} className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || 'Perfect for First-Time Customers'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'Start with these beginner-friendly options'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {products.map((product: any, index: number) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 relative">
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-green-600 text-white font-semibold px-3 py-1">
                    {product.badge || 'Beginner Friendly'}
                  </Badge>
                </div>
                {product.discount && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {product.discount}
                    </div>
                  </div>
                )}
                <div className="aspect-[4/3] bg-gradient-to-br from-green-50 to-emerald-50 p-8 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Product Image</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-green-600">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-slate-400 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-600">{product.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{product.timeToComplete}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    {product.features?.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold group">
                    Start This Order
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderNewCustomerIncentives = (section: ContentSection, content: any) => {
    const incentives = content.incentives || []
    return (
      <section key={section.id} className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || 'Special New Customer Benefits'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {incentives.map((incentive: any, index: number) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
                  {incentive.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">
                  {incentive.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                  {incentive.description}
                </p>
                <div className="bg-green-50 rounded-lg px-3 py-1 inline-block">
                  <span className="text-green-700 font-semibold text-sm">
                    {incentive.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderSupportOnboarding = (section: ContentSection, content: any) => {
    const supportOptions = content.supportOptions || []
    return (
      <section key={section.id} className={`py-16 ${content.backgroundColor || 'bg-gradient-to-r from-green-500 to-emerald-500'} ${content.textColor || 'text-white'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {content.title || 'We\'re Here to Help You Succeed'}
            </h2>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              {content.subtitle || 'Questions? Our team is ready to guide you'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {supportOptions.map((option: any, index: number) => (
              <div key={index} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 text-center">
                <div className="text-3xl mb-4">{option.icon}</div>
                <h3 className="font-bold text-lg mb-2">{option.method}</h3>
                <div className="font-semibold mb-2">{option.availability}</div>
                <p className="text-sm opacity-90">{option.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="group bg-white text-green-600 hover:bg-green-50 text-lg px-8 py-4 font-bold" size="lg">
                {content.ctaText || 'Start Your First Order Now'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                {content.ctaSecondaryText || 'Contact Support First'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // SEASONAL_HOLIDAY specific rendering functions
  const renderHolidayFestiveHero = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`relative overflow-hidden ${content.backgroundColor || 'bg-gradient-to-br from-red-600 via-green-600 to-red-700'} ${content.textColor || 'text-white'} min-h-[600px] flex items-center`}>
        {content.festiveElements && (
          <>
            <div className="absolute inset-0 bg-[url('/snowflakes.png')] opacity-10 animate-pulse" />
            <div className="absolute top-4 left-4 text-6xl animate-bounce">🎄</div>
            <div className="absolute top-8 right-8 text-4xl animate-pulse">❄️</div>
            <div className="absolute bottom-8 left-8 text-5xl animate-bounce delay-500">🎁</div>
            <div className="absolute bottom-4 right-4 text-3xl animate-pulse delay-1000">⭐</div>
          </>
        )}
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {content.badge && (
                <Badge className="inline-flex items-center gap-1 px-4 py-2 bg-white/20 text-white border-white/30 animate-pulse">
                  <Gift className="w-4 h-4" />
                  {content.badge}
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {content.headline || '🎄 Holiday Magic Starts Here! ❄️'}
              </h1>
              <p className="text-xl text-red-100 leading-relaxed">
                {content.subtext || 'Make this season unforgettable with custom holiday printing'}
              </p>
              {content.seasonalOffer && (
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20 border-dashed">
                  <div className="text-lg font-semibold mb-2">🎁 Holiday Special:</div>
                  <div className="text-2xl font-bold">{content.seasonalOffer}</div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="group bg-white text-red-900 hover:bg-red-50 text-lg px-8 py-4 font-semibold" size="lg">
                  {content.ctaText || 'Create Holiday Magic'}
                  <Gift className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                  {content.ctaSecondaryText || 'Browse Holiday Designs'}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20 border-dashed">
                <div className="text-center mb-6">
                  <div className="text-lg font-semibold">🎄 Holiday Essentials</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30">
                    <div className="text-2xl mb-2">🎄</div>
                    <div className="text-sm font-semibold">Christmas Cards</div>
                    <div className="text-xs opacity-90">Custom designs</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30">
                    <div className="text-2xl mb-2">🎁</div>
                    <div className="text-sm font-semibold">Gift Tags</div>
                    <div className="text-xs opacity-90">Personalized</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30">
                    <div className="text-2xl mb-2">🎉</div>
                    <div className="text-sm font-semibold">Party Banners</div>
                    <div className="text-xs opacity-90">Weather resistant</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30">
                    <div className="text-2xl mb-2">📧</div>
                    <div className="text-sm font-semibold">Invitations</div>
                    <div className="text-xs opacity-90">RSVP ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderSeasonalShowcase = (section: ContentSection, content: any) => {
    const products = content.products || []
    return (
      <section key={section.id} className="py-16 bg-gradient-to-b from-red-50 via-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '🎁 Festive Holiday Collection'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'Everything you need to celebrate the season in style'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: any, index: number) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-red-100 hover:border-green-200 relative">
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-red-600 text-white font-semibold px-3 py-1">
                    {product.badge || 'Holiday Special'}
                  </Badge>
                </div>
                {product.discount && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold border-2 border-white">
                      {product.discount}
                    </div>
                  </div>
                )}
                <div className="aspect-square bg-gradient-to-br from-red-50 via-green-50 to-red-100 p-8 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[url('/holiday-pattern.png')] opacity-5" />
                  <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <span className="text-slate-400 text-sm">Holiday Product</span>
                  </div>
                  <div className="absolute top-2 right-2 text-2xl">{product.seasonalTheme === 'Christmas' ? '🎄' : product.seasonalTheme === 'New Year' ? '🎉' : '🎁'}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-red-600">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-slate-400 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  {product.urgency && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
                      <div className="text-xs text-red-700 font-medium">
                        ⏰ {product.urgency}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2 mb-6">
                    {product.features?.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold group">
                    Order Holiday Special
                    <Gift className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderHolidayCountdown = (section: ContentSection, content: any) => {
    const deadlines = content.deadlines || []
    return (
      <section key={section.id} className={`py-16 ${content.backgroundColor || 'bg-gradient-to-r from-red-500 via-green-500 to-red-600'} ${content.textColor || 'text-white'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {content.title || '⏰ Holiday Deadlines Approaching!'}
            </h2>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              {content.subtitle || 'Don\'t miss out on holiday delivery'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deadlines.map((deadline: any, index: number) => (
              <div key={index} className={`bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 text-center ${deadline.urgencyLevel === 'high' ? 'border-yellow-300 bg-yellow-500/10' : deadline.urgencyLevel === 'medium' ? 'border-orange-300 bg-orange-500/10' : 'border-white/20'}`}>
                <div className="text-4xl mb-4">{deadline.icon}</div>
                <h3 className="font-bold text-xl mb-2">{deadline.holiday}</h3>
                <div className="text-2xl font-bold mb-2">{deadline.deadline}</div>
                <p className="text-sm opacity-90 mb-4">{deadline.description}</p>
                <div className={`bg-white/20 rounded-lg py-2 px-4 ${deadline.urgencyLevel === 'high' ? 'animate-pulse' : ''}`}>
                  <div className="text-lg font-semibold">
                    {deadline.daysLeft} days left
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderFestiveTestimonials = (section: ContentSection, content: any) => {
    const testimonials = content.testimonials || []
    return (
      <section key={section.id} className="py-16 bg-gradient-to-b from-green-50 to-red-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '🎄 Holiday Success Stories'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'See how we made their holidays special'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="bg-white rounded-2xl p-8 border-2 border-red-100 hover:border-green-200 transition-colors shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-2xl">
                    {testimonial.holidayType?.includes('Christmas') ? '🎄' :
                     testimonial.holidayType?.includes('New Year') ? '🎉' :
                     testimonial.holidayType?.includes('Banner') ? '🎊' : '🎁'}
                  </span>
                </div>
                <blockquote className="text-lg text-slate-800 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-semibold">
                      {testimonial.author?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-600">{testimonial.company}</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="text-sm text-green-700">
                    🎯 <strong>{testimonial.holidayType}</strong>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {testimonial.seasonalNote}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderSeasonalCTA = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`py-20 ${content.backgroundColor || 'bg-gradient-to-r from-green-600 via-red-600 to-green-700'} ${content.textColor || 'text-white'} relative overflow-hidden`}>
        {content.festiveDecorations && (
          <>
            <div className="absolute inset-0 bg-[url('/holiday-decorations.png')] opacity-5" />
            <div className="absolute top-8 left-8 text-6xl animate-bounce">🎁</div>
            <div className="absolute top-12 right-12 text-4xl animate-pulse">🎄</div>
            <div className="absolute bottom-8 left-12 text-5xl animate-pulse delay-500">⭐</div>
            <div className="absolute bottom-12 right-8 text-3xl animate-bounce delay-1000">❄️</div>
          </>
        )}
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            {content.title || '🎁 Make This Holiday Season Magical'}
          </h2>
          <p className="text-xl mb-2 opacity-90 max-w-2xl mx-auto">
            {content.subtitle || 'Limited time holiday pricing'}
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
            {content.description || 'Join thousands of customers who trust us with their holiday printing'}
          </p>

          {content.urgencyMessage && (
            <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <div className="text-lg font-bold text-yellow-100">
                ⚠️ {content.urgencyMessage}
              </div>
            </div>
          )}

          {content.holidayFeatures && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 text-sm">
              {content.holidayFeatures.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {feature}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="group bg-white text-red-600 hover:bg-red-50 text-lg px-8 py-4 font-bold" size="lg">
              {content.primaryButton || '🎄 Start Holiday Order'}
              <Gift className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              {content.secondaryButton || '📞 Rush Holiday Order'}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // BULK_VOLUME_DISCOUNTS specific rendering functions
  const renderBusinessVolumeHero = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`relative overflow-hidden ${content.backgroundColor || 'bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900'} ${content.textColor || 'text-white'} min-h-[600px] flex items-center`}>
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {content.badge && (
                <Badge className="inline-flex items-center gap-1 px-4 py-2 bg-white/20 text-white border-white/30">
                  <Building className="w-4 h-4" />
                  {content.badge}
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {content.headline || '📦 Enterprise Printing Solutions'}
              </h1>
              <p className="text-xl text-slate-200 leading-relaxed">
                {content.subtext || 'Scale your business with our volume pricing'}
              </p>
              {content.volumeHighlight && (
                <div className="bg-blue-500/20 backdrop-blur rounded-lg p-4 border border-blue-400/30">
                  <div className="text-lg font-semibold mb-2">💰 Volume Savings:</div>
                  <div className="text-2xl font-bold">{content.volumeHighlight}</div>
                  {content.minimumOrder && (
                    <div className="text-sm opacity-90 mt-1">Starting at {content.minimumOrder}</div>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="group bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-4 font-semibold" size="lg">
                  {content.ctaText || 'Get Volume Quote'}
                  <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                  {content.ctaSecondaryText || 'View Pricing Tiers'}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/5 backdrop-blur rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <div className="text-lg font-semibold">📊 Business Benefits</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                    <div className="text-2xl font-bold">50%</div>
                    <div className="text-sm opacity-90">Max Savings</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm opacity-90">Min Order</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                    <div className="text-2xl font-bold">FREE</div>
                    <div className="text-sm opacity-90">Bulk Shipping</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                    <div className="text-2xl font-bold">24hr</div>
                    <div className="text-sm opacity-90">Quote Response</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderBulkPricingTiers = (section: ContentSection, content: any) => {
    const tiers = content.tiers || []
    return (
      <section key={section.id} className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '💼 Volume Pricing Tiers'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'The more you order, the bigger your savings get'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier: any, index: number) => (
              <div key={index} className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${tier.popular ? 'border-green-400 scale-105' : 'border-slate-200'} relative`}>
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className={`p-6 ${tier.color === 'blue' ? 'bg-blue-50' : tier.color === 'green' ? 'bg-green-50' : tier.color === 'purple' ? 'bg-purple-50' : tier.color === 'gold' ? 'bg-yellow-50' : 'bg-slate-50'}`}>
                  <div className="text-center">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${tier.color === 'blue' ? 'bg-blue-100 text-blue-800' : tier.color === 'green' ? 'bg-green-100 text-green-800' : tier.color === 'purple' ? 'bg-purple-100 text-purple-800' : tier.color === 'gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>
                      {tier.badge}
                    </div>
                    <div className="text-lg font-semibold text-slate-700 mb-2">{tier.range}</div>
                    <div className={`text-3xl font-bold mb-4 ${tier.color === 'blue' ? 'text-blue-600' : tier.color === 'green' ? 'text-green-600' : tier.color === 'purple' ? 'text-purple-600' : tier.color === 'gold' ? 'text-yellow-600' : 'text-slate-600'}`}>
                      {tier.discount}
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {tier.features?.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-sm font-semibold text-slate-700 mb-2">Popular for:</div>
                    <div className="text-xs text-slate-600">
                      {tier.popularProducts?.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <Button className={`w-full font-semibold ${tier.popular ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}>
                    Get {tier.badge} Quote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderBusinessCaseStudies = (section: ContentSection, content: any) => {
    const caseStudies = content.caseStudies || []
    return (
      <section key={section.id} className="py-16 bg-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '🏢 Success Stories from Our Business Clients'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'See how companies like yours are saving with bulk printing'}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {caseStudies.map((study: any, index: number) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Building className="w-8 h-8 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{study.company}</h3>
                    <div className="text-sm text-slate-600">{study.industry}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-blue-600 font-medium">Order Size</div>
                    <div className="text-lg font-bold text-blue-800">{study.orderSize}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-green-600 font-medium">Total Savings</div>
                    <div className="text-lg font-bold text-green-800">{study.savings}</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Challenge:</div>
                    <p className="text-sm text-slate-600">{study.challenge}</p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Solution:</div>
                    <p className="text-sm text-slate-600">{study.solution}</p>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-1">Result:</div>
                    <p className="text-sm text-green-700 font-medium">{study.result}</p>
                  </div>
                </div>

                <blockquote className="text-slate-700 italic border-l-4 border-blue-300 pl-4 mb-4">
                  "{study.testimonial}"
                </blockquote>

                <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white" size="sm">
                  Get Similar Results
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderVolumeCalculator = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className="py-16 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '🧮 Bulk Savings Calculator'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'See your potential savings with volume pricing'}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Select Product & Quantity</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Product Type</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                        <option>Business Cards</option>
                        <option>Marketing Flyers</option>
                        <option>Brochures</option>
                        <option>Posters</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        placeholder="Enter quantity"
                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm text-slate-600 mb-2">Your Discount Tier:</div>
                      <div className="text-2xl font-bold text-blue-600">25% OFF</div>
                      <div className="text-sm text-slate-500">1,000-4,999 items</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Savings Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Base Price:</span>
                      <span className="font-semibold">$199.96</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Volume Discount (25%):</span>
                      <span className="font-semibold text-green-600">-$49.99</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Your Price:</span>
                        <span className="text-2xl font-bold text-blue-600">$149.97</span>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-green-800 font-semibold text-center">
                        💰 You Save $49.99!
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    Get Official Quote
                  </Button>
                </div>
              </div>
              {content.features && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {content.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderBusinessCTA = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`py-20 ${content.backgroundColor || 'bg-gradient-to-r from-slate-700 to-blue-800'} ${content.textColor || 'text-white'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            {content.title || '🤝 Ready to Scale Your Printing?'}
          </h2>
          <p className="text-xl mb-2 opacity-90 max-w-2xl mx-auto">
            {content.subtitle || 'Join thousands of businesses saving with our volume pricing'}
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
            {content.description || 'Get a custom quote for your bulk printing needs'}
          </p>

          {content.urgencyMessage && (
            <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <div className="text-lg font-bold text-blue-100">
                📈 {content.urgencyMessage}
              </div>
            </div>
          )}

          {content.businessFeatures && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
              {content.businessFeatures.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4" />
                  {feature}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="group bg-white text-slate-900 hover:bg-slate-100 text-lg px-8 py-4 font-bold" size="lg">
              {content.primaryButton || '📊 Get Custom Quote'}
              <TrendingUp className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              {content.secondaryButton || '📞 Speak to Bulk Specialist'}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // FAST_TURNAROUND specific rendering functions
  const renderSpeedRushHero = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`relative overflow-hidden ${content.backgroundColor || 'bg-gradient-to-br from-orange-600 via-yellow-500 to-orange-700'} ${content.textColor || 'text-white'} min-h-[600px] flex items-center`}>
        {content.speedAnimations && (
          <>
            <div className="absolute inset-0 bg-[url('/speed-lines.png')] opacity-10 animate-pulse" />
            <div className="absolute top-4 right-4 text-6xl animate-bounce">⚡</div>
            <div className="absolute top-1/2 left-8 text-4xl animate-ping">🚀</div>
            <div className="absolute bottom-8 right-8 text-5xl animate-pulse">💨</div>
            <div className="absolute bottom-4 left-4 text-3xl animate-bounce delay-500">⏰</div>
          </>
        )}
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {content.badge && (
                <Badge className="inline-flex items-center gap-1 px-4 py-2 bg-white/20 text-white border-white/30 animate-pulse">
                  <Zap className="w-4 h-4" />
                  {content.badge}
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                {content.headline || '⚡ Lightning-Fast Printing'}
              </h1>
              <p className="text-xl text-orange-100 leading-relaxed">
                {content.subtext || 'Need it yesterday? We deliver quality at lightning speed'}
              </p>
              {content.rushHighlight && (
                <div className="bg-yellow-500/20 backdrop-blur rounded-lg p-4 border border-yellow-400/30 border-dashed animate-pulse">
                  <div className="text-lg font-semibold mb-2">🚀 Rush Service:</div>
                  <div className="text-2xl font-bold">{content.rushHighlight}</div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="group bg-white text-orange-900 hover:bg-orange-50 text-lg px-8 py-4 font-semibold animate-pulse" size="lg">
                  {content.ctaText || 'Order Rush Delivery'}
                  <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                  {content.ctaSecondaryText || 'Check Rush Pricing'}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20 border-dashed">
                <div className="text-center mb-6">
                  <div className="text-lg font-semibold">⏱️ Speed Options</div>
                </div>
                {content.speedStats && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30">
                      <div className="text-2xl font-bold">⚡ {content.speedStats.fastest}</div>
                      <div className="text-sm opacity-90">Fastest Turnaround</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30">
                      <div className="text-2xl font-bold">🚀 {content.speedStats.sameDay}</div>
                      <div className="text-sm opacity-90">Same-day Hours</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4 text-center border border-white/30">
                      <div className="text-2xl font-bold">📦 {content.speedStats.nextDay}</div>
                      <div className="text-sm opacity-90">Next-day Delivery</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderTurnaroundTimeline = (section: ContentSection, content: any) => {
    const timeline = content.timeline || []
    return (
      <section key={section.id} className="py-16 bg-gradient-to-b from-orange-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '⏱️ Our Speed Timeline'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'Choose the turnaround time that fits your deadline'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((item: any, index: number) => (
              <div key={index} className={`relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${item.popular ? 'border-yellow-400 scale-105' : item.color === 'red' ? 'border-red-200' : item.color === 'orange' ? 'border-orange-200' : item.color === 'yellow' ? 'border-yellow-200' : 'border-green-200'} overflow-hidden`}>
                {item.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold animate-bounce">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-4xl mb-4 animate-pulse">{item.icon}</div>
                  <div className={`text-3xl font-bold mb-2 ${item.color === 'red' ? 'text-red-600' : item.color === 'orange' ? 'text-orange-600' : item.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {item.time}
                  </div>
                  <div className="font-semibold text-slate-800 mb-3">{item.label}</div>
                  <p className="text-sm text-slate-600 mb-4">{item.description}</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 ${item.color === 'red' ? 'bg-red-100 text-red-800' : item.color === 'orange' ? 'bg-orange-100 text-orange-800' : item.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {item.price}
                  </div>
                  <div className="text-xs text-slate-500 mb-4">{item.availability}</div>
                  <Button className={`w-full font-semibold ${item.popular ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : item.color === 'red' ? 'bg-red-100 hover:bg-red-200 text-red-800' : item.color === 'orange' ? 'bg-orange-100 hover:bg-orange-200 text-orange-800' : item.color === 'yellow' ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' : 'bg-green-100 hover:bg-green-200 text-green-800'}`} size="sm">
                    Select {item.label}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderSpeedProducts = (section: ContentSection, content: any) => {
    const products = content.products || []
    return (
      <section key={section.id} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '🏃‍♂️ Rush-Ready Products'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'Products available for same-day and next-day delivery'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product: any, index: number) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-orange-100 hover:border-orange-300 relative">
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-orange-600 text-white font-semibold px-3 py-1">
                    {product.badge || 'Rush Available'}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold border-2 border-white animate-pulse">
                    {product.time}
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-8 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[url('/rush-pattern.png')] opacity-5" />
                  <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <span className="text-slate-400 text-sm">Rush Product</span>
                  </div>
                  <div className="absolute top-2 right-2 text-2xl animate-bounce">
                    {product.speedLevel === 'express' ? '⚡' : product.speedLevel === 'fast' ? '🚀' : '📦'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-orange-600">{product.price}</span>
                    <span className="text-lg text-slate-400 line-through">{product.originalPrice}</span>
                    <span className="text-sm text-red-600 font-semibold">{product.rushFee}</span>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-4">
                    <div className="text-xs text-orange-700 font-medium">
                      ⏰ {product.availability}
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    {product.features?.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold group">
                    Rush Order Now
                    <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderFastTestimonials = (section: ContentSection, content: any) => {
    const testimonials = content.testimonials || []
    return (
      <section key={section.id} className="py-16 bg-gradient-to-b from-yellow-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '⏰ Deadline Heroes'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'Real customers who needed it fast - and got it faster'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="bg-white rounded-2xl p-8 border-2 border-orange-100 hover:border-orange-300 transition-colors shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-2xl">⚡</span>
                </div>
                <blockquote className="text-lg text-slate-800 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {testimonial.author?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-600">{testimonial.company}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-orange-600 font-medium">Service</div>
                    <div className="text-xs font-bold text-orange-800">{testimonial.rushType}</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-yellow-600 font-medium">Time</div>
                    <div className="text-xs font-bold text-yellow-800">{testimonial.timeframe}</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="text-sm text-green-700">
                    🎯 <strong>Challenge:</strong> {testimonial.deadline}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderRushCTA = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`py-20 ${content.backgroundColor || 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-600'} ${content.textColor || 'text-white'} relative overflow-hidden`}>
        {content.speedAnimations && (
          <>
            <div className="absolute inset-0 bg-[url('/speed-bg.png')] opacity-5" />
            <div className="absolute top-8 left-8 text-6xl animate-bounce">⚡</div>
            <div className="absolute top-12 right-12 text-4xl animate-ping">🚀</div>
            <div className="absolute bottom-8 left-12 text-5xl animate-pulse delay-500">💨</div>
            <div className="absolute bottom-12 right-8 text-3xl animate-bounce delay-1000">⏰</div>
          </>
        )}
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            {content.title || '🔥 Got a Deadline? We\'ve Got You Covered!'}
          </h2>
          <p className="text-xl mb-2 opacity-90 max-w-2xl mx-auto">
            {content.subtitle || 'Rush orders processed immediately - no waiting, no delays'}
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
            {content.description || 'Upload your files now and we\'ll start production within minutes'}
          </p>

          {content.urgencyMessage && (
            <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-4 mb-8 max-w-2xl mx-auto animate-pulse">
              <div className="text-lg font-bold text-yellow-100">
                ⚠️ {content.urgencyMessage}
              </div>
            </div>
          )}

          {content.rushFeatures && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
              {content.rushFeatures.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4" />
                  {feature}
                </div>
              ))}
            </div>
          )}

          {content.rushHotline && (
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-8 max-w-md mx-auto">
              <div className="text-lg font-semibold mb-2">📞 Rush Hotline:</div>
              <div className="text-2xl font-bold">{content.rushHotline}</div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="group bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-4 font-bold animate-pulse" size="lg">
              {content.primaryButton || '⚡ Start Rush Order'}
              <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              {content.secondaryButton || '📞 Call Rush Hotline'}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // LOCAL_COMMUNITY specific rendering functions
  const renderCommunityHero = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`relative overflow-hidden ${content.backgroundColor || 'bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-600'} ${content.textColor || 'text-white'} min-h-[600px] flex items-center`}>
        <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {content.badge && (
                <Badge className="inline-flex items-center gap-1 px-4 py-2 bg-white/20 text-white border-white/30">
                  🤝 {content.badge}
                </Badge>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                {content.headline || '🏘️ Your Neighborhood Printing Partner'}
              </h1>
              <p className="text-lg sm:text-xl opacity-90 leading-relaxed">
                {content.subtext || 'Supporting local businesses and community events since 2010. When you succeed, our community thrives together.'}
              </p>

              {content.localBadges && (
                <div className="flex flex-wrap gap-3">
                  {content.localBadges.map((badge: string, index: number) => (
                    <div key={index} className="bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm">
                      {badge}
                    </div>
                  ))}
                </div>
              )}

              {content.neighborhoodStats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{content.neighborhoodStats.businessesServed}</div>
                    <div className="text-sm opacity-80">Local Businesses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{content.neighborhoodStats.eventsSupported}</div>
                    <div className="text-sm opacity-80">Community Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{content.neighborhoodStats.yearsLocal}</div>
                    <div className="text-sm opacity-80">In Neighborhood</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="group bg-white text-emerald-700 hover:bg-emerald-50 font-semibold" size="lg">
                  {content.ctaText || 'Support Local Business'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  {content.ctaSecondaryText || 'Get Community Pricing'}
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white/10 backdrop-blur rounded-3xl p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full">
                  {['Local Events', 'Business Cards', 'Community Signs', 'Fundraisers'].map((item, i) => (
                    <div key={i} className="bg-white/20 backdrop-blur rounded-lg p-4 text-center transform hover:scale-105 transition-transform">
                      <div className="aspect-video bg-white/20 rounded mb-2" />
                      <p className="text-sm font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderLocalBusinessShowcase = (section: ContentSection, content: any) => {
    const products = content.products || []
    return (
      <section key={section.id} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '🏪 Essential Tools for Local Business Success'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'Everything your neighborhood business needs to stand out and connect with customers'}
            </p>
          </div>
          <div className={`grid ${content.layout === 'community-4-grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-8`}>
            {products.map((product: any, index: number) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-emerald-200">
                <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center relative overflow-hidden">
                  {product.badge && (
                    <Badge className="absolute top-3 left-3 bg-emerald-600 text-white">
                      {product.badge}
                    </Badge>
                  )}
                  <div className="w-24 h-24 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-12 h-12 text-emerald-600" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-slate-900">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-bold text-emerald-600">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-500 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  {product.communityDiscount && (
                    <div className="bg-emerald-50 rounded-lg p-2 mb-3">
                      <div className="text-sm font-semibold text-emerald-700">💰 {product.communityDiscount}</div>
                    </div>
                  )}
                  <div className="space-y-2 mb-4">
                    {product.features?.map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  {product.localSupport && (
                    <div className="bg-teal-50 rounded-lg p-3 mb-4">
                      <div className="text-sm font-medium text-teal-700">🤝 {product.localSupport}</div>
                    </div>
                  )}
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Order Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderCommunityEvents = (section: ContentSection, content: any) => {
    const events = content.eventGallery || []
    return (
      <section key={section.id} className="py-16 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '🎪 Proud Community Event Partner'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'We don\'t just print for events - we\'re part of making them happen'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {events.map((event: any, index: number) => (
              <Card key={index} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎪</div>
                    <div className="font-semibold text-slate-700">{event.event}</div>
                    <div className="text-sm text-slate-500">{event.year}</div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-slate-600 mb-4 leading-relaxed">{event.description}</p>
                  <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                    <div className="text-sm font-semibold text-emerald-700 mb-1">Community Impact:</div>
                    <div className="text-sm text-emerald-600">{event.impact}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700">Materials Provided:</div>
                    <div className="flex flex-wrap gap-2">
                      {event.materials?.map((material: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {content.communityImpact && (
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-8">📊 Our Community Impact</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{content.communityImpact.eventsPerYear}</div>
                  <div className="text-sm text-slate-600">Events Per Year</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{content.communityImpact.charitiesSupported}</div>
                  <div className="text-sm text-slate-600">Charities Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{content.communityImpact.localJobsCreated}</div>
                  <div className="text-sm text-slate-600">Local Jobs Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{content.communityImpact.communityFunding}</div>
                  <div className="text-sm text-slate-600">Community Funding</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  const renderNeighborhoodTestimonials = (section: ContentSection, content: any) => {
    const testimonials = content.testimonials || []
    return (
      <section key={section.id} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {content.title || '💬 Voices from Our Neighborhood'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {content.subtitle || 'Real local business owners sharing their experiences'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-slate-600 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                          {testimonial.author?.charAt(0) || 'L'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-slate-900">{testimonial.author}</div>
                        <div className="text-sm text-slate-500">{testimonial.company}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Business Type:</span>
                        <span className="text-slate-700">{testimonial.businessType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Customer Since:</span>
                        <span className="text-slate-700">{testimonial.yearsCustomer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Location:</span>
                        <span className="text-slate-700">{testimonial.location}</span>
                      </div>
                      {testimonial.favoriteService && (
                        <div className="bg-emerald-50 rounded-lg p-3 mt-3">
                          <div className="text-xs text-emerald-600 font-medium">Favorite Service:</div>
                          <div className="text-sm text-emerald-700">{testimonial.favoriteService}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderCommunityCTA = (section: ContentSection, content: any) => {
    return (
      <section key={section.id} className={`py-20 ${content.backgroundColor || 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600'} ${content.textColor || 'text-white'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            {content.title || '🤝 Join Our Community of Successful Local Businesses'}
          </h2>
          <p className="text-xl mb-2 opacity-90 max-w-2xl mx-auto">
            {content.subtitle || 'Get the personal service and community support your business deserves'}
          </p>
          <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
            {content.description || 'Experience the difference of working with a local printing partner who cares about your success and our community\'s growth.'}
          </p>

          {content.communityPerks && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-w-5xl mx-auto">
              {content.communityPerks.map((perk: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-left">
                  <Check className="w-5 h-5 text-emerald-200 flex-shrink-0" />
                  <span className="text-sm">{perk}</span>
                </div>
              ))}
            </div>
          )}

          {content.localPromise && (
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8 max-w-4xl mx-auto">
              <div className="text-lg leading-relaxed opacity-95">
                {content.localPromise}
              </div>
            </div>
          )}

          {content.contactInfo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-sm opacity-80">Address</div>
                <div className="font-semibold">{content.contactInfo.address}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-sm opacity-80">Phone</div>
                <div className="font-semibold">{content.contactInfo.phone}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-sm opacity-80">Email</div>
                <div className="font-semibold">{content.contactInfo.email}</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-sm opacity-80">Hours</div>
                <div className="font-semibold">{content.contactInfo.hours}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="group bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-4 font-bold" size="lg">
              {content.primaryButton || '🏪 Get Community Pricing'}
              <Users className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              {content.secondaryButton || '☕ Schedule Coffee & Consultation'}
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const getFeatureIcon = (index: number) => {
    const icons = [<Clock key="clock" className="h-8 w-8 text-primary" />, <Shield key="shield" className="h-8 w-8 text-primary" />, <Users key="users" className="h-8 w-8 text-primary" />, <TrendingUp key="trending" className="h-8 w-8 text-primary" />]
    return icons[index % icons.length]
  }

  const renderFeaturedProducts = (section: ContentSection, content: any) => {
    const variantType = content.variantType || homepage?.type
    const products = content.products || variantProducts[variantType as keyof typeof variantProducts] || featuredProducts
    const productCount = parseInt(section.sectionType.split('-')[2]) || 4
    const displayProducts = products.slice(0, productCount)
    const theme = getVariantTheme(variantType || '')

    const getGridClasses = () => {
      switch (productCount) {
        case 2: return 'grid-cols-1 md:grid-cols-2'
        case 3: return 'grid-cols-1 md:grid-cols-3'
        case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }
    }

    return (
      <section key={section.id} className={`py-12 sm:py-16 lg:py-20 bg-gradient-to-r ${theme.gradientClass}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {content.title || 'Featured Products'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {content.description || 'Discover our most popular printing solutions'}
            </p>
          </div>
          <div className={`grid ${getGridClasses()} gap-6`}>
            {displayProducts.map((product: any, index: number) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${theme.urgencyClass}`}>
                <div className={`aspect-square bg-gradient-to-br ${theme.primaryColor} rounded-t-lg flex items-center justify-center relative`}>
                  <Package className="h-16 w-16 text-primary/40" />
                  {product.badge && (
                    <Badge
                      className={`absolute top-3 right-3 ${theme.badgeClass} ${theme.urgencyClass}`}
                    >
                      {product.badge}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-medium">{product.price}</p>
                      {product.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          {product.originalPrice}
                        </p>
                      )}
                    </div>
                    {product.bulkPrice && (
                      <p className="text-xs text-muted-foreground">
                        {product.bulkPrice}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderProductCategories = (section: ContentSection, content: any) => {
    const variantType = content.variantType || homepage?.type
    const categories = content.categories || variantCategories[variantType as keyof typeof variantCategories] || productCategories.slice(0, 4)
    const theme = getVariantTheme(variantType || '')

    return (
      <section key={section.id} className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {content.title || 'Product Categories'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {content.description || 'Explore our complete range of printing services'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any, index: number) => (
              <Link key={index} href={category.href}>
                <Card className="group hover:shadow-lg transition-all h-full overflow-hidden">
                  <div className={`relative aspect-video bg-gradient-to-br ${theme.primaryColor}`}>
                    {category.badge && (
                      <Badge
                        className={`absolute top-3 right-3 ${theme.badgeClass} ${
                          category.urgent ? theme.urgencyClass : ''
                        }`}
                      >
                        {category.badge}
                      </Badge>
                    )}
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <div className="w-full h-full bg-white/50 rounded-lg shadow-sm flex items-center justify-center">
                        <div className="text-center">
                          <Package className="h-16 w-16 text-primary/40 mx-auto mb-2" />
                          <span className="text-xs text-muted-foreground">Sample Image</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderTestimonials = (section: ContentSection, content: any) => {
    const sectionTestimonials = content.testimonials || testimonials.slice(0, 3)
    const variantType = homepage?.type
    const theme = getVariantTheme(variantType || '')

    return (
      <section key={section.id} className={`py-12 sm:py-16 lg:py-20 bg-gradient-to-r ${theme.gradientClass}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {content.title || 'What Our Customers Say'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {content.description || 'Don\'t just take our word for it - hear from our satisfied customers'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {sectionTestimonials.map((testimonial: any, index: number) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderQuickStats = (section: ContentSection, content: any) => {
    const stats = content.stats || [
      { number: '10,000+', label: 'Happy Customers' },
      { number: '50,000+', label: 'Orders Completed' },
      { number: '24hr', label: 'Fast Turnaround' },
      { number: '99.9%', label: 'Satisfaction Rate' },
    ]
    const variantType = homepage?.type
    const theme = getVariantTheme(variantType || '')

    return (
      <section key={section.id} className={`border-y bg-gradient-to-r ${theme.gradientClass}`}>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const renderFallbackContent = () => (
    <main className="min-h-screen">
      {/* Fallback Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 xl:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <Badge className="inline-flex items-center gap-1 px-3 py-1">
                <Zap className="w-3 h-3" />
                Same Day Printing Available
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight">
                Professional Printing
                <span className="text-primary"> Made Simple</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                High-quality printing services with fast turnaround times. From business cards to
                banners, we bring your ideas to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="group" size="lg">
                  <Link href="/products">
                    <Package className="mr-2 h-5 w-5" />
                    Start Your Order
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/track">Track Order</Link>
                </Button>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 p-4 sm:p-6 md:p-8">
                  {['Business Cards', 'Flyers', 'Banners', 'Stickers'].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow-lg p-2 sm:p-3 md:p-4 transform hover:scale-105 transition-transform"
                    >
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded mb-1 sm:mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-center">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24hr</div>
              <div className="text-sm text-muted-foreground">Fast Turnaround</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Quality Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Product Types</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Choose Your Product</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select from our wide range of printing products. Each category offers multiple
              customization options.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {productCategories.map((category) => (
              <Link key={category.title} href={category.href}>
                <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 group cursor-pointer overflow-hidden">
                  <div className="aspect-[4/3] relative bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
                    {category.popular && (
                      <Badge
                        className="absolute top-3 right-3 z-10 bg-primary/10 text-primary border-primary/20"
                        variant="secondary"
                      >
                        Popular
                      </Badge>
                    )}
                    <div className="w-full h-full flex flex-col items-center justify-center p-6">
                      <div className="w-full h-full bg-white/50 rounded-lg shadow-sm flex items-center justify-center">
                        <div className="text-center">
                          <Package className="h-16 w-16 text-primary/40 mx-auto mb-2" />
                          <span className="text-xs text-muted-foreground">Sample Image</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {category.title}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-primary">
                      <span className="text-sm font-medium">Get Started</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our most popular products with competitive pricing and fast delivery
            </p>
          </div>
          <Carousel className="max-w-5xl mx-auto">
            <CarouselContent className="-ml-4">
              {featuredProducts.map((product, index) => (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 relative">
                      <Badge className="absolute top-4 right-4 z-10">{product.badge}</Badge>
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-20 w-20 text-primary/30" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <p className="text-primary font-bold">{product.price}</p>
                      <Button asChild className="w-full mt-4" variant="outline">
                        <Link href="/products">View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose GangRun Printing?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine quality, speed, and service to deliver exceptional printing solutions
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fast Turnaround</h3>
              <p className="text-sm text-muted-foreground">
                Same-day and next-day printing options available
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                100% satisfaction or we'll reprint for free
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Expert Support</h3>
              <p className="text-sm text-muted-foreground">
                Free design consultation and file review
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Bulk Discounts</h3>
              <p className="text-sm text-muted-foreground">
                Save more when you order in larger quantities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {testimonial.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose from our wide selection of products and upload your design. Our team is ready to
            bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="group" size="lg">
              <Link href="/products">
                <Package className="mr-2 h-5 w-5" />
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/track">Track Your Order</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )

  // Main component return logic
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </main>
    )
  }

  // Render dynamic content if homepage variant is available
  if (homepage && homepage.content) {
    return (
      <main className="min-h-screen">
        {homepage.content
          .filter(section => section.isVisible)
          .sort((a, b) => a.position - b.position)
          .map((section) => renderDynamicSection(section))}
      </main>
    )
  }

  // Fallback to static content
  return renderFallbackContent()
}
