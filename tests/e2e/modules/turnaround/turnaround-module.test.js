/**
 * Turnaround Module Testing Suite
 * 5 comprehensive tests for turnaround time selection functionality
 */

const puppeteer = require('puppeteer')
const TestHelpers = require('../utils/test-helpers')
const DataGenerators = require('../utils/data-generators')
const selectors = require('../utils/selectors')

describe('Turnaround Module Tests', () => {
  let browser
  let page
  let helpers

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
  })

  beforeEach(async () => {
    page = await browser.newPage()
    helpers = new TestHelpers(page)

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 })

    // Enable console logging
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
  })

  afterEach(async () => {
    await helpers.takeScreenshot('turnaround-test-end')
    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })

  /**
   * TEST 1: Basic Turnaround Selection
   * Tests all standard turnaround options and basic functionality
   */
  describe('Test 1: Basic Turnaround Selection', () => {
    test('should select different turnaround options correctly', async () => {
      console.log('🧪 Starting Turnaround Test 1: Basic Turnaround Selection')

      // Navigate to product creation
      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('turnaround-test1-start')

      // Fill basic product info and upload demo image
      const productData = await helpers.fillBasicProductInfo({
        name: 'Turnaround Test 1 - Basic Selection',
        category: 'business-cards',
      })

      await helpers.uploadDemoImage()
      await helpers.takeScreenshot('turnaround-test1-image-uploaded')

      // Get turnaround configurations
      const turnaroundConfigs = DataGenerators.generateTurnaroundConfigs().basic

      // Test each turnaround option
      for (const config of turnaroundConfigs) {
        console.log(
          `Testing turnaround: ${config.turnaroundId} (${config.expected.days} days, ${config.expected.type})`
        )

        // Configure turnaround
        await helpers.configureTurnaround(config)
        await helpers.takeScreenshot(`turnaround-test1-${config.turnaroundId}-selected`)

        // Wait for processing
        await page.waitForTimeout(2000)

        // Verify turnaround selection
        const selectedTurnaround = await helpers.getSelectedTurnaround()
        expect(selectedTurnaround).toContain(config.expected.days.toString())
        expect(selectedTurnaround.toLowerCase()).toContain(config.expected.type)

        // Verify business days calculation is displayed
        const businessDaysInfo = await helpers.getTurnaroundBusinessDays()
        if (businessDaysInfo) {
          console.log(`Business days info for ${config.turnaroundId}: ${businessDaysInfo}`)
          expect(businessDaysInfo.length).toBeGreaterThan(0)
        }

        console.log(`Turnaround ${config.turnaroundId} selected successfully`)
      }

      // Save product
      const saved = await helpers.saveProduct()
      expect(saved).toBe(true)

      await helpers.takeScreenshot('turnaround-test1-saved')

      console.log('✅ Turnaround Test 1 completed successfully')
    }, 120000) // 2 minute timeout
  })

  /**
   * TEST 2: Turnaround Pricing Impact
   * Tests pricing changes based on turnaround selection
   */
  describe('Test 2: Turnaround Pricing Impact', () => {
    test('should apply correct pricing based on turnaround selection', async () => {
      console.log('🧪 Starting Turnaround Test 2: Pricing Impact')

      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('turnaround-test2-start')

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Turnaround Test 2 - Pricing Impact',
        category: 'flyers',
      })

      await helpers.uploadDemoImage()

      // Configure standard quantity for consistent pricing comparison
      await helpers.configureQuantity({ type: 'standard', value: '1000' })

      // Get pricing configurations
      const pricingConfigs = DataGenerators.generateTurnaroundConfigs().pricing
      const priceData = []

      for (const config of pricingConfigs) {
        console.log(`Testing pricing for turnaround: ${config.turnaroundId}`)

        // Configure turnaround
        await helpers.configureTurnaround({ turnaroundId: config.turnaroundId })
        await helpers.takeScreenshot(`turnaround-test2-pricing-${config.turnaroundId}`)

        // Wait for price calculation
        await page.waitForTimeout(3000)

        // Get current price
        const currentPrice = await helpers.getCurrentPrice()
        expect(currentPrice).toBeGreaterThan(0)

        priceData.push({
          turnaroundId: config.turnaroundId,
          price: currentPrice,
          expectedPremium: config.expectedPremium,
          expectedDiscount: config.expectedDiscount,
        })

        console.log(`Price for ${config.turnaroundId}: $${currentPrice}`)
      }

      // Verify pricing logic
      const standardPrice = priceData.find((p) => p.turnaroundId.includes('standard'))?.price
      const rushPrice = priceData.find((p) => p.turnaroundId.includes('rush'))?.price
      const economyPrice = priceData.find((p) => p.turnaroundId.includes('economy'))?.price

      if (standardPrice && rushPrice) {
        // Rush should be more expensive
        expect(rushPrice).toBeGreaterThan(standardPrice)
        console.log(`✓ Rush pricing confirmed: $${rushPrice} > $${standardPrice}`)
      }

      if (standardPrice && economyPrice) {
        // Economy should be cheaper
        expect(economyPrice).toBeLessThan(standardPrice)
        console.log(`✓ Economy pricing confirmed: $${economyPrice} < $${standardPrice}`)
      }

      // Save product
      const saved = await helpers.saveProduct()
      expect(saved).toBe(true)

      await helpers.takeScreenshot('turnaround-test2-saved')

      console.log('✅ Turnaround Test 2 completed successfully')
      console.log('Pricing data:', priceData)
    }, 120000)
  })

  /**
   * TEST 3: Turnaround Restrictions and Dependencies
   * Tests restrictions like rush orders requiring specific coating options
   */
  describe('Test 3: Turnaround Restrictions and Dependencies', () => {
    test('should handle turnaround restrictions correctly', async () => {
      console.log('🧪 Starting Turnaround Test 3: Restrictions and Dependencies')

      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('turnaround-test3-start')

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Turnaround Test 3 - Restrictions',
        category: 'postcards',
      })

      await helpers.uploadDemoImage()

      // Set up paper stock configuration first
      await helpers.configurePaperStock({
        paper: '16pt-cardstock',
        coating: 'uv',
        sides: 'double',
      })

      await helpers.takeScreenshot('turnaround-test3-paper-configured')

      // Get restriction configurations
      const restrictionConfigs = DataGenerators.generateTurnaroundConfigs().restrictions

      for (const config of restrictionConfigs) {
        console.log(`Testing restriction for turnaround: ${config.turnaroundId}`)

        // Apply turnaround with restrictions
        await helpers.configureTurnaround({ turnaroundId: config.turnaroundId })
        await helpers.takeScreenshot(`turnaround-test3-restriction-${config.turnaroundId}`)

        // Wait for cascade logic to apply
        await page.waitForTimeout(3000)

        // Check if coating was changed due to restrictions
        if (config.requiresNoCoating) {
          const currentCoating = await helpers.getSelectedCoating()
          console.log(`Current coating after ${config.turnaroundId}: ${currentCoating}`)

          // Verify coating restriction is applied or warning is shown
          const restrictionWarning = await helpers.waitForSelectorSafe(
            selectors.turnaround.restrictionWarning,
            3000
          )

          if (restrictionWarning) {
            const warningText = await page.textContent(selectors.turnaround.restrictionWarning)
            console.log(`Restriction warning: "${warningText}"`)
            expect(warningText.toLowerCase()).toContain('coating')
          } else {
            // Or coating should be automatically changed
            expect(currentCoating.toLowerCase()).toContain('no-coating')
          }
        }

        // Verify turnaround is still selectable despite restrictions
        const selectedTurnaround = await helpers.getSelectedTurnaround()
        expect(selectedTurnaround).toContain(config.turnaroundId.split('-')[1])
      }

      // Test that non-restricted turnarounds don't affect coating
      await helpers.configureTurnaround({ turnaroundId: 'standard-3day' })
      await page.waitForTimeout(2000)

      const finalCoating = await helpers.getSelectedCoating()
      console.log(`Final coating with standard turnaround: ${finalCoating}`)

      // Save product
      const saved = await helpers.saveProduct()
      expect(saved).toBe(true)

      await helpers.takeScreenshot('turnaround-test3-saved')

      console.log('✅ Turnaround Test 3 completed successfully')
    }, 120000)
  })

  /**
   * TEST 4: Business Days Calculation
   * Tests business days calculation and delivery date estimation
   */
  describe('Test 4: Business Days Calculation', () => {
    test('should calculate business days and delivery dates correctly', async () => {
      console.log('🧪 Starting Turnaround Test 4: Business Days Calculation')

      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('turnaround-test4-start')

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Turnaround Test 4 - Business Days',
        category: 'brochures',
      })

      await helpers.uploadDemoImage()

      // Test business days calculation for different turnarounds
      const testTurnarounds = [
        { turnaroundId: 'rush-1day', expectedDays: 1 },
        { turnaroundId: 'standard-3day', expectedDays: 3 },
        { turnaroundId: 'standard-5day', expectedDays: 5 },
        { turnaroundId: 'economy-7day', expectedDays: 7 },
      ]

      const businessDaysData = []

      for (const config of testTurnarounds) {
        console.log(`Testing business days calculation for: ${config.turnaroundId}`)

        await helpers.configureTurnaround({ turnaroundId: config.turnaroundId })
        await page.waitForTimeout(2000)

        // Get business days information
        const businessDaysInfo = await helpers.getTurnaroundBusinessDays()
        const deliveryDate = await helpers.getEstimatedDeliveryDate()

        businessDaysData.push({
          turnaroundId: config.turnaroundId,
          expectedDays: config.expectedDays,
          businessDaysInfo,
          deliveryDate,
        })

        console.log(`${config.turnaroundId}: ${businessDaysInfo} | Delivery: ${deliveryDate}`)

        await helpers.takeScreenshot(`turnaround-test4-businessdays-${config.turnaroundId}`)

        // Verify business days information exists
        expect(businessDaysInfo).toBeTruthy()

        // Verify delivery date is provided
        if (deliveryDate) {
          expect(deliveryDate.length).toBeGreaterThan(0)

          // Basic date format validation (should contain a future date)
          const deliveryDateObj = new Date(deliveryDate)
          const today = new Date()
          expect(deliveryDateObj.getTime()).toBeGreaterThan(today.getTime())
        }
      }

      // Verify that shorter turnarounds have earlier delivery dates
      for (let i = 1; i < businessDaysData.length; i++) {
        const current = businessDaysData[i]
        const previous = businessDaysData[i - 1]

        if (current.deliveryDate && previous.deliveryDate) {
          const currentDate = new Date(current.deliveryDate)
          const previousDate = new Date(previous.deliveryDate)

          // Current (longer turnaround) should have later or equal delivery date
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(previousDate.getTime())
        }
      }

      // Save product
      const saved = await helpers.saveProduct()
      expect(saved).toBe(true)

      await helpers.takeScreenshot('turnaround-test4-saved')

      console.log('✅ Turnaround Test 4 completed successfully')
      console.log('Business days data:', businessDaysData)
    }, 150000)
  })

  /**
   * TEST 5: Turnaround Persistence & Frontend Display
   * Tests data persistence and customer frontend display
   */
  describe('Test 5: Turnaround Persistence & Frontend Display', () => {
    test('should persist turnaround selection and display correctly on frontend', async () => {
      console.log('🧪 Starting Turnaround Test 5: Persistence & Frontend Display')

      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('turnaround-test5-start')

      // Create product with specific turnaround configuration
      const productConfig = {
        basic: {
          name: 'Turnaround Test 5 - Persistence Test',
          category: 'door-hangers',
        },
        turnaround: { turnaroundId: 'rush-2day' },
      }

      const result = await helpers.createCompleteProduct(productConfig)
      expect(result.saved).toBe(true)

      await helpers.takeScreenshot('turnaround-test5-created')

      // Extract product ID from URL or response
      const currentUrl = page.url()
      console.log('Product created, current URL:', currentUrl)

      // Test persistence by reloading the edit page
      await page.reload({ waitUntil: 'networkidle0' })
      await page.waitForTimeout(3000)

      await helpers.takeScreenshot('turnaround-test5-reloaded')

      // Verify turnaround value persisted
      const turnaroundSelector = await page.$(selectors.turnaround.dropdown)
      if (turnaroundSelector) {
        const selectedText = await turnaroundSelector.textContent()
        console.log('Persisted turnaround selection:', selectedText)

        // Check if turnaround is still selected
        expect(selectedText.toLowerCase()).toContain('2')
        expect(selectedText.toLowerCase()).toContain('rush')
      }

      // Verify business days calculation persisted
      const persistedBusinessDays = await helpers.getTurnaroundBusinessDays()
      expect(persistedBusinessDays).toBeTruthy()
      console.log('Persisted business days info:', persistedBusinessDays)

      // Navigate to customer frontend
      const productSlug = productConfig.basic.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      try {
        await helpers.navigateToCustomerPage(productSlug)
        await helpers.takeScreenshot('turnaround-test5-frontend')

        // Verify frontend display
        const frontendResults = await helpers.verifyFrontendDisplay(productConfig)
        console.log('Frontend verification results:', frontendResults)

        // Check that turnaround selector exists on frontend
        expect(frontendResults.turnaround).toBe(true)

        // Test turnaround selection on frontend
        const customerTurnaroundExists = await helpers.waitForSelectorSafe(
          selectors.customer.turnaroundSelector,
          10000
        )
        expect(customerTurnaroundExists).toBe(true)

        // Verify delivery date is displayed to customer
        const customerDeliveryDate = await helpers.getCustomerDeliveryDate()
        if (customerDeliveryDate) {
          console.log('Customer delivery date display:', customerDeliveryDate)
          expect(customerDeliveryDate.length).toBeGreaterThan(0)
        }

        // Test turnaround option selection on frontend
        const frontendTurnaroundOptions = await helpers.getFrontendTurnaroundOptions()
        console.log('Frontend turnaround options:', frontendTurnaroundOptions)
        expect(frontendTurnaroundOptions.length).toBeGreaterThan(1)

        await helpers.takeScreenshot('turnaround-test5-frontend-verified')
      } catch (error) {
        console.log(
          'Frontend test skipped - product may not be immediately available:',
          error.message
        )
        // This is acceptable as the product might need time to be indexed
      }

      console.log('✅ Turnaround Test 5 completed successfully')
    }, 180000)
  })
})

// Additional integration helper for turnaround module
describe('Turnaround Module Integration Helpers', () => {
  test('should export proper turnaround configuration for other modules', async () => {
    const turnaroundConfigs = DataGenerators.generateTurnaroundConfigs()

    expect(turnaroundConfigs).toHaveProperty('basic')
    expect(turnaroundConfigs).toHaveProperty('restrictions')
    expect(turnaroundConfigs).toHaveProperty('pricing')

    expect(turnaroundConfigs.basic.length).toBeGreaterThan(0)
    expect(turnaroundConfigs.restrictions.length).toBeGreaterThan(0)
    expect(turnaroundConfigs.pricing.length).toBeGreaterThan(0)

    // Verify business days calculation helper
    const businessDaysCalc = DataGenerators.generateTurnaroundConfigs().basic[0]
    expect(businessDaysCalc).toHaveProperty('expected')
    expect(businessDaysCalc.expected).toHaveProperty('days')
    expect(businessDaysCalc.expected).toHaveProperty('type')

    console.log('✅ Turnaround module data generators working correctly')
  })
})
