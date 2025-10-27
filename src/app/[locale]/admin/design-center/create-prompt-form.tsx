'use client'

/**
 * CreatePromptForm - Unified Template Creation
 *
 * Includes modifier selectors directly in create form
 * Date: October 27, 2025
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Sparkles, Eye } from 'lucide-react'
import { ModifierSelector } from './[id]/edit/modifier-selector'
import { previewPrompt } from '@/lib/ai/prompt-builder'

interface SelectedModifiers {
  style: string[]
  technical: string[]
  negative: string[]
  holiday: string
  location: string
  camera: string
}

export function CreatePromptForm() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'PRODUCT',
    productType: '',
    promptText: '',
  })
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifiers>({
    style: [],
    technical: [],
    negative: [],
    holiday: '',
    location: '',
    camera: '',
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Generate preview of final prompt
  const promptPreview = previewPrompt({
    basePrompt: formData.promptText,
    productType: formData.productType || null,
    selectedModifiers,
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.productType || !formData.promptText) {
      alert('Please fill in Template Name, Product Type, and Base Prompt')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selectedModifiers,
        }),
      })

      if (!response.ok) throw new Error('Failed to create prompt')

      const prompt = await response.json()
      router.push(`/admin/design-center/${prompt.id}/edit`)
    } catch (error) {
      console.error('Error creating prompt:', error)
      alert('Failed to create prompt. Please try again.')
      setIsCreating(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: '',
      category: 'PRODUCT',
      productType: '',
      promptText: '',
    })
    setSelectedModifiers({
      style: [],
      technical: [],
      negative: [],
      holiday: '',
      location: '',
      camera: '',
    })
  }

  return (
    <div className="max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your template with quick-select modifiers and generate test images
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Template Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Business Card - Professional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
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
                  placeholder="Business Cards, Flyers, etc."
                />
              </div>
            </div>
          </div>

          {/* Base Prompt */}
          <div className="space-y-2">
            <Label htmlFor="promptText">
              Base Prompt <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="promptText"
              value={formData.promptText}
              onChange={(e) => handleChange('promptText', e.target.value)}
              placeholder="Describe what you want to generate..."
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              The main description of what you want in the image
            </p>
          </div>

          {/* Modifier Selectors */}
          <div className="space-y-2">
            <Label>Quick-Select Modifiers</Label>
            <p className="text-xs text-muted-foreground mb-4">
              Click to select modifiers that will enhance your prompt
            </p>
            <ModifierSelector
              selectedModifiers={selectedModifiers}
              onChange={setSelectedModifiers}
            />
          </div>

          {/* Prompt Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Prompt Preview</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? 'Hide' : 'Show'}
              </Button>
            </div>
            {showPreview && (
              <div className="space-y-4 rounded-lg border p-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Positive Prompt</Label>
                  <div className="mt-1 rounded-md bg-muted p-3 font-mono text-xs">
                    {promptPreview.positive || <span className="text-muted-foreground">Empty</span>}
                  </div>
                </div>
                {promptPreview.negative && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Negative Prompt</Label>
                    <div className="mt-1 rounded-md bg-destructive/10 p-3 font-mono text-xs">
                      {promptPreview.negative}
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Word count: {promptPreview.wordCount}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isCreating}
              onClick={handleReset}
            >
              Reset Form
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-1"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isCreating ? 'Creating...' : 'Create & Start Testing'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
