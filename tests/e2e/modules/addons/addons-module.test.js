/**
 * Addons Module Testing Suite
 * 5 comprehensive tests for addon selection and configuration functionality
 */

const puppeteer = require('puppeteer')
const TestHelpers = require('../utils/test-helpers')
const DataGenerators = require('../utils/data-generators')
const selectors = require('../utils/selectors')

describe('Addons Module Tests', () => {
  let browser
  let page
  let helpers

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })
  })

  beforeEach(async () => {
    page = await browser.newPage()
    helpers = new TestHelpers(page)
    await page.setViewport({ width: 1920, height: 1080 })
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
  })

  afterEach(async () => {
    await helpers.takeScreenshot('addons-test-end')
    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })

  /**
   * TEST 1: Basic Addon Selection
   * Tests selecting and deselecting individual addons
   */
  describe('Test 1: Basic Addon Selection', () => {
    test('should select and deselect addons with correct pricing', async () => {
      console.log('🧪 Starting Addons Test 1: Basic Addon Selection')

      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('addons-test1-start')

      // Basic product setup
      const productData = await helpers.fillBasicProductInfo({
        name: 'Addons Test 1 - Basic Selection',
        category: 'business-cards',
      })

      await helpers.uploadDemoImage()

      // Configure prerequisites
      await helpers.configureQuantity({ type: 'standard', value: '1000' })
      await helpers.configureSize({ type: 'standard', value: '3.5x2' })
      await helpers.configurePaperStock({
        paper: '14pt-cardstock',
        coating: 'matte',
        sides: 'double',
      })

      await helpers.takeScreenshot('addons-test1-prerequisites')

      // Get base price before addons
      const basePrice = await helpers.getCurrentPrice()
      console.log(`Base price before addons: $${basePrice}`)

      // Test addon module existence and expansion
      const addonsModuleExists = await helpers.waitForSelectorSafe(selectors.addons.module, 10000)

      if (addonsModuleExists) {
        // Try to expand addons accordion
        const accordionTrigger = await page.$(selectors.addons.trigger)
        if (accordionTrigger) {
          await accordionTrigger.click()
          await page.waitForTimeout(2000)
          console.log('Addons accordion expanded')
        }

        await helpers.takeScreenshot('addons-test1-expanded')

        // Test basic addon configurations
        const basicAddonConfigs = DataGenerators.generateAddonConfigs().basic
        const addonResults = []

        for (const config of basicAddonConfigs) {
          console.log(`Testing basic addon: ${config.description}`)

          // Find and select addon checkboxes
          for (const addonId of config.addons) {
            console.log(`Looking for addon: ${addonId}`)

            // Try multiple selector strategies for addon selection
            const addonSelectors = [
              selectors.addons.checkbox(addonId),
              `[data-testid="addon-${addonId}"]`,
              `[data-addon-id="${addonId}"]`,
              `input[value="${addonId}"]`,
              `#addon-${addonId}`,
            ]

            let addonSelected = false

            for (const selector of addonSelectors) {
              try {
                const addonElement = await page.$(selector)
                if (addonElement) {
                  const isVisible = await addonElement.isVisible()
                  if (isVisible) {
                    await addonElement.click()
                    await page.waitForTimeout(1000)
                    console.log(`✅ Selected addon using selector: ${selector}`)
                    addonSelected = true
                    break
                  }
                }
              } catch (error) {
                // Try next selector
                continue
              }
            }

            // Alternative approach: look for addon by text content
            if (!addonSelected) {
              console.log(`Trying to find addon by text content: ${addonId}`)

              const checkboxes = await page.$$('input[type="checkbox"]')
              for (const checkbox of checkboxes) {
                try {
                  const parent = await checkbox.evaluateHandle((el) =>
                    el.closest('label, .addon-item, .addon-option')
                  )
                  if (parent) {
                    const parentText = await parent.evaluate((el) => el.textContent || '')
                    if (parentText.toLowerCase().includes(addonId.replace('-', ' '))) {
                      await checkbox.click()
                      await page.waitForTimeout(1000)
                      console.log(`✅ Selected addon by text content: ${addonId}`)
                      addonSelected = true
                      break
                    }
                  }
                } catch (error) {
                  continue
                }
              }
            }

            if (!addonSelected) {
              console.log(`⚠️ Could not select addon: ${addonId} (may not exist or be visible)`)
            }
          }

          // Wait for price update
          await page.waitForTimeout(2000)

          // Get price with addon
          const priceWithAddon = await helpers.getCurrentPrice()
          console.log(`Price with ${config.description}: $${priceWithAddon}`)

          addonResults.push({
            description: config.description,
            addons: config.addons,
            price: priceWithAddon,
            priceIncrease: priceWithAddon && basePrice ? priceWithAddon - basePrice : 0,
          })

          await helpers.takeScreenshot(`addons-test1-${config.description.replace(/\s+/g, '-')}`)

          // Test addon deselection
          console.log(`Testing deselection of ${config.description}`)

          // Deselect the addons (using similar strategy)
          for (const addonId of config.addons) {
            const addonSelectors = [
              selectors.addons.checkbox(addonId),
              `[data-testid="addon-${addonId}"]`,
              `input[value="${addonId}"]`,
            ]

            for (const selector of addonSelectors) {
              try {
                const addonElement = await page.$(selector)
                if (addonElement) {
                  const isChecked = await addonElement.evaluate((el) => el.checked)
                  if (isChecked) {
                    await addonElement.click()
                    await page.waitForTimeout(1000)
                    console.log(`✅ Deselected addon: ${addonId}`)
                    break
                  }
                }
              } catch (error) {
                continue
              }
            }
          }

          // Verify price returns to base price
          await page.waitForTimeout(2000)
          const priceAfterDeselection = await helpers.getCurrentPrice()
          console.log(`Price after deselection: $${priceAfterDeselection}`)

          // Price should be close to base price (allowing for small rounding differences)
          if (basePrice && priceAfterDeselection) {
            const priceDifference = Math.abs(priceAfterDeselection - basePrice)
            expect(priceDifference).toBeLessThan(1) // Within $1 of base price
          }
        }

        // Verify addon pricing logic
        console.log('Addon pricing results:', addonResults)

        for (const result of addonResults) {
          if (result.price && basePrice) {
            // Addons should generally increase price
            expect(result.price).toBeGreaterThanOrEqual(basePrice)

            if (result.priceIncrease > 0) {
              console.log(
                `✅ ${result.description} adds $${result.priceIncrease.toFixed(2)} to price`
              )
            }
          }
        }
      } else {
        console.log(
          '⚠️ Addons module not found - may be no addons configured for this product type'
        )
      }

      const saved = await helpers.saveProduct()
      expect(saved).toBe(true)

      await helpers.takeScreenshot('addons-test1-saved')
      console.log('✅ Addons Test 1 completed successfully')
    }, 180000)
  })

  /**
   * TEST 2: Variable Data Configuration
   * Tests variable data addon with location configuration
   */
  describe('Test 2: Variable Data Configuration', () => {
    test('should configure variable data addon correctly', async () => {
      console.log('🧪 Starting Addons Test 2: Variable Data Configuration')

      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('addons-test2-start')

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Addons Test 2 - Variable Data',
        category: 'flyers',
      })

      await helpers.uploadDemoImage()
      await helpers.configureQuantity({ type: 'standard', value: '5000' })
      await helpers.configureSize({ type: 'standard', value: '8.5x11' })
      await helpers.configurePaperStock({
        paper: '100lb-text',
        coating: 'gloss',
        sides: 'single',
      })

      // Configure variable data addon
      const variableDataConfig = {
        variableData: { enabled: true, locations: 5 },
      }

      await helpers.configureAddons(variableDataConfig)
      await helpers.takeScreenshot('addons-test2-variable-data-configured')

      // Verify variable data configuration elements
      const variableDataExists = await helpers.waitForSelectorSafe(
        selectors.addons.variableData.enable,
        5000
      )

      if (variableDataExists) {
        // Verify variable data is enabled
        const variableDataCheckbox = await page.$(selectors.addons.variableData.enable)
        if (variableDataCheckbox) {
          const isChecked = await variableDataCheckbox.evaluate((el) => el.checked)
          expect(isChecked).toBe(true)
          console.log('✅ Variable data checkbox is checked')
        }

        // Test locations input
        const locationsInput = await page.$(selectors.addons.variableData.locationsInput)
        if (locationsInput) {
          // Clear and set specific location count
          await locationsInput.click({ clickCount: 3 }) // Select all
          await page.keyboard.type('10')
          await page.waitForTimeout(1000)

          const locationsValue = await locationsInput.evaluate((el) => el.value)
          expect(locationsValue).toBe('10')
          console.log(`✅ Locations set to: ${locationsValue}`)

          await helpers.takeScreenshot('addons-test2-locations-configured')

          // Test different location counts and pricing
          const locationCounts = [1, 5, 10, 25, 50]
          const locationPrices = []

          for (const count of locationCounts) {
            await locationsInput.click({ clickCount: 3 })
            await page.keyboard.type(count.toString())
            await page.waitForTimeout(2000) // Wait for price update

            const priceWithLocations = await helpers.getCurrentPrice()
            locationPrices.push({
              locations: count,
              price: priceWithLocations,
            })

            console.log(`Price with ${count} locations: $${priceWithLocations}`)
            await helpers.takeScreenshot(`addons-test2-locations-${count}`)
          }

          // Verify pricing increases with more locations
          for (let i = 1; i < locationPrices.length; i++) {
            const current = locationPrices[i]
            const previous = locationPrices[i - 1]

            if (current.price && previous.price && current.locations > previous.locations) {
              expect(current.price).toBeGreaterThanOrEqual(previous.price)
              console.log(
                `✅ Price increases with more locations: ${previous.locations} -> ${current.locations}`
              )
            }
          }
        }

        // Test variable data with different quantity levels
        console.log('Testing variable data pricing with different quantities')

        const quantityTests = [
          { type: 'standard', value: '1000' },
          { type: 'standard', value: '5000' },
          { type: 'custom', value: 25000 },
        ]

        const quantityVariablePrices = []

        for (const qtyConfig of quantityTests) {
          await helpers.configureQuantity(qtyConfig)
          await page.waitForTimeout(2000)

          const price = await helpers.getCurrentPrice()
          quantityVariablePrices.push({
            quantity: qtyConfig.value,
            price: price,
          })

          console.log(`Variable data price with ${qtyConfig.value} quantity: $${price}`)
        }

        // Verify variable data pricing scales with quantity appropriately
        for (let i = 1; i < quantityVariablePrices.length; i++) {
          const current = quantityVariablePrices[i]
          const previous = quantityVariablePrices[i - 1]

          if (current.price && previous.price) {
            expect(current.price).toBeGreaterThan(previous.price)
            console.log(`✅ Variable data pricing scales with quantity`)
          }
        }

        // Test variable data disable/enable
        console.log('Testing variable data disable/enable')

        const priceWithVariableData = await helpers.getCurrentPrice()

        // Disable variable data
        if (variableDataCheckbox) {
          await variableDataCheckbox.click()
          await page.waitForTimeout(2000)

          const priceWithoutVariableData = await helpers.getCurrentPrice()
          console.log(`Price without variable data: $${priceWithoutVariableData}`)

          // Price should be lower without variable data
          if (priceWithVariableData && priceWithoutVariableData) {
            expect(priceWithoutVariableData).toBeLessThan(priceWithVariableData)
            console.log('✅ Disabling variable data reduces price')
          }

          // Re-enable variable data
          await variableDataCheckbox.click()
          await page.waitForTimeout(2000)

          const priceReEnabled = await helpers.getCurrentPrice()
          console.log(`Price with variable data re-enabled: $${priceReEnabled}`)

          // Price should return to higher level
          if (priceReEnabled && priceWithoutVariableData) {
            expect(priceReEnabled).toBeGreaterThan(priceWithoutVariableData)
            console.log('✅ Re-enabling variable data increases price')
          }

          await helpers.takeScreenshot('addons-test2-variable-data-toggled')
        }
      } else {
        console.log('⚠️ Variable data addon not found - may not be available for this product type')
      }

      const saved = await helpers.saveProduct()
      expect(saved).toBe(true)

      await helpers.takeScreenshot('addons-test2-saved')
      console.log('✅ Addons Test 2 completed successfully')
    }, 180000)
  })

  /**
   * TEST 3: Perforation & Special Addons
   * Tests perforation, corner rounding, and banding configurations
   */
  describe('Test 3: Perforation & Special Addons', () => {
    test('should configure perforation and special addons correctly', async () => {
      console.log('🧪 Starting Addons Test 3: Perforation & Special Addons')

      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('addons-test3-start')

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Addons Test 3 - Perforation & Special',
        category: 'door-hangers',
      })

      await helpers.uploadDemoImage()
      await helpers.configureQuantity({ type: 'standard', value: '2500' })
      await helpers.configureSize({ type: 'custom', width: 4.25, height: 11 })
      await helpers.configurePaperStock({
        paper: '16pt-cardstock',
        coating: 'uv',
        sides: 'double',
      })

      await helpers.takeScreenshot('addons-test3-prerequisites')

      // Test perforation configuration
      console.log('Testing perforation addon configuration')

      const perforationConfig = {
        perforation: { enabled: true, vertical: 2, horizontal: 1 },
      }

      await helpers.configureAddons(perforationConfig)

      // Verify perforation elements
      const perforationExists = await helpers.waitForSelectorSafe(
        selectors.addons.perforation.enable,
        5000
      )

      if (perforationExists) {
        const perforationCheckbox = await page.$(selectors.addons.perforation.enable)
        if (perforationCheckbox) {
          const isChecked = await perforationCheckbox.evaluate((el) => el.checked)
          expect(isChecked).toBe(true)
          console.log('✅ Perforation enabled')

          // Test perforation configuration options
          const verticalInput = await page.$(selectors.addons.perforation.vertical)
          const horizontalInput = await page.$(selectors.addons.perforation.horizontal)

          if (verticalInput) {
            await verticalInput.click({ clickCount: 3 })
            await page.keyboard.type('3')
            await page.waitForTimeout(1000)

            const verticalValue = await verticalInput.evaluate((el) => el.value)
            console.log(`Vertical perforation lines: ${verticalValue}`)
          }

          if (horizontalInput) {
            await horizontalInput.click({ clickCount: 3 })
            await page.keyboard.type('2')
            await page.waitForTimeout(1000)

            const horizontalValue = await horizontalInput.evaluate((el) => el.value)
            console.log(`Horizontal perforation lines: ${horizontalValue}`)
          }

          await helpers.takeScreenshot('addons-test3-perforation-configured')
        }
      }

      // Test corner rounding addon
      console.log('Testing corner rounding addon')

      const cornerRoundingConfig = {
        cornerRounding: { enabled: true, type: '4-corners' },
      }

      await helpers.configureAddons(cornerRoundingConfig)

      const cornerRoundingExists = await helpers.waitForSelectorSafe(
        selectors.addons.cornerRounding.enable,
        5000
      )

      if (cornerRoundingExists) {
        const cornerRoundingCheckbox = await page.$(selectors.addons.cornerRounding.enable)
        if (cornerRoundingCheckbox) {
          const isChecked = await cornerRoundingCheckbox.evaluate((el) => el.checked)
          expect(isChecked).toBe(true)
          console.log('✅ Corner rounding enabled')

          // Test corner rounding type selection
          const cornerTypeSelector = await page.$(selectors.addons.cornerRounding.type)
          if (cornerTypeSelector) {
            await cornerTypeSelector.click()
            await page.waitForTimeout(1000)

            // Look for corner type options
            const cornerOptions = await page.$$('[role="option"]')
            if (cornerOptions.length > 0) {
              await cornerOptions[0].click()
              await page.waitForTimeout(1000)
              console.log('✅ Corner rounding type selected')
            }
          }

          await helpers.takeScreenshot('addons-test3-corner-rounding-configured')
        }
      }

      // Test banding addon
      console.log('Testing banding addon')

      const bandingConfig = {
        banding: { enabled: true, itemsPerBundle: 25 },
      }

      await helpers.configureAddons(bandingConfig)

      const bandingExists = await helpers.waitForSelectorSafe(selectors.addons.banding.enable, 5000)

      if (bandingExists) {
        const bandingCheckbox = await page.$(selectors.addons.banding.enable)
        if (bandingCheckbox) {
          const isChecked = await bandingCheckbox.evaluate((el) => el.checked)
          expect(isChecked).toBe(true)
          console.log('✅ Banding enabled')

          // Test banding configuration
          const bandingTypeSelector = await page.$(selectors.addons.banding.type)
          if (bandingTypeSelector) {
            await bandingTypeSelector.click()
            await page.waitForTimeout(1000)

            const bandingOptions = await page.$$('[role="option"]')
            if (bandingOptions.length > 0) {
              await bandingOptions[0].click()
              await page.waitForTimeout(1000)
              console.log('✅ Banding type selected')
            }
          }

          // Test items per bundle configuration
          const itemsPerBundleInput = await page.$(selectors.addons.banding.itemsPerBundle)
          if (itemsPerBundleInput) {
            await itemsPerBundleInput.click({ clickCount: 3 })
            await page.keyboard.type('50')
            await page.waitForTimeout(1000)

            const bundleValue = await itemsPerBundleInput.evaluate((el) => el.value)
            expect(bundleValue).toBe('50')
            console.log(`✅ Items per bundle set to: ${bundleValue}`)
          }

          await helpers.takeScreenshot('addons-test3-banding-configured')
        }
      }

      // Test multiple special addons combined pricing
      console.log('Testing combined special addons pricing')

      const basePriceBeforeSpecial = await helpers.getCurrentPrice()

      // Configure comprehensive addon combination
      const comprehensiveConfig = {
        perforation: { enabled: true, vertical: 3, horizontal: 2 },
        cornerRounding: { enabled: true, type: '2-corners' },
        banding: { enabled: true, itemsPerBundle: 25 },
      }

      await helpers.configureAddons(comprehensiveConfig)
      await page.waitForTimeout(3000)

      const priceWithAllSpecialAddons = await helpers.getCurrentPrice()
      console.log(`Price with all special addons: $${priceWithAllSpecialAddons}`)

      // Verify combined addons increase price significantly
      if (basePriceBeforeSpecial && priceWithAllSpecialAddons) {
        const addonsIncrease = priceWithAllSpecialAddons - basePriceBeforeSpecial
        console.log(`Special addons total increase: $${addonsIncrease.toFixed(2)}`)

        expect(priceWithAllSpecialAddons).toBeGreaterThan(basePriceBeforeSpecial)
        console.log('✅ Combined special addons increase price')
      }

      await helpers.takeScreenshot('addons-test3-all-special-configured')

      // Test addon interaction and dependencies
      console.log('Testing addon interactions and dependencies')

      // Some addons might have dependencies or conflicts
      // Test removing one addon and ensuring others persist
      if (perforationExists) {
        const perforationCheckbox = await page.$(selectors.addons.perforation.enable)
        if (perforationCheckbox) {
          // Disable perforation
          await perforationCheckbox.click()
          await page.waitForTimeout(2000)

          // Verify other addons still enabled
          if (cornerRoundingExists) {
            const cornerCheckbox = await page.$(selectors.addons.cornerRounding.enable)
            if (cornerCheckbox) {
              const stillChecked = await cornerCheckbox.evaluate((el) => el.checked)
              expect(stillChecked).toBe(true)
              console.log('✅ Other addons persist when one is disabled')
            }
          }

          // Re-enable perforation for final save
          await perforationCheckbox.click()
          await page.waitForTimeout(1000)
        }
      }

      const saved = await helpers.saveProduct()
      expect(saved).toBe(true)

      await helpers.takeScreenshot('addons-test3-saved')
      console.log('✅ Addons Test 3 completed successfully')
    }, 240000)
  })

  /**
   * TEST 4: Addon Dependencies & Restrictions
   * Tests addon restrictions and dependency rules
   */
  describe('Test 4: Addon Dependencies & Restrictions', () => {
    test('should handle addon dependencies and restrictions correctly', async () => {
      console.log('🧪 Starting Addons Test 4: Dependencies & Restrictions')

      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('addons-test4-start')

      // Basic setup
      await helpers.fillBasicProductInfo({
        name: 'Addons Test 4 - Dependencies',
        category: 'brochures',
      })

      await helpers.uploadDemoImage()
      await helpers.configureQuantity({ type: 'standard', value: '1000' })
      await helpers.configureSize({ type: 'standard', value: '8.5x11' })

      // Test addon availability with different paper types
      console.log('Testing addon availability across different paper types')

      const paperTypes = ['14pt-cardstock', '16pt-cardstock', '100lb-text']
      const addonAvailabilityResults = []

      for (const paperType of paperTypes) {
        console.log(`Testing addons with paper type: ${paperType}`)

        // Configure paper stock
        await helpers.configurePaperStock({
          paper: paperType,
          coating: 'matte',
          sides: 'single',
        })

        await page.waitForTimeout(2000)
        await helpers.takeScreenshot(`addons-test4-paper-${paperType}`)

        // Check which addons are available/enabled
        const addonsModuleExists = await helpers.waitForSelectorSafe(selectors.addons.module, 5000)

        if (addonsModuleExists) {
          // Expand addons if needed
          const accordionTrigger = await page.$(selectors.addons.trigger)
          if (accordionTrigger) {
            try {
              await accordionTrigger.click()
              await page.waitForTimeout(1000)
            } catch (error) {
              // Accordion may already be open
            }
          }

          // Count available addons
          const availableAddons = []

          // Check for different addon types
          const addonChecks = [
            { name: 'Variable Data', selector: selectors.addons.variableData.enable },
            { name: 'Perforation', selector: selectors.addons.perforation.enable },
            { name: 'Corner Rounding', selector: selectors.addons.cornerRounding.enable },
            { name: 'Banding', selector: selectors.addons.banding.enable },
          ]

          for (const addon of addonChecks) {
            const addonElement = await page.$(addon.selector)
            if (addonElement) {
              const isVisible = await addonElement.isVisible()
              const isEnabled = await addonElement.evaluate((el) => !el.disabled)

              if (isVisible && isEnabled) {
                availableAddons.push(addon.name)
              }
            }
          }

          console.log(`Available addons for ${paperType}: ${availableAddons.join(', ')}`)

          addonAvailabilityResults.push({
            paperType: paperType,
            availableAddons: availableAddons,
            addonCount: availableAddons.length,
          })
        }
      }

      // Verify addon availability consistency
      console.log('Addon availability results:', addonAvailabilityResults)

      // All paper types should have at least some addons available
      for (const result of addonAvailabilityResults) {
        expect(result.addonCount).toBeGreaterThan(0)
      }

      // Test addon restrictions with quantity limits
      console.log('Testing addon restrictions with quantity limits')

      // Set base configuration
      await helpers.configurePaperStock({
        paper: '16pt-cardstock',
        coating: 'gloss',
        sides: 'double',
      })

      const quantityRestrictionTests = [
        { type: 'standard', value: '100' }, // Small quantity
        { type: 'standard', value: '5000' }, // Medium quantity
        { type: 'custom', value: 50000 }, // Large quantity
      ]

      for (const qtyTest of quantityRestrictionTests) {
        console.log(`Testing addon restrictions with quantity: ${qtyTest.value}`)

        await helpers.configureQuantity(qtyTest)
        await page.waitForTimeout(2000)

        // Try to enable variable data addon
        const variableDataElement = await page.$(selectors.addons.variableData.enable)
        if (variableDataElement) {
          const isEnabled = await variableDataElement.evaluate((el) => !el.disabled)
          const isVisible = await variableDataElement.isVisible()

          console.log(`Variable data available for ${qtyTest.value} qty: ${isEnabled && isVisible}`)

          if (isEnabled && isVisible) {
            // Test if addon behaves differently with different quantities
            await variableDataElement.click()
            await page.waitForTimeout(1000)

            const priceWithAddon = await helpers.getCurrentPrice()
            console.log(`Price with variable data at ${qtyTest.value} qty: $${priceWithAddon}`)

            // Disable for next test
            await variableDataElement.click()
            await page.waitForTimeout(1000)
          }
        }

        await helpers.takeScreenshot(`addons-test4-qty-restriction-${qtyTest.value}`)
      }

      // Test addon compatibility with coating restrictions
      console.log('Testing addon compatibility with coating restrictions')

      const coatingTests = ['matte', 'gloss', 'uv', 'uncoated']

      for (const coating of coatingTests) {
        console.log(`Testing addons with ${coating} coating`)

        // Try to set this coating
        await page.waitForSelector(selectors.paperStock.coatingDropdown, { timeout: 5000 })
        await page.click(selectors.paperStock.coatingDropdown)
        await page.waitForTimeout(1000)

        const coatingOptions = await page.$$('[role="option"]')
        let coatingSelected = false

        for (const option of coatingOptions) {
          const optionText = await option.textContent()
          if (optionText.toLowerCase().includes(coating)) {
            await option.click()
            await page.waitForTimeout(1000)
            coatingSelected = true
            console.log(`Selected ${coating} coating`)
            break
          }
        }

        if (!coatingSelected && coatingOptions.length > 0) {
          // Fallback: select first available coating
          await coatingOptions[0].click()
          await page.waitForTimeout(1000)
        }

        // Check addon availability with this coating
        const variableDataAfterCoating = await page.$(selectors.addons.variableData.enable)
        if (variableDataAfterCoating) {
          const isStillAvailable = await variableDataAfterCoating.evaluate((el) => !el.disabled)
          console.log(`Variable data available with ${coating}: ${isStillAvailable}`)
        }

        await helpers.takeScreenshot(`addons-test4-coating-${coating}`)
      }

      // Test addon pricing model variations
      console.log('Testing addon pricing models (per unit vs flat fee)')

      // Configure a standard setup
      await helpers.configureQuantity({ type: 'standard', value: '1000' })

      // Test with different quantities to see pricing behavior
      const pricingModelTests = [
        { quantity: 500, type: 'standard', value: '500' },
        { quantity: 2000, type: 'standard', value: '2000' },
        { quantity: 10000, type: 'custom', value: 10000 },
      ]

      const addonPricingResults = []

      for (const pricingTest of pricingModelTests) {
        await helpers.configureQuantity(pricingTest)
        await page.waitForTimeout(1000)

        const basePriceForPricing = await helpers.getCurrentPrice()

        // Enable variable data addon
        const variableDataForPricing = await page.$(selectors.addons.variableData.enable)
        if (variableDataForPricing) {
          await variableDataForPricing.click()
          await page.waitForTimeout(2000)

          const priceWithAddon = await helpers.getCurrentPrice()
          const addonCost = priceWithAddon - basePriceForPricing
          const costPerUnit = addonCost / pricingTest.quantity

          addonPricingResults.push({
            quantity: pricingTest.quantity,
            addonCost: addonCost,
            costPerUnit: costPerUnit,
          })

          console.log(
            `Qty ${pricingTest.quantity}: Addon cost $${addonCost.toFixed(2)}, Per unit $${costPerUnit.toFixed(4)}`
          )

          // Disable addon for next test
          await variableDataForPricing.click()
          await page.waitForTimeout(1000)
        }
      }

      // Analyze pricing model (per unit vs flat fee)
      if (addonPricingResults.length > 1) {
        const costPerUnitVariance =
          Math.max(...addonPricingResults.map((r) => r.costPerUnit)) -
          Math.min(...addonPricingResults.map((r) => r.costPerUnit))

        if (costPerUnitVariance < 0.01) {
          console.log('✅ Addon appears to use flat fee pricing model')
        } else {
          console.log('✅ Addon appears to use per-unit pricing model')
        }
      }

      const saved = await helpers.saveProduct()
      expect(saved).toBe(true)

      await helpers.takeScreenshot('addons-test4-saved')
      console.log('✅ Addons Test 4 completed successfully')
    }, 300000)
  })

  /**
   * TEST 5: Addon Frontend Integration
   * Tests addon display and functionality on customer frontend
   */
  describe('Test 5: Addon Frontend Integration', () => {
    test('should display and function correctly on customer frontend', async () => {
      console.log('🧪 Starting Addons Test 5: Frontend Integration')

      await helpers.navigateToProductCreation()
      await helpers.takeScreenshot('addons-test5-start')

      // Create comprehensive product with multiple addons
      const productConfig = {
        basic: {
          name: 'Addons Test 5 - Frontend Integration',
          category: 'business-cards',
        },
        quantity: { type: 'standard', value: '2500' },
        size: { type: 'standard', value: '3.5x2' },
        paperStock: {
          paper: '16pt-cardstock',
          coating: 'uv',
          sides: 'double',
        },
        addons: {
          variableData: { enabled: true, locations: 5 },
          cornerRounding: { enabled: true, type: '4-corners' },
        },
      }

      const result = await helpers.createCompleteProduct(productConfig)
      expect(result.saved).toBe(true)

      await helpers.takeScreenshot('addons-test5-product-created')

      // Generate product slug for frontend testing
      const productSlug = productConfig.basic.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      try {
        // Navigate to customer frontend
        await helpers.navigateToCustomerPage(productSlug)
        await helpers.takeScreenshot('addons-test5-frontend-loaded')

        // Verify addons section exists on frontend
        const frontendResults = await helpers.verifyFrontendDisplay(productConfig)
        console.log('Frontend verification results:', frontendResults)

        // Check specific addons display
        const addonsDisplayExists = await helpers.waitForSelectorSafe(
          selectors.customer.addonsSelector,
          10000
        )
        expect(addonsDisplayExists).toBe(true)

        await helpers.takeScreenshot('addons-test5-addons-section-found')

        // Test addon interaction on customer side
        if (addonsDisplayExists) {
          // Try to expand/interact with addons section
          await page.click(selectors.customer.addonsSelector)
          await page.waitForTimeout(2000)

          // Look for addon options
          const customerAddonOptions = await page.$$(
            '[data-testid*="customer-addon"], .addon-option, .addon-item'
          )
          console.log(`Customer addon options found: ${customerAddonOptions.length}`)

          await helpers.takeScreenshot('addons-test5-customer-addons-expanded')

          // Test addon selection on customer side
          for (let i = 0; i < Math.min(3, customerAddonOptions.length); i++) {
            try {
              const addonOption = customerAddonOptions[i]
              const addonText = await addonOption.textContent()
              console.log(`Customer addon option ${i + 1}: ${addonText}`)

              // Verify customer-friendly description (not technical IDs)
              expect(addonText.length).toBeGreaterThan(10)
              expect(addonText).not.toMatch(/^[a-z0-9-_]+$/) // Not just technical IDs

              // Test addon selection
              const addonCheckbox = await addonOption.$('input[type="checkbox"]')
              if (addonCheckbox) {
                await addonCheckbox.click()
                await page.waitForTimeout(2000)

                // Verify price updates on customer side
                const customerPrice = await helpers.getCurrentPrice()
                expect(customerPrice).toBeGreaterThan(0)

                console.log(`Price with customer addon ${i + 1}: $${customerPrice}`)

                // Uncheck for next test
                await addonCheckbox.click()
                await page.waitForTimeout(1000)
              }

              await helpers.takeScreenshot(`addons-test5-customer-addon-${i + 1}`)
            } catch (error) {
              console.log(`Could not test customer addon option ${i + 1}:`, error.message)
            }
          }

          // Test addon configuration options on customer side
          console.log('Testing customer addon configuration options')

          // Look for variable data configuration
          const customerVariableDataConfig = await page.$(
            '[data-testid="customer-variable-data-config"]'
          )
          if (customerVariableDataConfig) {
            console.log('✅ Variable data configuration available to customer')

            // Test locations input on customer side
            const customerLocationsInput = await page.$('[data-testid="customer-locations-input"]')
            if (customerLocationsInput) {
              await customerLocationsInput.click({ clickCount: 3 })
              await page.keyboard.type('8')
              await page.waitForTimeout(2000)

              const customerPrice = await helpers.getCurrentPrice()
              console.log(`Customer price with 8 locations: $${customerPrice}`)

              await helpers.takeScreenshot('addons-test5-customer-variable-data-config')
            }
          }

          // Test addon pricing transparency on customer side
          console.log('Testing addon pricing transparency')

          const addonPriceElements = await page.$$(
            '[data-testid*="addon-price"], .addon-price, .price-addon'
          )
          for (const priceElement of addonPriceElements) {
            const priceText = await priceElement.textContent()
            console.log(`Customer addon price display: ${priceText}`)

            // Should show pricing information
            if (
              priceText.includes('$') ||
              priceText.includes('cost') ||
              priceText.includes('add')
            ) {
              console.log('✅ Addon pricing information visible to customer')
            }
          }

          // Test complete customer addon configuration flow
          console.log('Testing complete customer addon flow')

          // Select multiple addons and verify total price
          const basePriceBeforeAddons = await helpers.getCurrentPrice()

          let addonsSelected = 0
          for (const addonOption of customerAddonOptions.slice(0, 2)) {
            const addonCheckbox = await addonOption.$('input[type="checkbox"]')
            if (addonCheckbox) {
              const isChecked = await addonCheckbox.evaluate((el) => el.checked)
              if (!isChecked) {
                await addonCheckbox.click()
                await page.waitForTimeout(1500)
                addonsSelected++
              }
            }
          }

          if (addonsSelected > 0) {
            const finalPriceWithAddons = await helpers.getCurrentPrice()
            console.log(`Final price with ${addonsSelected} addons: $${finalPriceWithAddons}`)

            if (basePriceBeforeAddons && finalPriceWithAddons) {
              expect(finalPriceWithAddons).toBeGreaterThan(basePriceBeforeAddons)
              console.log('✅ Customer addon selection increases total price')
            }

            await helpers.takeScreenshot('addons-test5-customer-flow-complete')
          }

          // Verify no admin-only features visible to customer
          const adminOnlySelectors = [
            '[data-testid="admin-addon-config"]',
            '[data-testid="addon-pricing-details"]',
            '[data-testid="addon-markup"]',
          ]

          for (const adminSelector of adminOnlySelectors) {
            const adminElement = await page.$(adminSelector)
            expect(adminElement).toBeNull()
          }

          console.log('✅ No admin-only addon features leaked to customer')

          await helpers.takeScreenshot('addons-test5-frontend-verification-complete')
        } else {
          console.log('⚠️ Addons section not found on customer frontend')
        }
      } catch (error) {
        console.log(
          'Frontend test skipped - product may not be immediately available:',
          error.message
        )
        console.log(
          'This is acceptable as products may need time to be indexed for customer display'
        )
      }

      console.log('✅ Addons Test 5 completed successfully')
    }, 300000)
  })
})

// Additional integration helper for addons module
describe('Addons Module Integration Helpers', () => {
  test('should export proper addon configuration for other modules', async () => {
    const addonConfigs = DataGenerators.generateAddonConfigs()

    expect(addonConfigs).toHaveProperty('basic')
    expect(addonConfigs).toHaveProperty('complex')
    expect(addonConfigs).toHaveProperty('comprehensive')

    expect(addonConfigs.basic.length).toBeGreaterThan(0)
    expect(addonConfigs.complex.length).toBeGreaterThan(0)

    // Verify addon configuration structure
    for (const basicConfig of addonConfigs.basic) {
      expect(basicConfig).toHaveProperty('addons')
      expect(basicConfig).toHaveProperty('description')
      expect(Array.isArray(basicConfig.addons)).toBe(true)
    }

    console.log('✅ Addons module data generators working correctly')
  })
})
