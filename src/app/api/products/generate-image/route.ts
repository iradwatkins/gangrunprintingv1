/**
 * AI Image Generation API Route
 *
 * Generates product images using Google AI Imagen 4
 * Supports campaigns, diversity enhancement, and auto-SEO labeling
 */

import { type NextRequest, NextResponse } from 'next/server'
import { GoogleAIImageGenerator } from '@/lib/image-generation'
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { enhancePromptWithDiversity } from '@/lib/image-generation/diversity-enhancer'
import { generateSEOLabels } from '@/lib/image-generation/auto-seo-generator'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true,
})

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'gangrun-products'
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'

interface GenerateImageRequest {
  prompt: string
  productName?: string
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
  imageSize?: '1K' | '2K'
  // Campaign system fields
  campaignId?: string
  locale?: 'en' | 'es'
  cityName?: string
  stateName?: string
  productType?: string
  version?: number
}

/**
 * POST /api/products/generate-image
 *
 * Enhanced with campaign support, diversity, and auto-SEO
 *
 * Body:
 * {
 *   "prompt": "Professional photo of business cards",
 *   "locale": "en",                    // Auto-applies diversity
 *   "cityName": "Chicago",             // For auto-SEO labels
 *   "stateName": "Illinois",           // Optional
 *   "productType": "business-cards",   // For SEO and context
 *   "campaignId": "abc123",            // Optional: links to campaign
 *   "version": 1,                      // Optional: v1, v2, v3 for regenerations
 *   "aspectRatio": "1:1",              // For ChatGPT: always 1:1 (square)
 *   "imageSize": "1K"                  // For ChatGPT: 1K = 1024x1024
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateImageRequest = await request.json()
    const {
      prompt,
      productName,
      aspectRatio = '1:1', // ChatGPT requires square images (1024x1024)
      imageSize = '1K',
      campaignId,
      locale = 'en',
      cityName,
      stateName,
      productType,
      version = 1,
    } = body

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // STEP 1: Enhance prompt with diversity if locale provided
    let finalPrompt = prompt
    let diversityMetadata = null

    if (locale) {
      const enhanced = enhancePromptWithDiversity(prompt, {
        locale,
        productType,
        cityName,
      })
      finalPrompt = enhanced.prompt
      diversityMetadata = enhanced.diversityMetadata
    }

    // STEP 2: Generate SEO labels if city/product info provided
    let seoLabels = null
    if (cityName && productType && locale) {
      seoLabels = generateSEOLabels({
        cityName,
        stateName,
        productType,
        locale,
        version,
      })
    }

    // STEP 3: Generate the image with enhanced prompt
    const generator = new GoogleAIImageGenerator()
    const result = await generator.generateImage({
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio,
        imageSize,
        personGeneration: locale ? 'allow_adult' : 'dont_allow', // Allow people if locale specified
      },
    })

    // STEP 4: Determine storage path (campaign folder or drafts)
    const timestamp = Date.now()
    let filename: string

    if (campaignId) {
      // Store in campaign-specific folder
      const campaignSlug = await getCampaignSlug(campaignId)
      const seoFilename = seoLabels?.filename || `image-${timestamp}.png`
      filename = `campaigns/${campaignSlug}/${seoFilename}`
    } else {
      // Fallback to drafts folder (legacy)
      const sanitizedName = (productName || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 50)
      filename = `drafts/${sanitizedName}-${timestamp}.png`
    }

    // STEP 5: Upload to MinIO with enhanced metadata
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: result.buffer,
        ContentType: 'image/png',
        Metadata: {
          originalPrompt: prompt.substring(0, 500),
          enhancedPrompt: finalPrompt.substring(0, 500),
          generatedAt: result.generatedAt.toISOString(),
          aspectRatio,
          imageSize,
          locale: locale || '',
          cityName: cityName || '',
          productType: productType || '',
          version: version.toString(),
          ...(seoLabels && {
            alt: seoLabels.alt.substring(0, 200),
            title: seoLabels.title.substring(0, 100),
          }),
        },
      })
    )

    // Construct public URL
    const imageUrl = `${MINIO_PUBLIC_URL}/${BUCKET_NAME}/${filename}`

    // STEP 6: Save to database if campaign provided
    let dbImage = null
    if (campaignId && seoLabels) {
      dbImage = await prisma.image.create({
        data: {
          id: nanoid(),
          name: seoLabels.filename,
          url: imageUrl,
          alt: seoLabels.alt,
          description: seoLabels.description,
          category: 'ai-generated',
          tags: seoLabels.keywords,
          metadata: {
            aspectRatio,
            imageSize,
            seoLabels,
          },
          campaignId,
          locale,
          version,
          isActive: false, // Not active until approved
          originalPrompt: prompt,
          diversityMetadata,
          cityName,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        filename,
        originalPrompt: prompt,
        enhancedPrompt: finalPrompt,
        generatedAt: result.generatedAt,
        aspectRatio,
        imageSize,
        seoLabels,
        diversityMetadata,
        dbImageId: dbImage?.id,
        version,
      },
    })
  } catch (error: any) {
    console.error('Image generation error:', error)

    // Handle specific errors
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service not configured. Check API key.' },
        { status: 500 }
      )
    }

    if (error.message?.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment and try again.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Get campaign slug from ID
 */
