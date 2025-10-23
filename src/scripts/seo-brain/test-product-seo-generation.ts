/**
 * Test Script: Product SEO Content Generation
 *
 * Tests the SEO Brain integration with product pages
 */

import { prisma } from '@/lib/prisma'
import { generateProductSEO, approveProductSEO } from '@/lib/seo-brain/generate-product-seo'
import { ollamaClient } from '@/lib/seo-brain/ollama-client'

async function main() {
  console.log('🧠 SEO Brain - Product Content Generation Test\n')
  console.log('='.repeat(60))

  // Test 1: Check Ollama connection
  console.log('\n[1/5] Testing Ollama connection...')
  const connection = await ollamaClient.testConnection()
  if (!connection.success) {
    console.error('❌ Ollama connection failed:', connection.error)
    process.exit(1)
  }
  console.log(`✅ Connected to Ollama (model: ${connection.model})`)

  // Test 2: Get a sample product
  console.log('\n[2/5] Fetching sample product...')
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
    },
    include: {
      ProductCategory: true,
      City: true,
    },
  })

  if (!product) {
    console.error('❌ No active products found in database')
    process.exit(1)
  }

  console.log(`✅ Found product: "${product.name}"`)
  console.log(`   Category: ${product.ProductCategory.name}`)
  if (product.City) {
    console.log(`   Location: ${product.City.name}, ${product.City.stateCode}`)
  }

  // Test 3: Generate SEO content
  console.log('\n[3/5] Generating SEO content...')
  const startTime = Date.now()

  try {
    const result = await generateProductSEO({
      productId: product.id,
      productName: product.name,
      productCategory: product.ProductCategory.name,
      city: product.City?.name,
      state: product.City?.stateCode,
      wordCount: 150,
      temperature: 0.7,
      forceRegenerate: true, // Force new generation for testing
    })

    const generationTime = Date.now() - startTime

    console.log(`✅ Content generated in ${generationTime}ms`)
    console.log(`   Word count: ${result.wordCount}`)
    console.log(`   Model: ${result.model}`)
    console.log(`   From cache: ${result.fromCache}`)
    console.log('\n📝 Generated Content:')
    console.log('─'.repeat(60))
    console.log(result.content)
    console.log('─'.repeat(60))

    // Test 4: Check word count accuracy
    console.log('\n[4/5] Validating content quality...')
    const targetWordCount = 150
    const wordCountDiff = Math.abs(result.wordCount - targetWordCount)
    const wordCountAccuracy = ((targetWordCount - wordCountDiff) / targetWordCount) * 100

    console.log(`   Target: ${targetWordCount} words`)
    console.log(`   Actual: ${result.wordCount} words`)
    console.log(`   Accuracy: ${wordCountAccuracy.toFixed(1)}%`)

    if (wordCountDiff <= 10) {
      console.log('   ✅ Word count within acceptable range (±10 words)')
    } else {
      console.warn('   ⚠️  Word count outside target range')
    }

    // Check for reasoning leakage
    const hasReasoning =
      result.content.includes('Let me') ||
      result.content.includes('I will') ||
      result.content.includes('First,') ||
      result.content.includes('Step ')

    if (!hasReasoning) {
      console.log('   ✅ No reasoning leakage detected')
    } else {
      console.warn('   ⚠️  Possible reasoning leakage detected')
    }

    // Test 5: Performance check
    console.log('\n[5/5] Performance validation...')
    const targetTime = 3000 // 3 seconds
    if (generationTime < targetTime) {
      console.log(`   ✅ Generation time under ${targetTime}ms target`)
    } else {
      console.warn(`   ⚠️  Generation time exceeded ${targetTime}ms target`)
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Summary')
    console.log('='.repeat(60))
    console.log(`Connection:     ✅ Success`)
    console.log(`Generation:     ✅ Success (${generationTime}ms)`)
    console.log(
      `Word Count:     ${wordCountDiff <= 10 ? '✅' : '⚠️'} ${result.wordCount}/${targetWordCount} words`
    )
    console.log(
      `Quality:        ${!hasReasoning ? '✅' : '⚠️'} ${!hasReasoning ? 'Clean' : 'Has reasoning'}`
    )
    console.log(
      `Performance:    ${generationTime < targetTime ? '✅' : '⚠️'} ${generationTime < targetTime ? 'Fast' : 'Slow'}`
    )

    console.log('\n💡 Next Steps:')
    console.log('1. Review generated content above')
    console.log('2. If quality is good, run: npx tsx src/scripts/seo-brain/approve-seo-content.ts')
    console.log('3. Build admin dashboard to generate content for all products')
    console.log('\n✨ Test completed successfully!')
  } catch (error) {
    console.error('\n❌ Generation failed:', error)
    if (error instanceof Error) {
      console.error('   Error message:', error.message)
    }
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
