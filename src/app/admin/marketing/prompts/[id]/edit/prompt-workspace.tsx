'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Save, Loader2 } from 'lucide-react'
import { PromptEditor } from './prompt-editor'
import { TestImageGrid } from './test-image-grid'
import type { PromptTemplate, PromptTestImage } from '@prisma/client'

interface PromptWorkspaceProps {
  prompt: PromptTemplate & {
    testImages: PromptTestImage[]
  }
}

export function PromptWorkspace({ prompt: initialPrompt }: PromptWorkspaceProps) {
  const router = useRouter()
  const [prompt, setPrompt] = useState(initialPrompt)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [images, setImages] = useState(initialPrompt.testImages)
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const handleGenerateImages = async () => {
    setIsGenerating(true)
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

        {/* Generate Button */}
        <Card className="border-dashed border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Generate Test Images</h3>
                <p className="text-sm text-muted-foreground">
                  Create 4 variations to test your prompt. Each generation counts as 1 iteration.
                </p>
              </div>
              <Button
                onClick={handleGenerateImages}
                disabled={isGenerating}
                size="lg"
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
              {isGenerating && (
                <p className="text-xs text-muted-foreground">
                  This will take about 8-10 seconds...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Test Images */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Test Images</CardTitle>
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
