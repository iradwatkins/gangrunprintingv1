/**
 * AI Prompt Optimizer - Gemini-powered prompt variation generator
 *
 * Uses Google Gemini 2.0 Flash to analyze and improve image generation prompts
 * Generates 4 variations: lighting, composition, and 2 style variations
 */

import { GoogleGenAI } from '@google/genai'

export interface PromptVariation {
  type: 'lighting' | 'composition' | 'style'
  modifiedPrompt: string
  explanation: string
  priority: number // 1-4
}

export class PromptOptimizer {
  private client: GoogleGenAI
  private readonly model = 'gemini-2.0-flash-exp'

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_AI_STUDIO_API_KEY

    if (!key) {
      throw new Error(
        'Google AI Studio API key not found. ' +
          'Set GOOGLE_AI_STUDIO_API_KEY environment variable or pass apiKey to constructor.'
      )
    }

    this.client = new GoogleGenAI({ apiKey: key })
  }

  /**
   * Generate 4 variations of a prompt (lighting, composition, 2x style)
   */
  async generateVariations(basePrompt: string): Promise<PromptVariation[]> {
    const systemPrompt = `You are an expert product photography prompt engineer for AI image generation.

Your task: Given a base prompt, create EXACTLY 4 improved variations optimized for Google Imagen.

**Variation Requirements:**
1. **Lighting variation** - Modify lighting style only (studio/natural/dramatic/soft/backlit)
2. **Composition variation** - Change camera angle/perspective only (straight-on/45-degree/overhead/close-up/wide-shot)
3. **Style variation #1** - Professional vs lifestyle aesthetic
4. **Style variation #2** - Vibrant/energetic vs minimalist/clean

**Critical Rules:**
- Modify ONLY the specified aspect per variation
- Keep all other elements consistent with the base prompt
- Use Imagen-optimized keywords (professional photography, studio quality, commercial shoot)
- Avoid negative phrasing - describe what TO include
- Keep prompts concise (under 200 characters per variation)

**Output Format:** Return ONLY valid JSON array with NO markdown, NO explanation text:

[
  {
    "type": "lighting",
    "modifiedPrompt": "concise improved prompt here",
    "explanation": "why this lighting improves the image",
    "priority": 1
  },
  {
    "type": "composition",
    "modifiedPrompt": "concise improved prompt here",
    "explanation": "why this composition improves the image",
    "priority": 2
  },
  {
    "type": "style",
    "modifiedPrompt": "concise improved prompt here",
    "explanation": "professional/lifestyle style improvement",
    "priority": 3
  },
  {
    "type": "style",
    "modifiedPrompt": "concise improved prompt here",
    "explanation": "vibrant/minimalist style improvement",
    "priority": 4
  }
]

Remember: Return ONLY the JSON array, nothing else.`

    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\n**Base Prompt:**\n"${basePrompt}"\n\n**Generate 4 variations as JSON array:**`,
              },
            ],
          },
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      })

      const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        throw new Error('No text response from Gemini')
      }

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = text.trim()

      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '')

      // Find JSON array
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        console.error('Failed to parse Gemini response:', text)
        throw new Error('Failed to extract JSON array from Gemini response')
      }

      const variations = JSON.parse(jsonMatch[0]) as PromptVariation[]

      // Validate we got exactly 4 variations
      if (variations.length !== 4) {
        console.warn(`Expected 4 variations, got ${variations.length}`)
      }

      return variations
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error(`Failed to generate variations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Analyze generated images and recommend winners
   * Note: Gemini 2.0 Flash supports multimodal (text + images)
   */
  async analyzeGeneratedImages(
    variations: Array<{ type: string; prompt: string; imageDataUrl: string }>
  ): Promise<string> {
    const systemPrompt = `You are an expert product photography critic.

**Task:** Analyze these 4 AI-generated product images and rank them from best to worst.

**Evaluation Criteria:**
- Image clarity and sharpness
- Professional appearance
- Lighting quality
- Composition and framing
- Color balance
- Commercial viability

**Output Format:**
Provide a clear ranking (1st, 2nd, 3rd, 4th) with brief explanations.

Example:
🥇 **1st Place - Lighting Variation**
Excellent dramatic backlight creates depth and professional appeal.

🥈 **2nd Place - Composition Variation**
45-degree angle adds visual interest without sacrificing clarity.

🥉 **3rd Place - Style Variation #1**
Good overall but slightly busy composition.

**4th Place - Style Variation #2**
Too minimalist, lacks visual interest.`

    try {
      // Prepare multimodal content (images + text)
      const parts: any[] = [{ text: systemPrompt }]

      for (let i = 0; i < variations.length; i++) {
        const v = variations[i]

        // Add image
        if (v.imageDataUrl.startsWith('data:image')) {
          // Extract base64 data
          const base64Data = v.imageDataUrl.split(',')[1]
          const mimeType = v.imageDataUrl.match(/data:(image\/[^;]+)/)?.[1] || 'image/png'

          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          })
        }

        parts.push({
          text: `**Image ${i + 1} (${v.type} variation)**\nPrompt: "${v.prompt}"`,
        })
      }

      parts.push({
        text: '\n**Now rank these 4 images from best to worst with explanations:**',
      })

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          temperature: 0.5,
          maxOutputTokens: 1000,
        },
      })

      const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        throw new Error('No analysis response from Gemini')
      }

      return text
    } catch (error) {
      console.error('Gemini analysis error:', error)
      // Fallback if multimodal fails
      return `Analysis unavailable. Please review the generated images manually based on:\n- Clarity and sharpness\n- Professional appearance\n- Lighting quality\n- Composition\n- Commercial viability`
    }
  }
}

/**
 * Convenience function to generate variations
 */
export async function generatePromptVariations(basePrompt: string): Promise<PromptVariation[]> {
  const optimizer = new PromptOptimizer()
  return optimizer.generateVariations(basePrompt)
}

/**
 * Convenience function to analyze images
 */
export async function analyzeImages(
  variations: Array<{ type: string; prompt: string; imageDataUrl: string }>
): Promise<string> {
  const optimizer = new PromptOptimizer()
  return optimizer.analyzeGeneratedImages(variations)
}
