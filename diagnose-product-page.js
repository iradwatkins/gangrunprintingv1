/**
 * Product Page Diagnostic Script
 * Tests https://gangrunprinting.com/products/asdfddddddddddddd-20
 * Captures console errors, React Error #310, and screenshots
 */

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const PRODUCT_URL = 'https://gangrunprinting.com/products/asdfddddddddddddd-20'
const SCREENSHOT_DIR = '/root/websites/gangrunprinting/diagnostics'
const TIMEOUT = 30000 // 30 seconds

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

async function diagnoseProductPage() {
  console.log('='.repeat(80))
  console.log('🔍 PRODUCT PAGE DIAGNOSTIC TEST')
  console.log('='.repeat(80))
  console.log(`Testing URL: ${PRODUCT_URL}`)
  console.log(`Timestamp: ${new Date().toISOString()}`)
  console.log('='.repeat(80))
  console.log()

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  })

  const page = await browser.newPage()

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 })

  // Track all console messages
  const consoleLogs = []
  const consoleErrors = []
  const consoleWarnings = []
  const reactErrors = []

  // Capture console output
  page.on('console', (msg) => {
    const text = msg.text()
    const type = msg.type()
    const location = msg.location()

    const logEntry = {
      type,
      text,
      location,
      timestamp: new Date().toISOString(),
    }

    if (type === 'error') {
      consoleErrors.push(logEntry)
      console.error(`❌ CONSOLE ERROR: ${text}`)
      if (location?.url) {
        console.error(`   Location: ${location.url}:${location.lineNumber}`)
      }

      // Check for React Error #310
      if (text.includes('Error #310') || text.includes('Maximum update depth exceeded')) {
        reactErrors.push(logEntry)
        console.error('🚨 REACT ERROR #310 DETECTED!')
      }
    } else if (type === 'warning') {
      consoleWarnings.push(logEntry)
      console.warn(`⚠️  CONSOLE WARNING: ${text}`)
    } else {
      consoleLogs.push(logEntry)
      console.log(`📝 CONSOLE LOG: ${text}`)
    }
  })

  // Capture page errors
  page.on('pageerror', (error) => {
    const errorEntry = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }

    consoleErrors.push(errorEntry)
    console.error('❌ PAGE ERROR:', error.message)

    if (error.stack) {
      console.error('Stack trace:')
      console.error(error.stack)
    }

    // Check for React Error #310 in page errors
    if (
      error.message.includes('Error #310') ||
      error.message.includes('Maximum update depth exceeded')
    ) {
      reactErrors.push(errorEntry)
      console.error('🚨 REACT ERROR #310 DETECTED IN PAGE ERROR!')
    }
  })

  // Capture failed requests
  const failedRequests = []
  page.on('requestfailed', (request) => {
    const failedReq = {
      url: request.url(),
      failure: request.failure(),
      timestamp: new Date().toISOString(),
    }
    failedRequests.push(failedReq)
    console.error(`❌ REQUEST FAILED: ${request.url()}`)
    console.error(`   Reason: ${request.failure()?.errorText}`)
  })

  // Track responses
  const responses = []
  page.on('response', (response) => {
    if (!response.ok()) {
      responses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString(),
      })
      console.warn(`⚠️  HTTP ${response.status()}: ${response.url()}`)
    }
  })

  console.log('\n📥 Loading page...\n')

  try {
    // Navigate to the page
    const response = await page.goto(PRODUCT_URL, {
      waitUntil: 'networkidle0',
      timeout: TIMEOUT,
    })

    console.log(`\n✅ Page loaded with status: ${response.status()}\n`)

    // Take initial screenshot
    const initialScreenshot = path.join(SCREENSHOT_DIR, `01-initial-load-${Date.now()}.png`)
    await page.screenshot({ path: initialScreenshot, fullPage: true })
    console.log(`📸 Initial screenshot: ${initialScreenshot}`)

    // Wait a bit to see if errors appear
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Take screenshot after 2 seconds
    const after2sScreenshot = path.join(SCREENSHOT_DIR, `02-after-2s-${Date.now()}.png`)
    await page.screenshot({ path: after2sScreenshot, fullPage: true })
    console.log(`📸 After 2s screenshot: ${after2sScreenshot}`)

    // Check for infinite loop indicators
    console.log('\n🔄 Checking for infinite loop indicators...\n')

    let renderCount = 0
    let previousHTML = ''

    for (let i = 0; i < 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const currentHTML = await page.content()

      if (currentHTML !== previousHTML) {
        renderCount++
        console.log(`🔄 Render ${renderCount}: Page content changed`)
      }

      previousHTML = currentHTML
    }

    if (renderCount > 3) {
      console.error('🚨 INFINITE LOOP DETECTED: Page is re-rendering continuously!')
    }

    // Take final screenshot
    const finalScreenshot = path.join(SCREENSHOT_DIR, `03-final-${Date.now()}.png`)
    await page.screenshot({ path: finalScreenshot, fullPage: true })
    console.log(`📸 Final screenshot: ${finalScreenshot}`)

    // Check for specific React error in page content
    const pageContent = await page.content()
    if (
      pageContent.includes('Error #310') ||
      pageContent.includes('Maximum update depth exceeded')
    ) {
      console.error('🚨 REACT ERROR #310 FOUND IN PAGE CONTENT!')
    }

    // Try to get React DevTools info if available
    const reactInfo = await page.evaluate(() => {
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        return {
          hasReactDevTools: true,
          reactVersion: window.React?.version || 'unknown',
        }
      }
      return { hasReactDevTools: false }
    })

    console.log('\n📊 React Info:', reactInfo)
  } catch (error) {
    console.error('\n❌ ERROR DURING PAGE LOAD:')
    console.error(error.message)

    // Take error screenshot
    const errorScreenshot = path.join(SCREENSHOT_DIR, `error-${Date.now()}.png`)
    await page.screenshot({ path: errorScreenshot, fullPage: true })
    console.log(`📸 Error screenshot: ${errorScreenshot}`)
  }

  await browser.close()

  // Generate report
  console.log('\n' + '='.repeat(80))
  console.log('📊 DIAGNOSTIC REPORT')
  console.log('='.repeat(80))

  console.log('\n🔴 CONSOLE ERRORS:', consoleErrors.length)
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((err, idx) => {
      console.log(`\n  Error ${idx + 1}:`)
      console.log(`  ${JSON.stringify(err, null, 2)}`)
    })
  }

  console.log('\n🚨 REACT ERROR #310 OCCURRENCES:', reactErrors.length)
  if (reactErrors.length > 0) {
    console.log('\n  CRITICAL: React Error #310 detected!')
    console.log('  This indicates an infinite loop in a component.')
    reactErrors.forEach((err, idx) => {
      console.log(`\n  React Error ${idx + 1}:`)
      console.log(`  ${JSON.stringify(err, null, 2)}`)
    })
  }

  console.log('\n⚠️  CONSOLE WARNINGS:', consoleWarnings.length)
  if (consoleWarnings.length > 0 && consoleWarnings.length <= 10) {
    consoleWarnings.forEach((warn, idx) => {
      console.log(`\n  Warning ${idx + 1}: ${warn.text}`)
    })
  }

  console.log('\n📝 CONSOLE LOGS:', consoleLogs.length)

  console.log('\n❌ FAILED REQUESTS:', failedRequests.length)
  if (failedRequests.length > 0) {
    failedRequests.forEach((req, idx) => {
      console.log(`\n  Failed Request ${idx + 1}:`)
      console.log(`  URL: ${req.url}`)
      console.log(`  Error: ${req.failure?.errorText}`)
    })
  }

  console.log('\n🌐 HTTP ERRORS:', responses.length)
  if (responses.length > 0) {
    responses.forEach((res, idx) => {
      console.log(`  ${idx + 1}. ${res.status} ${res.statusText}: ${res.url}`)
    })
  }

  // Save full report to JSON
  const reportPath = path.join(SCREENSHOT_DIR, `diagnostic-report-${Date.now()}.json`)
  const report = {
    url: PRODUCT_URL,
    timestamp: new Date().toISOString(),
    summary: {
      consoleErrors: consoleErrors.length,
      reactError310: reactErrors.length,
      consoleWarnings: consoleWarnings.length,
      consoleLogs: consoleLogs.length,
      failedRequests: failedRequests.length,
      httpErrors: responses.length,
    },
    consoleErrors,
    reactErrors,
    consoleWarnings: consoleWarnings.slice(0, 20), // Limit warnings
    consoleLogs: consoleLogs.slice(0, 50), // Limit logs
    failedRequests,
    httpErrors: responses,
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n💾 Full report saved: ${reportPath}`)

  console.log('\n' + '='.repeat(80))
  console.log('✅ DIAGNOSTIC COMPLETE')
  console.log('='.repeat(80))

  // Exit with error code if React Error #310 was detected
  if (reactErrors.length > 0) {
    console.error('\n🚨 CRITICAL: React Error #310 detected - infinite loop in component!')
    process.exit(1)
  }
}

// Run diagnostic
diagnoseProductPage().catch((error) => {
  console.error('Fatal error running diagnostic:')
  console.error(error)
  process.exit(1)
})
