'use client'

/**
 * PromptWorkspace - Redesigned October 27, 2025
 *
 * New Features:
 * - Quick-select modifier buttons (instead of free-text fields)
 * - Single image generation (not 4 variations)
 * - Vertical history timeline
 * - Live prompt preview
 * - Product type auto-updates prompt
 *
 * Workflow: Configure → Generate → Review → Adjust → Regenerate
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Loader2, Sparkles, Eye } from 'lucide-react'
import { ModifierSelector } from './modifier-selector'
import { GenerationHistory } from './generation-history'
import { previewPrompt } from '@/lib/ai/prompt-builder'
import type { PromptTemplate, PromptTestImage, PromptCategory, PromptStatus } from '@prisma/client'

interface SelectedModifiers {
  style: string[]
  technical: string[]
  negative: string[]
  holiday: string
  location: string
  camera: string
}

interface PromptWorkspaceProps {
  prompt: PromptTemplate & {
    testImages: PromptTestImage[]
  }
}

export function PromptWorkspace({ prompt: initialPrompt }: PromptWorkspaceProps) {
  const router = useRouter()

  // State
  const [prompt, setPrompt] = useState(initialPrompt)
  const [basePrompt, setBasePrompt] = useState(initialPrompt.promptText)
  const [promptName, setPromptName] = useState(initialPrompt.name)
  const [productType, setProductType] = useState(initialPrompt.productType || '')
  const [category, setCategory] = useState<PromptCategory>(initialPrompt.category)
  const [status, setStatus] = useState<PromptStatus>(initialPrompt.status)
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifiers>({
    style: [],
    technical: [],
    negative: [],
    holiday: '',
    location: '',
    camera: '',
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Load selected modifiers from database on mount
  useEffect(() => {
    if (initialPrompt.selectedModifiers) {
      const mods = initialPrompt.selectedModifiers as Record<string, unknown>
      setSelectedModifiers({
        style: (mods.style as string[]) || [],
        technical: (mods.technical as string[]) || [],
        negative: (mods.negative as string[]) || [],
        holiday: (mods.holiday as string) || '',
        location: (mods.location as string) || '',
        camera: (mods.camera as string) || '',
      })
    }
  }, [initialPrompt.selectedModifiers])

  // Generate preview of final prompt
  const promptPreview = previewPrompt({
    basePrompt,
    productType: productType || null,
    selectedModifiers,
  })

  // Handle generate single image
  const handleGenerate = async () => {
    setIsGenerating(true)
    setFeedbackMessage({
      type: 'info',
      message: 'Generating image... This may take 10-15 seconds.',
    })

    try {
      const response = await fetch(`/api/prompts/${prompt.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspectRatio: '4:3',
          imageSize: '2K',
          selectedModifiers,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate image')
      }

      const data = await response.json()

      // Refresh to get new image from database
      router.refresh()

      setFeedbackMessage({
        type: 'success',
        message: `Image generated successfully! (v${data.iteration})`,
      })
      setTimeout(() => setFeedbackMessage(null), 4000)
    } catch (error) {
      console.error('Error generating image:', error)
      setFeedbackMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate image',
      })
      setTimeout(() => setFeedbackMessage(null), 5000)
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle save prompt
  const handleSave = async () => {
    setIsSaving(true)
    setFeedbackMessage(null)

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: promptName,
          promptText: basePrompt,
          productType,
          category,
          status,
          selectedModifiers,
        }),
      })

      if (!response.ok) throw new Error('Failed to save prompt')

      setFeedbackMessage({
        type: 'success',
        message: 'Template saved successfully!',
      })
      setTimeout(() => setFeedbackMessage(null), 3000)
    } catch (error) {
      console.error('Error saving prompt:', error)
      setFeedbackMessage({
        type: 'error',
        message: 'Failed to save. Please try again.',
      })
      setTimeout(() => setFeedbackMessage(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete image
  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/prompts/${prompt.id}/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete image')

      router.refresh()

      setFeedbackMessage({
        type: 'success',
        message: 'Image deleted',
      })
      setTimeout(() => setFeedbackMessage(null), 2000)
    } catch (error) {
      console.error('Error deleting image:', error)
      setFeedbackMessage({
        type: 'error',
        message: 'Failed to delete image',
      })
      setTimeout(() => setFeedbackMessage(null), 3000)
    }
  }

  // Handle select winner
  const handleSelectWinner = async (imageId: string) => {
    try {
      const response = await fetch(`/api/prompts/${prompt.id}/images/${imageId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isWinner: true }),
      })

      if (!response.ok) throw new Error('Failed to update image')

      router.refresh()

      setFeedbackMessage({
        type: 'success',
        message: 'Winner selected!',
      })
      setTimeout(() => setFeedbackMessage(null), 2000)
    } catch (error) {
      console.error('Error selecting winner:', error)
      setFeedbackMessage({
        type: 'error',
        message: 'Failed to select winner',
      })
      setTimeout(() => setFeedbackMessage(null), 3000)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Feedback Message */}
      {feedbackMessage && (
        <div
          className={`m-6 mb-0 rounded-lg border p-4 ${
            feedbackMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : feedbackMessage.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}
        >
          <p className="text-sm font-medium">{feedbackMessage.message}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header Card - Template Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Template Configuration</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure your template and generate test images
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">v{prompt.currentIteration}</Badge>
                  <Button onClick={handleSave} disabled={isSaving} size="sm">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  placeholder="e.g., Business Card - Professional"
                />
              </div>

              {/* Product Type & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">Product Type</Label>
                  <Input
                    id="productType"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="Business Cards, Flyers, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as PromptCategory)}>
                    <SelectTrigger id="category">
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
              </div>
            </CardContent>
          </Card>

          {/* Base Prompt */}
          <Card>
            <CardHeader>
              <CardTitle>Base Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                rows={4}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Modifier Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Quick-Select Modifiers</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select modifiers to enhance your prompt
              </p>
            </CardHeader>
            <CardContent>
              <ModifierSelector
                selectedModifiers={selectedModifiers}
                onChange={setSelectedModifiers}
                promptId={prompt.id}
              />
            </CardContent>
          </Card>

          {/* Prompt Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prompt Preview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            {showPreview && (
              <CardContent className="space-y-4">
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
              </CardContent>
            )}
          </Card>

          {/* Generate Button */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h4 className="font-semibold">Ready to generate?</h4>
                <p className="text-sm text-muted-foreground">
                  Click below to create a test image with your current settings
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !basePrompt.trim()}
                size="lg"
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generation History */}
          <Card>
            <CardHeader>
              <CardTitle>Generation History</CardTitle>
            </CardHeader>
            <CardContent>
              <GenerationHistory
                images={prompt.testImages}
                onDelete={handleDeleteImage}
                onSelectWinner={handleSelectWinner}
                onTryAgain={handleGenerate}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