async function getCampaignSlug(campaignId: string): Promise<string> {
  const campaign = await prisma.imageCampaign.findUnique({
    where: { id: campaignId },
    select: { slug: true },
  })
  return campaign?.slug || 'unknown-campaign'
}

/**
 * GET /api/products/generate-image?productName=business-cards
 *
 * Lists all draft versions for a product
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productName = searchParams.get('productName')

    if (!productName) {
      return NextResponse.json(
        { error: 'productName query parameter is required' },
        { status: 400 }
      )
    }

    const sanitizedName = productName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 50)

    const drafts = await listDraftVersions(sanitizedName)

    return NextResponse.json({
      success: true,
      data: {
        productName,
        drafts,
        count: drafts.length,
      },
    })
  } catch (error: any) {
    console.error('Error listing drafts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list draft versions' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/generate-image
 *
 * Delete a specific draft version or all drafts for a product
 *
 * Body:
 * {
 *   "filename": "drafts/business-cards-123456.png"  // Delete specific
 *   OR
 *   "productName": "business-cards",                // Delete all drafts
 *   "deleteAll": true
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, productName, deleteAll } = body

    if (deleteAll && productName) {
      // Delete all drafts for this product
      const sanitizedName = productName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 50)

      const drafts = await listDraftVersions(sanitizedName)

      // Delete each draft
      const { DeleteObjectsCommand } = await import('@aws-sdk/client-s3')
      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: drafts.map((draft) => ({ Key: draft.filename })),
          },
        })
      )

      return NextResponse.json({
        success: true,
        message: `Deleted ${drafts.length} draft versions`,
        deletedCount: drafts.length,
      })
    } else if (filename) {
      // Delete specific file
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filename,
        })
      )

      return NextResponse.json({
        success: true,
        message: 'Draft deleted successfully',
      })
    } else {
      return NextResponse.json(
        { error: 'Either filename or (productName + deleteAll) is required' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error deleting draft:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete draft' }, { status: 500 })
  }
}

/**
 * Helper: List all draft versions for a product name prefix
 */
async function listDraftVersions(productNamePrefix: string) {
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `drafts/${productNamePrefix}`,
    })
  )

  const drafts = (response.Contents || []).map((item) => ({
    filename: item.Key || '',
    url: `${MINIO_PUBLIC_URL}/${BUCKET_NAME}/${item.Key}`,
    size: item.Size || 0,
    lastModified: item.LastModified || new Date(),
  }))

  // Sort by newest first
  return drafts.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
}
