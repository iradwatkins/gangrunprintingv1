/**
 * AI Product Designer Component
 *
 * Integrates with product creation page to generate AI content
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, Copy, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from '@/lib/toast'

interface AIProductDesignerProps {
  onContentGenerated?: (content: any) => void
  defaultProductName?: string
}

export function AIProductDesigner({
  onContentGenerated,
  defaultProductName = '',
}: AIProductDesignerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [productName, setProductName] = useState(defaultProductName)
  const [context, setContext] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/ai-agents/create-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          context,
          targetAudience,
          preview: true, // Get preview first (faster, no images)
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate content')
      }

      const data = await response.json()
      setResult(data)

      if (data.buildPhase) {
        toast.info('Build Phase: Follow instructions to generate content')
      } else {
        toast.success(`Content generated! SEO Score: ${data.seoContent.seoScore}/100`)
      }
    } catch (error) {
      console.error('Error generating content:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPrompt = () => {
    const prompt = result?.prompt || `Generate product: ${productName}`
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Prompt copied to clipboard!')
  }

  const handleUseContent = () => {
    if (result?.seoContent && onContentGenerated) {
      onContentGenerated(result.seoContent)
      setOpen(false)
      toast.success('Content applied to form!')
    }
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Sparkles className="h-4 w-4 text-purple-600" />
        AI Designer
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Product Designer
            </DialogTitle>
            <DialogDescription>Generate SEO-optimized product content using AI</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Input Form */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  placeholder="e.g., Business Cards 4x6"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="e.g., Premium 16pt cardstock, for professionals, luxury feel"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={2}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., Small business owners, Professionals"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!productName.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="border-t pt-4 space-y-4">
                {result.buildPhase ? (
                  // Build Phase Instructions
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900">Build Phase Mode</h3>
                        <p className="text-sm text-blue-800 mt-1">
                          Ask Claude Code the following in chat:
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-blue-300 rounded p-3">
                      <code className="text-sm text-blue-900 whitespace-pre-wrap">
                        {result.instructions}
                      </code>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyPrompt}
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy Prompt
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-4">
                      <Label>Paste Claude Code's JSON response here:</Label>
                      <Textarea
                        placeholder="Paste JSON from Claude Code here..."
                        rows={8}
                        className="mt-1 font-mono text-xs"
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value)
                            setResult({ ...result, seoContent: parsed })
                          } catch (err) {
                            // Invalid JSON, wait for complete input
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  // Production Mode Results
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">Content Generated</h3>
                      </div>
                      <div className="text-sm text-green-700">
                        SEO Score: {result.seoContent?.seoScore}/100
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Title:</span>
                        <p className="text-gray-700">{result.seoContent?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-gray-700 line-clamp-3">
                          {result.seoContent?.description}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Keywords:</span>
                        <p className="text-gray-700">
                          {result.seoContent?.primaryKeywords?.join(', ')}
                        </p>
                      </div>
                    </div>

                    <Button onClick={handleUseContent} className="w-full">
                      Use This Content
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
