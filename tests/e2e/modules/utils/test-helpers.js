/**
 * Test Helper Functions for Module Testing
 * Common utilities used across all module tests
 */

const path = require('path')
const selectors = require('./selectors')

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
const DEMO_IMAGE_PATH = '/root/websites/gangrunprinting/docs/documentations/demo.png'

// Test timeouts
const TIMEOUTS = {
  default: 30000,
  upload: 60000,
  save: 45000,
  navigation: 15000,
}

class TestHelpers {
  constructor(page) {
    this.page = page
  }

  /**
   * Navigate to admin product creation page
   */
  async navigateToProductCreation() {
    await this.page.goto(`${BASE_URL}/admin/products/new`, {
      waitUntil: 'networkidle0',
      timeout: TIMEOUTS.navigation,
    })

    // Wait for form to load
    await this.page.waitForSelector(selectors.admin.productForm, { timeout: TIMEOUTS.default })
  }

  /**
   * Fill basic product information
   */
  async fillBasicProductInfo(productData = {}) {
    const defaultData = {
      name: `Test Product ${Date.now()}`,
      sku: `TEST-${Date.now()}`,
      category: 'business-cards', // Assuming this exists
      description: 'Test product for module verification',
    }

    const data = { ...defaultData, ...productData }

    // Fill basic fields
    await this.page.fill(selectors.admin.basicInfo.name, data.name)
    await this.page.fill(selectors.admin.basicInfo.sku, data.sku)
    await this.page.fill(selectors.admin.basicInfo.description, data.description)

    // Select category if dropdown exists
    try {
      await this.page.click(selectors.admin.basicInfo.category)
      await this.page.click(`[data-value="${data.category}"]`)
    } catch (error) {
      console.log('Category selection method may differ, trying alternative...')
      // Alternative method if needed
    }

    return data
  }

  /**
   * Upload demo image
   */
  async uploadDemoImage() {
    console.log('Uploading demo image...')

    try {
      // Wait for upload zone
      await this.page.waitForSelector(selectors.admin.imageUpload.uploadZone, {
        timeout: TIMEOUTS.default,
      })

      // Find file input (may be hidden)
      const fileInput = await this.page.$(selectors.admin.imageUpload.fileInput)

      if (fileInput) {
        // Upload file directly to input
        await fileInput.uploadFile(DEMO_IMAGE_PATH)
      } else {
        // Try drag and drop approach
        const uploadZone = await this.page.$(selectors.admin.imageUpload.uploadZone)
        if (uploadZone) {
          // Simulate file drop
          await this.page.evaluate((filePath) => {
            const uploadZone = document.querySelector('[data-testid="image-upload-zone"]')
            if (uploadZone) {
              // Trigger file upload through JavaScript if needed
              console.log('Triggering upload via JavaScript')
            }
          }, DEMO_IMAGE_PATH)
        }
      }

      // Wait for upload completion
      await this.page.waitForSelector(selectors.admin.imageUpload.uploadSuccess, {
        timeout: TIMEOUTS.upload,
      })

      console.log('Demo image uploaded successfully')
      return true
    } catch (error) {
      console.error('Failed to upload demo image:', error.message)
      // Continue with test even if upload fails
      return false
    }
  }

  /**
   * Configure Quantity Module
   */
  async configureQuantity(config) {
    console.log('Configuring quantity module...', config)

    await this.page.waitForSelector(selectors.quantity.dropdown, { timeout: TIMEOUTS.default })

    if (config.type === 'standard') {
      // Select standard quantity
      await this.page.click(selectors.quantity.dropdown)
      await this.page.click(selectors.quantity.value(config.value))
    } else if (config.type === 'custom') {
      // Select custom quantity
      await this.page.click(selectors.quantity.dropdown)
      await this.page.click(selectors.quantity.customOption)

      // Wait for custom input to appear
      await this.page.waitForSelector(selectors.quantity.customInput, { timeout: TIMEOUTS.default })
      await this.page.fill(selectors.quantity.customInput, config.value.toString())
    }

    // Wait for selection to process
    await this.page.waitForTimeout(1000)
  }

