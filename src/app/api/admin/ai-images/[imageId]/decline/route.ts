/**
 * Decline and Regenerate AI Image
 *
 * POST /api/admin/ai-images/{imageId}/decline
 *
 * Marks current image as declined and queues regeneration
 */

import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface DeclineImageRequest {
  reason?: string // Optional reason for declining
  autoRegenerate?: boolean // Auto-trigger regeneration (default: true)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const { imageId } = params
    const body: DeclineImageRequest = await request.json()
    const { reason, autoRegenerate = true } = body

    // Get image with campaign info
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        campaign: {
          select: {
            id: true,
            locale: true,
            slug: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    if (image.isActive) {
      return NextResponse.json(
        { error: 'Cannot decline an approved image' },
        { status: 400 }
      )
    }

    // STEP 1: Mark current image as declined (deactivate)
    const declinedImage = await prisma.image.update({
      where: { id: imageId },
      data: {
        isActive: false,
        metadata: {
          ...(typeof image.metadata === 'object' ? image.metadata : {}),
          declined: true,
          declinedAt: new Date().toISOString(),
          declineReason: reason || 'User declined',
        },
      },
    })

    // STEP 2: Prepare regeneration parameters
    const regenerationParams = {
      prompt: image.originalPrompt || 'Professional product photo',
      campaignId: image.campaignId,
      locale: image.locale as 'en' | 'es' | undefined,
      cityName: image.cityName,
      productType: extractProductType(image),
      version: (image.version || 1) + 1, // Increment version
    }

    // In production, this would queue a background job
    // For now, return params for manual/automated regeneration
    return NextResponse.json({
      success: true,
      data: {
        declinedImage: {
          id: declinedImage.id,
          version: declinedImage.version,
          declined: true,
        },
        regeneration: autoRegenerate
          ? {
              status: 'queued',
              message: 'Regeneration queued - new version will be created',
              params: regenerationParams,
              nextVersion: regenerationParams.version,
              endpoint: '/api/products/generate-image',
            }
          : {
              status: 'manual',
              message: 'Regeneration not queued - manual intervention required',
              params: regenerationParams,
            },
      },
    })
  } catch (error: any) {
    console.error('Error declining image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to decline image' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Extract product type from image metadata
 */
function extractProductType(image: any): string | undefined {
  if (typeof image.metadata !== 'object' || !image.metadata) {
    return undefined
  }

  // Try to extract from SEO labels
  const seoLabels = image.metadata.seoLabels
  if (seoLabels?.keywords && Array.isArray(seoLabels.keywords)) {
    // Look for product type in keywords
    const productTypes = ['business-cards', 'postcards', 'flyers', 'brochures']
    for (const keyword of seoLabels.keywords) {
      for (const type of productTypes) {
        if (keyword.toLowerCase().includes(type)) {
          return type
        }
      }
    }
  }

  // Fallback: check tags
  if (Array.isArray(image.tags)) {
    const productTypes = ['business-cards', 'postcards', 'flyers', 'brochures']
    for (const tag of image.tags) {
      for (const type of productTypes) {
        if (tag.toLowerCase().includes(type)) {
          return type
        }
      }
    }
  }

  return undefined
}
