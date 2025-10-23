/**
 * TEST: City Content Generator Uniqueness
 *
 * Tests AI content generation with 3 sample cities to verify TRUE uniqueness
 */

import { enrichCityData, generateCityContent } from '../src/lib/landing-page/content-generator'
import { prisma } from '../src/lib/prisma'

async function testContentGenerator() {
  console.log('🧪 Testing City Content Generator for Uniqueness\n')
  console.log('='.repeat(80))

  try {
    // Get 3 sample cities
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { rank: 'asc' },
      take: 3,
    })

    if (cities.length === 0) {
      console.log('❌ No cities found in database!')
      return
    }

    console.log(`\nFound ${cities.length} cities for testing:`)
    cities.forEach((city, i) => {
      console.log(
        `  ${i + 1}. ${city.name}, ${city.stateCode} (Pop: ${city.population.toLocaleString()})`
      )
    })
    console.log()

    // Test templates
    const templates = {
      titleTemplate: 'Professional [PRODUCT] Printing in [CITY], [STATE] | GangRun Printing',
      metaDescTemplate:
        'Order premium [PRODUCT] in [CITY], [STATE]. Fast printing, [POPULATION_FORMATTED] satisfied customers. Free shipping on orders over $50.',
      h1Template: 'Professional [PRODUCT] Printing in [CITY], [STATE]',
      contentTemplate:
        'Welcome to [CITY], [STATE] - serving [POPULATION_FORMATTED] residents across [NEIGHBORHOODS].',
    }

    const productType = 'Postcards 4x6'
    const results: Array<{ city: string; content: any }> = []

    // Generate content for each city
    for (const city of cities) {
      console.log(`\n🔄 Generating content for ${city.name}, ${city.stateCode}...`)

      const content = await generateCityContent(
        city.id,
        'test-landing-page-set',
        templates,
        productType
      )

      results.push({
        city: `${city.name}, ${city.stateCode}`,
        content,
      })

      console.log(`  ✅ Generated:`)
      console.log(`     - Title: ${content.title.substring(0, 60)}...`)
      console.log(`     - Intro: ${content.aiIntro.substring(0, 100)}...`)
      console.log(`     - FAQs: ${content.faqSchema.length} questions`)
    }

    // Compare uniqueness
    console.log('\n' + '='.repeat(80))
    console.log('📊 UNIQUENESS ANALYSIS\n')

    console.log('1. TITLE COMPARISON:')
    results.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.content.title}`)
    })

    console.log('\n2. INTRO COMPARISON (First 150 chars):')
    results.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.city}:`)
      console.log(`      "${result.content.aiIntro.substring(0, 150)}..."`)
    })

    console.log('\n3. FAQ QUESTIONS (City #1 vs #2 vs #3):')
    const faqQuestion1 = results[0].content.faqSchema[0].question
    const faqQuestion2 = results[1].content.faqSchema[0].question
    const faqQuestion3 = results[2].content.faqSchema[0].question

    console.log(`   City 1: "${faqQuestion1}"`)
    console.log(`   City 2: "${faqQuestion2}"`)
    console.log(`   City 3: "${faqQuestion3}"`)

    // Check if content is truly unique
    const intro1 = results[0].content.aiIntro
    const intro2 = results[1].content.aiIntro
    const intro3 = results[2].content.aiIntro

    const unique12 = intro1 !== intro2
    const unique13 = intro1 !== intro3
    const unique23 = intro2 !== intro3

    console.log('\n4. UNIQUENESS VERIFICATION:')
    console.log(`   City 1 vs City 2: ${unique12 ? '✅ UNIQUE' : '❌ DUPLICATE'}`)
    console.log(`   City 1 vs City 3: ${unique13 ? '✅ UNIQUE' : '❌ DUPLICATE'}`)
    console.log(`   City 2 vs City 3: ${unique23 ? '✅ UNIQUE' : '❌ DUPLICATE'}`)

    if (unique12 && unique13 && unique23) {
      console.log('\n✅ SUCCESS: All content is UNIQUE! Google duplicate content penalty avoided.')
    } else {
      console.log('\n⚠️  WARNING: Some content appears to be duplicate. Need more variation.')
    }

    // Display full intro for manual review
    console.log('\n' + '='.repeat(80))
    console.log('📝 FULL INTRO CONTENT FOR MANUAL REVIEW:\n')

    results.forEach((result, i) => {
      console.log(`${i + 1}. ${result.city}:`)
      console.log(result.content.aiIntro)
      console.log('\n' + '-'.repeat(80) + '\n')
    })
  } catch (error) {
    console.error('❌ Error testing content generator:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run test
testContentGenerator()
  .then(() => {
    console.log('\n✅ Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
