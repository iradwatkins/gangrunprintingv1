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

      default:
        return null
    }
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

        {/* Always include featured products and categories after dynamic content */}
        {renderFallbackContent().props.children.slice(1)}
      </main>
    )
  }

  // Fallback to static content
  return renderFallbackContent()
}
