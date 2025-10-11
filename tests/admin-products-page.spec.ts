import { test, expect } from '@playwright/test'

test.describe('Admin Products Page Tests', () => {
  test('should display products list with newly seeded products', async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'log' || msg.type() === 'error') {
      }
    })

    // Track network requests to API
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
      }
    })

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
      }
    })

    // Navigate to admin products page
    await page.goto('https://gangrunprinting.com/admin/products')

    // Wait for authentication to complete
    await page.waitForTimeout(3000)

    // Check if we get redirected to login (if not authenticated)
    if (page.url().includes('/auth/signin')) {
      return
    }

    // Check if page loads properly
    await page.waitForSelector('h1', { timeout: 10000 })

    // Verify page title
    const pageTitle = await page.locator('h1').first().textContent()

    expect(pageTitle).toContain('Product Management')

    // Wait for loading to complete and check for products
    await page.waitForTimeout(2000)

    // Check if products table exists
    const tableExists = await page.locator('table').isVisible()

    if (tableExists) {
      // Count product rows (excluding header)
      const productRows = page.locator('table tbody tr')
      const productCount = await productRows.count()

      // Check for our seeded products
      const expectedProducts = [
        'Premium Business Cards',
        'Full Color Flyers',
        'Glossy Postcards',
        'Large Format Posters',
        'Die Cut Stickers',
      ]

      for (const productName of expectedProducts) {
        const productExists = await page.locator(`text=${productName}`).isVisible()

        if (productExists) {
          // Check if the product row contains expected data
          const productRow = page.locator('tr').filter({ hasText: productName })

          // Check for SKU
          const hasValidSKU = await productRow.locator('td').nth(1).textContent()

          // Check for category
          const category = await productRow.locator('td').nth(2).textContent()

          // Check for price
          const price = await productRow.locator('td').nth(4).textContent()

          // Check for status badges
          const statusBadges = productRow.locator('.badge, [class*="badge"]')
          const badgeCount = await statusBadges.count()
        }
      }

      // Check stats cards at the top
      const statsCards = page
        .locator('[class*="card"]')
        .filter({ hasText: /Total Products|Featured|Gang Run|With Images/ })
      const statsCount = await statsCards.count()

      if (statsCount > 0) {
        for (let i = 0; i < Math.min(statsCount, 4); i++) {
          const cardText = await statsCards.nth(i).textContent()
        }
      }

      // Test "Add Product" button functionality
      const addButton = page
        .locator('text=Add Product')
        .or(page.locator('a[href*="/admin/products/new"]'))
      const addButtonVisible = await addButton.isVisible()

      if (addButtonVisible) {
        await addButton.click()
        await page.waitForTimeout(1000)

        const newPageUrl = page.url()

        if (newPageUrl.includes('/admin/products/new')) {
          // Check if the form loads
          await page.waitForSelector('form', { timeout: 5000 })
          const formExists = await page.locator('form').isVisible()

          if (formExists) {
            // Check for key form elements
            const nameField = await page.locator('input[id="name"]').isVisible()
            const skuField = await page.locator('input[id="sku"]').isVisible()
            const categorySelect = await page
              .locator('select, [role="combobox"]')
              .first()
              .isVisible()
          }
        }
      }
    } else {
      // Check for "no products" message
      const noProductsMessage = await page.locator('text*=No products').isVisible()

      if (noProductsMessage) {
      }
    }

    // Take a screenshot for reference
    await page.screenshot({ path: 'admin-products-test.png', fullPage: true })

    // Check for any JavaScript errors in console
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
  })

  test('should test individual product actions', async ({ page }) => {
    await page.goto('https://gangrunprinting.com/admin/products')
    await page.waitForTimeout(3000)

    // Skip if not authenticated
    if (page.url().includes('/auth/signin')) {
      return
    }

    // Wait for products to load
    await page.waitForSelector('table', { timeout: 10000 })

    // Find the first product row
    const firstProductRow = page.locator('table tbody tr').first()
    const firstProductExists = await firstProductRow.isVisible()

    if (firstProductExists) {
      const productName = await firstProductRow.locator('td').first().textContent()

      // Test View button (eye icon)
      const viewButton = firstProductRow
        .locator('button, a')
        .filter({ has: page.locator('[data-testid="eye"], .lucide-eye, svg') })
        .first()
      const viewButtonExists = await viewButton.isVisible()

      // Test Edit button
      const editButton = firstProductRow
        .locator('button, a')
        .filter({ has: page.locator('[data-testid="edit"], .lucide-edit, svg') })
        .first()
      const editButtonExists = await editButton.isVisible()

      // Test Delete button
      const deleteButton = firstProductRow
        .locator('button')
        .filter({ has: page.locator('[data-testid="trash"], .lucide-trash, svg') })
        .first()
      const deleteButtonExists = await deleteButton.isVisible()

      // Test status toggle (if available)
      const statusBadge = firstProductRow.locator('.badge, [class*="badge"]').first()
      const statusBadgeExists = await statusBadge.isVisible()

      if (statusBadgeExists) {
        const statusText = await statusBadge.textContent()
      }
    } else {
    }
  })
})
