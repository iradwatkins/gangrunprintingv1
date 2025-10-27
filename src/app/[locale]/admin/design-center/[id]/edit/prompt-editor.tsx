'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { ReferenceImageUploader } from './reference-image-uploader'
import type { PromptTemplate } from '@prisma/client'

interface ReferenceImage {
  url: string
  name: string
}

interface PromptEditorProps {
  prompt: PromptTemplate
  onSave: (data: Partial<PromptTemplate>) => Promise<void>
  isSaving: boolean
}

export function PromptEditor({ prompt, onSave, isSaving }: PromptEditorProps) {
  // Parse reference images from JSON
  const initialReferenceImages: ReferenceImage[] = Array.isArray(prompt.referenceImages)
    ? (prompt.referenceImages as unknown as ReferenceImage[])
    : []

  const [formData, setFormData] = useState({
    name: prompt.name,
    category: prompt.category,
    productType: prompt.productType || '',
    promptText: prompt.promptText,
    styleModifiers: prompt.styleModifiers || '',
    technicalSpecs: prompt.technicalSpecs || '',
    negativePrompt: prompt.negativePrompt || '',
    referenceImages: initialReferenceImages,
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleReferenceImagesChange = (images: ReferenceImage[]) => {
    setFormData((prev) => ({ ...prev, referenceImages: images }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    // Convert referenceImages to JSON-compatible format
    const saveData = {
      ...formData,
      referenceImages: formData.referenceImages as any, // Type assertion for Prisma JsonValue
    }
    await onSave(saveData)
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Prompt Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Business Card Hero Shot"
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
            <Label htmlFor="productType">Product Type</Label>
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
          <Label htmlFor="promptText">Base Prompt</Label>
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
          <Label htmlFor="styleModifiers">Style Modifiers (Optional)</Label>
          <Textarea
            id="styleModifiers"
            value={formData.styleModifiers}
            onChange={(e) => handleChange('styleModifiers', e.target.value)}
            placeholder="e.g., studio lighting, clean background, professional..."
            rows={3}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Add style and aesthetic preferences
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="technicalSpecs">Technical Specs (Optional)</Label>
          <Textarea
            id="technicalSpecs"
            value={formData.technicalSpecs}
            onChange={(e) => handleChange('technicalSpecs', e.target.value)}
            placeholder="e.g., 4k resolution, sharp focus, high quality..."
            rows={3}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Technical quality and specifications
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
          <Textarea
            id="negativePrompt"
            value={formData.negativePrompt}
            onChange={(e) => handleChange('negativePrompt', e.target.value)}
            placeholder="e.g., blurry, low quality, watermark..."
            rows={3}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Things to avoid in the generated image
          </p>
        </div>
      </div>

      {/* Reference Images */}
      <div className="pt-4 border-t">
        <ReferenceImageUploader
          images={formData.referenceImages}
          onChange={handleReferenceImagesChange}
        />
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="w-full"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
        </Button>
      </div>

      {/* Full Prompt Preview */}
      <div className="space-y-2">
        <Label>Full Prompt Preview</Label>
        <div className="p-4 bg-muted rounded-lg font-mono text-sm">
          {[formData.promptText, formData.styleModifiers, formData.technicalSpecs]
            .filter(Boolean)
            .join(', ')}
        </div>
      </div>
    </div>
  )
}
