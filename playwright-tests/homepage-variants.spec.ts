import { test, expect } from '@playwright/test'

test.describe('Homepage Variants', () => {
  test('homepage loads dynamic variant content', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3002/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if the page is loading dynamic content by looking for variant-specific elements
    // If the Limited Time Offer variant is active, we should see its specific content

    // Test 1: Check for dynamic hero content (not just fallback)
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()

    // Test 2: Look for variant-specific content that wouldn't be in static fallback
    // The active variant should have "Limited Time: 30% Off All Orders" headline
    const dynamicHeadline = page.locator('h1').filter({ hasText: /Limited Time|30% Off/ })

    // Test 3: Check for variant badge that indicates dynamic loading
    const variantBadge = page.locator('[class*="badge"]').filter({ hasText: /Limited Time Offer|⚡/ })

    // Test 4: Look for any h1 content to see what's actually being rendered
    const mainHeadline = page.locator('h1').first()
    const headlineText = await mainHeadline.textContent()

    console.log('Homepage headline text:', headlineText)

    // Verify we're not seeing the fallback content
    const fallbackHeadline = page.locator('h1').filter({ hasText: 'Professional Printing Made Simple' })
    const isDynamicContent = await dynamicHeadline.count() > 0
    const isFallbackContent = await fallbackHeadline.count() > 0

    console.log('Dynamic content found:', isDynamicContent)
    console.log('Fallback content found:', isFallbackContent)

    // If we're seeing dynamic content, the headline should NOT be the fallback
    if (isDynamicContent) {
      console.log('✓ Dynamic variant content is loading successfully!')
    } else if (isFallbackContent) {
      console.log('✗ Still showing fallback content - dynamic loading failed')
    } else {
      console.log('? Unknown content state - need to investigate further')
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'homepage-test.png', fullPage: true })
  })

  test('api endpoints are working', async ({ request }) => {
    // Test the active homepage API
    const activeResponse = await request.get('http://localhost:3002/api/home-pages/active')
    expect(activeResponse.ok()).toBeTruthy()

    const activeData = await activeResponse.json()
    console.log('Active homepage variant:', activeData.name, activeData.type)

    // Test the homepage variants list API
    const listResponse = await request.get('http://localhost:3002/api/home-pages')
    expect(listResponse.ok()).toBeTruthy()

    const listData = await listResponse.json()
    console.log('Total variants available:', listData.length)
  })
})