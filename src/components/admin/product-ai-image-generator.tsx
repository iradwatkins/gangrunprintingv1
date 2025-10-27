'use client'

/**
 * Product AI Image Generator Component
 *
 * Purpose: Generate AI images for products using category prompt templates
 *
 * Features:
 * - Generate button → Creates image from product name + category template
 * - Refresh button → Regenerates with same prompt (AI natural variation)
 * - Image gallery display
 * - Set as primary image option
 * - Loading and error states
 *
 * Date: October 27, 2025
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, RefreshCw, Star, AlertCircle } from 'lucide-react'
import toast from '@/lib/toast'

interface AIImageGeneratorProps {
  productId: string
  productName: string
  categoryName?: string
}

interface GeneratedImage {
  id: string
  imageUrl: string
}

export function ProductAIImageGenerator({
  productId,
  productName,
  categoryName,
}: AIImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastGenerated, setLastGenerated] = useState<GeneratedImage | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/products/${productId}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspectRatio: '4:3',
          imageSize: '2K',
          isPrimary: false, // Don't auto-set as primary
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const data = await response.json()

      setLastGenerated({
        id: data.imageId,
        imageUrl: data.imageUrl,
      })

      toast.success('Image generated successfully!')

      // Reload page to show new image in main gallery
      window.location.reload()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate image'
      setError(message)
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefresh = async () => {
    // Refresh is just generating again with same prompt
    await handleGenerate()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Image Generation
            </CardTitle>
            <CardDescription className="mt-1.5">
              Generate product images using AI based on "{productName}"
              {categoryName && ` in ${categoryName}`}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Powered by Google Imagen
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-destructive">Generation Failed</p>
              <p className="text-destructive/90 mt-1">{error}</p>
              {error.includes('no prompt template') && (
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Assign a prompt template to this product's category first in Design Center
                </p>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">How it works:</span>
            <br />
            1. We use your category's prompt template
            <br />
            2. Substitute product-specific details (name, dimensions, etc.)
            <br />
            3. Generate unique AI image
            <br />
            4. Click "Refresh" to create variations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>

          {lastGenerated && !isGenerating && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="lg"
              className="flex-shrink-0"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>

        {/* Last Generated Preview */}
        {lastGenerated && (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Last Generated Image</p>
              <Badge className="text-xs">
                <Star className="mr-1 h-3 w-3" />
                New
              </Badge>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={lastGenerated.imageUrl}
                alt="AI Generated"
                className="object-contain w-full h-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Image has been added to the product gallery above. Reload page to see it.
            </p>
          </div>
        )}

        {/* Quick Tips */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>💡 <span className="font-medium">Tip:</span> Each generation creates a unique image</p>
          <p>🔄 <span className="font-medium">Refresh:</span> Regenerates using same prompt with AI variation</p>
          <p>⚙️ <span className="font-medium">Customize:</span> Edit category prompt template in Design Center</p>
        </div>
      </CardContent>
    </Card>
  )
}
