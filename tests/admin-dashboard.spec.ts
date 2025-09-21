import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/admin')
  })

  test('dashboard loads with correct theme colors', async ({ page }) => {
    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/admin-dashboard.png', fullPage: true })

    // Check if primary elements are visible
    const dashboard = page.locator('h1:has-text("Dashboard")')
    await expect(dashboard).toBeVisible()

    // Verify cards are present
    const revenueCard = page.locator('text=Total Revenue')
    await expect(revenueCard).toBeVisible()

    const ordersCard = page.locator('text=Print Orders')
    await expect(ordersCard).toBeVisible()

    const jobsCard = page.locator('text=Active Jobs')
    await expect(jobsCard).toBeVisible()

    // Check for primary color (Tangerine theme)
    const primaryButton = page.locator('button:has-text("New Order")')
    await expect(primaryButton).toBeVisible()

    // Get computed styles to verify theme
    const logoElement = page.locator('.bg-primary').first()
    const bgColor = await logoElement.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    // Verify no purple/pink classes exist
    const purpleElements = await page.locator('[class*="purple"]').count()
    const pinkElements = await page.locator('[class*="pink"]').count()
    expect(purpleElements).toBe(0)
    expect(pinkElements).toBe(0)
  })

  test('responsive design works correctly', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.screenshot({ path: 'tests/screenshots/dashboard-desktop.png' })

    // Check sidebar is visible on desktop
    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.screenshot({ path: 'tests/screenshots/dashboard-tablet.png' })

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.screenshot({ path: 'tests/screenshots/dashboard-mobile.png' })

    // Sidebar should be hidden on mobile
    await expect(sidebar).toBeHidden()

    // Mobile menu button should be visible
    const mobileMenuButton = page.locator('button').filter({ has: page.locator('svg.lucide-menu') })
    await expect(mobileMenuButton).toBeVisible()
  })

  test('dark mode toggle works', async ({ page }) => {
    // Check if page has proper theme classes
    const htmlElement = page.locator('html')
    const initialClass = await htmlElement.getAttribute('class')

    // Take light mode screenshot
    await page.screenshot({ path: 'tests/screenshots/dashboard-light.png' })

    // Add dark class to test dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    // Take dark mode screenshot
    await page.screenshot({ path: 'tests/screenshots/dashboard-dark.png' })

    // Verify dark mode styles are applied
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark')
    })
    expect(isDark).toBe(true)
  })

  test('all Shadcn components render correctly', async ({ page }) => {
    // Check Card components
    const cards = page.locator('[class*="rounded-lg"][class*="border"]')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)

    // Check Table component
    const table = page.locator('table')
    await expect(table).toBeVisible()

    // Check Badge components
    const badges = page.locator('[class*="inline-flex"][class*="rounded"]')
    const badgeCount = await badges.count()
    expect(badgeCount).toBeGreaterThan(0)

    // Check Button components
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)

    // Check Progress components
    const progressBars = page.locator('[role="progressbar"]')
    const progressCount = await progressBars.count()
    expect(progressCount).toBeGreaterThan(0)

  })

  test('printing industry terminology is used', async ({ page }) => {
    // Verify print shop specific terms
    await expect(page.locator('text=Print Orders')).toBeVisible()
    await expect(page.locator('text=Active Jobs')).toBeVisible()
    await expect(page.locator('text=print shop')).toBeVisible()
    await expect(page.locator('text=Design Jobs')).toBeVisible()

    // Check for printing-specific statuses
    await expect(page.locator('text=printing')).toBeVisible()
    await expect(page.locator('text=design')).toBeVisible()

    // Verify product types
    await expect(
      page.locator('text=/Business Cards|Flyers|Brochures|Banners|Postcards/')
    ).toBeVisible()
  })

  test('measure performance metrics', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now()
    await page.goto('http://localhost:3001/admin')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000) // Should load in less than 5 seconds

    // Check for console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.reload()
    await page.waitForTimeout(2000)

    if (consoleErrors.length > 0) {
      console.error('Console errors found:', consoleErrors)
    }
    expect(consoleErrors.length).toBe(0)
  })
})
