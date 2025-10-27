'use client'

/**
 * Product SEO Validator Component
 *
 * Purpose: Validate and score product names for SEO quality using AI
 *
 * Features:
 * - Validate button → Analyzes product name
 * - SEO score display (0-100) with color coding
 * - 5-dimension analysis breakdown
 * - Improvement suggestions
 * - Optimized name suggestion
 *
 * Date: October 27, 2025
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, AlertTriangle, XCircle, Lightbulb, TrendingUp } from 'lucide-react'
import toast from '@/lib/toast'

interface SEOValidatorProps {
  productId: string
  productName: string
  categoryName?: string
  description?: string
}

interface ValidationResult {
  score: number
  category: 'excellent' | 'good' | 'fair' | 'poor'
  analysis: {
    keywordScore: number
    lengthScore: number
    clarityScore: number
    intentScore: number
    uniquenessScore: number
  }
  suggestions: string[]
  optimizedName?: string
}

export function ProductSEOValidator({
  productId,
  productName,
  categoryName,
  description,
}: SEOValidatorProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)

  const handleValidate = async () => {
    setIsValidating(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}/validate-seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to validate SEO')
      }

      const data = await response.json()
      setResult(data.validation)

      if (data.validation.score >= 90) {
        toast.success(`Excellent SEO score: ${data.validation.score}/100`)
      } else if (data.validation.score >= 70) {
        toast.success(`Good SEO score: ${data.validation.score}/100`)
      } else {
        toast.warning(`SEO needs improvement: ${data.validation.score}/100`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate SEO'
      toast.error(message)
    } finally {
      setIsValidating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (category: string) => {
    if (category === 'excellent') return 'default'
    if (category === 'good') return 'secondary'
    if (category === 'fair') return 'outline'
    return 'destructive'
  }

  const getScoreIcon = (category: string) => {
    if (category === 'excellent') return <CheckCircle className="h-4 w-4" />
    if (category === 'good') return <TrendingUp className="h-4 w-4" />
    if (category === 'fair') return <AlertTriangle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              SEO Name Validation
            </CardTitle>
            <CardDescription className="mt-1.5">
              AI-powered analysis of product name SEO quality
            </CardDescription>
          </div>
          <Button onClick={handleValidate} disabled={isValidating} size="sm">
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Validate SEO
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Product Name Display */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Current Product Name</p>
          <p className="font-medium">{productName}</p>
          {categoryName && (
            <p className="text-xs text-muted-foreground mt-1">Category: {categoryName}</p>
          )}
        </div>

        {/* Validation Result */}
        {result && (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="rounded-lg border p-4 bg-background">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">SEO Score</h3>
                <Badge variant={getScoreBadgeVariant(result.category)} className="gap-1">
                  {getScoreIcon(result.category)}
                  {result.category.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                  <span className="text-xl text-muted-foreground">/100</span>
                </div>
                <div className="flex-1">
                  <Progress value={result.score} className="h-2" />
                </div>
              </div>
            </div>

            {/* 5-Dimension Analysis */}
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-3">Detailed Analysis</h3>
              <div className="space-y-3">
                {Object.entries(result.analysis).map(([key, score]) => {
                  const label = key
                    .replace(/Score$/, '')
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .replace(/^\w/, (c) => c.toUpperCase())

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={`font-medium ${getScoreColor(score)}`}>
                          {score}/100
                        </span>
                      </div>
                      <Progress value={score} className="h-1.5" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Improvement Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                      Improvement Suggestions
                    </h3>
                    <ul className="space-y-1.5">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Optimized Name Suggestion */}
            {result.optimizedName && (
              <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-900 mb-2">
                      Suggested Optimized Name
                    </h3>
                    <p className="font-medium text-green-800">{result.optimizedName}</p>
                    <p className="text-xs text-green-700 mt-2">
                      This name includes better keywords and is optimized for search engines
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info when not validated */}
        {!result && !isValidating && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Click "Validate SEO" to analyze this product name
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
