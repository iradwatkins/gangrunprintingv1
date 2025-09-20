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

  const renderPreviewContent = (section: ContentSection) => {
    if (!section.isVisible) return null

    const { content } = section

    switch (section.sectionType) {
      case 'hero':
        return (
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
            <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
            <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-8">
                  {content.badge && (
                    <Badge className="inline-flex items-center gap-1 px-3 py-1">
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
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center">
                    <div className="text-6xl">🖨️</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )

      case 'features':
        return (
          <section className="py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  {content.title || 'Why Choose GangRun Printing?'}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {content.features?.map((feature: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
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
          <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
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

      default:
        return (
          <section className="py-8 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 capitalize">
                  {section.sectionType.replace('_', ' ')} Section
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