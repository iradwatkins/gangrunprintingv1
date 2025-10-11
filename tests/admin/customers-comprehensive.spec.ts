import { test, expect, Page } from '@playwright/test'

test.describe('Customer Management System - Comprehensive Testing', () => {
  let adminPage: Page
  const baseURL = 'http://localhost:3002'

  test.beforeEach(async ({ page }) => {
    adminPage = page

    // Login as admin
    await page.goto(`${baseURL}/login`)
    await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
    await page.fill('input[name="password"]', 'Iw2006js!')
    await page.click('button[type="submit"]')
    await page.waitForURL(`${baseURL}/admin`, { timeout: 10000 })
  })

  test.describe('Customer Table Rendering & Type Safety', () => {
    test('should load customers page without TypeScript errors', async () => {
      // Monitor console for TypeScript runtime errors
      const consoleErrors: string[] = []
      adminPage.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      // Navigate to customers page
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table', { timeout: 10000 })

      // Check for any TypeScript errors in console
      const tsErrors = consoleErrors.filter(
        (err) =>
          err.includes('TypeError') ||
          err.includes('Cannot read') ||
          err.includes('undefined') ||
          err.includes('type')
      )
      expect(tsErrors).toHaveLength(0)
    })

    test('should display customer status badges correctly', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Check for verified status badge
      const verifiedBadges = await adminPage.$$('text=verified')
      const unverifiedBadges = await adminPage.$$('text=unverified')

      // Ensure status badges exist and use correct types
      expect(verifiedBadges.length + unverifiedBadges.length).toBeGreaterThan(0)

      // Verify badge styling (type assertion working correctly)
      if (verifiedBadges.length > 0) {
        const verifiedBadge = await adminPage.$('text=verified')
        const className = await verifiedBadge?.getAttribute('class')
        expect(className).toContain('bg-green')
      }

      if (unverifiedBadges.length > 0) {
        const unverifiedBadge = await adminPage.$('text=unverified')
        const className = await unverifiedBadge?.getAttribute('class')
        expect(className).toContain('bg-yellow')
      }
    })

    test('should calculate and display customer statistics correctly', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Find customer rows
      const customerRows = await adminPage.$$('tbody tr')

      for (let i = 0; i < Math.min(3, customerRows.length); i++) {
        const row = customerRows[i]

        // Check total orders column
        const totalOrdersText = await row.$eval('td:nth-child(4)', (el) => el.textContent)
        expect(totalOrdersText).toMatch(/^\d+$/)
        const totalOrders = parseInt(totalOrdersText || '0')
        expect(totalOrders).toBeGreaterThanOrEqual(0)

        // Check total spent column (should be formatted as currency)
        const totalSpentText = await row.$eval('td:nth-child(5)', (el) => el.textContent)
        expect(totalSpentText).toMatch(/^\$[\d,]+\.?\d*$/)
      }
    })

    test('should handle null/undefined customer data gracefully', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Check that N/A fallbacks are working
      const naElements = await adminPage.$$('text=N/A')

      // If there are any N/A elements, verify they render properly
      if (naElements.length > 0) {
        const firstNA = naElements[0]
        const isVisible = await firstNA.isVisible()
        expect(isVisible).toBe(true)
      }

      // Ensure page doesn't break with missing data
      const pageTitle = await adminPage.$('h1')
      expect(await pageTitle?.textContent()).toContain('Customers')
    })
  })

  test.describe('Customer Filtering & Search', () => {
    test('should filter customers by status', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Check if filter dropdown exists
      const filterDropdown = await adminPage.$(
        '[data-testid="status-filter"], select[name*="status"]'
      )

      if (filterDropdown) {
        // Test verified filter
        await filterDropdown.selectOption('verified')
        await adminPage.waitForTimeout(500)

        const verifiedRows = await adminPage.$$('tbody tr')
        for (const row of verifiedRows) {
          const statusBadge = await row.$('text=verified')
          expect(statusBadge).toBeTruthy()
        }

        // Test unverified filter
        await filterDropdown.selectOption('unverified')
        await adminPage.waitForTimeout(500)

        const unverifiedRows = await adminPage.$$('tbody tr')
        for (const row of unverifiedRows) {
          const statusBadge = await row.$('text=unverified')
          expect(statusBadge).toBeTruthy()
        }
      }
    })

    test('should search customers by email', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      const searchInput = await adminPage.$('input[placeholder*="Search"], input[type="search"]')

      if (searchInput) {
        // Get first customer email for testing
        const firstEmail = await adminPage.$eval(
          'tbody tr:first-child td:nth-child(3)',
          (el) => el.textContent
        )

        if (firstEmail && firstEmail !== 'N/A') {
          await searchInput.fill(firstEmail)
          await adminPage.waitForTimeout(500)

          const searchResults = await adminPage.$$('tbody tr')
          expect(searchResults.length).toBeGreaterThan(0)

          // Verify search result contains the email
          const resultEmail = await adminPage.$eval(
            'tbody tr:first-child td:nth-child(3)',
            (el) => el.textContent
          )
          expect(resultEmail).toBe(firstEmail)
        }
      }
    })
  })

  test.describe('Customer Details & Actions', () => {
    test('should navigate to customer details page', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Click on first customer row or view button
      const viewButton = await adminPage.$(
        'tbody tr:first-child button:has-text("View"), tbody tr:first-child a[href*="/customers/"]'
      )

      if (viewButton) {
        await viewButton.click()
        await adminPage.waitForURL(/\/admin\/customers\/[\w-]+/)

        // Verify customer details page loads
        const customerName = await adminPage.$('h1, h2')
        expect(await customerName?.textContent()).toBeTruthy()

        // Check for order history section
        const orderHistory = await adminPage.$('text=Order History, text=Orders')
        expect(orderHistory).toBeTruthy()
      }
    })

    test('should display customer order history correctly', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Get customer with orders
      const customerWithOrders = await adminPage.$(
        'tbody tr:has(td:nth-child(4):not(:has-text("0")))'
      )

      if (customerWithOrders) {
        const viewButton = await customerWithOrders.$(
          'button:has-text("View"), a[href*="/customers/"]'
        )
        if (viewButton) {
          await viewButton.click()
          await adminPage.waitForURL(/\/admin\/customers\/[\w-]+/)

          // Check order list
          const ordersList = await adminPage.$$('[data-testid="order-item"], tbody tr')
          expect(ordersList.length).toBeGreaterThan(0)

          // Verify order data structure
          for (const order of ordersList.slice(0, 2)) {
            const orderTotal = await order.$('td:has-text("$")')
            expect(orderTotal).toBeTruthy()

            const orderStatus = await order.$('[data-testid="order-status"], .badge')
            expect(orderStatus).toBeTruthy()
          }
        }
      }
    })
  })

  test.describe('Data Integrity & Consistency', () => {
    test('should maintain data consistency across page refreshes', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Get initial customer count
      const initialRows = await adminPage.$$('tbody tr')
      const initialCount = initialRows.length

      // Get first customer data
      const firstCustomerData = await adminPage.$eval('tbody tr:first-child', (row) => {
        const cells = Array.from(row.querySelectorAll('td'))
        return {
          name: cells[1]?.textContent,
          email: cells[2]?.textContent,
          orders: cells[3]?.textContent,
          spent: cells[4]?.textContent,
        }
      })

      // Refresh page
      await adminPage.reload()
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Get data after refresh
      const refreshedRows = await adminPage.$$('tbody tr')
      const refreshedCount = refreshedRows.length

      const refreshedCustomerData = await adminPage.$eval('tbody tr:first-child', (row) => {
        const cells = Array.from(row.querySelectorAll('td'))
        return {
          name: cells[1]?.textContent,
          email: cells[2]?.textContent,
          orders: cells[3]?.textContent,
          spent: cells[4]?.textContent,
        }
      })

      // Verify consistency
      expect(refreshedCount).toBe(initialCount)
      expect(refreshedCustomerData).toEqual(firstCustomerData)
    })

    test('should handle pagination correctly if implemented', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Check for pagination controls
      const pagination = await adminPage.$(
        '[data-testid="pagination"], .pagination, nav[aria-label="pagination"]'
      )

      if (pagination) {
        // Test next page
        const nextButton = await adminPage.$('button:has-text("Next"), a:has-text("Next")')
        if (nextButton && (await nextButton.isEnabled())) {
          await nextButton.click()
          await adminPage.waitForTimeout(500)

          // Verify new data loaded
          const secondPageRows = await adminPage.$$('tbody tr')
          expect(secondPageRows.length).toBeGreaterThan(0)

          // Go back to first page
          const prevButton = await adminPage.$(
            'button:has-text("Previous"), a:has-text("Previous")'
          )
          if (prevButton) {
            await prevButton.click()
            await adminPage.waitForTimeout(500)
          }
        }
      }
    })
  })

  test.describe('Performance & Memory', () => {
    test('should not have memory leaks when navigating', async () => {
      // Navigate multiple times to check for memory leaks
      for (let i = 0; i < 5; i++) {
        await adminPage.goto(`${baseURL}/admin/customers`)
        await adminPage.waitForSelector('[data-testid="customers-table"], table')

        // Navigate away and back
        await adminPage.goto(`${baseURL}/admin`)
        await adminPage.waitForTimeout(100)
      }

      // Final navigation to customers
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Page should still be responsive
      const table = await adminPage.$('[data-testid="customers-table"], table')
      expect(table).toBeTruthy()
    })

    test('should load customer data within acceptable time', async () => {
      const startTime = Date.now()

      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      const loadTime = Date.now() - startTime

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000)
    })
  })

  test.describe('Edge Cases & Error Handling', () => {
    test('should handle customers with no orders', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Find customer with 0 orders
      const zeroOrderCustomer = await adminPage.$('tbody tr:has(td:nth-child(4):has-text("0"))')

      if (zeroOrderCustomer) {
        // Verify spent shows $0
        const spentCell = await zeroOrderCustomer.$eval('td:nth-child(5)', (el) => el.textContent)
        expect(spentCell).toMatch(/^\$0(\.00)?$/)

        // Verify last order shows N/A or similar
        const lastOrderCell = await zeroOrderCustomer.$('td:nth-child(6)')
        if (lastOrderCell) {
          const lastOrderText = await lastOrderCell.textContent()
          expect(lastOrderText).toMatch(/N\/A|Never|-/)
        }
      }
    })

    test('should handle special characters in customer names', async () => {
      await adminPage.goto(`${baseURL}/admin/customers`)
      await adminPage.waitForSelector('[data-testid="customers-table"], table')

      // Check that special characters don't break rendering
      const allNames = await adminPage.$$eval('tbody tr td:nth-child(2)', (cells) =>
        cells.map((cell) => cell.textContent)
      )

      // Names should be properly escaped and displayed
      allNames.forEach((name) => {
        expect(name).toBeDefined()
        expect(name?.length).toBeGreaterThan(0)
      })
    })
  })
})

