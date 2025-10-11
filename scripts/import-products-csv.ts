/**
 * CSV Product Importer
 *
 * Imports products from CSV file with automatic configuration
 *
 * Usage:
 *   npx tsx scripts/import-products-csv.ts products.csv
 *
 * CSV Format:
 *   name,slug,sku,category,basePrice,productionTime,size,quantities,description
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface CSVRow {
  name: string
  slug: string
  sku: string
  category: string // Category slug or ID
  basePrice: string
  productionTime: string
  size: string // e.g., "3.5x2" or "8.5x11"
  quantities?: string // e.g., "100,250,500,1000" (optional - uses defaults)
  description?: string
  featured?: string // "true" or "false"
  active?: string // "true" or "false"
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n').filter((line) => line.trim())
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))

  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: any = {}

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim().replace(/^"|"$/g, '') || ''
    })

    rows.push(row as CSVRow)
  }

  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function getCategoryDefaults(categorySlugOrId: string) {
  // Find category by slug or ID
  const category = await prisma.productCategory.findFirst({
    where: {
      OR: [{ slug: categorySlugOrId }, { id: categorySlugOrId }],
    },
  })

  if (!category) {
    throw new Error(`Category not found: ${categorySlugOrId}`)
  }

  // Get default configurations for this category
  // These are the common sets used by most products

  const paperStockSet = await prisma.paperStockSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  const quantityGroup = await prisma.quantityGroup.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  const turnaroundSet = await prisma.turnaroundTimeSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  const addonSet = await prisma.addOnSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })

  const coatingOptions = await prisma.coatingOption.findMany()
  const sidesOptions = await prisma.sidesOption.findMany()

  return {
    category,
    paperStockSet,
    quantityGroup,
    turnaroundSet,
    addonSet,
    coatingOptions,
    sidesOptions,
  }
}

async function createOrUpdateSizeGroup(size: string, productName: string) {
  const sizeGroupName = `${productName} Sizes`

  const sizeGroup = await prisma.sizeGroup.upsert({
    where: { name: sizeGroupName },
    update: {
      values: size,
      defaultValue: size,
      updatedAt: new Date(),
    },
    create: {
      id: `sg_${slugify(productName)}`,
      name: sizeGroupName,
      description: `Size options for ${productName}`,
      values: size,
      defaultValue: size,
      sortOrder: 1,
      isActive: true,
      updatedAt: new Date(),
    },
  })

  return sizeGroup
}

async function importProduct(row: CSVRow, rowNumber: number) {
  console.log(`\n📦 Row ${rowNumber}: ${row.name}`)

  try {
    // Validate required fields
    if (!row.name || !row.slug || !row.sku || !row.category) {
      throw new Error('Missing required fields: name, slug, sku, category')
    }

    // Check if product already exists
    const existing = await prisma.product.findUnique({
      where: { slug: row.slug },
    })

    if (existing) {
      console.log(`   ⚠️  Product already exists: ${row.slug}`)
      return { status: 'skipped', product: existing }
    }

    // Get category and defaults
    const defaults = await getCategoryDefaults(row.category)

    if (!defaults.category) {
      throw new Error(`Category not found: ${row.category}`)
    }

    console.log(`   ✅ Category: ${defaults.category.name}`)

    // Create or get size group
    const sizeGroup = await createOrUpdateSizeGroup(row.size, row.name)
    console.log(`   ✅ Size: ${row.size}`)

    // Parse pricing and time
    const basePrice = parseFloat(row.basePrice) || 0
    const productionTime = parseInt(row.productionTime) || 5
    const isActive = row.active?.toLowerCase() !== 'false'
    const isFeatured = row.featured?.toLowerCase() === 'true'

    // Generate product ID
    const productId = `prod_${slugify(row.name)}`

    // Create product
    const product = await prisma.product.create({
      data: {
        id: productId,
        name: row.name,
        slug: row.slug,
        sku: row.sku,
        description:
          row.description ||
          `Professional ${row.name.toLowerCase()} from GangRun Printing. High-quality printing with fast turnaround times.`,
        categoryId: defaults.category.id,
        basePrice: basePrice,
        productionTime: productionTime,
        isActive: isActive,
        updatedAt: new Date(),
        metadata: {
          featured: isFeatured,
          imported: true,
          importedAt: new Date().toISOString(),
        },
      },
    })

    console.log(`   ✅ Product created: ${product.id}`)

    // Link configurations
    if (defaults.paperStockSet) {
      await prisma.productPaperStockSet.create({
        data: {
          id: `${product.id}_pss`,
          productId: product.id,
          paperStockSetId: defaults.paperStockSet.id,
          isDefault: true,
        },
      })
      console.log(`   ✅ Paper stock set linked`)
    }

    if (defaults.quantityGroup) {
      await prisma.productQuantityGroup.create({
        data: {
          id: `${product.id}_qg`,
          productId: product.id,
          quantityGroupId: defaults.quantityGroup.id,
          isDefault: true,
        },
      })
      console.log(`   ✅ Quantity group linked`)
    }

    await prisma.productSizeGroup.create({
      data: {
        id: `${product.id}_sg`,
        productId: product.id,
        sizeGroupId: sizeGroup.id,
        isDefault: true,
      },
    })
    console.log(`   ✅ Size group linked`)

    if (defaults.turnaroundSet) {
      await prisma.productTurnaroundTimeSet.create({
        data: {
          id: `${product.id}_tts`,
          productId: product.id,
          turnaroundTimeSetId: defaults.turnaroundSet.id,
          isDefault: true,
        },
      })
      console.log(`   ✅ Turnaround set linked`)
    }

    if (defaults.addonSet) {
      await prisma.productAddOnSet.create({
        data: {
          id: `${product.id}_aos`,
          productId: product.id,
          addOnSetId: defaults.addonSet.id,
        },
      })
      console.log(`   ✅ AddOn set linked`)
    }

    // Link coating options
    for (const coating of defaults.coatingOptions) {
      await prisma.productCoatingOption.create({
        data: {
          id: `${product.id}_co_${coating.id}`,
          productId: product.id,
          coatingOptionId: coating.id,
        },
      })
    }
    console.log(`   ✅ Coating options linked (${defaults.coatingOptions.length})`)

    // Link sides options
    for (const sides of defaults.sidesOptions) {
      await prisma.productSidesOption.create({
        data: {
          id: `${product.id}_so_${sides.id}`,
          productId: product.id,
          sidesOptionId: sides.id,
        },
      })
    }
    console.log(`   ✅ Sides options linked (${defaults.sidesOptions.length})`)

    console.log(`   🎉 Complete!`)

    return { status: 'created', product }
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`)
    return { status: 'error', error: error.message }
  }
}

async function main() {
  const csvFilePath = process.argv[2]

  if (!csvFilePath) {
    console.error('❌ Error: Please provide CSV file path')
    console.error('\nUsage: npx tsx scripts/import-products-csv.ts products.csv')
    console.error('\nExample: npx tsx scripts/import-products-csv.ts data/products.csv')
    process.exit(1)
  }

  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ Error: File not found: ${csvFilePath}`)
    process.exit(1)
  }

  console.log('📥 CSV Product Importer')
  console.log('='.repeat(60))
  console.log(`📂 File: ${csvFilePath}\n`)

  // Read and parse CSV
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
  const rows = parseCSV(csvContent)

  console.log(`📊 Found ${rows.length} products to import\n`)
  console.log('='.repeat(60))

  // Import products
  let created = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < rows.length; i++) {
    const result = await importProduct(rows[i], i + 1)

    if (result.status === 'created') created++
    else if (result.status === 'skipped') skipped++
    else if (result.status === 'error') errors++
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Import Summary')
  console.log('='.repeat(60))
  console.log(`✅ Created: ${created}`)
  console.log(`⚠️  Skipped: ${skipped}`)
  console.log(`❌ Errors: ${errors}`)
  console.log(`📍 Total: ${rows.length}`)

  if (created > 0) {
    console.log('\n🎉 Products imported successfully!')
    console.log('\n🌐 View products: https://gangrunprinting.com/admin/products')
  }

  if (errors > 0) {
    console.log('\n⚠️  Some products had errors. Review the output above.')
  }
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
