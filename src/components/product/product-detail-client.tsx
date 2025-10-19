'use client'

import { useEffect, useState } from 'react'
import { Clock, Check } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductImageGallery } from './ProductImageGallery'
import SimpleQuantityTest from './SimpleQuantityTest'
import { AddonAccordion } from './addons/AddonAccordion'
import { TechnicalSpecsTable, getDefaultSpecs } from './TechnicalSpecsTable'
import { HowItWorksSection } from './HowItWorksSection'
import { TrustBadgesSection, TrustBadgesCompact } from './TrustBadgesSection'
import { CitySpecificSection, getDefaultCityData } from './CitySpecificSection'
import { ComparisonTable, getCategoryComparison } from './ComparisonTable'
import { logViewItem } from '@/components/GoogleAnalytics'

interface ProductImage {
  id: string
  url: string
  thumbnailUrl?: string | null
  largeUrl?: string | null
  mediumUrl?: string | null
  webpUrl?: string | null
  blurDataUrl?: string | null
  alt?: string | null
  caption?: string | null
  isPrimary: boolean
  sortOrder: number
  width?: number | null
  height?: number | null
  fileSize?: number | null
  mimeType?: string | null
  createdAt?: Date
  updatedAt?: Date
  productId?: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  basePrice: number
  setupFee: number
  productionTime: number
  isActive: boolean
  ProductCategory: {
    id: string
    name: string
  }
  City?: {
    id: string
    name: string
    stateCode: string
  } | null
  ProductImage: ProductImage[]
  productPaperStockSets: Array<{
    paperStockSet: {
      id: string
      name: string
      description?: string
      paperStockItems: Array<{
        id: string
        paperStock: {
          id: string
          name: string
          description?: string
        }
        isDefault: boolean
        sortOrder: number
      }>
    }
    isDefault: boolean
  }>
  productQuantityGroups: Array<{
    quantityGroup: {
      id: string
      name: string
      values: string
      defaultValue: string
    }
  }>
  productSizeGroups: Array<{
    sizeGroup: {
      id: string
      name: string
      values: string
      defaultValue: string
    }
  }>
  seoFaqs?: Array<{
    question: string
    answer: string
  }> | null
  metadata?: {
    benefits?: Array<{
      icon: string
      title: string
      description: string
    }>
    useCases?: string[]
    testimonials?: Array<{
      quote: string
      author: string
      location: string
      rating: number
      verifiedPurchase?: boolean
      date?: string
    }>
    guarantees?: string[]
    eeat?: {
      experience: string
      expertise: string
      authority: string
      trust: string
    }
    technicalSpecs?: {
      finishedSize?: string
      designSize?: string
      bleed?: string
      minResolution?: string
      fileFormats?: string[]
      colorSpace?: string
      paperOptions?: string[]
      coatingOptions?: string[]
      uspsCompliant?: boolean
    }
    cityContext?: {
      population?: number | null
      topIndustries?: string[]
      neighborhoods?: string[]
      shippingNotes?: string
    }
  } | null
}

interface CustomerImage {
  id: string
  url: string
  thumbnailUrl?: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

interface ProductDetailClientProps {
  product: Product
  configuration?: any // Product configuration from server
}

// Helper function to convert icon names to emojis
function getIconForName(iconName: string): string {
  const iconMap: Record<string, string> = {
    target: '🎯',
    clock: '⏰',
    'dollar-sign': '💰',
    'shield-check': '🛡️',
    truck: '🚚',
    star: '⭐',
    check: '✓',
    award: '🏆',
  }
  return iconMap[iconName] || '✓'
}

export default function ProductDetailClient({ product, configuration }: ProductDetailClientProps) {
  // Debug logging
  console.log('[ProductDetailClient] Received props:', {
    productId: product?.id,
    hasConfiguration: !!configuration,
    quantitiesCount: configuration?.quantities?.length || 0,
  })

  // Track product view in Google Analytics
  useEffect(() => {
    if (product) {
      logViewItem({
        item_id: product.id,
        item_name: product.name,
        price: product.basePrice / 100,
        category: product.ProductCategory?.name || 'Uncategorized',
      })
    }
  }, [product])

  // Generate technical specs (use metadata if exists, otherwise use defaults)
  const technicalSpecs = product.metadata?.technicalSpecs
    ? Object.entries(product.metadata.technicalSpecs)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([name, value]) => ({
          name: name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
          value: Array.isArray(value) ? value.join(', ') : String(value),
        }))
    : getDefaultSpecs(product.ProductCategory.name)

