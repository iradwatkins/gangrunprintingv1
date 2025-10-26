/**
 * Generate Product Variants for ChatGPT ACP
 *
 * This script generates ProductVariant records from existing product configurations.
 * It creates all combinations of paper stocks, sizes, and quantities.
 *
 * Usage:
 * - All products: npx tsx src/scripts/generate-product-variants.ts
 * - Single product: npx tsx src/scripts/generate-product-variants.ts --product-id=abc123
 * - Dry run: npx tsx src/scripts/generate-product-variants.ts --dry-run
 */

import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

interface VariantConfig {
  paperStock: string
  paperStockId: string
  size: string
  sizeId: string
  quantity: number
  quantityId: string
}

interface PricingModifiers {
  basePriceAdjustment: number
  quantityDiscount: number
  paperStockMultiplier: number
}

/**
 * Generate all variant combinations for a product
 */
async function generateVariantsForProduct(
  productId: string,
  dryRun: boolean = false
): Promise<{
  productName: string
  variantsCreated: number
  variantsSkipped: number
  totalVariants: number
}> {
  // Fetch product with all configuration
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      ProductPaperStock: {
        include: {
          PaperStock: true,
        },
      },
      ProductSize: {
        include: {
          size: true,
        },
      },
      ProductQuantity: {
        include: {
          quantity: true,
        },
      },
    },
  })

  if (!product) {
    throw new Error(`Product not found: ${productId}`)
  }

  console.log(`\n📦 Processing: ${product.name}`)
  console.log(`   Base Price: $${product.basePrice}`)

  // Get all configuration options
  const paperStocks = product.ProductPaperStock.map((ps) => ({
    id: ps.paperStock.id,
    name: ps.paperStock.name,
    weight: ps.paperStock.weight,
    finish: ps.paperStock.finish,
    priceMultiplier: ps.priceMultiplier || 1.0,
  }))

  const sizes = product.ProductSize.map((s) => ({
    id: s.size.id,
    name: s.size.name,
    width: s.size.width,
    height: s.size.height,
    priceMultiplier: s.priceMultiplier || 1.0,
  }))

  const quantities = product.ProductQuantity.map((q) => ({
    id: q.quantity.id,
    value: q.quantity.value,
    priceMultiplier: q.priceMultiplier || 1.0,
  }))

  console.log(`   Paper Stocks: ${paperStocks.length}`)
  console.log(`   Sizes: ${sizes.length}`)
  console.log(`   Quantities: ${quantities.length}`)

  // Generate all combinations
  const variants: VariantConfig[] = []
  for (const paperStock of paperStocks) {
    for (const size of sizes) {
      for (const quantity of quantities) {
        variants.push({
          paperStock: `${paperStock.name} ${paperStock.weight}lb ${paperStock.finish}`,
          paperStockId: paperStock.id,
          size: size.name,
          sizeId: size.id,
          quantity: quantity.value,
          quantityId: quantity.id,
        })
      }
    }
  }

  console.log(`   Total Combinations: ${variants.length}`)

  if (dryRun) {
    console.log('   🔍 DRY RUN - No variants will be created')
    return {
      productName: product.name,
      variantsCreated: 0,
      variantsSkipped: 0,
      totalVariants: variants.length,
    }
  }

  // Check for existing variants
  const existingVariants = await prisma.productVariant.findMany({
    where: { productId },
  })

  const existingOfferIds = new Set(existingVariants.map((v) => v.offerId))

  let created = 0
  let skipped = 0

  // Create variants
  for (const variant of variants) {
    // Generate unique offerId (SKU-based)
    const offerId = `${product.sku}-${variant.sizeId.slice(0, 4)}-${variant.paperStockId.slice(0, 4)}-${variant.quantity}`

    if (existingOfferIds.has(offerId)) {
      skipped++
      continue
    }

    // Calculate price
    const paperStock = paperStocks.find((ps) => ps.id === variant.paperStockId)!
    const size = sizes.find((s) => s.id === variant.sizeId)!
    const quantity = quantities.find((q) => q.id === variant.quantityId)!

    const price =
      product.basePrice *
      paperStock.priceMultiplier *
      size.priceMultiplier *
      quantity.priceMultiplier

    // Generate variant title
    const title = `${product.name} - ${variant.size}, ${variant.paperStock}, Qty: ${variant.quantity}`

    // Create variant
    await prisma.productVariant.create({
      data: {
        id: nanoid(),
        productId,
        offerId,
        title,
        price: Math.round(price * 100) / 100, // Round to 2 decimals

        // ChatGPT ACP fields
        availability: product.isActive ? 'in_stock' : 'out_of_stock',
        inventoryQuantity: 999999, // Unlimited for print-on-demand

        // Custom variant fields (custom_variant1/2/3 in feed)
        paperStock: variant.paperStock,
        size: variant.size,
        quantity: variant.quantity.toString(),

        // Additional fields
        turnaroundTime: product.productionTime.toString(),
        imageUrl: product.images?.[0] || null,
        isActive: product.isActive,
      },
    })

    created++
  }

  console.log(`   ✅ Created: ${created} variants`)
  console.log(`   ⏭️  Skipped: ${skipped} variants (already exist)`)

  return {
    productName: product.name,
    variantsCreated: created,
    variantsSkipped: skipped,
    totalVariants: variants.length,
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)
  const productIdArg = args.find((arg) => arg.startsWith('--product-id='))
  const dryRun = args.includes('--dry-run')

  console.log('🔧 Product Variant Generator for ChatGPT ACP')
  console.log('=============================================\n')

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n')
  }

  let results: {
    productName: string
    variantsCreated: number
    variantsSkipped: number
    totalVariants: number
  }[] = []

  if (productIdArg) {
    // Single product
    const productId = productIdArg.split('=')[1]
    console.log(`📌 Processing single product: ${productId}\n`)

    const result = await generateVariantsForProduct(productId, dryRun)
    results.push(result)
  } else {
    // All products
    console.log('📌 Processing ALL products\n')

    // Get all active products with configuration
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        // Only products with paper stocks configured
        ProductPaperStock: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    console.log(`Found ${products.length} products with configurations\n`)

    for (const product of products) {
      try {
        const result = await generateVariantsForProduct(product.id, dryRun)
        results.push(result)
      } catch (error: any) {
        console.error(`❌ Error processing ${product.name}:`, error.message)
      }
    }
  }

  // Summary
  console.log('\n\n📊 SUMMARY')
  console.log('==========')
  console.log(`Products Processed: ${results.length}`)
  console.log(
    `Total Variants Created: ${results.reduce((sum, r) => sum + r.variantsCreated, 0)}`
  )
  console.log(
    `Total Variants Skipped: ${results.reduce((sum, r) => sum + r.variantsSkipped, 0)}`
  )
  console.log(
    `Total Combinations: ${results.reduce((sum, r) => sum + r.totalVariants, 0)}`
  )

  if (dryRun) {
    console.log('\n💡 Run without --dry-run to create variants')
  } else {
    console.log('\n✅ Variant generation complete!')
  }

  console.log('\nNext steps:')
  console.log('1. Verify variants: SELECT COUNT(*) FROM "ProductVariant";')
  console.log('2. Generate ChatGPT feed: npx tsx src/scripts/generate-chatgpt-feed.ts')
  console.log('3. View in admin: /admin/products/[id]/variants\n')
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
