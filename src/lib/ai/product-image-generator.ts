/**
 * Product Image Generator Service
 *
 * Purpose: Generate product images using category prompt templates
 *
 * Workflow:
 * 1. Fetch product data (name, description, category, dimensions)
 * 2. Get category's prompt template
 * 3. Build prompt with product variable substitution
 * 4. Generate image using AI
 * 5. Save to ProductImage table
 *
 * Date: October 27, 2025
 */

import { prisma } from '@/lib/prisma'
import { GoogleAIImageGenerator } from '@/lib/image-generation/google-ai-client'
import { buildCompletePrompt, type ProductData } from './prompt-builder'

interface GenerateProductImageOptions {
  productId: string
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
  imageSize?: '1K' | '2K'
  isPrimary?: boolean // Set as primary product image
}

interface GenerateProductImageResult {
  success: boolean
  imageId?: string
  imageUrl?: string
  error?: string
}

/**
 * Generate an AI image for a specific product using its category's prompt template
 */
export async function generateProductImage(
  options: GenerateProductImageOptions
): Promise<GenerateProductImageResult> {
  const { productId, aspectRatio = '4:3', imageSize = '2K', isPrimary = false } = options

  try {
    // 1. Fetch product with category and prompt template
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          include: {
            PromptTemplate: true, // Get the category's prompt template
          },
        },
      },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    if (!product.category) {
      return {
        success: false,
        error: 'Product has no category',
      }
    }

    if (!product.category.PromptTemplate) {
      return {
        success: false,
        error: `Category "${product.category.name}" has no prompt template. Please assign a prompt template to this category first.`,
      }
    }

    const template = product.category.PromptTemplate

    // 2. Prepare product data for variable substitution
    const productData: ProductData = {
      name: product.name,
      description: product.description || undefined,
      categoryName: product.category.name,
      dimensions: product.width && product.height
        ? {
            width: product.width,
            height: product.height,
            length: product.length || undefined,
            unit: 'in', // Default to inches
          }
        : undefined,
    }

    // 3. Build the full prompt using template + product data
    const { prompt: fullPrompt, negativePrompt } = buildCompletePrompt({
      basePrompt: template.promptText,
      productType: template.productType,
      productData, // NEW: Product-specific variable substitution
      selectedModifiers: (template.selectedModifiers as any) || null,
      styleModifiers: template.styleModifiers,
      technicalSpecs: template.technicalSpecs,
      negativePrompt: template.negativePrompt,
    })

    // 4. Generate the image using Google AI
    const generator = new GoogleAIImageGenerator()
    const result = await generator.generateImage({
      prompt: fullPrompt,
      negativePrompt: negativePrompt || template.negativePrompt || undefined,
      config: {
        numberOfImages: 1,
        aspectRatio,
        imageSize,
        personGeneration: 'dont_allow',
      },
    })

    // 5. Convert buffer to base64 data URL
    const base64Image = result.buffer.toString('base64')
    const imageUrl = `data:image/png;base64,${base64Image}`

    // 6. If setting as primary, unset existing primary images
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: {
          productId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      })
    }

    // 7. Save to ProductImage table
    const productImage = await prisma.productImage.create({
      data: {
        productId,
        imageUrl,
        altText: product.name,
        isPrimary,
        sortOrder: 0,
        promptTemplateId: template.id, // Track which template generated this
        generatedPrompt: fullPrompt, // Store the actual prompt used
        generationConfig: {
          aspectRatio,
          imageSize,
          templateName: template.name,
          productData,
        },
      },
    })

    // 8. Update product's imagePromptsUsed array
    const updatedPromptsUsed = product.imagePromptsUsed || []
    if (!updatedPromptsUsed.includes(template.id)) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          imagePromptsUsed: [...updatedPromptsUsed, template.id],
        },
      })
    }

    return {
      success: true,
      imageId: productImage.id,
      imageUrl: productImage.imageUrl,
    }
  } catch (error) {
    console.error('Error generating product image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate product image',
    }
  }
}

/**
 * Generate multiple images for a product (batch generation)
 */
export async function generateProductImages(
  productId: string,
  count: number = 3,
  options?: Omit<GenerateProductImageOptions, 'productId'>
): Promise<{
  success: boolean
  generatedCount: number
  failedCount: number
  images: Array<{ id: string; imageUrl: string }>
  errors: string[]
}> {
  const results = {
    success: true,
    generatedCount: 0,
    failedCount: 0,
    images: [] as Array<{ id: string; imageUrl: string }>,
    errors: [] as string[],
  }

  for (let i = 0; i < count; i++) {
    const result = await generateProductImage({
      productId,
      ...options,
      isPrimary: i === 0 && (options?.isPrimary ?? false), // Only first image is primary
    })

    if (result.success && result.imageId && result.imageUrl) {
      results.generatedCount++
      results.images.push({ id: result.imageId, imageUrl: result.imageUrl })
    } else {
      results.failedCount++
      results.errors.push(result.error || 'Unknown error')
    }
  }

  results.success = results.generatedCount > 0

  return results
}

/**
 * Regenerate primary image for a product
 */
export async function regeneratePrimaryProductImage(
  productId: string,
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
  imageSize?: '1K' | '2K'
): Promise<GenerateProductImageResult> {
  return generateProductImage({
    productId,
    aspectRatio,
    imageSize,
    isPrimary: true,
  })
}
