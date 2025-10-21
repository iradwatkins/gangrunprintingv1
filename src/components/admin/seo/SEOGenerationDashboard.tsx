'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Product {
  id: string
  name: string
  slug: string
  categoryName: string
  cityName?: string
  stateCode?: string
  hasSEOContent: boolean
  seoContentApproved: boolean
}

interface SEOContent {
  id: string
  productId: string
  content: string
  wordCount: number
  model: string
  approved: boolean
  generatedAt: string
  city?: string
  state?: string
}

interface GenerationResult {
  productId: string
  productName: string
  success: boolean
  content?: string
  wordCount?: number
  generationTime?: number
  error?: string
}

export function SEOGenerationDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [wordCount, setWordCount] = useState(150)
  const [temperature, setTemperature] = useState(0.7)
  const [generating, setGenerating] = useState(false)
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([])
  const [previewContent, setPreviewContent] = useState<SEOContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [bulkGenerating, setBulkGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Load products
  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const response = await fetch('/api/admin/seo/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateSingleProduct() {
    if (!selectedProduct) return

    setGenerating(true)
    const product = products.find((p) => p.id === selectedProduct)

    try {
      const response = await fetch('/api/admin/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          wordCount,
          temperature,
          forceRegenerate: true,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setGenerationResults([
          {
            productId: selectedProduct,
            productName: product?.name || 'Unknown',
            success: true,
            content: result.content,
            wordCount: result.wordCount,
            generationTime: result.generationTime,
          },
        ])
        setPreviewContent(result)
        await loadProducts() // Refresh list
      } else {
        setGenerationResults([
          {
            productId: selectedProduct,
            productName: product?.name || 'Unknown',
            success: false,
            error: result.error || 'Generation failed',
          },
        ])
      }
    } catch (error) {
      setGenerationResults([
        {
          productId: selectedProduct,
          productName: product?.name || 'Unknown',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ])
    } finally {
      setGenerating(false)
    }
  }

  async function generateBulk() {
    const productsToGenerate = products.filter((p) => !p.hasSEOContent || !p.seoContentApproved)

    if (productsToGenerate.length === 0) {
      alert('All products already have approved SEO content')
      return
    }

    if (
      !confirm(
        `Generate SEO content for ${productsToGenerate.length} products? This may take several minutes.`
      )
    ) {
      return
    }

    setBulkGenerating(true)
    setProgress(0)
    const results: GenerationResult[] = []

    for (let i = 0; i < productsToGenerate.length; i++) {
      const product = productsToGenerate[i]

      try {
        const response = await fetch('/api/admin/seo/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            wordCount,
            temperature,
            forceRegenerate: false, // Use cache if exists
          }),
        })

        const result = await response.json()

        results.push({
          productId: product.id,
          productName: product.name,
          success: response.ok,
          content: result.content,
          wordCount: result.wordCount,
          generationTime: result.generationTime,
          error: response.ok ? undefined : result.error,
        })
      } catch (error) {
        results.push({
          productId: product.id,
          productName: product.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      setProgress(((i + 1) / productsToGenerate.length) * 100)
    }

    setGenerationResults(results)
    setBulkGenerating(false)
    await loadProducts()
  }

  async function approveContent(contentId: string) {
    try {
      const response = await fetch('/api/admin/seo/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      })

      if (response.ok) {
        await loadProducts()
        if (previewContent?.id === contentId) {
          setPreviewContent({ ...previewContent, approved: true })
        }
      }
    } catch (error) {
      console.error('Failed to approve content:', error)
    }
  }

  const productsWithoutSEO = products.filter((p) => !p.hasSEOContent)
  const productsWithUnapprovedSEO = products.filter((p) => p.hasSEOContent && !p.seoContentApproved)
  const productsWithApprovedSEO = products.filter((p) => p.seoContentApproved)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Content</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsWithApprovedSEO.length}</div>
            <p className="text-xs text-muted-foreground">
              {products.length > 0
                ? Math.round((productsWithApprovedSEO.length / products.length) * 100)
                : 0}
              % complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsWithUnapprovedSEO.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Content</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsWithoutSEO.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs className="space-y-4" defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">Single Product</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Single Product Generation */}
        <TabsContent className="space-y-4" value="single">
          <Card>
            <CardHeader>
              <CardTitle>Generate SEO Content</CardTitle>
              <CardDescription>
                Generate AI-powered SEO content for a single product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}{' '}
                          {product.seoContentApproved && (
                            <Badge className="ml-2" variant="outline">
                              Approved
                            </Badge>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Word Count</Label>
                  <Input
                    max={300}
                    min={100}
                    type="number"
                    value={wordCount}
                    onChange={(e) => setWordCount(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Temperature (0.5 = consistent, 0.9 = creative)</Label>
                  <Input
                    max={0.9}
                    min={0.5}
                    step={0.1}
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <Button disabled={!selectedProduct || generating} onClick={generateSingleProduct}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>

              {previewContent && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Preview</h3>
                    <div className="flex gap-2">
                      <Badge>{previewContent.wordCount} words</Badge>
                      <Badge variant={previewContent.approved ? 'default' : 'secondary'}>
                        {previewContent.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <Textarea
                    readOnly
                    className="min-h-[200px]"
                    value={previewContent.content}
                  />
                  {!previewContent.approved && (
                    <Button onClick={() => approveContent(previewContent.id)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve & Publish
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Generation */}
        <TabsContent className="space-y-4" value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Generation</CardTitle>
              <CardDescription>
                Generate SEO content for all products without approved content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will generate content for {productsWithoutSEO.length + productsWithUnapprovedSEO.length}{' '}
                  products. Each generation takes 1-2 minutes.
                  <br />
                  <strong>Estimated time: {Math.round(((productsWithoutSEO.length + productsWithUnapprovedSEO.length) * 1.5) / 60)} hours</strong>
                </AlertDescription>
              </Alert>

              {bulkGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <Button
                disabled={bulkGenerating || productsWithoutSEO.length === 0}
                onClick={generateBulk}
              >
                {bulkGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating... ({Math.round(progress)}%)
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate for All Products
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results */}
        <TabsContent className="space-y-4" value="results">
          <Card>
            <CardHeader>
              <CardTitle>Generation Results</CardTitle>
              <CardDescription>Recent generation attempts</CardDescription>
            </CardHeader>
            <CardContent>
              {generationResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No results yet</p>
              ) : (
                <div className="space-y-2">
                  {generationResults.map((result, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{result.productName}</p>
                        {result.success && (
                          <p className="text-sm text-muted-foreground">
                            {result.wordCount} words in {result.generationTime}ms
                          </p>
                        )}
                        {!result.success && (
                          <p className="text-sm text-destructive">{result.error}</p>
                        )}
                      </div>
                      {result.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
