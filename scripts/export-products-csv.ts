/**
 * CSV Product Exporter
 *
 * Exports existing products to CSV format
 *
 * Usage:
 *   npx tsx scripts/export-products-csv.ts output.csv
 *   npx tsx scripts/export-products-csv.ts output.csv --category=cat_business_card
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

function escapeCSV(value: string | null | undefined): string {
  if (!value) return ''

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

async function exportProducts(outputPath: string, categoryFilter?: string) {
  console.log('📤 CSV Product Exporter')
  console.log('='.repeat(60))

  // Build query
  const where: any = { isActive: true }

  if (categoryFilter) {
    where.categoryId = categoryFilter
  }

  // Fetch products
  const products = await prisma.product.findMany({
    where,
    include: {
      ProductCategory: true,
      ProductSizeGroup: {
        include: {
          SizeGroup: true,
        },
      },
    },
    orderBy: [{ ProductCategory: { name: 'asc' } }, { name: 'asc' }],
  })

  console.log(`📊 Found ${products.length} products`)

  if (categoryFilter) {
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryFilter },
    })
    console.log(`📂 Category filter: ${category?.name || categoryFilter}`)
  }

  // Build CSV content
  const headers = [
    'name',
    'slug',
    'sku',
    'category',
    'basePrice',
    'productionTime',
    'size',
    'description',
    'featured',
    'active',
  ]

  let csv = headers.join(',') + '\n'

  for (const product of products) {
    const size = product.ProductSizeGroup?.[0]?.SizeGroup?.values || ''
    const featured =
      product.metadata && typeof product.metadata === 'object' && 'featured' in product.metadata
        ? product.metadata.featured
        : false

    const row = [
      escapeCSV(product.name),
      escapeCSV(product.slug),
      escapeCSV(product.sku),
      escapeCSV(product.ProductCategory?.slug || product.categoryId),
      product.basePrice.toString(),
      product.productionTime.toString(),
      escapeCSV(size),
      escapeCSV(product.description),
      featured ? 'true' : 'false',
      product.isActive ? 'true' : 'false',
    ]

    csv += row.join(',') + '\n'
  }

  // Write to file
  fs.writeFileSync(outputPath, csv, 'utf-8')

  console.log(`\n✅ Exported ${products.length} products to: ${outputPath}`)
  console.log('\n💡 You can now:')
  console.log('   1. Open in Excel/Google Sheets')
  console.log('   2. Edit products')
  console.log('   3. Import back with: npx tsx scripts/import-products-csv.ts')
}

async function main() {
  const outputPath = process.argv[2]
  const categoryArg = process.argv.find((arg) => arg.startsWith('--category='))
  const categoryFilter = categoryArg?.split('=')[1]

  if (!outputPath) {
    console.error('❌ Error: Please provide output file path')
    console.error('\nUsage: npx tsx scripts/export-products-csv.ts output.csv')
    console.error(
      '       npx tsx scripts/export-products-csv.ts output.csv --category=cat_business_card'
    )
    process.exit(1)
  }

  await exportProducts(outputPath, categoryFilter)
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
