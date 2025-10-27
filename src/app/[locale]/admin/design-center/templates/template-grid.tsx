'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Copy, ImageIcon, Loader2, Trash2 } from 'lucide-react'
import type { PromptTemplate } from '@prisma/client'

interface TemplateGridProps {
  templates: (PromptTemplate & {
    testImages: { id: string }[]
  })[]
}

// Component to lazy load individual images
function TemplateImage({ imageId, templateName }: { imageId?: string; templateName: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!imageId) {
      setLoading(false)
      return
    }

    fetch(`/api/prompts/test-images/${imageId}`)
      .then((res) => res.json())
      .then((data) => {
        setImageUrl(data.imageUrl)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [imageId])

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={`${templateName} sample`}
      className="absolute inset-0 w-full h-full object-cover"
    />
  )
}

export function TemplateGrid({ templates: initialTemplates }: TemplateGridProps) {
  const router = useRouter()
  const [usingTemplate, setUsingTemplate] = useState<string | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<string | null>(null)
  const [templates, setTemplates] = useState(initialTemplates)

  const handleUseTemplate = async (templateId: string) => {
    setUsingTemplate(templateId)
    try {
      const response = await fetch('/api/prompts/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      })

      if (!response.ok) throw new Error('Failed to create prompt from template')

      const { promptId } = await response.json()
      router.push(`/admin/design-center/${promptId}/edit`)
    } catch (error) {
      console.error('Error using template:', error)
      alert('Failed to use template. Please try again.')
      setUsingTemplate(null)
    }
  }

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"? This cannot be undone.`)) {
      return
    }

    setDeletingTemplate(templateId)
    try {
      const response = await fetch(`/api/prompts/${templateId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete template')

      // Remove from local state
      setTemplates((prev) => prev.filter((t) => t.id !== templateId))
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template. Please try again.')
      setDeletingTemplate(null)
    }
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No templates in this category yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => {
        const imageId = template.testImages[0]?.id

        return (
          <Card key={template.id} className="flex flex-col overflow-hidden">
            {/* Sample Product Image - Lazy loaded */}
            <div className="relative w-full aspect-square bg-muted">
              <TemplateImage imageId={imageId} templateName={template.name} />
            </div>

            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <Badge variant="outline" className="mt-1">
                      {template.productType}
                    </Badge>
                  </CardDescription>
                </div>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.promptText}
                </p>
                {template.styleModifiers && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Style:</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.styleModifiers}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                className="flex-1"
                onClick={() => handleUseTemplate(template.id)}
                disabled={usingTemplate === template.id || deletingTemplate === template.id}
              >
                <Copy className="h-4 w-4 mr-2" />
                {usingTemplate === template.id ? 'Creating...' : 'Use Template'}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteTemplate(template.id, template.name)}
                disabled={deletingTemplate === template.id || usingTemplate === template.id}
                title="Delete template"
              >
                {deletingTemplate === template.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
