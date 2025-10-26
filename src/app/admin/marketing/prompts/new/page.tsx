'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function NewPromptPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'PRODUCT',
    productType: '',
    promptText: '',
    styleModifiers: '',
    technicalSpecs: '',
    negativePrompt: '',
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.productType || !formData.promptText) {
      alert('Please fill in all required fields')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create prompt')

      const prompt = await response.json()
      router.push(`/admin/marketing/prompts/${prompt.id}/edit`)
    } catch (error) {
      console.error('Error creating prompt:', error)
      alert('Failed to create prompt. Please try again.')
      setIsCreating(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div>
        <Link href="/admin/marketing/prompts">
          <Button variant="ghost" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prompts
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Create New Prompt
        </h1>
        <p className="text-muted-foreground mt-1">
          Build a custom prompt from scratch or browse templates
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Prompt Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Prompt Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Business Card Hero Shot"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRODUCT">Product</SelectItem>
                      <SelectItem value="PROMOTIONAL">Promotional</SelectItem>
                      <SelectItem value="SEASONAL">Seasonal</SelectItem>
                      <SelectItem value="LIFESTYLE">Lifestyle</SelectItem>
                      <SelectItem value="ENVIRONMENT">Environment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productType">
                    Product Type <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="productType"
                    value={formData.productType}
                    onChange={(e) => handleChange('productType', e.target.value)}
                    placeholder="e.g., Business Cards"
                  />
                </div>
              </div>
            </div>

            {/* Prompt Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promptText">
                  Base Prompt <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="promptText"
                  value={formData.promptText}
                  onChange={(e) => handleChange('promptText', e.target.value)}
                  placeholder="Describe the core image concept..."
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The main description of what you want to see in the image
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="styleModifiers">Style Modifiers</Label>
                <Textarea
                  id="styleModifiers"
                  value={formData.styleModifiers}
                  onChange={(e) => handleChange('styleModifiers', e.target.value)}
                  placeholder="e.g., studio lighting, clean background, professional..."
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicalSpecs">Technical Specs</Label>
                <Textarea
                  id="technicalSpecs"
                  value={formData.technicalSpecs}
                  onChange={(e) => handleChange('technicalSpecs', e.target.value)}
                  placeholder="e.g., 4k resolution, sharp focus, high quality..."
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="negativePrompt">Negative Prompt</Label>
                <Textarea
                  id="negativePrompt"
                  value={formData.negativePrompt}
                  onChange={(e) => handleChange('negativePrompt', e.target.value)}
                  placeholder="e.g., blurry, low quality, watermark..."
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <Link href="/admin/marketing/prompts" className="flex-1">
                <Button variant="outline" className="w-full" disabled={isCreating}>
                  Cancel
                </Button>
              </Link>
              <Button onClick={handleCreate} disabled={isCreating} className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' : 'Create Prompt'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
