#!/usr/bin/env tsx
/**
 * Submit Sitemap to Google Search Console
 * Fixes the "Couldn't fetch" errors in GSC
 */

import { config } from 'dotenv'
import { google } from 'googleapis'

// Load environment variables
config()

async function submitSitemap() {
  console.log('🗺️  Submitting sitemap to Google Search Console...\n')

  // Initialize Google Search Console API
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET
  )

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN,
  })

  const searchConsole = google.searchconsole({ version: 'v1', auth })
  const siteUrl = 'sc-domain:gangrunprinting.com'
  const sitemapUrl = 'https://gangrunprinting.com/sitemap.xml'

  try {
    // Submit the sitemap
    console.log(`📤 Submitting: ${sitemapUrl}`)
    console.log(`📍 To property: ${siteUrl}\n`)

    await searchConsole.sitemaps.submit({
      siteUrl,
      feedpath: sitemapUrl,
    })

    console.log('✅ Sitemap submitted successfully!\n')

    // Fetch sitemap status
    console.log('📊 Checking sitemap status...\n')

    const response = await searchConsole.sitemaps.get({
      siteUrl,
      feedpath: sitemapUrl,
    })

    console.log('📈 Sitemap Status:')
    console.log(`   Path: ${response.data.path}`)
    console.log(`   Type: ${response.data.type || 'sitemap'}`)
    console.log(`   Submitted: ${response.data.lastSubmitted || 'Just now'}`)
    console.log(`   Last Downloaded: ${response.data.lastDownloaded || 'Pending...'}`)
    console.log(`   Status: ${response.data.isSitemapsIndex ? 'Sitemap Index' : 'Regular Sitemap'}`)

    if (response.data.contents && response.data.contents.length > 0) {
      console.log(`   URLs Submitted: ${response.data.contents[0].submitted || 'Pending...'}`)
      console.log(`   URLs Indexed: ${response.data.contents[0].indexed || 'Pending...'}`)
    }

    console.log('\n✨ Done! Check Google Search Console in 24-48 hours to verify indexing.')
    console.log(
      '🔗 https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Agangrunprinting.com'
    )
  } catch (error: any) {
    if (error.code === 404) {
      console.log('ℹ️  Sitemap not found in GSC - this is expected for first submission.')
      console.log('✅ It has been submitted and Google will crawl it within 24-48 hours.')
    } else {
      console.error('❌ Error:', error.message)
      if (error.errors) {
        console.error('Details:', error.errors)
      }
    }
  }
}

// Check if credentials are configured
if (
  !process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID ||
  !process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET ||
  !process.env.GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN
) {
  console.log('❌ Google Search Console credentials not configured in .env')
  process.exit(1)
}

submitSitemap().catch(console.error)
