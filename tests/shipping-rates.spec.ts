import { test, expect } from '@playwright/test'

test.describe('Shipping Rate Calculation Tests', () => {
  test('Calculate FedEx rates for 45lb box and 2x30lb boxes', async ({ page }) => {
    // Navigate to the test shipping page
    await page.goto('http://localhost:3002/test/shipping')

    // Wait for page to load
    await page.waitForSelector('h1:has-text("Shipping Integration Test")')

    // The test page has default items, but we need to modify to test specific weights
    // We'll create a custom test by calling the API directly

    // Test shipping address in Dallas, TX
    const shippingAddress = {
      street: '456 Customer Ave',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
      country: 'US',
      isResidential: true
    }

    // Define our test packages: 1x45lb box + 2x30lb boxes = 105lb total
    const testItems = [
      {
        quantity: 1,
        width: 12,  // Standard box dimensions
        height: 12,
        paperStockWeight: 45 / (12 * 12), // Weight per square inch to equal 45 lbs
      },
      {
        quantity: 1,
        width: 10,
        height: 10,
        paperStockWeight: 30 / (10 * 10), // First 30 lb box
      },
      {
        quantity: 1,
        width: 10,
        height: 10,
        paperStockWeight: 30 / (10 * 10), // Second 30 lb box
      }
    ]

    // Call the shipping calculation API directly
    const response = await page.request.post('http://localhost:3002/api/shipping/calculate', {
      data: {
        toAddress: shippingAddress,
        items: testItems
      }
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()

    // Filter and display only FedEx rates
    const fedexRates = data.rates.filter((rate: any) => rate.carrier === 'FEDEX')

    fedexRates.forEach((rate: any) => {

      if (rate.deliveryDate) {

      }
      if (rate.isGuaranteed) {

      }
    })

    // Store rates for assertions
    expect(fedexRates.length).toBeGreaterThan(0)
    expect(data.totalWeight).toBe('105.00')

    // Verify we have the expected services
    const serviceNames = fedexRates.map((r: any) => r.serviceName)
    expect(serviceNames).toContain('FedEx Ground')

    // Return the rates for reference
    return {
      totalWeight: data.totalWeight,
      rates: fedexRates
    }
  })

  test('Verify shipping page UI with default items', async ({ page }) => {
    // Navigate to shipping test page
    await page.goto('http://localhost:3002/test/shipping')

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Shipping Integration Test")')

    // Check that test products are displayed
    await expect(page.locator('text=1000 Flyers')).toBeVisible()
    await expect(page.locator('text=500 Business Cards')).toBeVisible()

    // Check weight calculation display
    await expect(page.locator('text=Total: 239.5 lbs')).toBeVisible()

    // Wait for shipping rates to load (they auto-calculate on page load)
    await page.waitForSelector('text=Select Shipping Method', { timeout: 10000 })

    // Check that shipping options are displayed
    const shippingOptions = page.locator('[role="radiogroup"] label')
    const count = await shippingOptions.count()

    for (let i = 0; i < count; i++) {
      const option = shippingOptions.nth(i)
      const text = await option.textContent()

    }
  })
})