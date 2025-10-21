/**
 * Test Payment Methods - PayPal & Cash App
 * Verifies payment buttons render correctly on checkout page
 */

const puppeteer = require('puppeteer')

async function testPaymentMethods() {
  console.log('\n🧪 Testing Payment Methods\n')
  console.log('='.repeat(80))

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  // Enable console logging from browser
  page.on('console', (msg) => {
    const type = msg.type()
    const text = msg.text()

    if (type === 'error') {
      console.log(`❌ Browser Error: ${text}`)
    } else if (text.includes('PayPal') || text.includes('Cash App')) {
      console.log(`📝 Browser Log: ${text}`)
    }
  })

  try {
    // Step 1: Navigate directly to payment page (bypass checkout for testing)
    console.log('\n📍 Step 1: Navigating to payment page...')

    // First, set up session storage with mock checkout data
    await page.goto('https://gangrunprinting.com', { waitUntil: 'networkidle0' })

    await page.evaluate(() => {
      // Mock shipping address
      sessionStorage.setItem('checkout_shipping_address', JSON.stringify({
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com',
        phone: '555-0123',
        street: '123 Test St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'US',
      }))

      // Mock shipping method
      sessionStorage.setItem('checkout_shipping_method', JSON.stringify({
        carrier: 'FEDEX',
        service: 'FEDEX_GROUND',
        rate: {
          amount: 15.00,
          currency: 'USD'
        }
      }))
    })

    // Navigate to payment page
    await page.goto('https://gangrunprinting.com/checkout/payment', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    console.log('✅ Payment page loaded')
    await page.screenshot({ path: 'test-screenshots/payment-page.png', fullPage: true })

    // Step 2: Check for NEXT_PUBLIC_PAYPAL_CLIENT_ID
    console.log('\n📍 Step 2: Checking PayPal client ID in browser...')

    const paypalClientId = await page.evaluate(() => {
      return window.process?.env?.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
             'NOT FOUND - Check .env file'
    })

    console.log(`   PayPal Client ID: ${paypalClientId.substring(0, 20)}...`)

    // Step 3: Check if PayPal button option exists
    console.log('\n📍 Step 3: Looking for PayPal payment option...')

    const paypalButtonExists = await page.evaluate(() => {
      const text = document.body.innerText
      return text.includes('PayPal') || text.includes('paypal')
    })

    if (paypalButtonExists) {
      console.log('✅ PayPal option text found on page')
    } else {
      console.log('❌ PayPal option NOT found on page')
    }

    // Step 4: Try to click PayPal option
    console.log('\n📍 Step 4: Attempting to select PayPal...')

    try {
      // Wait for payment method buttons
      await page.waitForSelector('button', { timeout: 5000 })

      // Look for PayPal button by text
      const paypalButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'))
        return buttons.find(btn => btn.textContent?.includes('PayPal'))
      })

      if (paypalButton) {
        console.log('✅ Found PayPal button')
        await paypalButton.asElement().click()
        await page.waitForTimeout(2000)

        await page.screenshot({ path: 'test-screenshots/paypal-selected.png', fullPage: true })

        // Check if PayPal SDK loaded
        const paypalSDKLoaded = await page.evaluate(() => {
          return typeof window.paypal !== 'undefined'
        })

        if (paypalSDKLoaded) {
          console.log('✅ PayPal SDK loaded successfully')
        } else {
          console.log('❌ PayPal SDK NOT loaded')
        }

        // Check for PayPal buttons container
        const paypalButtonsExist = await page.evaluate(() => {
          return document.querySelector('[data-paypal-button]') !== null ||
                 document.querySelector('.paypal-buttons') !== null
        })

        if (paypalButtonsExist) {
          console.log('✅ PayPal payment buttons rendered')
        } else {
          console.log('⚠️  PayPal payment buttons NOT rendered')
        }
      } else {
        console.log('❌ Could not find PayPal button to click')
      }
    } catch (err) {
      console.log('❌ Error selecting PayPal:', (err).message)
    }

    // Step 5: Check for Cash App option
    console.log('\n📍 Step 5: Looking for Cash App option...')

    const cashAppExists = await page.evaluate(() => {
      const text = document.body.innerText
      return text.includes('Cash App') || text.includes('CashApp')
    })

    if (cashAppExists) {
      console.log('✅ Cash App option text found')
    } else {
      console.log('❌ Cash App option NOT found')
    }

    // Step 6: Check network requests for errors
    console.log('\n📍 Step 6: Checking for network errors...')

    const failedRequests = []
    page.on('requestfailed', (request) => {
      failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText,
      })
    })

    await page.waitForTimeout(2000)

    if (failedRequests.length > 0) {
      console.log(`❌ Found ${failedRequests.length} failed requests:`)
      failedRequests.forEach((req) => {
        console.log(`   - ${req.url}: ${req.error}`)
      })
    } else {
      console.log('✅ No network errors detected')
    }

    console.log('\n' + '='.repeat(80))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(80))
    console.log(`PayPal Client ID: ${paypalClientId !== 'NOT FOUND - Check .env file' ? '✅' : '❌'}`)
    console.log(`PayPal Option Visible: ${paypalButtonExists ? '✅' : '❌'}`)
    console.log(`Cash App Option Visible: ${cashAppExists ? '✅' : '❌'}`)
    console.log('='.repeat(80) + '\n')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    await page.screenshot({ path: 'test-screenshots/payment-error.png', fullPage: true })
  } finally {
    await browser.close()
  }
}

// Run test
testPaymentMethods().catch(console.error)
