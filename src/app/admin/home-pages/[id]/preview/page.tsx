'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit,
  Power,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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

export default function PreviewHomepagePage() {
  const params = useParams()
  const [homepage, setHomepage] = useState<HomepageVariant | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  useEffect(() => {
    if (params.id) {
      fetchHomepage(params.id as string)
    }
  }, [params.id])

  const fetchHomepage = async (id: string) => {
    try {
      const response = await fetch(`/api/home-pages/${id}`)
      if (!response.ok) throw new Error('Failed to fetch homepage')
      const data = await response.json()
      setHomepage(data)
    } catch (error) {
      console.error('Error fetching homepage:', error)
      alert('Failed to load homepage')
    } finally {
      setLoading(false)
    }
  }

  const activateHomepage = async () => {
    if (!homepage) return

    try {
      const response = await fetch(`/api/home-pages/${homepage.id}/activate`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to activate homepage')

      const data = await response.json()
      alert(`${data.homepage.name} is now active`)
      setHomepage(prev => prev ? { ...prev, isActive: true } : prev)
    } catch (error) {
      console.error('Error activating homepage:', error)
      alert('Failed to activate homepage variant')
    }
  }

  // Import the same rendering functions and theme system from the main homepage
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

  const renderPreviewContent = (section: ContentSection) => {
    if (!section.isVisible) return null

    const { content } = section
    const theme = getVariantTheme(homepage?.type || '')

    switch (section.sectionType) {
      case 'hero':
        return (
          <section key={section.id} className={`relative overflow-hidden bg-gradient-to-br ${theme.heroGradient}`}>
            <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
            <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-8">
                  {content.badge && (
                    <Badge className={`inline-flex items-center gap-1 px-3 py-1 ${theme.badgeClass} ${theme.urgencyClass}`}>
                      {content.badge}
                    </Badge>
                  )}
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                    {content.headline || 'Professional Printing Made Simple'}
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground">
                    {content.subtext || 'High-quality printing services with fast turnaround times.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="group" size="lg">
                      {content.ctaText || 'Start Your Order'}
                    </Button>
                    <Button size="lg" variant="outline">
                      {content.ctaSecondaryText || 'Track Order'}
                    </Button>
                  </div>
                </div>
                <div className="relative order-first lg:order-last">
                  <div className={`aspect-square bg-gradient-to-br ${theme.primaryColor} rounded-3xl flex items-center justify-center`}>
                    <div className="text-6xl">🖨️</div>
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {content.features?.map((feature: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${theme.primaryColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <div className="text-2xl">✓</div>
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
                {content.description || 'Choose from our wide selection of products and upload your design.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="group" size="lg">
                  {content.primaryButton || 'Browse Products'}
                </Button>
                <Button size="lg" variant="outline">
                  {content.secondaryButton || 'Track Your Order'}
                </Button>
              </div>
            </div>
          </section>
        )

      case 'featured-products-2':
      case 'featured-products-3':
      case 'featured-products-4':
        const productCount = parseInt(section.sectionType.split('-')[2]) || 4
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
                {Array.from({ length: productCount }).map((_, index) => (
                  <Card key={index} className={`hover:shadow-lg transition-shadow ${theme.urgencyClass}`}>
                    <div className={`aspect-square bg-gradient-to-br ${theme.primaryColor} rounded-t-lg flex items-center justify-center relative`}>
                      <div className="text-4xl">📦</div>
                      <Badge className={`absolute top-3 right-3 ${theme.badgeClass}`}>
                        Sample Product
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">Product {index + 1}</h3>
                      <p className="text-primary font-medium">Starting at $29.99</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )

      case 'testimonials':
        return (
          <section key={section.id} className={`py-12 sm:py-16 lg:py-20 bg-gradient-to-r ${theme.gradientClass}`}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  {content.title || 'What Our Customers Say'}
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-4 h-4 text-yellow-400">⭐</div>
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4">"Great service and quality!"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          👤
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Customer {index + 1}</p>
                          <p className="text-xs text-muted-foreground">Business Owner</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )

      case 'quick-stats':
        const stats = content.stats || [
          { number: '10,000+', label: 'Happy Customers' },
          { number: '50,000+', label: 'Orders Completed' },
          { number: '24hr', label: 'Fast Turnaround' },
          { number: '99.9%', label: 'Satisfaction Rate' },
        ]
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

      case 'product-categories':
        return (
          <section key={section.id} className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  {content.title || 'Product Categories'}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all h-full overflow-hidden">
                    <div className={`relative aspect-video bg-gradient-to-br ${theme.primaryColor}`}>
                      <Badge className={`absolute top-3 right-3 ${theme.badgeClass}`}>
                        Popular
                      </Badge>
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl">📄</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">Category {index + 1}</h3>
                      <p className="text-sm text-muted-foreground">Sample description</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )

      // LIMITED_TIME_OFFER specific sections
      case 'urgency-banner':
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

      case 'countdown-hero':
        return (
          <section key={section.id} className={`relative overflow-hidden bg-gradient-to-br ${theme.heroGradient} py-16 lg:py-24`}>
            <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
            <div className="container mx-auto px-4">
              <div className="text-center max-w-4xl mx-auto space-y-8">
                {content.badge && (
                  <Badge className={`inline-flex items-center gap-1 px-4 py-2 text-lg ${theme.badgeClass} ${theme.urgencyClass}`}>
                    {content.badge}
                  </Badge>
                )}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  {content.headline || 'Limited Time Offer'}
                </h1>
                <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  {content.subtext || 'Don\'t miss out on this incredible deal!'}
                </p>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-2xl mx-auto">
                  <p className="text-2xl font-bold mb-4 text-red-600">Sale Ends In:</p>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <div className="text-2xl font-bold text-red-600">00</div>
                      <div className="text-sm text-muted-foreground">Days</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <div className="text-2xl font-bold text-red-600">23</div>
                      <div className="text-sm text-muted-foreground">Hours</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <div className="text-2xl font-bold text-red-600">59</div>
                      <div className="text-sm text-muted-foreground">Minutes</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <div className="text-2xl font-bold text-red-600">59</div>
                      <div className="text-sm text-muted-foreground">Seconds</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="group bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4" size="lg">
                    {content.ctaText || 'Shop Now'}
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                    {content.ctaSecondaryText || 'View All Deals'}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )

      case 'flash-deals-grid':
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
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="hover:shadow-xl transition-all duration-300 border-red-200 hover:border-red-400 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-sm font-bold animate-pulse">
                      SAVE $10
                    </div>
                    <div className={`aspect-square bg-gradient-to-br ${theme.primaryColor} rounded-t-lg flex items-center justify-center relative`}>
                      <div className="text-6xl">📦</div>
                      <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                        🔥 HOT DEAL
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">Flash Product {index + 1}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-red-600">$19.99</span>
                          <span className="text-sm text-muted-foreground line-through">$29.99</span>
                        </div>
                        <div className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded font-medium">
                          💰 Save $10
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                        🛒 Add to Cart
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )

      case 'urgency-stats':
        return (
          <section key={section.id} className="py-12 bg-red-600 text-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {content.title || 'Don\'t Wait - Act Now!'}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { number: '847', label: 'Orders Today', animated: true },
                  { number: '23hrs', label: 'Sale Ends In', animated: true },
                  { number: '30%', label: 'Maximum Savings', animated: false },
                  { number: '2,341', label: 'Items Sold Today', animated: true },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-3xl sm:text-4xl font-bold text-white ${stat.animated ? 'animate-pulse' : ''}`}>
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

      case 'urgency-cta':
        return (
          <section key={section.id} className="py-16 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {content.title || '⏰ Last Chance!'}
              </h2>
              <p className="text-lg mb-8 max-w-3xl mx-auto opacity-90">
                {content.description || 'Don\'t miss out on this incredible offer!'}
              </p>
              <div className="mb-8">
                <p className="text-xl font-semibold mb-4">Sale ends in:</p>
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="group bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4 font-bold" size="lg">
                  {content.primaryButton || '🛒 Shop Now & Save'}
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                  {content.secondaryButton || '⏱️ View Countdown'}
                </Button>
              </div>
            </div>
          </section>
        )

      case 'premium-hero':
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

      case 'product-spotlight-grid':
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
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'premium-testimonials':
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

      case 'quality-badges':
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

      case 'premium-cta':
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
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                  {content.secondaryButton || 'Schedule Consultation'}
                </Button>
              </div>
            </div>
          </section>
        )

      case 'welcome-onboarding-hero':
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
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                      {content.ctaSecondaryText || 'Learn How It Works'}
                    </Button>
                  </div>
                </div>
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
                  </div>
                </div>
              </div>
            </div>
          </section>
        )

      case 'getting-started-steps':
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

      case 'new-customer-products':
        const newProducts = content.products || []
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
                {newProducts.map((product: any, index: number) => (
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
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold">
                        Start This Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'new-customer-incentives':
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
                  <div key={index} className="bg-white rounded-2xl p-6 text-center border border-slate-200">
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

      case 'support-onboarding':
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
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                    {content.ctaSecondaryText || 'Contact Support First'}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )

      // LOCAL_COMMUNITY specific sections
      case 'community-hero':
        return (
          <section key={section.id} className={`relative overflow-hidden ${content.backgroundColor || 'bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-600'} ${content.textColor || 'text-white'} min-h-[500px] flex items-center`}>
            <div className="container mx-auto px-4 py-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  {content.badge && (
                    <Badge className="bg-white/20 text-white border-white/30">
                      🤝 {content.badge}
                    </Badge>
                  )}
                  <h1 className="text-4xl lg:text-5xl font-bold">
                    {content.headline || '🏘️ Your Neighborhood Printing Partner'}
                  </h1>
                  <p className="text-lg opacity-90">
                    {content.subtext || 'Supporting local businesses and community events since 2010.'}
                  </p>
                  {content.neighborhoodStats && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold">{content.neighborhoodStats.businessesServed}</div>
                        <div className="text-sm opacity-80">Local Businesses</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{content.neighborhoodStats.eventsSupported}</div>
                        <div className="text-sm opacity-80">Community Events</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">{content.neighborhoodStats.yearsLocal}</div>
                        <div className="text-sm opacity-80">In Neighborhood</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="aspect-square bg-white/10 rounded-3xl flex items-center justify-center">
                  <div className="text-6xl">🏘️</div>
                </div>
              </div>
            </div>
          </section>
        )

      case 'local-business-showcase':
        return (
          <section key={section.id} className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  {content.title || '🏪 Essential Tools for Local Business Success'}
                </h2>
                <p className="text-lg text-slate-600">
                  {content.subtitle || 'Everything your neighborhood business needs'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(content.products || []).map((product: any, index: number) => (
                  <div key={index} className="bg-white border border-emerald-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-emerald-50 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <div className="text-2xl font-bold text-emerald-600 mb-2">{product.price}</div>
                    {product.communityDiscount && (
                      <div className="text-sm bg-emerald-50 text-emerald-700 rounded px-2 py-1 mb-3">
                        💰 {product.communityDiscount}
                      </div>
                    )}
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      Order Now
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'community-events':
        return (
          <section key={section.id} className="py-16 bg-gradient-to-br from-slate-50 to-emerald-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  {content.title || '🎪 Proud Community Event Partner'}
                </h2>
                <p className="text-lg text-slate-600">
                  {content.subtitle || 'We don\'t just print for events - we\'re part of making them happen'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(content.eventGallery || []).map((event: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="aspect-video bg-emerald-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🎪</div>
                        <div className="font-semibold">{event.event}</div>
                        <div className="text-sm text-slate-500">{event.year}</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-slate-600 mb-4">{event.description}</p>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <div className="text-sm font-semibold text-emerald-700">Impact: {event.impact}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'neighborhood-testimonials':
        return (
          <section key={section.id} className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  {content.title || '💬 Voices from Our Neighborhood'}
                </h2>
                <p className="text-lg text-slate-600">
                  {content.subtitle || 'Real local business owners sharing their experiences'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(content.testimonials || []).map((testimonial: any, index: number) => (
                  <div key={index} className="bg-white border border-slate-200 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-slate-600 mb-4 italic">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-slate-900">{testimonial.author}</div>
                      <div className="text-sm text-slate-500 mb-2">{testimonial.company}</div>
                      <div className="text-xs text-emerald-600">
                        {testimonial.businessType} • {testimonial.location} • Customer {testimonial.yearsCustomer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )

      case 'community-cta':
        return (
          <section key={section.id} className={`py-20 ${content.backgroundColor || 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600'} ${content.textColor || 'text-white'}`}>
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold mb-4">
                {content.title || '🤝 Join Our Community of Successful Local Businesses'}
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
                {content.subtitle || 'Get the personal service and community support your business deserves'}
              </p>
              {content.communityPerks && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto text-left">
                  {content.communityPerks.slice(0, 6).map((perk: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span className="text-sm">{perk}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-4">
                  {content.primaryButton || '🏪 Get Community Pricing'}
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
                  {content.secondaryButton || '☕ Schedule Coffee & Consultation'}
                </Button>
              </div>
            </div>
          </section>
        )

      default:
        return (
          <section key={section.id} className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 capitalize">
                  {section.sectionType.replace(/[_-]/g, ' ')} Section
                </h3>
                <p className="text-sm text-muted-foreground">
                  Custom content section
                </p>
              </div>
            </div>
          </section>
        )
    }
  }

  const getViewportClasses = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      default:
        return 'w-full'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-96 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!homepage) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Homepage Not Found</h1>
          <Button asChild>
            <Link href="/admin/home-pages">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Homepage Management
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Header - Fixed */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/home-pages">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">Preview: {homepage.name}</h1>
                <p className="text-sm text-muted-foreground">{homepage.description}</p>
              </div>
              {homepage.isActive && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Viewport Controls */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/home-pages/${homepage.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>

              {homepage.isEnabled && !homepage.isActive && (
                <Button
                  onClick={activateHomepage}
                  size="sm"
                  className="gap-2"
                >
                  <Power className="h-4 w-4" />
                  Activate
                </Button>
              )}

              <Button asChild variant="outline" size="sm">
                <Link href="/" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live Site
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className={`${getViewportClasses()} transition-all duration-300`}>
        <div className="bg-white min-h-screen">
          {homepage.content
            .filter(section => section.isVisible)
            .sort((a, b) => a.position - b.position)
            .map((section) => (
              <div key={section.id}>
                {renderPreviewContent(section)}
              </div>
            ))}
        </div>
      </div>

      {/* Preview Footer */}
      <div className="border-t bg-muted/30 p-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            This is a preview of how "{homepage.name}" would appear on your live website.
            {!homepage.isActive && ' Click "Activate" to make this your live homepage.'}
          </p>
        </div>
      </div>
    </div>
  )
}