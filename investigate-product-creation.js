const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

// Real data from database
const REAL_DATA = {
  categories: [
    { id: 'cat_banner', name: 'Banner', slug: 'banner' },
    { id: 'cat_booklet', name: 'Booklet', slug: 'booklet' },
    { id: 'cat_bookmark', name: 'Bookmark', slug: 'bookmark' },
    { id: 'cat_brochure', name: 'Brochure', slug: 'brochure' },
    { id: 'cat_business_card', name: 'Business Card', slug: 'business-card' },
  ],
  paperStocks: [
    { id: 'cmg46sc60000f12ymdo48kpb0', name: '16pt C2S Cardstock' },
    { id: '6e805d64-ac09-47ab-a015-2e02da5c5943', name: '14pt C2S Cardstock' },
    { id: '9497e3ba-e4ab-4de9-ad7e-12bdcb319001', name: '100 lb Uncoated Cover (14pt)' },
    { id: '99ae8c92-2968-4842-a834-29a81f361ceb', name: '12pt C2S Cardstock' },
    { id: '48d4fb70-30c2-46c0-8fcc-5d0546894a73', name: '60 lb Offset' },
  ],
  quantityGroups: [{ id: 'cmg5i6poy000094pu856umjxa', name: 'Standard Size' }],
  sizeGroups: [{ id: 'b180aadd-1ed7-42e5-9640-9460a58e9f72', name: 'Printing Sizes' }],
  turnaroundGroups: [{ id: 'cmg46sc7u001k12ymd9w3p9uk', name: 'Standard Turnaround Options' }],
}

