'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Copy } from 'lucide-react'
import type { PromptTemplate } from '@prisma/client'

interface TemplateGridProps {
  templates: PromptTemplate[]
}

export function TemplateGrid({ templates }: TemplateGridProps) {
  const router = useRouter()
  const [usingTemplate, setUsingTemplate] = useState<string | null>(null)

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
      router.push(`/admin/marketing/prompts/${promptId}/edit`)
    } catch (error) {
      console.error('Error using template:', error)
      alert('Failed to use template. Please try again.')
      setUsingTemplate(null)
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
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col">
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
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleUseTemplate(template.id)}
              disabled={usingTemplate === template.id}
            >
              <Copy className="h-4 w-4 mr-2" />
              {usingTemplate === template.id ? 'Creating...' : 'Use Template'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
