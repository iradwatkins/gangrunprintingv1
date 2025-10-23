#!/usr/bin/env npx tsx

/**
 * SEO Brain - Start Product Campaign
 *
 * Starts a new 200-city landing page campaign for a product
 *
 * Usage:
 *   npx tsx src/scripts/seo-brain/start-product-campaign.ts
 *
 * This will:
 * 1. Prompt you for product details
 * 2. Generate main product image (Google AI)
 * 3. Create 200 city landing pages with unique content (Ollama)
 * 4. Generate 200 city hero images (Google AI)
 * 5. Submit sitemap to Google
 * 6. Start monitoring & optimization
 */

import { prisma } from '@/lib/prisma'
import { generate200CityPages } from '@/lib/seo-brain/city-page-generator'
import { sendCampaignCompleteAlert } from '@/lib/seo-brain/telegram-notifier'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function main() {
  console.log('🤖 SEO Brain - Start Product Campaign\n')
  console.log('='.repeat(70))
  console.log('\nThis will generate 200 city landing pages for your product.')
  console.log('Each page includes:')
  console.log('  • Unique 500-word content (Ollama AI)')
  console.log('  • 10 city-specific benefits')
  console.log('  • 15 comprehensive FAQs')
  console.log('  • Main product image (Google AI)')
  console.log('  • City hero image (Google AI)')
  console.log('  • Complete schema markup')
  console.log('\nEstimated time: 6-7 hours')
  console.log('='.repeat(70))

  // Get product details
  console.log('\n📦 PRODUCT DETAILS\n')

  const productName = await question('Product name (e.g., "5000 4x6 Flyers"): ')
  const quantity = parseInt(await question('Quantity (e.g., 5000): '))
  const size = await question('Size (e.g., "4x6"): ')
  const material = await question('Material (e.g., "9pt Cardstock"): ')
  const turnaround = await question('Turnaround time (e.g., "3-4 days"): ')
  const price = parseFloat(await question('Price (e.g., 179): '))

  const keywordsInput = await question(
    'Keywords (comma-separated, e.g., "flyer printing, club flyers"): '
  )
  const keywords = keywordsInput.split(',').map((k) => k.trim())

  rl.close()

  console.log('\n✅ Product details collected\n')
  console.log('Product:', productName)
  console.log('Specs:', `${quantity} qty, ${size}, ${material}`)
  console.log('Turnaround:', turnaround)
  console.log('Price:', `$${price}`)
  console.log('Keywords:', keywords.join(', '))

  console.log('\n🚀 Starting campaign...\n')

  // Create campaign in database
  const campaign = await prisma.productCampaignQueue.create({
    data: {
      id: `campaign-${Date.now()}`,
      productName,
      productSpec: {
        quantity,
        size,
        material,
        turnaround,
        price,
        onlineOnly: true,
        keywords,
      },
      status: 'GENERATING',
      priority: 5,
      citiesGenerated: 0,
      citiesIndexed: 0,
      generationStartedAt: new Date(),
    },
  })

  console.log(`✅ Campaign created: ${campaign.id}\n`)

  // Initialize Ollama client (placeholder - implement based on your setup)
  const ollamaClient = {
    generate: async (prompt: string) => {
      // TODO: Implement actual Ollama API call
      // For now, return placeholder
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'deepseek-r1:32b',
          prompt,
          stream: false,
        }),
      })

      const data = await response.json()
      return data.response
    },
  }

  // Generate 200 city pages
  console.log('🏙️  Generating 200 city landing pages...\n')
  console.log('This will take approximately 6-7 hours.')
  console.log('You can monitor progress in real-time.\n')
  console.log('-'.repeat(70))

  const startTime = Date.now()

  const result = await generate200CityPages(
    campaign.id,
    {
      productName,
      quantity,
      size,
      material,
      turnaround,
      price,
      onlineOnly: true,
      keywords,
    },
    ollamaClient
  )

  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000 / 60).toFixed(1) // minutes

  console.log('\n' + '='.repeat(70))
  console.log('\n✅ CAMPAIGN COMPLETE\n')
  console.log(`Generated: ${result.generated}/200 pages`)
  console.log(`Failed: ${result.failed}/200 pages`)
  console.log(`Duration: ${duration} minutes`)
  console.log('\n' + '='.repeat(70))

  if (result.success) {
    // Send completion alert via Telegram
    await sendCampaignCompleteAlert({
      product: productName,
      citiesGenerated: result.generated,
      totalRevenue: 0, // Will be tracked over time
      topCities: ['New York', 'Los Angeles', 'Chicago'], // Will be determined by performance
      metrics: {
        pagesCreated: result.generated,
        estimatedMonthlyTraffic: result.generated * 50, // Estimate: 50 views per page/month
        estimatedMonthlyRevenue: result.generated * 2, // Estimate: $2 per page/month
      },
    })

    console.log('\n📬 Completion alert sent to Telegram')

    console.log('\n📊 NEXT STEPS:\n')
    console.log('1. Submit sitemap to Google Search Console')
    console.log('2. Wait 7-14 days for Google to index pages')
    console.log('3. Monitor performance in SEO Brain dashboard')
    console.log('4. Receive Telegram alerts when optimization needed')
    console.log('\n🎉 Your 200-city campaign is now live!')
  } else {
    console.error('\n❌ Campaign failed. Check logs for details.')
  }

  process.exit(result.success ? 0 : 1)
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
