/**
 * Duplicate Product for 200 Cities
 *
 * Takes a template product and creates 200 city-specific variants
 *
 * Usage:
 *   npx tsx scripts/duplicate-product-for-200-cities.ts <template-product-slug>
 *
 * Example:
 *   npx tsx scripts/duplicate-product-for-200-cities.ts postcards-4x6-template
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Load 200 cities from JSON file
const citiesFilePath = path.join(__dirname, 'data', '200-cities.json')
const TOP_200_CITIES = JSON.parse(fs.readFileSync(citiesFilePath, 'utf-8'))

interface City {
  name: string
  state: string
  stateCode: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function generateCitySlug(city: City, baseProductType: string): string {
  const citySlug = slugify(city.name)
  const stateSlug = slugify(city.stateCode)
  return `${baseProductType}-${citySlug}-${stateSlug}`
}

function generateCityProductName(city: City, baseProductName: string): string {
  // Replace "Template" or generic name with city-specific name
  const cleanBase = baseProductName.replace(/template/i, '').trim()
  return `${cleanBase} - ${city.name}, ${city.stateCode}`
}

function generateCitySKU(city: City, baseSKU: string): string {
  const cityCode = slugify(city.name).toUpperCase().substring(0, 10)
  const stateCode = city.stateCode.toUpperCase()
  return `${baseSKU}-${stateCode}-${cityCode}`
}

async function duplicateProductForCity(
  templateProduct: any,
  city: City,
  categoryId: string
): Promise<string> {

  const baseProductType = templateProduct.slug.replace(/-template$/, '')
  const newSlug = generateCitySlug(city, baseProductType)
  const newName = generateCityProductName(city, templateProduct.name)
  const newSKU = generateCitySKU(city, templateProduct.sku)
  const newId = `prod_${slugify(newName)}`

  console.log(`\n📍 Creating: ${newName}`)
  console.log(`   Slug: ${newSlug}`)
  console.log(`   SKU: ${newSKU}`)

  // Check if product already exists
  const existing = await prisma.product.findUnique({
    where: { slug: newSlug }
  })

  if (existing) {
    console.log(`   ⚠️  Already exists, skipping...`)
    return existing.id
  }

  // Get city from database
  const cityRecord = await prisma.city.findFirst({
    where: {
      name: city.name,
      stateCode: city.stateCode
    }
  })

  if (!cityRecord) {
    console.log(`   ⚠️  City not found in database: ${city.name}, ${city.stateCode}`)
  }

  // Create new product
  const newProduct = await prisma.product.create({
    data: {
      id: newId,
      name: newName,
      slug: newSlug,
      sku: newSKU,
      description: templateProduct.description?.replace(/template/gi, city.name) || `Professional printing services in ${city.name}, ${city.state}`,
      categoryId: categoryId,
      basePrice: templateProduct.basePrice,
      productionTime: templateProduct.productionTime,
      isActive: templateProduct.isActive,
      cityId: cityRecord?.id || null,
      updatedAt: new Date(),
      metadata: {
        ...templateProduct.metadata,
        city: city.name,
        state: city.state,
        stateCode: city.stateCode,
        isCity Product: true,
        templateProductId: templateProduct.id
      }
    }
  })

  console.log(`   ✅ Product created: ${newProduct.id}`)

  // Copy all product configurations from template
  await copyProductConfigurations(templateProduct.id, newProduct.id)

  return newProduct.id
}

async function copyProductConfigurations(
  templateId: string,
  newProductId: string
) {
  // Copy Paper Stock Sets
  const paperStockSets = await prisma.productPaperStockSet.findMany({
    where: { productId: templateId }
  })
  for (const pss of paperStockSets) {
    await prisma.productPaperStockSet.create({
      data: {
        id: `${newProductId}_pss_${pss.paperStockSetId}`,
        productId: newProductId,
        paperStockSetId: pss.paperStockSetId,
        isDefault: pss.isDefault,
      }
    })
  }

  // Copy Quantity Groups
  const quantityGroups = await prisma.productQuantityGroup.findMany({
    where: { productId: templateId }
  })
  for (const qg of quantityGroups) {
    await prisma.productQuantityGroup.create({
      data: {
        id: `${newProductId}_qg_${qg.quantityGroupId}`,
        productId: newProductId,
        quantityGroupId: qg.quantityGroupId,
        isDefault: qg.isDefault,
      }
    })
  }

  // Copy Size Groups
  const sizeGroups = await prisma.productSizeGroup.findMany({
    where: { productId: templateId }
  })
  for (const sg of sizeGroups) {
    await prisma.productSizeGroup.create({
      data: {
        id: `${newProductId}_sg_${sg.sizeGroupId}`,
        productId: newProductId,
        sizeGroupId: sg.sizeGroupId,
        isDefault: sg.isDefault,
      }
    })
  }

  // Copy Turnaround Time Sets
  const turnaroundSets = await prisma.productTurnaroundTimeSet.findMany({
    where: { productId: templateId }
  })
  for (const tts of turnaroundSets) {
    await prisma.productTurnaroundTimeSet.create({
      data: {
        id: `${newProductId}_tts_${tts.turnaroundTimeSetId}`,
        productId: newProductId,
        turnaroundTimeSetId: tts.turnaroundTimeSetId,
        isDefault: tts.isDefault,
      }
    })
  }

  // Copy AddOn Sets
  const addonSets = await prisma.productAddOnSet.findMany({
    where: { productId: templateId }
  })
  for (const aos of addonSets) {
    await prisma.productAddOnSet.create({
      data: {
        id: `${newProductId}_aos_${aos.addOnSetId}`,
        productId: newProductId,
        addOnSetId: aos.addOnSetId,
      }
    })
  }

  // Copy Coating Options
  const coatings = await prisma.productCoatingOption.findMany({
    where: { productId: templateId }
  })
  for (const coating of coatings) {
    await prisma.productCoatingOption.create({
      data: {
        id: `${newProductId}_co_${coating.coatingOptionId}`,
        productId: newProductId,
        coatingOptionId: coating.coatingOptionId,
      }
    })
  }

  // Copy Sides Options
  const sides = await prisma.productSidesOption.findMany({
    where: { productId: templateId }
  })
  for (const side of sides) {
    await prisma.productSidesOption.create({
      data: {
        id: `${newProductId}_so_${side.sidesOptionId}`,
        productId: newProductId,
        sidesOptionId: side.sidesOptionId,
      }
    })
  }

  console.log(`   ✅ Configurations copied`)
}

async function main() {
  const templateSlug = process.argv[2]

  if (!templateSlug) {
    console.error('❌ Error: Please provide template product slug')
    console.error('\nUsage: npx tsx scripts/duplicate-product-for-200-cities.ts <template-slug>')
    console.error('Example: npx tsx scripts/duplicate-product-for-200-cities.ts postcards-4x6-template')
    process.exit(1)
  }

  console.log('🌆 200 Cities Product Generator')
  console.log('================================\n')
  console.log(`📋 Template Product: ${templateSlug}`)
  console.log(`📍 Cities to Generate: ${TOP_200_CITIES.length}\n`)

  // Get template product
  const templateProduct = await prisma.product.findUnique({
    where: { slug: templateSlug },
    include: {
      ProductCategory: true
    }
  })

  if (!templateProduct) {
    console.error(`❌ Error: Template product not found: ${templateSlug}`)
    process.exit(1)
  }

  console.log(`✅ Template found: ${templateProduct.name}`)
  console.log(`   Category: ${templateProduct.ProductCategory?.name || 'N/A'}`)
  console.log(`   Base Price: $${templateProduct.basePrice}`)
  console.log(`   Production Time: ${templateProduct.productionTime} days`)

  // Get or create 200 Cities category
  let cityCategory = await prisma.productCategory.findFirst({
    where: { slug: '200-cities-postcards' }
  })

  if (!cityCategory) {
    console.log('\n⚠️  200 Cities category not found, creating...')
    cityCategory = await prisma.productCategory.create({
      data: {
        id: 'cat_200_cities',
        name: '200 Cities - Postcards',
        slug: '200-cities-postcards',
        description: 'City-specific postcard products for 200 major US cities',
        isActive: true,
        isHidden: true, // Hidden from main navigation
        updatedAt: new Date(),
      }
    })
    console.log(`✅ Category created: ${cityCategory.name}`)
  }

  console.log(`\n🚀 Starting duplication process...\n`)
  console.log('=' .repeat(60))

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const city of TOP_200_CITIES) {
    try {
      const productId = await duplicateProductForCity(
        templateProduct,
        city,
        cityCategory.id
      )

      if (productId) {
        successCount++
      } else {
        skipCount++
      }
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary')
  console.log('='.repeat(60))
  console.log(`✅ Created: ${successCount}`)
  console.log(`⚠️  Skipped: ${skipCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📍 Total: ${TOP_200_CITIES.length}`)

  if (successCount > 0) {
    console.log('\n🎉 City products generated successfully!')
    console.log(`\n🌐 View products: https://gangrunprinting.com/admin/products`)
    console.log(`📂 Category: ${cityCategory.name}`)
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
