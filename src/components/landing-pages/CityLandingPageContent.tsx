'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface CityLandingPageContentProps {
  cityLandingPage: any
  landingPageSet: any
  city: any
}

export function CityLandingPageContent({
  cityLandingPage,
  landingPageSet,
  city
}: CityLandingPageContentProps) {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showDiscount, setShowDiscount] = useState(false)

  useEffect(() => {
    // Set source tracking cookie for attribution
    document.cookie = `landing_page_source=${cityLandingPage.id}; path=/; max-age=2592000` // 30 days

    // Show discount notification if enabled
    if (landingPageSet.discountEnabled) {
      setTimeout(() => setShowDiscount(true), 3000)
    }
  }, [cityLandingPage.id, landingPageSet.discountEnabled])

  const handleOrderNow = () => {
    // Navigate to product with pre-filled configuration
    router.push(`/products/${landingPageSet.slug}?source=landing`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Discount Banner */}
      {showDiscount && landingPageSet.discountEnabled && (
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 text-center relative">
          <p className="font-bold">
            🎉 Special {landingPageSet.discountPercent}% Discount for {city.name} Customers - Limited Time!
          </p>
          <button
            onClick={() => setShowDiscount(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <a href="/" className="hover:text-blue-600">Home</a>
                <span>/</span>
                <a href="/products" className="hover:text-blue-600">Products</a>
                <span>/</span>
                <span className="text-gray-900">{city.name}, {city.stateCode}</span>
              </div>

              {/* H1 - Critical for SEO */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {cityLandingPage.h1}
              </h1>

              {/* Location Badge */}
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-lg text-gray-700">
                  Serving {city.name}, {city.state} ({city.population.toLocaleString()} residents)
                </span>
              </div>

              {/* Key Benefits */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Fast Turnaround</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Premium Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Free Shipping $50+</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Local Delivery</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                  onClick={handleOrderNow}
                >
                  Get Started - Order Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg"
                  onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>

              {/* Urgency Message */}
              {landingPageSet.urgencyEnabled && (
                <p className="mt-4 text-sm text-orange-600 font-medium">
                  ⚡ {Math.floor(Math.random() * 5) + 3} people in {city.name} are viewing this right now
                </p>
              )}
            </div>

            {/* Hero Image Placeholder */}
            <div className="bg-white rounded-lg shadow-xl p-8 text-center">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg h-80 flex items-center justify-center">
                <div>
                  <Star className="h-20 w-20 text-blue-600 mx-auto mb-4" />
                  <p className="text-2xl font-bold text-gray-900">4.8/5 Stars</p>
                  <p className="text-gray-600">Based on 127 reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Generated Introduction */}
      {cityLandingPage.aiIntro && (
        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {cityLandingPage.aiIntro}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-blue-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Fast Turnaround</h3>
              <p className="text-sm text-gray-600">Rush options available</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-12 w-12 text-green-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-gray-600">100% satisfaction promise</p>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="h-12 w-12 text-orange-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-sm text-gray-600">Orders over $50</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-12 w-12 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Local Service</h3>
              <p className="text-sm text-gray-600">Serving {city.name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Generated Benefits */}
      {cityLandingPage.aiBenefits && (
        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Us in {city.name}?
            </h2>
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {cityLandingPage.aiBenefits}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      {cityLandingPage.contentSections && Array.isArray(cityLandingPage.contentSections) && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              {cityLandingPage.contentSections.map((section: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {section.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Social Proof */}
      <section className="py-12 px-4 bg-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Trusted by {city.name} Businesses
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers across {city.name}
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">10,000+</p>
              <p className="text-blue-100">Orders Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">4.8★</p>
              <p className="text-blue-100">Average Rating</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">24hr</p>
              <p className="text-blue-100">Rush Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {cityLandingPage.faqSchema && Array.isArray(cityLandingPage.faqSchema) && cityLandingPage.faqSchema.length > 0 && (
        <section id="faq" className="py-12 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {cityLandingPage.faqSchema.map((faq: any, index: number) => (
                <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <h3 className="text-lg font-bold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      {openFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === index && (
                      <p className="mt-4 text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Order your professional printing today and see the difference quality makes
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl"
            onClick={handleOrderNow}
          >
            Order Now - Fast & Easy
          </Button>
          {landingPageSet.discountEnabled && (
            <p className="mt-4 text-green-600 font-bold">
              ✓ {landingPageSet.discountPercent}% discount applied at checkout
            </p>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Phone className="h-8 w-8 mx-auto mb-3 text-blue-400" />
              <h3 className="font-bold mb-2">Call Us</h3>
              <p className="text-gray-400">1-555-PRINT-NOW</p>
            </div>
            <div>
              <Mail className="h-8 w-8 mx-auto mb-3 text-blue-400" />
              <h3 className="font-bold mb-2">Email Us</h3>
              <p className="text-gray-400">support@gangrunprinting.com</p>
            </div>
            <div>
              <MapPin className="h-8 w-8 mx-auto mb-3 text-blue-400" />
              <h3 className="font-bold mb-2">Location</h3>
              <p className="text-gray-400">Serving {city.name}, {city.stateCode}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
