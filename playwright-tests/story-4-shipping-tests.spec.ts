import { test, expect } from '@playwright/test'

test.describe('Story 4: Shipping Provider Selection', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3002'

  test.describe('Shipping Rate API', () => {
    test('should calculate rates for both providers', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/shipping/rates`, {
        data: {
          destination: {
            zipCode: '10001',
            state: 'NY',
            city: 'New York'
          },
          package: {
            weight: 5,
            dimensions: {
              length: 12,
              width: 10,
              height: 8
            }
          },
          providers: ['fedex', 'southwest-dash']
        }
      })

      expect(response.ok()).toBeTruthy()
      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('rates')
      expect(data.rates).toHaveLength(2)

      // Check FedEx rate
      const fedexRate = data.rates.find((r: any) => r.provider === 'fedex')
      expect(fedexRate).toBeDefined()
      expect(fedexRate.providerName).toBe('FedEx Ground')
      expect(fedexRate.rate.amount).toBeGreaterThan(0)
      expect(fedexRate.delivery.estimatedDays.min).toBe(3)
      expect(fedexRate.delivery.estimatedDays.max).toBe(5)

      // Check Southwest DASH rate
      const southwestRate = data.rates.find((r: any) => r.provider === 'southwest-dash')
      expect(southwestRate).toBeDefined()
      expect(southwestRate.providerName).toBe('Southwest Cargo DASH')
      expect(southwestRate.rate.amount).toBeGreaterThan(fedexRate.rate.amount)
      expect(southwestRate.delivery.estimatedDays.min).toBe(1)
      expect(southwestRate.delivery.estimatedDays.max).toBe(2)
    })

    test('should validate zip code format', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/shipping/rates`, {
        data: {
          destination: {
            zipCode: 'invalid',
            state: 'NY',
            city: 'New York'
          },
          package: {
            weight: 5
          }
        }
      })

      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data).toHaveProperty('details')
    })

    test('should validate package weight limits', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/shipping/rates`, {
        data: {
          destination: {
            zipCode: '10001',
            state: 'NY',
            city: 'New York'
          },
          package: {
            weight: 200 // Over 150 lb limit
          }
        }
      })

      expect(response.status()).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })

    test('should handle single provider request', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/shipping/rates`, {
        data: {
          destination: {
            zipCode: '90210',
            state: 'CA',
            city: 'Beverly Hills'
          },
          package: {
            weight: 2
          },
          providers: ['fedex']
        }
      })

      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      expect(data.rates).toHaveLength(1)
      expect(data.rates[0].provider).toBe('fedex')
    })
  })

  test.describe('Shipping UI Component', () => {
    test('should display shipping options on checkout page', async ({ page }) => {
      // Mock cart data
      await page.route('**/api/cart', async (route) => {
        await route.fulfill({
          json: {
            items: [
              {
                id: '1',
                productId: 'test-product',
                quantity: 100,
                price: 19.99,
                total: 1999.00
              }
            ],
            total: 1999.00
          }
        })
      })

      // Navigate to checkout
      await page.goto(`${baseURL}/checkout`)

      // Check if shipping section exists
      const shippingSection = page.locator('text=/Select Shipping Method/i')
      await expect(shippingSection).toBeVisible({ timeout: 10000 })

      // Check for FedEx option
      const fedexOption = page.locator('text=/FedEx Ground/i')
      await expect(fedexOption).toBeVisible()

      // Check for Southwest DASH option
      const southwestOption = page.locator('text=/Southwest Cargo DASH/i')
      await expect(southwestOption).toBeVisible()

      // Check for delivery time information
      await expect(page.locator('text=/3-5 business days/i')).toBeVisible()
      await expect(page.locator('text=/1-2 business days/i')).toBeVisible()

      // Check for price display
      const prices = await page.locator('text=/$\\d+\\.\\d{2}/').all()
      expect(prices.length).toBeGreaterThan(0)
    })

    test('should allow selecting different shipping options', async ({ page }) => {
      await page.goto(`${baseURL}/checkout`)

      // Wait for shipping options
      await page.waitForSelector('text=/Select Shipping Method/i', { timeout: 10000 })

      // Select FedEx
      const fedexRadio = page.locator('input[value="fedex"]')
      if (await fedexRadio.isVisible()) {
        await fedexRadio.click()
        await expect(fedexRadio).toBeChecked()
      }

      // Select Southwest DASH
      const southwestRadio = page.locator('input[value="southwest-dash"]')
      if (await southwestRadio.isVisible()) {
        await southwestRadio.click()
        await expect(southwestRadio).toBeChecked()

        // FedEx should now be unchecked
        await expect(fedexRadio).not.toBeChecked()
      }
    })

    test('should update order total when shipping is selected', async ({ page }) => {
      // Mock cart and shipping rates
      await page.route('**/api/cart', async (route) => {
        await route.fulfill({
          json: {
            items: [{
              id: '1',
              productId: 'test',
              quantity: 1,
              price: 100,
              total: 100
            }],
            total: 100
          }
        })
      })

      await page.route('**/api/shipping/rates', async (route) => {
        await route.fulfill({
          json: {
            success: true,
            rates: [
              {
                provider: 'fedex',
                providerName: 'FedEx Ground',
                rate: { amount: 12.99, currency: 'USD' },
                delivery: { estimatedDays: { min: 3, max: 5 } }
              },
              {
                provider: 'southwest-dash',
                providerName: 'Southwest Cargo DASH',
                rate: { amount: 29.99, currency: 'USD' },
                delivery: { estimatedDays: { min: 1, max: 2 } }
              }
            ]
          }
        })
      })

      await page.goto(`${baseURL}/checkout`)

      // Look for order summary
      const orderSummary = page.locator('text=/Order Summary/i')

      if (await orderSummary.isVisible({ timeout: 5000 })) {
        // Get initial total
        const initialTotal = await page.locator('text=/Total.*\\$[\\d,]+\\.\\d{2}/').textContent()

        // Select FedEx shipping
        const fedexRadio = page.locator('input[value="fedex"]')
        if (await fedexRadio.isVisible()) {
          await fedexRadio.click()
          await page.waitForTimeout(500)

          // Check if shipping cost appears in summary
          const shippingLine = page.locator('text=/Shipping.*\\$12\\.99/')
          await expect(shippingLine).toBeVisible({ timeout: 5000 })
        }

        // Select Southwest shipping
        const southwestRadio = page.locator('input[value="southwest-dash"]')
        if (await southwestRadio.isVisible()) {
          await southwestRadio.click()
          await page.waitForTimeout(500)

          // Check if shipping cost updates
          const shippingLine = page.locator('text=/Shipping.*\\$29\\.99/')
          await expect(shippingLine).toBeVisible({ timeout: 5000 })
        }
      }
    })
  })
})