/**
 * CSV Product Validator
 *
 * Validates CSV file before import to catch errors early
 *
 * Usage:
 *   npx tsx scripts/validate-products-csv.ts products.csv
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

interface ValidationError {
  row: number
  field: string
  value: string
  error: string
}

interface CSVRow {
  name: string
  slug: string
  sku: string
  category: string
  basePrice: string
  productionTime: string
  size: string
  quantities?: string
  description?: string
  featured?: string
  active?: string
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

async function validateRow(row: CSVRow, rowNumber: number): Promise<ValidationError[]> {
  const errors: ValidationError[] = []

  // Required fields
  if (!row.name || !row.name.trim()) {
    errors.push({
      row: rowNumber,
      field: 'name',
      value: row.name,
      error: 'Name is required',
    })
  }

  if (!row.slug || !row.slug.trim()) {
    errors.push({
      row: rowNumber,
      field: 'slug',
      value: row.slug,
      error: 'Slug is required',
    })
  } else {
    // Check if slug is valid format
    const validSlug = slugify(row.slug)
    if (row.slug !== validSlug) {
      errors.push({
        row: rowNumber,
        field: 'slug',
        value: row.slug,
        error: `Slug should be: ${validSlug}`,
      })
    }

    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug: row.slug },
    })
    if (existing) {
      errors.push({
        row: rowNumber,
        field: 'slug',
        value: row.slug,
        error: 'Slug already exists in database',
      })
    }
  }

  if (!row.sku || !row.sku.trim()) {
    errors.push({
      row: rowNumber,
      field: 'sku',
      value: row.sku,
      error: 'SKU is required',
    })
  } else {
    // Check if SKU already exists
    const existing = await prisma.product.findFirst({
      where: { sku: row.sku },
    })
    if (existing) {
      errors.push({
        row: rowNumber,
        field: 'sku',
        value: row.sku,
        error: 'SKU already exists in database',
      })
    }
  }

  if (!row.category || !row.category.trim()) {
    errors.push({
      row: rowNumber,
      field: 'category',
      value: row.category,
      error: 'Category is required',
    })
  } else {
    // Check if category exists
    const category = await prisma.productCategory.findFirst({
      where: {
        OR: [{ slug: row.category }, { id: row.category }],
      },
    })
    if (!category) {
      errors.push({
        row: rowNumber,
        field: 'category',
        value: row.category,
        error: 'Category not found in database',
      })
    }
  }

  // Validate price
  if (!row.basePrice || !row.basePrice.trim()) {
    errors.push({
      row: rowNumber,
      field: 'basePrice',
      value: row.basePrice,
      error: 'Base price is required',
    })
  } else {
    const price = parseFloat(row.basePrice)
    if (isNaN(price) || price <= 0) {
      errors.push({
        row: rowNumber,
        field: 'basePrice',
        value: row.basePrice,
        error: 'Base price must be a positive number',
      })
    }
  }

  // Validate production time
  if (!row.productionTime || !row.productionTime.trim()) {
    errors.push({
      row: rowNumber,
      field: 'productionTime',
      value: row.productionTime,
      error: 'Production time is required',
    })
  } else {
    const time = parseInt(row.productionTime)
    if (isNaN(time) || time <= 0) {
      errors.push({
        row: rowNumber,
        field: 'productionTime',
        value: row.productionTime,
        error: 'Production time must be a positive integer',
      })
    }
  }

  // Validate size
  if (!row.size || !row.size.trim()) {
    errors.push({
      row: rowNumber,
      field: 'size',
      value: row.size,
      error: 'Size is required',
    })
  }

  return errors
}

async function main() {
  const csvFilePath = process.argv[2]

  if (!csvFilePath) {
    console.error('❌ Error: Please provide CSV file path')
    console.error('\nUsage: npx tsx scripts/validate-products-csv.ts products.csv')
    process.exit(1)
  }

  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ Error: File not found: ${csvFilePath}`)
    process.exit(1)
  }

  console.log('🔍 CSV Product Validator')
  console.log('='.repeat(60))
  console.log(`📂 File: ${csvFilePath}\n`)

  // Read and parse CSV
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8')
  const rows = parseCSV(csvContent)

  console.log(`📊 Validating ${rows.length} products...\n`)

  // Validate each row
  const allErrors: ValidationError[] = []

  for (let i = 0; i < rows.length; i++) {
    const errors = await validateRow(rows[i], i + 2) // +2 because row 1 is header, rows start at 2
    allErrors.push(...errors)
  }

  console.log('='.repeat(60))

  if (allErrors.length === 0) {
    console.log('✅ Validation passed!')
    console.log(`\n📊 Summary:`)
    console.log(`   Total rows: ${rows.length}`)
    console.log(`   Errors: 0`)
    console.log('\n🚀 Ready to import!')
    console.log(`   Run: npx tsx scripts/import-products-csv.ts ${csvFilePath}`)
  } else {
    console.log('❌ Validation failed!')
    console.log(`\n📊 Found ${allErrors.length} errors:\n`)

    // Group errors by row
    const errorsByRow = new Map<number, ValidationError[]>()
    allErrors.forEach((error) => {
      if (!errorsByRow.has(error.row)) {
        errorsByRow.set(error.row, [])
      }
      errorsByRow.get(error.row)!.push(error)
    })

    // Display errors
    errorsByRow.forEach((errors, row) => {
      console.log(`Row ${row}:`)
      errors.forEach((error) => {
        console.log(`   ❌ ${error.field}: ${error.error}`)
        if (error.value) {
          console.log(`      Current value: "${error.value}"`)
        }
      })
      console.log()
    })

    console.log('='.repeat(60))
    console.log('💡 Fix these errors and run validation again')
    process.exit(1)
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
