'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  ArrowLeft,
  Eye,
  Plus,
  Trash2,
  Move,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

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

export default function EditHomepagePage() {
  const params = useParams()
  const router = useRouter()
  const [homepage, setHomepage] = useState<HomepageVariant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingContent, setEditingContent] = useState<{ [key: string]: any }>({})

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

      // Initialize editing content state
      const contentState: { [key: string]: any } = {}
      data.content.forEach((section: ContentSection) => {
        contentState[section.sectionType] = { ...section.content }
      })
      setEditingContent(contentState)
    } catch (error) {
      console.error('Error fetching homepage:', error)
      alert('Failed to load homepage')
    } finally {
      setLoading(false)
    }
  }

  const updateContentSection = (sectionType: string, field: string, value: any) => {
    setEditingContent(prev => ({
      ...prev,
      [sectionType]: {
        ...prev[sectionType],
        [field]: value
      }
    }))
  }

  const saveContent = async () => {
    if (!homepage) return

    setSaving(true)
    try {
      const contentSections = homepage.content.map(section => ({
        sectionType: section.sectionType,
        content: editingContent[section.sectionType] || section.content,
        position: section.position,
        isVisible: section.isVisible
      }))

      const response = await fetch(`/api/home-pages/${homepage.id}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentSections }),
      })

      if (!response.ok) throw new Error('Failed to save content')

      alert('Content saved successfully!')
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const toggleSectionVisibility = async (sectionType: string) => {
    if (!homepage) return

    const section = homepage.content.find(s => s.sectionType === sectionType)
    if (!section) return

    try {
      const response = await fetch(`/api/home-pages/${homepage.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType,
          content: section.content,
          position: section.position,
          isVisible: !section.isVisible
        }),
      })

      if (!response.ok) throw new Error('Failed to update section visibility')

      setHomepage(prev => {
        if (!prev) return prev
        return {
          ...prev,
          content: prev.content.map(s =>
            s.sectionType === sectionType ? { ...s, isVisible: !s.isVisible } : s
          )
        }
      })
    } catch (error) {
      console.error('Error updating section visibility:', error)
      alert('Failed to update section visibility')
    }
  }

  const renderContentEditor = (section: ContentSection) => {
    const content = editingContent[section.sectionType] || section.content

    switch (section.sectionType) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`${section.sectionType}-headline`}>Headline</Label>
              <Input
                id={`${section.sectionType}-headline`}
                value={content.headline || ''}
                onChange={(e) => updateContentSection(section.sectionType, 'headline', e.target.value)}
                placeholder="Main headline"
              />
            </div>
            <div>
              <Label htmlFor={`${section.sectionType}-subtext`}>Subtext</Label>
              <Textarea
                id={`${section.sectionType}-subtext`}
                value={content.subtext || ''}
                onChange={(e) => updateContentSection(section.sectionType, 'subtext', e.target.value)}
                placeholder="Supporting text"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor={`${section.sectionType}-badge`}>Badge Text</Label>
              <Input
                id={`${section.sectionType}-badge`}
                value={content.badge || ''}
                onChange={(e) => updateContentSection(section.sectionType, 'badge', e.target.value)}
                placeholder="Badge text (e.g., ⚡ Limited Time Offer)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${section.sectionType}-cta`}>Primary CTA</Label>
                <Input
                  id={`${section.sectionType}-cta`}
                  value={content.ctaText || ''}
                  onChange={(e) => updateContentSection(section.sectionType, 'ctaText', e.target.value)}
                  placeholder="Start Your Order"
                />
              </div>
              <div>
                <Label htmlFor={`${section.sectionType}-cta-secondary`}>Secondary CTA</Label>
                <Input
                  id={`${section.sectionType}-cta-secondary`}
                  value={content.ctaSecondaryText || ''}
                  onChange={(e) => updateContentSection(section.sectionType, 'ctaSecondaryText', e.target.value)}
                  placeholder="Track Order"
                />
              </div>
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`${section.sectionType}-title`}>Section Title</Label>
              <Input
                id={`${section.sectionType}-title`}
                value={content.title || ''}
                onChange={(e) => updateContentSection(section.sectionType, 'title', e.target.value)}
                placeholder="Why Choose GangRun Printing?"
              />
            </div>
            <div>
              <Label>Features</Label>
              <div className="space-y-3">
                {content.features?.map((feature: any, index: number) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg">
                    <div>
                      <Label htmlFor={`feature-${index}-title`}>Feature Title</Label>
                      <Input
                        id={`feature-${index}-title`}
                        value={feature.title || ''}
                        onChange={(e) => {
                          const newFeatures = [...(content.features || [])]
                          newFeatures[index] = { ...feature, title: e.target.value }
                          updateContentSection(section.sectionType, 'features', newFeatures)
                        }}
                        placeholder="Feature title"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`feature-${index}-description`}>Description</Label>
                      <Input
                        id={`feature-${index}-description`}
                        value={feature.description || ''}
                        onChange={(e) => {
                          const newFeatures = [...(content.features || [])]
                          newFeatures[index] = { ...feature, description: e.target.value }
                          updateContentSection(section.sectionType, 'features', newFeatures)
                        }}
                        placeholder="Feature description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`${section.sectionType}-title`}>CTA Title</Label>
              <Input
                id={`${section.sectionType}-title`}
                value={content.title || ''}
                onChange={(e) => updateContentSection(section.sectionType, 'title', e.target.value)}
                placeholder="Ready to Start Your Project?"
              />
            </div>
            <div>
              <Label htmlFor={`${section.sectionType}-description`}>Description</Label>
              <Textarea
                id={`${section.sectionType}-description`}
                value={content.description || ''}
                onChange={(e) => updateContentSection(section.sectionType, 'description', e.target.value)}
                placeholder="Call to action description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${section.sectionType}-primary`}>Primary Button</Label>
                <Input
                  id={`${section.sectionType}-primary`}
                  value={content.primaryButton || ''}
                  onChange={(e) => updateContentSection(section.sectionType, 'primaryButton', e.target.value)}
                  placeholder="Browse Products"
                />
              </div>
              <div>
                <Label htmlFor={`${section.sectionType}-secondary`}>Secondary Button</Label>
                <Input
                  id={`${section.sectionType}-secondary`}
                  value={content.secondaryButton || ''}
                  onChange={(e) => updateContentSection(section.sectionType, 'secondaryButton', e.target.value)}
                  placeholder="Track Your Order"
                />
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div>
            <Label>Content (JSON)</Label>
            <Textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  setEditingContent(prev => ({
                    ...prev,
                    [section.sectionType]: parsed
                  }))
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-32 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/home-pages">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Edit Homepage: {homepage.name}</h1>
              {homepage.isActive && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{homepage.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/home-pages/${homepage.id}/preview`}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>
            <Button
              onClick={saveContent}
              disabled={saving}
              size="sm"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {homepage.content
            .sort((a, b) => a.position - b.position)
            .map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="capitalize">
                        {section.sectionType.replace('_', ' ')} Section
                      </CardTitle>
                      <CardDescription>
                        Position: {section.position} • {section.isVisible ? 'Visible' : 'Hidden'}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.isVisible}
                          onCheckedChange={() => toggleSectionVisibility(section.sectionType)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {section.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {renderContentEditor(section)}
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
          <Button
            onClick={saveContent}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving Changes...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}