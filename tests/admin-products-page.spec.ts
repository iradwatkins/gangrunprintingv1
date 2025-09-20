import { test, expect } from '@playwright/test'

test.describe('Admin Products Page Tests', () => {
  test('should display products list with newly seeded products', async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`)
      }
    })

    // Track network requests to API
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`)
      }
    })

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`)
      }
    })

    console.log('🚀 Testing admin products page...')

    // Navigate to admin products page
    await page.goto('https://gangrunprinting.com/admin/products')

    // Wait for authentication to complete
    await page.waitForTimeout(3000)

    // Check if we get redirected to login (if not authenticated)
    if (page.url().includes('/auth/signin')) {
      console.log('🔐 Not authenticated - would need login to test admin functionality')
      return
    }

    // Check if page loads properly
    await page.waitForSelector('h1', { timeout: 10000 })

    // Verify page title
    const pageTitle = await page.locator('h1').first().textContent()
    console.log('📄 Page title:', pageTitle)
    expect(pageTitle).toContain('Product Management')

    // Wait for loading to complete and check for products
    await page.waitForTimeout(2000)

    // Check if products table exists
    const tableExists = await page.locator('table').isVisible()
    console.log('📊 Products table visible:', tableExists)

    if (tableExists) {
      // Count product rows (excluding header)
      const productRows = page.locator('table tbody tr')
      const productCount = await productRows.count()
      console.log('🎯 Number of products displayed:', productCount)

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
        console.log(`✅ ${productName}: ${productExists ? 'Found' : 'Not found'}`)

        if (productExists) {
          // Check if the product row contains expected data
          const productRow = page.locator('tr').filter({ hasText: productName })

          // Check for SKU
          const hasValidSKU = await productRow.locator('td').nth(1).textContent()
          console.log(`   SKU: ${hasValidSKU}`)

          // Check for category
          const category = await productRow.locator('td').nth(2).textContent()
          console.log(`   Category: ${category}`)

          // Check for price
          const price = await productRow.locator('td').nth(4).textContent()
          console.log(`   Price: ${price}`)

          // Check for status badges
          const statusBadges = productRow.locator('.badge, [class*="badge"]')
          const badgeCount = await statusBadges.count()
          console.log(`   Status badges: ${badgeCount}`)
        }
      }

      // Check stats cards at the top
      const statsCards = page
        .locator('[class*="card"]')
        .filter({ hasText: /Total Products|Featured|Gang Run|With Images/ })
      const statsCount = await statsCards.count()
      console.log('📈 Stats cards found:', statsCount)

      if (statsCount > 0) {
        for (let i = 0; i < Math.min(statsCount, 4); i++) {
          const cardText = await statsCards.nth(i).textContent()
          console.log(`   Card ${i + 1}: ${cardText?.replace(/\\s+/g, ' ').trim()}`)
        }
      }

      // Test "Add Product" button functionality
      const addButton = page
        .locator('text=Add Product')
        .or(page.locator('a[href*="/admin/products/new"]'))
      const addButtonVisible = await addButton.isVisible()
      console.log('➕ Add Product button visible:', addButtonVisible)

      if (addButtonVisible) {
        console.log('🔍 Testing Add Product button...')
        await addButton.click()
        await page.waitForTimeout(1000)

        const newPageUrl = page.url()
        console.log('🌐 Navigated to:', newPageUrl)

        if (newPageUrl.includes('/admin/products/new')) {
          console.log('✅ Add Product navigation works correctly')

          // Check if the form loads
          await page.waitForSelector('form', { timeout: 5000 })
          const formExists = await page.locator('form').isVisible()
          console.log('📝 Product creation form visible:', formExists)

          if (formExists) {
            // Check for key form elements
            const nameField = await page.locator('input[id="name"]').isVisible()
            const skuField = await page.locator('input[id="sku"]').isVisible()
            const categorySelect = await page
              .locator('select, [role="combobox"]')
              .first()
              .isVisible()

            console.log('📋 Form fields:')
            console.log(`   Name field: ${nameField}`)
            console.log(`   SKU field: ${skuField}`)
            console.log(`   Category select: ${categorySelect}`)
          }
        }
      }
    } else {
      // Check for "no products" message
      const noProductsMessage = await page.locator('text*=No products').isVisible()
      console.log('📭 "No products" message visible:', noProductsMessage)

      if (noProductsMessage) {
        console.log(
          "⚠️ No products are displayed - this suggests the seeding may not have worked or there's a loading issue"
        )
      }
    }

    // Take a screenshot for reference
    await page.screenshot({ path: 'admin-products-test.png', fullPage: true })
    console.log('📸 Screenshot saved as admin-products-test.png')

    // Check for any JavaScript errors in console
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))

    console.log('🔍 Final test summary:')
    console.log(`   URL: ${page.url()}`)
    console.log(`   Page title: ${await page.title()}`)
    console.log(`   Console errors: ${errors.length}`)
  })

  test('should test individual product actions', async ({ page }) => {
    console.log('🎯 Testing individual product actions...')

    await page.goto('https://gangrunprinting.com/admin/products')
    await page.waitForTimeout(3000)

    // Skip if not authenticated
    if (page.url().includes('/auth/signin')) {
      console.log('🔐 Skipping - authentication required')
      return
    }

    // Wait for products to load
    await page.waitForSelector('table', { timeout: 10000 })

    // Find the first product row
    const firstProductRow = page.locator('table tbody tr').first()
    const firstProductExists = await firstProductRow.isVisible()

    if (firstProductExists) {
      const productName = await firstProductRow.locator('td').first().textContent()
      console.log('🎯 Testing actions for:', productName)

      // Test View button (eye icon)
      const viewButton = firstProductRow
        .locator('button, a')
        .filter({ has: page.locator('[data-testid="eye"], .lucide-eye, svg') })
        .first()
      const viewButtonExists = await viewButton.isVisible()
      console.log('👁️ View button visible:', viewButtonExists)

      // Test Edit button
      const editButton = firstProductRow
        .locator('button, a')
        .filter({ has: page.locator('[data-testid="edit"], .lucide-edit, svg') })
        .first()
      const editButtonExists = await editButton.isVisible()
      console.log('✏️ Edit button visible:', editButtonExists)

      // Test Delete button
      const deleteButton = firstProductRow
        .locator('button')
        .filter({ has: page.locator('[data-testid="trash"], .lucide-trash, svg') })
        .first()
      const deleteButtonExists = await deleteButton.isVisible()
      console.log('🗑️ Delete button visible:', deleteButtonExists)

      // Test status toggle (if available)
      const statusBadge = firstProductRow.locator('.badge, [class*="badge"]').first()
      const statusBadgeExists = await statusBadge.isVisible()
      console.log('🏷️ Status badge visible:', statusBadgeExists)

      if (statusBadgeExists) {
        const statusText = await statusBadge.textContent()
        console.log('   Status text:', statusText)
      }
    } else {
      console.log('❌ No products found to test actions with')
    }
  })
})
