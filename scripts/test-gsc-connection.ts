#!/usr/bin/env tsx
/**
 * Test Google Search Console Connection
 *
 * Verifies that GSC API credentials are working
 * Shows sample ranking data
 */

import { isGSCConfigured, getSiteSearchData } from '../src/lib/seo/google-search-console'

async function main() {
  console.log('🔍 Testing Google Search Console connection...\n')

  // Check if credentials exist
  if (!isGSCConfigured()) {
    console.log('❌ Google Search Console not configured\n')
    console.log('Missing environment variables:')
    console.log('  - GOOGLE_SEARCH_CONSOLE_CLIENT_ID')
    console.log('  - GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET')
    console.log('  - GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN\n')
    console.log('See: docs/GOOGLE-SEARCH-CONSOLE-SETUP.md for setup instructions')
    process.exit(1)
  }

  console.log('✅ Credentials found in .env\n')

  try {
    // Get last 7 days of data
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    console.log(`📊 Fetching data for ${startDate} to ${endDate}...\n`)

    const data = await getSiteSearchData(startDate, endDate)

    if (!data || data.length === 0) {
      console.log('⚠️  No data found. This could mean:')
      console.log('   1. Website not verified in Google Search Console')
      console.log('   2. No traffic in the last 7 days')
      console.log('   3. API permissions issue\n')
      console.log('Verify at: https://search.google.com/search-console')
      process.exit(1)
    }

    console.log('✅ Connection successful!\n')
    console.log(`📈 Found ${data.length} keyword/page combinations\n`)

    // Show top 10 keywords
    const topKeywords = data.sort((a, b) => b.clicks - a.clicks).slice(0, 10)

    console.log('🔝 Top 10 Keywords (by clicks):\n')
    topKeywords.forEach((row, i) => {
      console.log(`${i + 1}. "${row.keys[0]}"`)
      console.log(`   Position: #${Math.round(row.position)}`)
      console.log(`   Clicks: ${row.clicks}`)
      console.log(`   Impressions: ${row.impressions}`)
      console.log(`   CTR: ${(row.ctr * 100).toFixed(1)}%`)
      console.log('')
    })

    console.log('✨ Test complete! SEO tracking is ready to use.')
    console.log('\nNext steps:')
    console.log('  1. Run: npx tsx scripts/daily-seo-check.ts')
    console.log('  2. Check your email for SEO alerts')
    console.log('  3. View dashboard: https://gangrunprinting.com/admin/seo/performance')
  } catch (error) {
    console.error('❌ Connection failed:', error)
    console.log('\nTroubleshooting:')
    console.log('  1. Verify credentials are correct in .env')
    console.log('  2. Check if API is enabled in Google Cloud Console')
    console.log('  3. Ensure website is verified in Search Console')
    console.log('\nSee: docs/GOOGLE-SEARCH-CONSOLE-SETUP.md')
    process.exit(1)
  }
}

main()
