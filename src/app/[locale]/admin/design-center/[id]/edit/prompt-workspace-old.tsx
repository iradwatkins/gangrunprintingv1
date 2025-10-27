'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Save, Loader2, Wand2 } from 'lucide-react'
import { PromptEditor } from './prompt-editor'
import { TestImageGrid } from './test-image-grid'
import { AIVariationGrid } from './ai-variation-grid'
import type { PromptTemplate, PromptTestImage } from '@prisma/client'

interface AIVariation {
  id: string
  imageUrl: string
  type: 'lighting' | 'composition' | 'style'
  prompt: string
  explanation: string
  priority: number
}

interface PromptWorkspaceProps {
  prompt: PromptTemplate & {
    testImages: PromptTestImage[]
  }
}

export function PromptWorkspace({ prompt: initialPrompt }: PromptWorkspaceProps) {
  const router = useRouter()
  const [prompt, setPrompt] = useState(initialPrompt)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAIGenerating, setIsAIGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [images, setImages] = useState(initialPrompt.testImages)
  const [aiVariations, setAIVariations] = useState<AIVariation[] | null>(null)
  const [aiAnalysis, setAIAnalysis] = useState<string | null>(null)
  const [selectedWinners, setSelectedWinners] = useState<string[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const handleGenerateImages = async () => {
    setIsGenerating(true)
    setAIVariations(null) // Clear AI variations when doing manual generation
    try {
      const response = await fetch(`/api/prompts/${prompt.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspectRatio: '4:3',
          imageSize: '2K',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate images')
      }

      const data = await response.json()

      // Refresh page to get new images from database
      router.refresh()

      // Show success message
      setFeedbackMessage({
        type: 'success',
        message: `Successfully generated ${data.images.length} images! (Iteration ${prompt.currentIteration})`,
      })
      setTimeout(() => setFeedbackMessage(null), 5000)
    } catch (error) {
      console.error('Error generating images:', error)
      setFeedbackMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate images. Please try again.',
      })
      setTimeout(() => setFeedbackMessage(null), 5000)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAIGenerateImages = async () => {
    setIsAIGenerating(true)
    setAIVariations(null)
    setAIAnalysis(null)
    setSelectedWinners([])

    try {
      setFeedbackMessage({
        type: 'info',
        message: 'AI is analyzing your prompt and generating 4 variations... This will take about 15-20 seconds.',
      })

      const response = await fetch(`/api/prompts/${prompt.id}/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate AI variations')
      }

      const data = await response.json()

      // Set AI variations and analysis
      setAIVariations(data.images)
      setAIAnalysis(data.aiAnalysis)

      // Refresh page to get new images in database
      router.refresh()

      // Show success message
      setFeedbackMessage({
        type: 'success',
        message: `Successfully generated ${data.count} AI variations! Review them below and select your favorites.`,
      })
      setTimeout(() => setFeedbackMessage(null), 8000)
    } catch (error) {
      console.error('Error generating AI variations:', error)
      setFeedbackMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate AI variations. Please try again.',
      })
      setTimeout(() => setFeedbackMessage(null), 5000)
    } finally {
      setIsAIGenerating(false)
    }
  }

  const handleSelectWinner = (variationId: string) => {
    setSelectedWinners((prev) =>
      prev.includes(variationId)
        ? prev.filter((id) => id !== variationId)
        : [...prev, variationId]
    )
  }

  const handleSavePrompt = async (updatedData: Partial<PromptTemplate>) => {
    setIsSaving(true)
    setFeedbackMessage(null)
    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) throw new Error('Failed to save prompt')

      const updated = await response.json()
      setPrompt({ ...prompt, ...updated })

      setFeedbackMessage({
        type: 'success',
        message: 'Prompt saved successfully!',
      })
      setTimeout(() => setFeedbackMessage(null), 3000)
    } catch (error) {
      console.error('Error saving prompt:', error)
      setFeedbackMessage({
        type: 'error',
        message: 'Failed to save prompt. Please try again.',
      })
      setTimeout(() => setFeedbackMessage(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Feedback Message */}
      {feedbackMessage && (
        <div
          className={`p-4 m-6 mb-0 rounded-lg ${
            feedbackMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : feedbackMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <p className="text-sm font-medium">{feedbackMessage.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 flex-1 overflow-auto">
        {/* Left Panel: Prompt Editor */}
        <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Prompt Editor</span>
              <Badge variant="outline">Iteration {prompt.currentIteration}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PromptEditor
              prompt={prompt}
              onSave={handleSavePrompt}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>

        {/* Generate Buttons */}
        <Card className="border-dashed border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Manual Generation */}
              <div className="text-center space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">Standard Generation</h3>
                  <p className="text-xs text-muted-foreground">
                    Generate 4 identical images to test your prompt
                  </p>
                </div>
                <Button
                  onClick={handleGenerateImages}
                  disabled={isGenerating || isAIGenerating}
                  size="lg"
                  variant="outline"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate 4 Test Images
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              {/* AI-Assisted Generation */}
              <div className="text-center space-y-3">
                <div>
                  <h3 className="font-semibold mb-1 flex items-center justify-center gap-2">
                    <Wand2 className="h-4 w-4 text-purple-600" />
                    AI-Assisted Generation
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Let AI suggest 4 optimized variations (lighting, composition, style)
                  </p>
                </div>
                <Button
                  onClick={handleAIGenerateImages}
                  disabled={isGenerating || isAIGenerating}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                >
                  {isAIGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI is working...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      AI-Assisted Generate
                    </>
                  )}
                </Button>
                {isAIGenerating && (
                  <p className="text-xs text-muted-foreground">
                    This will take 15-20 seconds... ✨
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Test Images / AI Variations */}
      <div className="space-y-4">
        {/* AI Variation Grid (when available) */}
        {aiVariations && aiVariations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-600" />
                AI-Generated Variations
                <Badge variant="secondary" className="ml-auto">
                  {selectedWinners.length} selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIVariationGrid
                variations={aiVariations}
                aiAnalysis={aiAnalysis || ''}
                onSelectWinner={handleSelectWinner}
                selectedWinners={selectedWinners}
              />
            </CardContent>
          </Card>
        )}

        {/* Regular Test Images */}
        <Card>
          <CardHeader>
            <CardTitle>
              {aiVariations && aiVariations.length > 0
                ? 'Previous Test Images'
                : 'Test Images'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TestImageGrid images={images} promptId={prompt.id} />
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}