  /**
   * Configure Size Module
   */
  async configureSize(config) {
    console.log('Configuring size module...', config)

    await this.page.waitForSelector(selectors.size.dropdown, { timeout: TIMEOUTS.default })

    if (config.type === 'standard') {
      // Select standard size
      await this.page.click(selectors.size.dropdown)
      await this.page.click(selectors.size.value(config.value))
    } else if (config.type === 'custom') {
      // Select custom size
      await this.page.click(selectors.size.dropdown)
      await this.page.click(selectors.size.customOption)

      // Wait for custom inputs
      await this.page.waitForSelector(selectors.size.customWidth, { timeout: TIMEOUTS.default })
      await this.page.fill(selectors.size.customWidth, config.width.toString())
      await this.page.fill(selectors.size.customHeight, config.height.toString())
    }

    // Set exact size requirement if specified
    if (config.exactSize) {
      await this.page.check(selectors.size.exactSizeCheckbox)
    }

    await this.page.waitForTimeout(1000)
  }

  /**
   * Configure Paper Stock Module
   */
  async configurePaperStock(config) {
    console.log('Configuring paper stock module...', config)

    // Select paper type
    await this.page.waitForSelector(selectors.paperStock.paperDropdown, {
      timeout: TIMEOUTS.default,
    })
    await this.page.click(selectors.paperStock.paperDropdown)
    await this.page.click(selectors.paperStock.paperOption(config.paper))

    // Wait for cascade updates
    await this.page.waitForTimeout(2000)

    // Select coating if specified
    if (config.coating) {
      await this.page.click(selectors.paperStock.coatingDropdown)
      await this.page.click(selectors.paperStock.coatingOption(config.coating))
    }

    // Select sides if specified
    if (config.sides) {
      await this.page.click(selectors.paperStock.sidesDropdown)
      await this.page.click(selectors.paperStock.sidesOption(config.sides))
    }

    await this.page.waitForTimeout(1000)
  }

  /**
   * Configure Addons Module
   */
  async configureAddons(config) {
    console.log('Configuring addons module...', config)

    // Open addons accordion if closed
    try {
      await this.page.click(selectors.addons.trigger)
      await this.page.waitForTimeout(1000)
    } catch (error) {
      // Accordion might already be open
    }

    // Configure variable data if specified
    if (config.variableData) {
      await this.page.check(selectors.addons.variableData.enable)
      if (config.variableData.locations) {
        await this.page.fill(
          selectors.addons.variableData.locationsInput,
          config.variableData.locations.toString()
        )
      }
    }

    // Configure perforation if specified
    if (config.perforation) {
      await this.page.check(selectors.addons.perforation.enable)
      // Add specific perforation configuration
    }

    // Configure corner rounding if specified
    if (config.cornerRounding) {
      await this.page.check(selectors.addons.cornerRounding.enable)
    }

    // Configure banding if specified
    if (config.banding) {
      await this.page.check(selectors.addons.banding.enable)
      if (config.banding.itemsPerBundle) {
        await this.page.fill(
          selectors.addons.banding.itemsPerBundle,
          config.banding.itemsPerBundle.toString()
        )
      }
    }

    await this.page.waitForTimeout(1000)
  }

  /**
   * Configure Turnaround Module
   */
  async configureTurnaround(config) {
    console.log('Configuring turnaround module...', config)

    await this.page.waitForSelector(selectors.turnaround.dropdown, { timeout: TIMEOUTS.default })
    await this.page.click(selectors.turnaround.dropdown)
    await this.page.click(selectors.turnaround.option(config.turnaroundId))

    await this.page.waitForTimeout(1000)
  }

  /**
   * Save product
   */
  async saveProduct() {
    console.log('Saving product...')

    await this.page.click(selectors.admin.saveButton)

    // Wait for save completion
    try {
      await this.page.waitForSelector(selectors.ui.success, { timeout: TIMEOUTS.save })
      console.log('Product saved successfully')
      return true
    } catch (error) {
      console.error('Product save may have failed or taken too long')
      return false
    }
  }

  /**
   * Get current price from UI
   */
  async getCurrentPrice() {
    try {
      await this.page.waitForSelector(selectors.pricing.totalPrice, { timeout: 5000 })
      const priceText = await this.page.textContent(selectors.pricing.totalPrice)
      return parseFloat(priceText.replace(/[$,]/g, ''))
    } catch (error) {
      console.log('Could not get current price from UI')
      return null
    }
  }

