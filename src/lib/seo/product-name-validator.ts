/**
 * Product Name SEO Validator (AI-Powered)
 *
 * Purpose: Validate and score product names for SEO quality using AI
 *
 * Features:
 * - SEO score (0-100)
 * - Keyword analysis
 * - Length optimization
 * - Clarity and specificity check
 * - Improvement suggestions
 *
 * Date: October 27, 2025
 */

import { GoogleGenAI } from '@google/genai'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Product name validation result
 */
export interface ProductNameValidationResult {
  /** Overall SEO score (0-100) */
  score: number

  /** Score category */
  category: 'excellent' | 'good' | 'fair' | 'poor'

  /** Detailed analysis breakdown */
  analysis: {
    /** Keyword presence and relevance */
    keywordScore: number
    /** Length optimization (ideal 50-60 chars) */
    lengthScore: number
    /** Clarity and specificity */
    clarityScore: number
    /** Search intent matching */
    intentScore: number
    /** Uniqueness and differentiation */
    uniquenessScore: number
  }

  /** List of improvement suggestions */
  suggestions: string[]

  /** Optimized name suggestion (if needed) */
  optimizedName?: string
}

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Product category for context */
  categoryName?: string
  /** Product description for context */
  description?: string
  /** Generate optimized name suggestion */
  suggestOptimization?: boolean
}

// ============================================================================
// SEO VALIDATOR CLASS
// ============================================================================

export class ProductNameSEOValidator {
  private genai: GoogleGenAI

  constructor() {
    const apiKey = process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is required')
    }
    this.genai = new GoogleGenAI({ apiKey })
  }

  /**
   * Validate a product name for SEO quality
   */
  async validateProductName(
    productName: string,
    options: ValidationOptions = {}
  ): Promise<ProductNameValidationResult> {
    const { categoryName, description, suggestOptimization = true } = options

    // Build the AI prompt
    const prompt = this.buildValidationPrompt(productName, categoryName, description, suggestOptimization)

    try {
      // Call Google Gemini API
      const model = this.genai.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()

      // Parse the structured JSON response
      const parsed = this.parseAIResponse(responseText)

      return parsed
    } catch (error) {
      console.error('Error validating product name:', error)
      // Return fallback basic validation
      return this.basicValidation(productName)
    }
  }

  /**
   * Build the AI prompt for product name validation
   */
  private buildValidationPrompt(
    productName: string,
    categoryName?: string,
    description?: string,
    suggestOptimization?: boolean
  ): string {
    const contextParts = []
    if (categoryName) contextParts.push(`Category: ${categoryName}`)
    if (description) contextParts.push(`Description: ${description}`)
    const context = contextParts.length > 0 ? `\n\nContext:\n${contextParts.join('\n')}` : ''

    return `You are an SEO expert specializing in e-commerce product optimization for a printing company.

Analyze this product name for SEO quality:
Product Name: "${productName}"${context}

Evaluate the product name based on these criteria (score each 0-100):
1. Keyword Score: Does it include relevant search keywords customers would use?
2. Length Score: Is it optimal length? (Ideal: 50-60 characters, Max: 70)
3. Clarity Score: Is it clear and specific about what the product is?
4. Intent Score: Does it match user search intent and commercial queries?
5. Uniqueness Score: Is it differentiated from generic competitors?

Provide your analysis in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{
  "score": <overall score 0-100>,
  "category": "<excellent|good|fair|poor>",
  "analysis": {
    "keywordScore": <number>,
    "lengthScore": <number>,
    "clarityScore": <number>,
    "intentScore": <number>,
    "uniquenessScore": <number>
  },
  "suggestions": [
    "<specific improvement suggestion 1>",
    "<specific improvement suggestion 2>",
    ...
  ]${suggestOptimization ? ',\n  "optimizedName": "<your suggested optimized product name>"' : ''}
}

Rules:
- Score 90-100: "excellent" - Perfect for SEO, no changes needed
- Score 70-89: "good" - Solid name, minor improvements possible
- Score 50-69: "fair" - Needs improvement for better SEO
- Score 0-49: "poor" - Major issues, significant changes needed
- Provide 2-5 specific, actionable suggestions
- Keep suggestions concise and practical
${suggestOptimization ? '- If score < 70, provide an optimized name that includes relevant keywords' : ''}

Respond ONLY with the JSON object, no other text.`
  }

  /**
   * Parse AI response into structured result
   */
  private parseAIResponse(responseText: string): ProductNameValidationResult {
    try {
      // Clean up response - remove markdown code blocks if present
      let cleaned = responseText.trim()
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }

      const parsed = JSON.parse(cleaned)

      // Validate and ensure all required fields exist
      return {
        score: Math.min(100, Math.max(0, parsed.score || 0)),
        category: parsed.category || this.getCategoryFromScore(parsed.score),
        analysis: {
          keywordScore: Math.min(100, Math.max(0, parsed.analysis?.keywordScore || 0)),
          lengthScore: Math.min(100, Math.max(0, parsed.analysis?.lengthScore || 0)),
          clarityScore: Math.min(100, Math.max(0, parsed.analysis?.clarityScore || 0)),
          intentScore: Math.min(100, Math.max(0, parsed.analysis?.intentScore || 0)),
          uniquenessScore: Math.min(100, Math.max(0, parsed.analysis?.uniquenessScore || 0)),
        },
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        optimizedName: parsed.optimizedName || undefined,
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      throw error
    }
  }

  /**
   * Get category from score
   */
  private getCategoryFromScore(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 90) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
  }

  /**
   * Basic fallback validation (if AI fails)
   */
  private basicValidation(productName: string): ProductNameValidationResult {
    const length = productName.length
    const lengthScore = length >= 10 && length <= 70 ? 80 : length < 10 ? 40 : 60

    // Basic keyword check
    const hasKeywords = /business|card|flyer|brochure|banner|poster|print|custom|premium|professional/i.test(
      productName
    )
    const keywordScore = hasKeywords ? 70 : 40

    // Basic clarity check (not all caps, has spaces)
    const isAllCaps = productName === productName.toUpperCase()
    const hasSpaces = productName.includes(' ')
    const clarityScore = !isAllCaps && hasSpaces ? 70 : 50

    const overallScore = Math.round((lengthScore + keywordScore + clarityScore) / 3)

    return {
      score: overallScore,
      category: this.getCategoryFromScore(overallScore),
      analysis: {
        keywordScore,
        lengthScore,
        clarityScore,
        intentScore: 50,
        uniquenessScore: 50,
      },
      suggestions: [
        'Add specific product keywords (e.g., "Premium", "Custom", "Professional")',
        'Include product category in name for better search visibility',
        'Keep length between 50-60 characters for optimal SEO',
      ],
    }
  }
}

/**
 * Convenience function to validate a product name
 */
export async function validateProductName(
  productName: string,
  options?: ValidationOptions
): Promise<ProductNameValidationResult> {
  const validator = new ProductNameSEOValidator()
  return validator.validateProductName(productName, options)
}
