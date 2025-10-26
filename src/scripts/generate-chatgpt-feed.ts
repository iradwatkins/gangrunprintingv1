/**
 * ChatGPT Product Feed Generator
 *
 * Generates a CSV feed compatible with ChatGPT Agentic Commerce Protocol (ACP).
 * Includes all product variants with custom printing options.
 *
 * Usage:
 * - Generate feed: npx tsx src/scripts/generate-chatgpt-feed.ts
 * - Output: chatgpt-product-feed.csv
 * - Preview: npx tsx src/scripts/generate-chatgpt-feed.ts --preview
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ChatGPTFeedRow {
  // Required ACP fields
  id: string // offer_id (unique SKU)
  item_group_id: string // Groups variants together
  title: string // Product + variant title
  description: string // Full description
  link: string // URL to product page
  image_link: string // Main product image
  condition: string // "new" | "used" | "refurbished"
  availability: string // "in_stock" | "out_of_stock" | "preorder" | "backorder"
  price: string // "19.99 USD"
  brand: string // "GangRun Printing"

  // Optional but recommended
  gtin?: string // Global Trade Item Number
  mpn?: string // Manufacturer Part Number

  // Custom variant fields (printing options)
  custom_variant1?: string // Paper Stock (e.g., "Glossy 100lb")
  custom_variant2?: string // Size (e.g., "3.5x2")
  custom_variant3?: string // Quantity (e.g., "500")

  // Additional fields
  product_type?: string // Category (e.g., "Business Cards")
  google_product_category?: string // Google taxonomy
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCsvField(field: string | undefined | null): string {
  if (field === undefined || field === null) return ''

  const str = String(field)

  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Convert feed row to CSV line
 */
function rowToCsvLine(row: ChatGPTFeedRow, headers: string[]): string {
  const values = headers.map((header) => {
    const value = row[header as keyof ChatGPTFeedRow]
    return escapeCsvField(value)
  })
  return values.join(',')
}

/**
 * Generate ChatGPT ACP feed
 */
async function generateFeed(preview: boolean = false): Promise<{
  totalProducts: number
  totalVariants: number
  feedRows: ChatGPTFeedRow[]
  csvContent: string
}> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gangrunprinting.com'
  const brand = 'GangRun Printing'

  // Fetch all products with variants
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      enableChatGPTCheckout: true,
    },
    include: {
      ProductCategory: true,
      ProductVariant: {
        where: { isActive: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  console.log(`\n📊 Found ${products.length} products enabled for ChatGPT`)

  const feedRows: ChatGPTFeedRow[] = []

  for (const product of products) {
    // Get primary image
    const imageUrl = product.images?.[0] || `${baseUrl}/images/placeholder.png`

    // Product URL
    const productUrl = `${baseUrl}/products/${product.slug}`

    // Category mapping
    const categoryName = product.ProductCategory?.name || 'Printing Services'
    const googleCategory = mapToGoogleCategory(categoryName)

    if (product.ProductVariant.length === 0) {
      // No variants - create single feed row for base product
      feedRows.push({
        id: product.sku,
        item_group_id: product.itemGroupId || product.sku,
        title: product.name,
        description: product.description || `${product.name} - Professional printing services`,
        link: productUrl,
        image_link: imageUrl,
        condition: 'new',
        availability: 'in_stock',
        price: `${product.basePrice.toFixed(2)} USD`,
        brand,
        gtin: product.gtin || undefined,
        mpn: product.sku,
        product_type: categoryName,
        google_product_category: googleCategory,
      })
    } else {
      // Has variants - create feed row for each variant
      for (const variant of product.ProductVariant) {
        feedRows.push({
          id: variant.offerId,
          item_group_id: product.itemGroupId || product.sku,
          title: variant.title,
          description: product.description || `${product.name} - Professional printing services`,
          link: productUrl,
          image_link: variant.imageUrl || imageUrl,
          condition: 'new',
          availability: variant.availability,
          price: `${variant.price.toFixed(2)} USD`,
          brand,
          gtin: product.gtin || undefined,
          mpn: product.sku,
          custom_variant1: variant.paperStock || undefined,
          custom_variant2: variant.size || undefined,
          custom_variant3: variant.quantity || undefined,
          product_type: categoryName,
          google_product_category: googleCategory,
        })
      }
    }
  }

  const totalVariants = feedRows.length

  console.log(`✅ Generated ${totalVariants} feed rows`)

  // Generate CSV
  const headers = [
    'id',
    'item_group_id',
    'title',
    'description',
    'link',
    'image_link',
    'condition',
    'availability',
    'price',
    'brand',
    'gtin',
    'mpn',
    'custom_variant1',
    'custom_variant2',
    'custom_variant3',
    'product_type',
    'google_product_category',
  ]

  const csvLines = [
    headers.join(','), // Header row
    ...feedRows.map((row) => rowToCsvLine(row, headers)),
  ]

  const csvContent = csvLines.join('\n')

  if (preview) {
    console.log('\n📝 PREVIEW (first 5 rows):\n')
    console.log(csvLines.slice(0, 6).join('\n'))
    console.log('\n...')
  }

  return {
    totalProducts: products.length,
    totalVariants,
    feedRows,
    csvContent,
  }
}

/**
 * Map category to Google Product Category
 */
function mapToGoogleCategory(categoryName: string): string {
  const mapping: Record<string, string> = {
    'Business Cards': '96 > 2047 > 2048', // Office Supplies > Business & Industrial > Printing
    'Postcards': '96 > 2047 > 2048',
    'Flyers': '96 > 2047 > 2048',
    'Brochures': '96 > 2047 > 2048',
    'Banners': '96 > 2047 > 2048',
    'Posters': '96 > 2047 > 2048',
  }

  return mapping[categoryName] || '96' // Default to Office Supplies
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  const preview = args.includes('--preview')
  const outputPath = args.find((arg) => arg.startsWith('--output='))?.split('=')[1] ||
                     'public/feeds/chatgpt-product-feed.csv'

  console.log('🤖 ChatGPT Product Feed Generator')
  console.log('==================================\n')

  if (preview) {
    console.log('👁️  PREVIEW MODE - Feed will not be saved\n')
  }

  // Generate feed
  const result = await generateFeed(preview)

  if (!preview) {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Write CSV file
    fs.writeFileSync(outputPath, result.csvContent, 'utf-8')

    console.log(`\n✅ Feed generated successfully!`)
    console.log(`   File: ${outputPath}`)
    console.log(`   Size: ${(result.csvContent.length / 1024).toFixed(2)} KB`)
    console.log(`   Products: ${result.totalProducts}`)
    console.log(`   Variants: ${result.totalVariants}`)
    console.log(`\n📋 Next steps:`)
    console.log(`   1. Test feed: curl ${process.env.NEXT_PUBLIC_APP_URL}/feeds/chatgpt-product-feed.csv`)
    console.log(`   2. Submit to ChatGPT: https://platform.openai.com/chatgpt/feed`)
    console.log(`   3. Monitor performance in ChatGPT Analytics\n`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
