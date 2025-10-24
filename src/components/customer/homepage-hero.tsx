'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Special {
  id: string
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  discount?: string
  bgColor: string
}

// Default specials - can be moved to database later
const DEFAULT_SPECIALS: Special[] = [
  {
    id: '1',
    title: 'Business Cards Special',
    subtitle: '500 Premium Business Cards',
    description: 'High-quality cardstock with multiple coating options',
    ctaText: 'Order Now',
    ctaLink: '/category/business-cards',
    discount: '20% OFF',
    bgColor: 'from-blue-600 to-blue-800',
  },
  {
    id: '2',
    title: 'Flyer Printing Deal',
    subtitle: '1000 Full-Color Flyers',
    description: 'Perfect for events, promotions, and marketing campaigns',
    ctaText: 'Get Started',
    ctaLink: '/category/flyers',
    discount: '15% OFF',
    bgColor: 'from-purple-600 to-purple-800',
  },
  {
    id: '3',
    title: 'Brochure Package',
    subtitle: 'Professional Tri-Fold Brochures',
    description: 'Showcase your business with professional brochures',
    ctaText: 'View Options',
    ctaLink: '/category/brochures',
    discount: '25% OFF',
    bgColor: 'from-orange-600 to-orange-800',
  },
]

export function HomepageHero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [specials] = useState<Special[]>(DEFAULT_SPECIALS)

  // Auto-rotate specials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % specials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [specials.length])

  const currentSpecial = specials[currentIndex]

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Hero Banner with rotating specials */}
      <div
        className={cn(
          'relative bg-gradient-to-r text-white p-8 md:p-12 lg:p-16 min-h-[400px] flex items-center transition-all duration-500',
          currentSpecial.bgColor
        )}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {currentSpecial.discount && (
            <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-white/40">
              <Sparkles className="mr-1 h-3 w-3" />
              {currentSpecial.discount}
            </Badge>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentSpecial.title}
          </h1>

          <p className="text-xl md:text-2xl mb-2 font-semibold opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {currentSpecial.subtitle}
          </p>

          <p className="text-lg mb-8 opacity-80 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {currentSpecial.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <Button asChild className="bg-white text-primary hover:bg-white/90" size="lg">
              <Link href={currentSpecial.ctaLink}>
                {currentSpecial.ctaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link className="border-white text-white hover:bg-white/10" href="/products">
                View All Products
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Rotation Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {specials.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to special ${index + 1}`}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
            )}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
