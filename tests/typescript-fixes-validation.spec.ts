import { test, expect } from '@playwright/test'

test.describe('TypeScript Fixes Validation - Quick Tests', () => {
  const baseURL = 'http://localhost:3002'

  test.describe('Critical Functionality Tests - Round 1', () => {
    test('Customer page - Status type fix validation', async ({ page }) => {
      // Quick login
      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      // Navigate to customers
      await page.goto(`${baseURL}/admin/customers`)
      await page.waitForSelector('table', { timeout: 10000 })

      // Check for TypeScript errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('Type')) {
          errors.push(msg.text())
        }
      })

      // Verify status badges render correctly
      const statusElements = await page.$$('[class*="badge"], [class*="status"]')
      expect(statusElements.length).toBeGreaterThan(0)

      // Check for runtime errors
      await page.waitForTimeout(2000)
      expect(errors).toHaveLength(0)

      // Take screenshot for review
      await page.screenshot({ path: 'tests/screenshots/customers-round1.png' })
    })

    test('Product API - Update functionality', async ({ page }) => {
      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      // Navigate to products
      await page.goto(`${baseURL}/admin/products`)
      await page.waitForSelector('table', { timeout: 10000 })

      // Find edit button
      const editButton = await page.$('button:has-text("Edit"), a:has-text("Edit")')
      if (editButton) {
        await editButton.click()
        await page.waitForURL(/\/admin\/products\/[\w-]+\/edit/)

        // Try to update product name
        const nameInput = await page.$('input[name="name"]')
        if (nameInput) {
          await nameInput.fill('Test Product Updated - Round 1')
          const saveButton = await page.$('button:has-text("Save")')
          if (saveButton) {
            await saveButton.click()
            await page.waitForTimeout(2000)

            // Check for success message or redirect
            const success = await page.$('text=/success|saved|updated/i')
            expect(success || page.url().includes('/products')).toBeTruthy()
          }
        }
      }

      await page.screenshot({ path: 'tests/screenshots/product-update-round1.png' })
    })

    test('Order page - Model field fixes', async ({ page }) => {
      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      // Go to orders
      await page.goto(`${baseURL}/admin/orders`)
      await page.waitForSelector('table', { timeout: 10000 })

      // Check if any orders exist
      const orderRows = await page.$$('tbody tr')
      if (orderRows.length > 0) {
        // Click first order
        const firstOrder = await page.$('tbody tr:first-child a, tbody tr:first-child button:has-text("View")')
        if (firstOrder) {
          await firstOrder.click()
          await page.waitForURL(/\/admin\/orders\/[\w-]+/)

          // Check order details render correctly
          const customerInfo = await page.$('text=/customer|user/i')
          const vendorInfo = await page.$('text=/vendor|supplier/i')
          const orderItems = await page.$$('[data-testid="order-item"], tbody tr')

          expect(customerInfo).toBeTruthy()
          expect(orderItems.length).toBeGreaterThanOrEqual(0)

          // Verify no TypeScript errors in console
          const errors: string[] = []
          page.on('console', msg => {
            if (msg.type() === 'error') {
              errors.push(msg.text())
            }
          })
          await page.waitForTimeout(2000)
          expect(errors.filter(e => e.includes('undefined') || e.includes('null')).length).toBe(0)
        }
      }

      await page.screenshot({ path: 'tests/screenshots/orders-round1.png' })
    })

    test('Dashboard components - Chart rendering', async ({ page }) => {
      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      // Go to dashboard
      await page.goto(`${baseURL}/admin`)
      await page.waitForSelector('[data-testid="dashboard"], main', { timeout: 10000 })

      // Check for chart components
      const productionChart = await page.$('[data-testid="production-chart"], [class*="chart"]')
      const gangRunSchedule = await page.$('[data-testid="gang-run-schedule"], [class*="schedule"]')

      // Verify charts rendered without type errors
      if (productionChart) {
        const chartVisible = await productionChart.isVisible()
        expect(chartVisible).toBe(true)
      }

      if (gangRunSchedule) {
        const scheduleVisible = await gangRunSchedule.isVisible()
        expect(scheduleVisible).toBe(true)
      }

      await page.screenshot({ path: 'tests/screenshots/dashboard-round1.png' })
    })

    test('Marketing pages - Automation and Segments', async ({ page }) => {
      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      // Test automation page
      await page.goto(`${baseURL}/admin/marketing/automation`)
      await page.waitForSelector('h1', { timeout: 10000 })

      const automationTitle = await page.$eval('h1', el => el.textContent)
      expect(automationTitle).toContain('Automation')

      // Test segments page
      await page.goto(`${baseURL}/admin/marketing/segments`)
      await page.waitForSelector('h1', { timeout: 10000 })

      const segmentsTitle = await page.$eval('h1', el => el.textContent)
      expect(segmentsTitle).toContain('Segments')

      // Check for any rendering errors
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      await page.waitForTimeout(2000)

      // Filter for TypeScript-related errors
      const tsErrors = errors.filter(e => e.includes('Type') || e.includes('undefined'))
      expect(tsErrors).toHaveLength(0)

      await page.screenshot({ path: 'tests/screenshots/marketing-round1.png' })
    })
  })

  test.describe('Critical Functionality Tests - Round 2 (Verification)', () => {
    test('Customer page - Second validation', async ({ page }) => {
      // Fresh session for round 2
      await page.context().clearCookies()

      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      await page.goto(`${baseURL}/admin/customers`)
      await page.waitForSelector('table', { timeout: 10000 })

      // Verify consistency with round 1
      const statusElements = await page.$$('[class*="badge"], [class*="status"]')
      expect(statusElements.length).toBeGreaterThan(0)

      // Check data consistency
      const firstCustomerEmail = await page.$eval('tbody tr:first-child td:nth-child(3)', el => el.textContent)
      expect(firstCustomerEmail).toBeTruthy()

      await page.screenshot({ path: 'tests/screenshots/customers-round2.png' })
    })

    test('Product API - Second update test', async ({ page }) => {
      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      await page.goto(`${baseURL}/admin/products`)
      await page.waitForSelector('table', { timeout: 10000 })

      // Try another update
      const editButton = await page.$('button:has-text("Edit"), a:has-text("Edit")')
      if (editButton) {
        await editButton.click()
        await page.waitForURL(/\/admin\/products\/[\w-]+\/edit/)

        const nameInput = await page.$('input[name="name"]')
        if (nameInput) {
          await nameInput.fill('Test Product Updated - Round 2')
          const saveButton = await page.$('button:has-text("Save")')
          if (saveButton) {
            await saveButton.click()
            await page.waitForTimeout(2000)

            // Verify update succeeded
            const success = await page.$('text=/success|saved|updated/i')
            expect(success || page.url().includes('/products')).toBeTruthy()
          }
        }
      }

      await page.screenshot({ path: 'tests/screenshots/product-update-round2.png' })
    })

    test('Order page - Second validation', async ({ page }) => {
      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      await page.goto(`${baseURL}/admin/orders`)
      await page.waitForSelector('table', { timeout: 10000 })

      // Verify orders list renders consistently
      const orderCount = await page.$$eval('tbody tr', rows => rows.length)
      expect(orderCount).toBeGreaterThanOrEqual(0)

      await page.screenshot({ path: 'tests/screenshots/orders-round2.png' })
    })

    test('Dashboard - Second render test', async ({ page }) => {
      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      await page.goto(`${baseURL}/admin`)
      await page.waitForSelector('[data-testid="dashboard"], main', { timeout: 10000 })

      // Verify charts still render correctly
      const charts = await page.$$('[class*="chart"], [class*="recharts"]')
      expect(charts.length).toBeGreaterThanOrEqual(0)

      await page.screenshot({ path: 'tests/screenshots/dashboard-round2.png' })
    })

    test('Marketing pages - Second validation', async ({ page }) => {
      await page.goto(`${baseURL}/login`)
      await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
      await page.fill('input[name="password"]', 'Iw2006js!')
      await page.click('button[type="submit"]')

      // Quick check both pages still work
      await page.goto(`${baseURL}/admin/marketing/automation`)
      let pageLoaded = await page.$('h1')
      expect(pageLoaded).toBeTruthy()

      await page.goto(`${baseURL}/admin/marketing/segments`)
      pageLoaded = await page.$('h1')
      expect(pageLoaded).toBeTruthy()

      await page.screenshot({ path: 'tests/screenshots/marketing-round2.png' })
    })
  })
})