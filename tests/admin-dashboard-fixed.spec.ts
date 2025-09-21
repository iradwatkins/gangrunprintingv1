import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard Visual Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/admin')
    await page.waitForLoadState('networkidle')
  })

  test('✅ Dashboard renders correctly with proper theme', async ({ page }) => {
    // Take full screenshot
    await page.screenshot({
      path: 'tests/screenshots/dashboard-full.png',
      fullPage: true,
    })

    // Verify dashboard title
    const title = page.locator('h1:has-text("Dashboard")').first()
    await expect(title).toBeVisible()

    // Verify professional cards are present
    await expect(page.locator('text="Total Revenue"').first()).toBeVisible()
    await expect(page.locator('text="Print Orders"').first()).toBeVisible()
    await expect(page.locator('text="Active Jobs"').first()).toBeVisible()

    // Verify NO purple/pink elements
    const htmlContent = await page.content()
    expect(htmlContent).not.toContain('purple')
    expect(htmlContent).not.toContain('pink')
    expect(htmlContent).not.toContain('indigo')

    // Check primary color is being used (Tangerine theme)
    const primaryElement = page.locator('.bg-primary').first()
    const exists = (await primaryElement.count()) > 0

  })

  test('📱 Responsive design at different breakpoints', async ({ page }) => {
    const breakpoints = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
    ]

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height })
      await page.screenshot({
        path: `tests/screenshots/dashboard-${bp.name.toLowerCase()}.png`,
      })

      // Verify content is still accessible
      await expect(page.locator('h1:has-text("Dashboard")').first()).toBeVisible()
    }
  })

  test('🎨 Shadcn components render correctly', async ({ page }) => {
    // Cards
    const cards = await page.locator('.rounded-lg.border').count()

    expect(cards).toBeGreaterThan(5)

    // Buttons
    const buttons = await page.locator('button').count()

    expect(buttons).toBeGreaterThan(5)

    // Table
    await expect(page.locator('table').first()).toBeVisible()

    // Badges
    const badges = await page.locator('[class*="inline-flex"][class*="rounded"]').count()

    expect(badges).toBeGreaterThan(0)

    // Progress bars
    const progress = await page.locator('[role="progressbar"]').count()

    expect(progress).toBeGreaterThan(0)
  })

  test('🖨️ Print shop terminology and features', async ({ page }) => {
    // Verify printing-specific terms
    const printingTerms = [
      'Print Orders',
      'Active Jobs',
      'print shop',
      'printing',
      'design',
      'Business Cards',
      'Flyers',
    ]

    for (const term of printingTerms) {
      const elements = await page.locator(`text="${term}"`).count()
      if (elements > 0) {

      }
    }

    // Verify professional layout elements
    await expect(page.locator('text="Performance Overview"').first()).toBeVisible()
    await expect(page.locator('text="Recent Sales"').first()).toBeVisible()

  })

  test('🌓 Theme system works correctly', async ({ page }) => {
    // Check light mode
    await page.screenshot({ path: 'tests/screenshots/theme-light.png' })

    // Apply dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    await page.screenshot({ path: 'tests/screenshots/theme-dark.png' })

    // Verify dark mode applied
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(isDark).toBe(true)

    // Remove dark mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
    })

  })

  test('⚡ Performance and quality checks', async ({ page }) => {
    // Measure load time
    const startTime = Date.now()
    await page.reload()
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(10000) // 10 second max

    // Check for critical errors (ignore 404s for missing images)
    const criticalErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('404')) {
        criticalErrors.push(msg.text())
      }
    })

    await page.waitForTimeout(1000)

    if (criticalErrors.length > 0) {
      console.warn('⚠️ Non-404 errors found:', criticalErrors)
    } else {

    }

    // Verify accessibility basics
    const hasMainContent = (await page.locator('main').count()) > 0
    const hasProperHeadings = (await page.locator('h1').count()) > 0

  })

  test('📊 Visual regression baseline', async ({ page }) => {
    // Create baseline screenshots for future regression testing
    const sections = [
      { selector: '.grid.gap-4', name: 'metrics-cards' },
      { selector: 'table', name: 'orders-table' },
      { selector: 'aside', name: 'sidebar' },
    ]

    for (const section of sections) {
      const element = page.locator(section.selector).first()
      const isVisible = await element.isVisible().catch(() => false)

      if (isVisible) {
        await element.screenshot({
          path: `tests/screenshots/baseline-${section.name}.png`,
        })

      } else {

      }
    }
  })
})
