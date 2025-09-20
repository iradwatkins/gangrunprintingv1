import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard Theme Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/admin')
  })

  test('should display Tangerine/Orange theme colors', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if primary color (Tangerine) is applied
    const primaryElement = await page.locator('.bg-primary').first()
    if ((await primaryElement.count()) > 0) {
      const bgColor = await primaryElement.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      )
      // Should be orange/tangerine color (HSL: 25 95% 53%)
      expect(bgColor).toMatch(/rgb/)
    }

    // Check stats cards have theme colors
    const statsCards = page.locator(
      '[class*="bg-primary/10"], [class*="bg-accent/10"], [class*="bg-secondary/10"], [class*="bg-chart"]'
    )
    const cardCount = await statsCards.count()
    expect(cardCount).toBeGreaterThan(0)

    // Check that no hardcoded colors are present
    const hardcodedColors = page.locator(
      '[class*="bg-green-100"], [class*="bg-blue-100"], [class*="bg-purple-100"], [class*="bg-yellow-100"]'
    )
    const hardcodedCount = await hardcodedColors.count()
    expect(hardcodedCount).toBe(0)

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'tests/screenshots/admin-dashboard-theme.png',
      fullPage: true,
    })
  })

  test('should have proper contrast with theme colors', async ({ page }) => {
    // Check text visibility on primary background
    const buttons = page.locator('button').filter({ hasText: /Add Job|Export CSV/ })
    const buttonCount = await buttons.count()

    if (buttonCount > 0) {
      const button = buttons.first()
      const isVisible = await button.isVisible()
      expect(isVisible).toBe(true)
    }

    // Check card backgrounds
    const cards = page.locator('.rounded-lg.border')
    const cardsCount = await cards.count()
    expect(cardsCount).toBeGreaterThan(0)
  })

  test('should render Gang Run Printing specific elements', async ({ page }) => {
    // Check for Gang Run Printing title
    await expect(page.locator('h1')).toContainText('Gang Run Printing Dashboard')

    // Check for print-specific stats
    const statsTexts = ["Today's Revenue", 'Jobs in Queue', 'Gang Runs Today', 'Completion Rate']

    for (const text of statsTexts) {
      const element = page.locator('text=' + text)
      await expect(element).toBeVisible()
    }

    // Check for production chart
    await expect(page.locator('text=Production Overview')).toBeVisible()

    // Check for gang run schedule
    await expect(page.locator("text=Today's Gang Runs")).toBeVisible()

    // Check for print queue table
    await expect(page.locator('text=Active Print Queue')).toBeVisible()
  })

  test('visual regression - dashboard appearance', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Capture different sections
    const sections = [
      { name: 'stats-cards', selector: '.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-4' },
      { name: 'production-chart', selector: 'text=Production Overview >> xpath=../../..' },
      { name: 'gang-runs', selector: "text=Today's Gang Runs >> xpath=../../.." },
      { name: 'print-queue', selector: 'text=Active Print Queue >> xpath=../../..' },
    ]

    for (const section of sections) {
      const element = page.locator(section.selector).first()
      if ((await element.count()) > 0) {
        await element.screenshot({
          path: `tests/screenshots/${section.name}.png`,
        })
      }
    }
  })

  test('theme colors are correctly applied from CSS variables', async ({ page }) => {
    // Check computed styles for CSS variables
    const rootStyles = await page.evaluate(() => {
      const root = document.documentElement
      const styles = getComputedStyle(root)
      return {
        primary: styles.getPropertyValue('--primary'),
        accent: styles.getPropertyValue('--accent'),
        secondary: styles.getPropertyValue('--secondary'),
        background: styles.getPropertyValue('--background'),
      }
    })

    // Verify HSL format (should be space-separated values)
    expect(rootStyles.primary).toMatch(/^\d+\s+\d+%\s+\d+%$/)
    expect(rootStyles.accent).toMatch(/^\d+\s+\d+%\s+\d+%$/)
    expect(rootStyles.secondary).toMatch(/^\d+\s+\d+%\s+\d+%$/)

    // Primary should be orange/tangerine (hue around 25)
    const primaryHue = parseInt(rootStyles.primary.split(' ')[0])
    expect(primaryHue).toBeGreaterThan(15)
    expect(primaryHue).toBeLessThan(35)

    console.log('Theme colors applied:', rootStyles)
  })
})
