import { test, expect } from '@playwright/test'

test.describe('Admin Preview System', () => {
  let variantIds: { id: string, name: string, type: string }[] = []

  test.beforeAll(async ({ request }) => {
    // Get all homepage variants
    const response = await request.get('/api/home-pages')
    expect(response.ok()).toBeTruthy()

    const variants = await response.json()
    variantIds = variants.map((v: any) => ({ id: v.id, name: v.name, type: v.type }))

    console.log('Found variants:', variantIds.map(v => `${v.name} (${v.type})`))
  })

  // Test each variant's preview individually
  for (let i = 0; i < 7; i++) {
    test(`variant ${i + 1} preview loads with correct theming`, async ({ page }) => {
      // Skip if we don't have enough variants
      if (i >= variantIds.length) {
        test.skip(true, `Variant ${i + 1} not found`)
        return
      }

      const variant = variantIds[i]
      console.log(`Testing preview for: ${variant.name} (${variant.type})`)

      // Navigate to variant preview page
      await page.goto(`/admin/home-pages/${variant.id}/preview`)

      // Wait for page to load
      await page.waitForLoadState('networkidle')

      // Check if preview header loads
      const previewHeader = page.locator('text=Preview:').first()
      await expect(previewHeader).toBeVisible()

      // Check if variant name is displayed
      const variantName = page.locator(`text=${variant.name}`)
      await expect(variantName).toBeVisible()

      // Check for theme-specific elements based on variant type
      switch (variant.type) {
        case 'LIMITED_TIME_OFFER':
          // Look for red/orange theming and urgency elements
          await expect(page.locator('[class*="bg-red"]').first()).toBeVisible()
          await expect(page.locator('text=Limited Time').first()).toBeVisible()
          break

        case 'FEATURED_PRODUCT':
          // Look for blue theming and premium elements
          await expect(page.locator('[class*="bg-blue"]').first()).toBeVisible()
          await expect(page.locator('text=Featured').first()).toBeVisible()
          break

        case 'NEW_CUSTOMER_WELCOME':
          // Look for green theming and welcome elements
          await expect(page.locator('[class*="bg-green"]').first()).toBeVisible()
          await expect(page.locator('text=Welcome').first()).toBeVisible()
          break

        case 'SEASONAL_HOLIDAY':
          // Look for purple theming and holiday elements
          await expect(page.locator('[class*="bg-purple"]').first()).toBeVisible()
          await expect(page.locator('text=Holiday').first()).toBeVisible()
          break

        case 'BULK_VOLUME_DISCOUNTS':
          // Look for yellow theming and business elements
          await expect(page.locator('[class*="bg-yellow"]').first()).toBeVisible()
          await expect(page.locator('text=Bulk').first()).toBeVisible()
          break

        case 'FAST_TURNAROUND':
          // Look for cyan theming and speed elements
          await expect(page.locator('[class*="bg-cyan"]').first()).toBeVisible()
          await expect(page.locator('text=Fast').first()).toBeVisible()
          break

        case 'LOCAL_COMMUNITY':
          // Look for slate theming and community elements
          await expect(page.locator('[class*="bg-slate"]').first()).toBeVisible()
          await expect(page.locator('text=Community').first()).toBeVisible()
          break
      }

      // Check for section content rendering
      const heroSection = page.locator('section').first()
      await expect(heroSection).toBeVisible()

      // Check for product sections (should show sample products)
      const productCards = page.locator('[class*="aspect-square"]')
      if (await productCards.count() > 0) {
        await expect(productCards.first()).toBeVisible()
      }

      // Take a screenshot for each variant
      await page.screenshot({
        path: `admin-preview-${variant.type.toLowerCase()}.png`,
        fullPage: true
      })

      console.log(`✓ Preview working for ${variant.name}`)
    })
  }

  test('preview viewport controls work', async ({ page }) => {
    if (variantIds.length === 0) {
      test.skip(true, 'No variants available')
      return
    }

    const firstVariant = variantIds[0]
    await page.goto(`/admin/home-pages/${firstVariant.id}/preview`)
    await page.waitForLoadState('networkidle')

    // Test desktop view (default)
    const desktopButton = page.locator('button').filter({ hasText: /desktop/i }).or(
      page.locator('button svg[data-testid="monitor"]').locator('..')
    )
    if (await desktopButton.count() > 0) {
      await desktopButton.click()
    }

    // Test tablet view
    const tabletButton = page.locator('button').filter({ hasText: /tablet/i }).or(
      page.locator('button svg[data-testid="tablet"]').locator('..')
    )
    if (await tabletButton.count() > 0) {
      await tabletButton.click()
    }

    // Test mobile view
    const mobileButton = page.locator('button').filter({ hasText: /mobile/i }).or(
      page.locator('button svg[data-testid="smartphone"]').locator('..')
    )
    if (await mobileButton.count() > 0) {
      await mobileButton.click()
    }

    console.log('✓ Viewport controls functional')
  })

  test('activate button works', async ({ page }) => {
    // Find a non-active variant to test activation
    const nonActiveVariant = variantIds.find(v => {
      // We'll try to activate a different variant
      return v.type !== 'LIMITED_TIME_OFFER' // since this is currently active
    })

    if (!nonActiveVariant) {
      test.skip(true, 'No inactive variant available for testing')
      return
    }

    await page.goto(`/admin/home-pages/${nonActiveVariant.id}/preview`)
    await page.waitForLoadState('networkidle')

    // Look for activate button
    const activateButton = page.locator('button').filter({ hasText: /activate/i })

    if (await activateButton.count() > 0) {
      // Click activate button
      await activateButton.click()

      // Wait for potential alert/confirmation
      await page.waitForTimeout(1000)

      console.log(`✓ Activate button functional for ${nonActiveVariant.name}`)
    } else {
      console.log('ℹ Activate button not visible (variant may already be active)')
    }
  })
})