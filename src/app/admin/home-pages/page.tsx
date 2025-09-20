'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Eye,
  Edit,
  Power,
  Clock,
  Layout,
  CheckCircle,
  Circle,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface HomepageVariant {
  id: string
  name: string
  type: string
  description: string | null
  isActive: boolean
  isEnabled: boolean
  sortOrder: number
  lastActivatedAt: string | null
  activatedBy: string | null
  createdAt: string
  updatedAt: string
  content: Array<{
    id: string
    sectionType: string
    content: any
    position: number
    isVisible: boolean
  }>
}

export default function HomePagesAdmin() {
  const [homepages, setHomepages] = useState<HomepageVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<string | null>(null)

  useEffect(() => {
    fetchHomepages()
  }, [])

  const fetchHomepages = async () => {
    try {
      const response = await fetch('/api/home-pages')
      if (!response.ok) throw new Error('Failed to fetch homepages')
      const data = await response.json()
      setHomepages(data)
    } catch (error) {
      console.error('Error fetching homepages:', error)
      alert('Failed to load homepage variants')
    } finally {
      setLoading(false)
    }
  }

  const activateHomepage = async (id: string) => {
    setActivating(id)
    try {
      const response = await fetch(`/api/home-pages/${id}/activate`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to activate homepage')

      const data = await response.json()
      alert(`${data.homepage.name} is now active`)

      // Update local state
      setHomepages(prev => prev.map(hp => ({
        ...hp,
        isActive: hp.id === id
      })))
    } catch (error) {
      console.error('Error activating homepage:', error)
      alert('Failed to activate homepage variant')
    } finally {
      setActivating(null)
    }
  }

  const toggleEnabled = async (id: string, isEnabled: boolean) => {
    try {
      const response = await fetch(`/api/home-pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled }),
      })

      if (!response.ok) throw new Error('Failed to update homepage')

      setHomepages(prev => prev.map(hp =>
        hp.id === id ? { ...hp, isEnabled } : hp
      ))

      console.log(`Homepage ${isEnabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error updating homepage:', error)
      alert('Failed to update homepage')
    }
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      'LIMITED_TIME_OFFER': '⚡',
      'FEATURED_PRODUCT': '⭐',
      'NEW_CUSTOMER_WELCOME': '🎉',
      'SEASONAL_HOLIDAY': '🎄',
      'BULK_VOLUME_DISCOUNTS': '📦',
      'FAST_TURNAROUND': '🚀',
      'LOCAL_COMMUNITY': '🏘️',
    }
    return icons[type as keyof typeof icons] || '📄'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(7)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Homepage Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your 7 marketing-focused homepage experiences. Only one can be active at a time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-2">
                <Layout className="h-3 w-3" />
                {homepages.length} Variants
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link href="/" target="_blank" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Live Site
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-lg font-semibold">
                      {homepages.find(hp => hp.isActive)?.name || 'None'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Circle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enabled</p>
                    <p className="text-lg font-semibold">
                      {homepages.filter(hp => hp.isEnabled).length} / {homepages.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-lg font-semibold">
                      {formatDate(homepages.find(hp => hp.isActive)?.lastActivatedAt || null)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                    <Layout className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Content Sections</p>
                    <p className="text-lg font-semibold">
                      {homepages.reduce((acc, hp) => acc + hp.content.length, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Homepage Variants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {homepages.map((homepage) => (
            <Card
              key={homepage.id}
              className={`relative transition-all hover:shadow-lg ${
                homepage.isActive ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getTypeIcon(homepage.type)}</div>
                    <div>
                      <CardTitle className="text-lg">{homepage.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {homepage.description}
                      </CardDescription>
                    </div>
                  </div>

                  {homepage.isActive && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Status and Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={homepage.isEnabled}
                      onCheckedChange={(checked) => toggleEnabled(homepage.id, checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {homepage.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {homepage.content.filter(c => c.isVisible).length} sections
                  </div>
                </div>

                {/* Activation Button */}
                {homepage.isEnabled && !homepage.isActive && (
                  <Button
                    onClick={() => activateHomepage(homepage.id)}
                    disabled={activating === homepage.id}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Power className="h-4 w-4" />
                    {activating === homepage.id ? 'Activating...' : 'Activate'}
                  </Button>
                )}

                {homepage.isActive && (
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      Currently Active Homepage
                    </p>
                    <p className="text-xs text-green-600">
                      Last activated: {formatDate(homepage.lastActivatedAt)}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" variant="outline" className="flex-1 gap-2">
                    <Link href={`/admin/home-pages/${homepage.id}/edit`}>
                      <Edit className="h-3 w-3" />
                      Edit
                    </Link>
                  </Button>

                  <Button asChild size="sm" variant="outline" className="flex-1 gap-2">
                    <Link href={`/admin/home-pages/${homepage.id}/preview`}>
                      <Eye className="h-3 w-3" />
                      Preview
                    </Link>
                  </Button>
                </div>

                {/* Meta Information */}
                <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                  <div>Created: {formatDate(homepage.createdAt)}</div>
                  <div>Updated: {formatDate(homepage.updatedAt)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}