async function investigateProductCreation() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--ignore-certificate-errors',
      '--window-size=1920,1080',
    ],
    defaultViewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  })

  const page = await browser.newPage()

  // Enable console logging
  page.on('console', (msg) => {
    const type = msg.type()
    const text = msg.text()
    console.log(`[BROWSER ${type.toUpperCase()}]:`, text)
  })

  // Capture network requests
  const networkLogs = []
  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('/api/products')) {
      const status = response.status()
      let body = null
      try {
        body = await response.text()
      } catch (e) {
        body = 'Could not read response body'
      }

      networkLogs.push({
        url,
        status,
        headers: response.headers(),
        body,
      })

      console.log('\n=== API REQUEST CAPTURED ===')
      console.log('URL:', url)
      console.log('Status:', status)
      console.log('Response Body:', body)
      console.log('=========================\n')
    }
  })

  try {
    console.log('\n=== STEP 1: Navigating to admin login ===')
    await page.goto('https://gangrunprinting.com/auth/signin', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    // Take screenshot of login page
    await page.screenshot({ path: 'step1-login-page.png', fullPage: true })
    console.log('Screenshot saved: step1-login-page.png')

    console.log('\n=== STEP 2: Logging in ===')
    // Check if we need to login or if already logged in
    const currentUrl = page.url()
    if (currentUrl.includes('/auth/signin')) {
      // Fill login form
      await page.type('input[name="email"]', 'iradwatkins@gmail.com', { delay: 100 })
      await page.type('input[name="password"]', 'Iw2006js!', { delay: 100 })

      // Click login button and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        page.click('button[type="submit"]'),
      ])

      console.log('Login submitted, current URL:', page.url())
      await page.screenshot({ path: 'step2-after-login.png', fullPage: true })
    }

    console.log('\n=== STEP 3: Navigating to product creation page ===')
    await page.goto('https://gangrunprinting.com/admin/products/new', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    console.log('Current URL:', page.url())
    await page.screenshot({ path: 'step3-product-creation-page.png', fullPage: true })
    console.log('Screenshot saved: step3-product-creation-page.png')

    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 })
    console.log('Form loaded successfully')

    console.log('\n=== STEP 4: Filling out product form with real data ===')

    // Fill basic information
    await page.type('input[name="name"]', 'Test Product - Puppeteer Investigation', { delay: 50 })
    console.log('Filled product name')

    await page.type('input[name="slug"]', 'test-product-puppeteer-investigation', { delay: 50 })
    console.log('Filled product slug')

    await page.type(
      'textarea[name="description"]',
      'This is a test product created during error investigation using Puppeteer.',
      { delay: 30 }
    )
    console.log('Filled product description')

    // Select category
    if (REAL_DATA.categories && REAL_DATA.categories.length > 0) {
      const categoryId = REAL_DATA.categories[0].id
      await page.select('select[name="categoryId"]', categoryId)
      console.log('Selected category:', REAL_DATA.categories[0].name)
    }

    // Select paper stock
    if (REAL_DATA.paperStocks && REAL_DATA.paperStocks.length > 0) {
      const paperStockId = REAL_DATA.paperStocks[0].id
      await page.select('select[name="paperStockId"]', paperStockId)
      console.log('Selected paper stock:', REAL_DATA.paperStocks[0].name)
    }

    // Select quantity group
    if (REAL_DATA.quantityGroups && REAL_DATA.quantityGroups.length > 0) {
      const quantityGroupId = REAL_DATA.quantityGroups[0].id
      await page.select('select[name="quantityGroupId"]', quantityGroupId)
      console.log('Selected quantity group:', REAL_DATA.quantityGroups[0].name)
    }

    // Select size group
    if (REAL_DATA.sizeGroups && REAL_DATA.sizeGroups.length > 0) {
      const sizeGroupId = REAL_DATA.sizeGroups[0].id
      await page.select('select[name="sizeGroupId"]', sizeGroupId)
      console.log('Selected size group:', REAL_DATA.sizeGroups[0].name)
    }

    // Select turnaround group
    if (REAL_DATA.turnaroundGroups && REAL_DATA.turnaroundGroups.length > 0) {
      const turnaroundGroupId = REAL_DATA.turnaroundGroups[0].id
      await page.select('select[name="turnaroundTimeGroupId"]', turnaroundGroupId)
      console.log('Selected turnaround group:', REAL_DATA.turnaroundGroups[0].name)
    }

    // Fill base price
    await page.type('input[name="basePrice"]', '25.99', { delay: 50 })
    console.log('Filled base price')

    await page.screenshot({ path: 'step4-form-filled.png', fullPage: true })
    console.log('Screenshot saved: step4-form-filled.png')

    console.log('\n=== STEP 5: Submitting form ===')

    // Click submit and wait for response
    await Promise.all([
      page
        .waitForResponse(
          (response) => response.url().includes('/api/products') && response.status() !== 200,
          { timeout: 30000 }
        )
        .catch(() => console.log('No error response captured')),
      page.click('button[type="submit"]'),
    ])

    // Wait a bit for any additional console logs
    await new Promise((resolve) => setTimeout(resolve, 2000))

    await page.screenshot({ path: 'step5-after-submit.png', fullPage: true })
    console.log('Screenshot saved: step5-after-submit.png')

    console.log('\n=== STEP 6: Capturing error details ===')

    // Check for error messages on page
    const errorElements = await page.$$(
      '[class*="error"], [role="alert"], .text-red-500, .text-red-600'
    )
    console.log(`Found ${errorElements.length} error elements on page`)

    for (let i = 0; i < errorElements.length; i++) {
      const text = await errorElements[i].evaluate((el) => el.textContent)
      console.log(`Error ${i + 1}:`, text)
    }

    // Save network logs to file
    fs.writeFileSync('network-logs.json', JSON.stringify(networkLogs, null, 2))
    console.log('Network logs saved to: network-logs.json')

    console.log('\n=== INVESTIGATION COMPLETE ===')
    console.log('Total API requests captured:', networkLogs.length)

    if (networkLogs.length > 0) {
      console.log('\n=== ERROR RESPONSE DETAILS ===')
      networkLogs.forEach((log, index) => {
        console.log(`\nRequest ${index + 1}:`)
        console.log('URL:', log.url)
        console.log('Status:', log.status)
        console.log('Response Body:', log.body)
      })
    }
  } catch (error) {
    console.error('\n=== ERROR DURING INVESTIGATION ===')
    console.error(error.message)
    console.error(error.stack)

    await page.screenshot({ path: 'error-screenshot.png', fullPage: true })
    console.log('Error screenshot saved: error-screenshot.png')
  } finally {
    // Keep browser open for 5 seconds to review
    console.log('\nKeeping browser open for 5 seconds...')
    await new Promise((resolve) => setTimeout(resolve, 5000))
    await browser.close()
  }
}

// Run the investigation
investigateProductCreation().catch(console.error)