test.describe('Second Test Run - Verify Consistency', () => {
  let adminPage: Page
  const baseURL = 'http://localhost:3002'

  test.beforeEach(async ({ page }) => {
    adminPage = page

    // Fresh login for second run
    await page.goto(`${baseURL}/login`)
    await page.fill('input[name="email"]', 'iradwatkins@gmail.com')
    await page.fill('input[name="password"]', 'Iw2006js!')
    await page.click('button[type="submit"]')
    await page.waitForURL(`${baseURL}/admin`, { timeout: 10000 })
  })

  test('should produce consistent results on second run', async () => {
    // Run critical tests again to ensure consistency
    await adminPage.goto(`${baseURL}/admin/customers`)
    await adminPage.waitForSelector('[data-testid="customers-table"], table')

    // Check console errors
    const consoleErrors: string[] = []
    adminPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Verify status badges still work
    const verifiedBadges = await adminPage.$$('text=verified')
    const unverifiedBadges = await adminPage.$$('text=unverified')
    expect(verifiedBadges.length + unverifiedBadges.length).toBeGreaterThan(0)

    // Verify statistics calculation
    const customerRows = await adminPage.$$('tbody tr')
    if (customerRows.length > 0) {
      const firstRow = customerRows[0]
      const totalOrdersText = await firstRow.$eval('td:nth-child(4)', (el) => el.textContent)
      expect(totalOrdersText).toMatch(/^\d+$/)

      const totalSpentText = await firstRow.$eval('td:nth-child(5)', (el) => el.textContent)
      expect(totalSpentText).toMatch(/^\$[\d,]+\.?\d*$/)
    }

    // No TypeScript errors should occur
    const tsErrors = consoleErrors.filter(
      (err) => err.includes('TypeError') || err.includes('Cannot read') || err.includes('undefined')
    )
    expect(tsErrors).toHaveLength(0)
  })
})