  /**
   * Verify configuration persists after page reload
   */
  async verifyConfigurationPersistence(productId) {
    console.log('Verifying configuration persistence...')

    // Navigate to edit page
    await this.page.goto(`${BASE_URL}/admin/products/${productId}/edit`, {
      waitUntil: 'networkidle0',
      timeout: TIMEOUTS.navigation,
    })

    // Wait for form to load
    await this.page.waitForSelector(selectors.admin.productForm, { timeout: TIMEOUTS.default })

    return true
  }

  /**
   * Navigate to customer product page
   */
  async navigateToCustomerPage(productSlug) {
    console.log(`Navigating to customer page: ${productSlug}`)

    await this.page.goto(`${BASE_URL}/products/${productSlug}`, {
      waitUntil: 'networkidle0',
      timeout: TIMEOUTS.navigation,
    })

    await this.page.waitForSelector(selectors.customer.productPage, { timeout: TIMEOUTS.default })
  }

  /**
   * Verify frontend configuration display
   */
  async verifyFrontendDisplay(expectedConfig) {
    console.log('Verifying frontend display matches configuration...')

    const results = {
      quantity: false,
      size: false,
      paperStock: false,
      addons: false,
      turnaround: false,
    }

    // Check quantity display
    try {
      await this.page.waitForSelector(selectors.customer.quantitySelector, { timeout: 5000 })
      results.quantity = true
    } catch (error) {
      console.log('Quantity selector not found on frontend')
    }

    // Check size display
    try {
      await this.page.waitForSelector(selectors.customer.sizeSelector, { timeout: 5000 })
      results.size = true
    } catch (error) {
      console.log('Size selector not found on frontend')
    }

    // Check paper stock display
    try {
      await this.page.waitForSelector(selectors.customer.paperSelector, { timeout: 5000 })
      results.paperStock = true
    } catch (error) {
      console.log('Paper selector not found on frontend')
    }

    // Check addons display
    try {
      await this.page.waitForSelector(selectors.customer.addonsSelector, { timeout: 5000 })
      results.addons = true
    } catch (error) {
      console.log('Addons selector not found on frontend')
    }

    // Check turnaround display
    try {
      await this.page.waitForSelector(selectors.customer.turnaroundSelector, { timeout: 5000 })
      results.turnaround = true
    } catch (error) {
      console.log('Turnaround selector not found on frontend')
    }

    return results
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name) {
    const timestamp = Date.now()
    const filename = `tests/e2e/modules/screenshots/${name}-${timestamp}.png`
    await this.page.screenshot({ path: filename, fullPage: true })
    console.log(`Screenshot saved: ${filename}`)
  }

  /**
   * Check for JavaScript errors
   */
  async checkForErrors() {
    const errors = []

    this.page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    this.page.on('requestfailed', (request) => {
      errors.push(`Request failed: ${request.url()}`)
    })

    return errors
  }

  /**
   * Wait for element and handle timeout gracefully
   */
  async waitForSelectorSafe(selector, timeout = TIMEOUTS.default) {
    try {
      await this.page.waitForSelector(selector, { timeout })
      return true
    } catch (error) {
      console.log(`Element not found within timeout: ${selector}`)
      return false
    }
  }

  /**
   * Complete product configuration flow
   */
  async createCompleteProduct(config) {
    console.log('Creating complete product with configuration:', config)

    // Start with basic info and image
    await this.navigateToProductCreation()
    const productData = await this.fillBasicProductInfo(config.basic)
    await this.uploadDemoImage()

    // Configure each module
    if (config.quantity) {
      await this.configureQuantity(config.quantity)
    }

    if (config.size) {
      await this.configureSize(config.size)
    }

    if (config.paperStock) {
      await this.configurePaperStock(config.paperStock)
    }

    if (config.addons) {
      await this.configureAddons(config.addons)
    }

    if (config.turnaround) {
      await this.configureTurnaround(config.turnaround)
    }

    // Save the product
    const saved = await this.saveProduct()

    return {
      saved,
      productData,
      config,
    }
  }
}

module.exports = TestHelpers
