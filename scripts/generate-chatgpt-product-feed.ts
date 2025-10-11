#!/usr/bin/env tsx
/**
 * ChatGPT Shopping Feed Generator
 *
 * Generates a product feed in JSON format compatible with OpenAI's
 * ChatGPT Shopping / Agentic Commerce Protocol specification.
 *
 * Specification: https://developers.openai.com/commerce/specs/feed/
 *
 * Run: npx tsx scripts/generate-chatgpt-product-feed.ts
 * Output: public/feeds/chatgpt-products.json
 *
 * Schedule: Run every 15 minutes via cron for real-time updates
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

// ChatGPT Product Feed Item Interface (based on OpenAI spec)
interface ChatGPTProductFeedItem {
  // Required fields
  id: string
  title: string
  description: string
  link: string
  price: string // Format: "29.99 USD"
  availability: 'in_stock' | 'out_of_stock' | 'preorder'
  image_link: string
  enable_search: boolean
  enable_checkout: boolean

  // Recommended fields
  gtin?: string
  brand?: string
  product_category?: string
  sale_price?: string
  inventory_quantity?: number
  seller_name?: string
  condition?: 'new' | 'refurbished' | 'used'

  // Additional enrichment fields
  additional_image_links?: string[]
  product_type?: string
  google_product_category?: string
}

/**
 * Get base price for a product (simplified - uses basePrice from product)
 * In production, this would calculate from paper stock, size, quantity, etc.
 */
function getProductBasePrice(product: any): number {
  // For now, use product.basePrice or calculate a reasonable default
  // Future: Calculate from ProductPricingConfig, paper stocks, etc.
  return product.basePrice || 29.99
}

/**
 * Get product image URL
 */
function getProductImageUrl(product: any, images: any[]): string {
  const primaryImage = images.find((img) => img.isPrimary)
  const firstImage = images[0]

  if (primaryImage?.Image) {
    const url = primaryImage.Image.url
    return url.startsWith('http') ? url : `https://gangrunprinting.com${url}`
  } else if (firstImage?.Image) {
    const url = firstImage.Image.url
    return url.startsWith('http') ? url : `https://gangrunprinting.com${url}`
  }

  // Fallback to placeholder
  return 'https://gangrunprinting.com/images/product-placeholder.jpg'
}

/**
 * Get additional product images (up to 10)
 */
function getAdditionalImageUrls(product: any, images: any[]): string[] {
  return images
    .filter((img) => !img.isPrimary)
    .slice(0, 9) // Max 10 additional images per OpenAI spec
    .map((img) => {
      const url = img.Image?.url
      if (!url) return null
      return url.startsWith('http') ? url : `https://gangrunprinting.com${url}`
    })
    .filter((url) => url && !url.includes('undefined')) as string[]
}

/**
 * Generate ChatGPT-compatible product feed
 */
async function generateChatGPTFeed() {
  console.log('🤖 Generating ChatGPT Shopping Feed...')
  console.log('Specification: OpenAI Agentic Commerce Protocol')
  console.log('')

  try {
    // Fetch all active products with relations
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        // Exclude test products (optional)
        NOT: {
          name: {
            contains: 'test',
            mode: 'insensitive',
          },
        },
      },
      include: {
        ProductCategory: true,
        ProductImage: {
          include: {
            Image: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    })

    console.log(`📦 Found ${products.length} active products`)

    // Transform products to ChatGPT feed format
    const feedItems: ChatGPTProductFeedItem[] = products.map((product) => {
      const basePrice = getProductBasePrice(product)
      const imageUrl = getProductImageUrl(product, product.ProductImage)
      const additionalImages = getAdditionalImageUrls(product, product.ProductImage)

      const feedItem: ChatGPTProductFeedItem = {
        // Required fields
        id: product.id,
        title: product.name.substring(0, 150), // Max 150 chars per spec
        description:
          product.description ||
          product.shortDescription ||
          `High-quality ${product.name} from GangRun Printing. Professional printing services with fast turnaround times.`,
        link: `https://gangrunprinting.com/products/${product.slug}`,
        price: `${basePrice.toFixed(2)} USD`,
        availability: 'in_stock', // Future: integrate with inventory system
        image_link: imageUrl,
        enable_search: true, // Make all products discoverable
        enable_checkout: false, // Future: enable when Instant Checkout implemented

        // Recommended fields
        brand: 'GangRun Printing',
        product_category: product.ProductCategory?.name || 'Printing Services',
        seller_name: 'GangRun Printing',
        condition: 'new',

        // Enrichment
        product_type: product.ProductCategory?.name || 'Custom Printing',
        google_product_category: 'Business & Industrial > Printing & Graphic Design',
      }

      // Add additional images if available
      if (additionalImages.length > 0) {
        feedItem.additional_image_links = additionalImages
      }

      // Add sale price if product has metadata with discount
      if (product.metadata && typeof product.metadata === 'object') {
        const metadata = product.metadata as any
        if (metadata.salePrice) {
          feedItem.sale_price = `${metadata.salePrice} USD`
        }
      }

      return feedItem
    })

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'public', 'feeds')
    await fs.mkdir(outputDir, { recursive: true })

    // Write feed to file
    const outputPath = path.join(outputDir, 'chatgpt-products.json')
    await fs.writeFile(outputPath, JSON.stringify(feedItems, null, 2), 'utf-8')

    console.log(`✅ Feed generated successfully!`)
    console.log(`📍 Location: ${outputPath}`)
    console.log(`📊 Products: ${feedItems.length}`)
    console.log(`🔗 URL: https://gangrunprinting.com/feeds/chatgpt-products.json`)
    console.log('')
    console.log('Next steps:')
    console.log('1. Set up cron job to run this script every 15 minutes')
    console.log('2. Submit feed URL to https://chatgpt.com/merchants')
    console.log('3. Monitor feed validation and indexing status')

    // Generate summary statistics
    const stats = {
      total_products: feedItems.length,
      searchable_products: feedItems.filter((p) => p.enable_search).length,
      checkout_enabled: feedItems.filter((p) => p.enable_checkout).length,
      categories: [...new Set(feedItems.map((p) => p.product_category))],
      generated_at: new Date().toISOString(),
      feed_url: 'https://gangrunprinting.com/feeds/chatgpt-products.json',
    }

    console.log('')
    console.log('📈 Feed Statistics:')
    console.log(JSON.stringify(stats, null, 2))

    return {
      success: true,
      feedItems,
      stats,
    }
  } catch (error) {
    console.error('❌ Error generating ChatGPT feed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  generateChatGPTFeed()
    .then(() => {
      console.log('')
      console.log('🎉 ChatGPT Shopping Feed generation complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Feed generation failed:', error)
      process.exit(1)
    })
}

export { generateChatGPTFeed }