  // City context for location-specific products
  const cityData = product.City
    ? {
        name: product.City.name,
        stateCode: product.City.stateCode,
        ...product.metadata?.cityContext,
      }
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        href="/products"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images - Now using optimized gallery */}
        <div>
          <ProductImageGallery
            enableLightbox={true}
            enableZoom={true}
            images={product.ProductImage}
            productCategory={product.ProductCategory.name}
            productName={product.name}
            showThumbnails={true}
          />
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <Badge className="mb-2" variant="secondary">
              {product.ProductCategory.name}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.description}</p>
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {product.productionTime} business days
              </div>
            </div>

            {/* Trust badges - above the fold for conversion */}
            <TrustBadgesCompact />
          </div>

          <Tabs className="mb-6" defaultValue="customize">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-6" value="customize">
              {product.id ? (
                <SimpleQuantityTest
                  addons={
                    configuration?.addons
                      ? configuration.addons.filter((addon: any) => {
                          const addonId = addon.id?.toLowerCase() || ''
                          const addonName = addon.name?.toLowerCase() || ''

                          // Exclude ONLY file upload and artwork addons, KEEP design addons
                          return !(
                            addonId.includes('upload') ||
                            addonId.includes('file') ||
                            addonId.includes('artwork') ||
                            addonName.includes('upload') ||
                            addonName.includes('file') ||
                            addonName.includes('artwork')
                          )
                        })
                      : []
                  }
                  addonsGrouped={
                    configuration?.addons
                      ? (() => {
                          const filtered = configuration.addons.filter((addon: any) => {
                            const addonId = addon.id?.toLowerCase() || ''
                            const addonName = addon.name?.toLowerCase() || ''

                            // Exclude ONLY file upload and artwork addons, KEEP design addons
                            return !(
                              addonId.includes('upload') ||
                              addonId.includes('file') ||
                              addonId.includes('artwork') ||
                              addonName.includes('upload') ||
                              addonName.includes('file') ||
                              addonName.includes('artwork')
                            )
                          })

                          // Group by displayPosition from database configuration
                          return {
                            aboveDropdown: filtered.filter(
                              (addon: any) => addon.displayPosition === 'ABOVE_DROPDOWN'
                            ),
                            inDropdown: filtered.filter(
                              (addon: any) =>
                                !addon.displayPosition ||
                                addon.displayPosition === 'IN_DROPDOWN'
                            ),
                            belowDropdown: filtered.filter(
                              (addon: any) => addon.displayPosition === 'BELOW_DROPDOWN'
                            ),
                          }
                        })()
                      : { aboveDropdown: [], inDropdown: [], belowDropdown: [] }
                  }
                  initialConfiguration={configuration}
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    productionTime: product.productionTime,
                    ProductImage: product.ProductImage,
                  }}
                  productId={product.id}
                  onAddonChange={(addonId: string, selected: boolean) => {
                    // console.log('Addon changed:', addonId, selected)
                  }}
                />
              ) : (
                <div className="p-4 text-red-500">
                  Error: Product ID is missing. Cannot load configuration.
                </div>
              )}
            </TabsContent>

            <TabsContent className="space-y-4" value="specifications">
              <div>
                <h3 className="font-semibold mb-2">Product Specifications</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category:</dt>
                    <dd>{product.ProductCategory.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Production Time:</dt>
                    <dd>{product.productionTime} business days</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Setup Fee:</dt>
                    <dd>${product.setupFee.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Professional quality printing
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Free design review
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    100% satisfaction guarantee
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Fast turnaround times
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Benefits Section */}
      {product.metadata?.benefits && product.metadata.benefits.length > 0 && (
        <div className="mt-16 w-full bg-muted/30 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Our Postcards?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {product.metadata.benefits.map((benefit, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">{getIconForName(benefit.icon)}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Use Cases Section */}
      {product.metadata?.useCases && product.metadata.useCases.length > 0 && (
        <div className="mt-16 w-full">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Popular Uses</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {product.metadata.useCases.map((useCase, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{useCase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      {product.metadata?.testimonials && product.metadata.testimonials.length > 0 && (
        <div className="mt-16 w-full bg-primary/5 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">What Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {product.metadata.testimonials.map((testimonial, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border shadow-sm">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-500 text-lg">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm italic mb-4 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  {testimonial.verifiedPurchase && (
                    <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
                      <Check className="h-3 w-3" />
                      Verified Purchase
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* E-E-A-T Signals & Guarantees */}
      {(product.metadata?.eeat || product.metadata?.guarantees) && (
        <div className="mt-16 w-full">
          <div className="max-w-4xl mx-auto px-4">
            {/* Experience Statement */}
            {product.metadata?.eeat?.experience && (
              <div className="mb-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Our Experience</h2>
                <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  {product.metadata.eeat.experience}
                </p>
              </div>
            )}

            {/* Trust Badges */}
            {product.metadata?.eeat && (
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold text-sm mb-1">Experience</h3>
                  <p className="text-xs text-muted-foreground">15+ Years</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">⭐</div>
                  <h3 className="font-semibold text-sm mb-1">Rating</h3>
                  <p className="text-xs text-muted-foreground">4.8/5 Stars</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🏆</div>
                  <h3 className="font-semibold text-sm mb-1">Orders</h3>
                  <p className="text-xs text-muted-foreground">50,000+ Completed</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="font-semibold text-sm mb-1">Secure</h3>
                  <p className="text-xs text-muted-foreground">SSL Encrypted</p>
                </div>
              </div>
            )}

            {/* Guarantees */}
            {product.metadata?.guarantees && product.metadata.guarantees.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-center">Our Promise to You</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {product.metadata.guarantees.map((guarantee, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card"
                    >
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm leading-relaxed">{guarantee}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Specifications Table */}
      <TechnicalSpecsTable specs={technicalSpecs} />

      {/* How It Works - 4 Step Process */}
      <HowItWorksSection />

      {/* FAQ Section */}
      {product.seoFaqs && product.seoFaqs.length > 0 && (
        <div className="mt-16 w-full">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center px-4">Frequently Asked Questions</h2>
            <div className="space-y-4 px-4">
              {product.seoFaqs.map((faq, index) => (
                <details
                  key={index}
                  className="group border border-border rounded-lg p-6 hover:shadow-md transition-shadow bg-card"
                >
                  <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center gap-4">
                    <span className="flex-1">{faq.question}</span>
                    <span className="flex-shrink-0 text-muted-foreground group-open:rotate-180 transition-transform">
                      <svg
                        fill="none"
                        height="20"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-muted-foreground leading-relaxed pr-8">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table - Show competitive advantage */}
      <ComparisonTable
        customComparison={getCategoryComparison(product.ProductCategory.name)}
        productCategory={product.ProductCategory.name}
      />

      {/* Trust Badges Section - Full version */}
      <TrustBadgesSection variant="default" />

      {/* City-Specific Section - Only for location-based products */}
      {cityData && <CitySpecificSection city={cityData} productName={product.name} />}
    </div>
  )
}
