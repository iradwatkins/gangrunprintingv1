/**
 * Product Image Generation API Endpoint
 *
 * POST /api/admin/products/[id]/generate-image
 *
 * Purpose: Generate AI images for products using category prompt templates
 *
 * Date: October 27, 2025
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { generateProductImage } from '@/lib/ai/product-image-generator'
import { z } from 'zod'

const generateImageSchema = z.object({
  aspectRatio: z.enum(['1:1', '3:4', '4:3', '9:16', '16:9']).optional(),
  imageSize: z.enum(['1K', '2K']).optional(),
  isPrimary: z.boolean().optional(),
})

/**
 * POST /api/admin/products/[id]/generate-image
 * Generate an AI image for a product using its category's prompt template
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication check
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin-only endpoint
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}))
    const config = generateImageSchema.parse(body)

    // 3. Generate the product image
    const result = await generateProductImage({
      productId: params.id,
      aspectRatio: config.aspectRatio,
      imageSize: config.imageSize,
      isPrimary: config.isPrimary,
    })

    // 4. Return result
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate product image' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      imageId: result.imageId,
      imageUrl: result.imageUrl,
      message: 'Product image generated successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error generating product image:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate product image',
      },
      { status: 500 }
    )
  }
}
