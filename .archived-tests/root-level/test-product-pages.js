const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

async function testProductPage(url, pageName) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`Testing: ${pageName}`)
  console.log(`URL: ${url}`)
  console.log('='.repeat(80))

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 })

  // Track console logs and errors
  const consoleMessages = []
  const errors = []
  let reloadCount = 0
  let hasReactError310 = false

  page.on('console', (msg) => {
    const text = msg.text()
    consoleMessages.push({
      type: msg.type(),
      text: text,
    })

    // Check for React Error #310
    if (text.includes('Error #310') || text.includes('Minified React error #310')) {
      hasReactError310 = true
      errors.push(`CRITICAL: React Error #310 detected - ${text}`)
    }

    // Track other errors
    if (msg.type() === 'error') {
      errors.push(text)
    }
  })

  page.on('pageerror', (error) => {
    const errorText = error.toString()
    errors.push(`Page Error: ${errorText}`)

    if (errorText.includes('Error #310') || errorText.includes('Minified React error #310')) {
      hasReactError310 = true
    }
  })

  // Track navigation to detect reload loops
  page.on('framenavigated', () => {
    reloadCount++
  })

  try {
    console.log('\n[1/5] Navigating to page...')
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    console.log('[2/5] Waiting 5 seconds for full load...')
    await new Promise((resolve) => setTimeout(resolve, 5000))

    console.log('[3/5] Checking page stability...')
    const initialReloadCount = reloadCount
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const finalReloadCount = reloadCount
    const hasReloadLoop = finalReloadCount - initialReloadCount > 1

    console.log('[4/5] Checking for product configuration elements...')

    // Check for key elements
    const pageContent = await page.content()
    const elements = {
      hasQuantitySection: pageContent.includes('Quantity') || pageContent.includes('quantity'),
      hasSizeSection: pageContent.includes('Size') || pageContent.includes('size'),
      hasPriceDisplay:
        pageContent.includes('$') &&
        (pageContent.includes('price') || pageContent.includes('Price')),
      hasAddToCart: pageContent.includes('Add to Cart') || pageContent.includes('add to cart'),
      hasProductTitle: (await page.$('h1')) !== null,
      hasConfigForm:
        (await page.$('form')) !== null || (await page.$('[class*="config"]')) !== null,
    }

    // Try to find specific configuration elements
    const selectors = {
      quantityInput: (await page.$('input[type="number"]')) !== null,
      selectDropdowns: await page.$$('select').then((els) => els.length),
      buttons: await page.$$('button').then((els) => els.length),
      formElements: await page.$$('form').then((els) => els.length),
    }

    console.log('[5/5] Taking screenshot...')
    const screenshotPath = path.join(
      __dirname,
      `test-${pageName.replace(/\s+/g, '-').toLowerCase()}.png`
    )
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    })

    // Get final page state
    const finalUrl = page.url()
    const pageTitle = await page.title()

    // Generate report
    console.log('\n' + '='.repeat(80))
    console.log('TEST RESULTS')
    console.log('='.repeat(80))

    console.log('\n✓ STATUS CHECKS:')
    console.log(`  Page Loaded: ${finalUrl === url ? '✅ YES' : '⚠️  REDIRECTED to ' + finalUrl}`)
    console.log(`  Page Title: "${pageTitle}"`)
    console.log(
      `  Reload Count: ${reloadCount} ${hasReloadLoop ? '❌ LOOP DETECTED' : '✅ STABLE'}`
    )
    console.log(`  React Error #310: ${hasReactError310 ? '❌ PRESENT' : '✅ NOT FOUND'}`)

    console.log('\n✓ PAGE ELEMENTS:')
    console.log(`  Product Title (h1): ${elements.hasProductTitle ? '✅ Found' : '❌ Missing'}`)
    console.log(`  Configuration Form: ${elements.hasConfigForm ? '✅ Found' : '❌ Missing'}`)
    console.log(`  Quantity Section: ${elements.hasQuantitySection ? '✅ Found' : '❌ Missing'}`)
    console.log(`  Size Section: ${elements.hasSizeSection ? '✅ Found' : '⚠️  Not Found'}`)
    console.log(`  Price Display: ${elements.hasPriceDisplay ? '✅ Found' : '❌ Missing'}`)
    console.log(`  Add to Cart Button: ${elements.hasAddToCart ? '✅ Found' : '❌ Missing'}`)

    console.log('\n✓ FORM CONTROLS:')
    console.log(`  Quantity Input: ${selectors.quantityInput ? '✅ Found' : '⚠️  Not Found'}`)
    console.log(`  Select Dropdowns: ${selectors.selectDropdowns} found`)
    console.log(`  Buttons: ${selectors.buttons} found`)
    console.log(`  Forms: ${selectors.formElements} found`)

    console.log('\n✓ CONSOLE ACTIVITY:')
    const errorCount = errors.filter((e) => !e.includes('favicon')).length
    const warningCount = consoleMessages.filter((m) => m.type === 'warning').length
    console.log(`  Errors: ${errorCount} ${errorCount === 0 ? '✅' : '⚠️'}`)
    console.log(`  Warnings: ${warningCount}`)

    if (errorCount > 0) {
      console.log('\n⚠️  ERRORS DETECTED:')
      errors.slice(0, 5).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.substring(0, 150)}${err.length > 150 ? '...' : ''}`)
      })
      if (errors.length > 5) {
        console.log(`  ... and ${errors.length - 5} more errors`)
      }
    }

    console.log('\n✓ SCREENSHOT:')
    console.log(`  Saved to: ${screenshotPath}`)

    // Overall assessment
    const isSuccess =
      !hasReactError310 &&
      !hasReloadLoop &&
      elements.hasProductTitle &&
      (elements.hasConfigForm || elements.hasQuantitySection) &&
      errorCount < 3

    console.log('\n' + '='.repeat(80))
    console.log(`OVERALL STATUS: ${isSuccess ? '✅ PASSED' : '❌ FAILED'}`)
    console.log('='.repeat(80))

    await browser.close()

    return {
      success: isSuccess,
      pageName,
      url,
      finalUrl,
      pageTitle,
      hasReactError310,
      hasReloadLoop,
      reloadCount,
      elements,
      selectors,
      errorCount,
      warningCount,
      errors: errors.slice(0, 10),
      screenshotPath,
    }
  } catch (error) {
    console.error('\n❌ TEST FAILED WITH EXCEPTION:')
    console.error(error)

    try {
      const screenshotPath = path.join(
        __dirname,
        `test-${pageName.replace(/\s+/g, '-').toLowerCase()}-error.png`
      )
      await page.screenshot({ path: screenshotPath, fullPage: true })
      console.log(`\n📸 Error screenshot saved: ${screenshotPath}`)
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError)
    }

    await browser.close()

    return {
      success: false,
      pageName,
      url,
      error: error.message,
      hasReactError310,
      errors,
    }
  }
}

async function runTests() {
  console.log('\n' + '█'.repeat(80))
  console.log('GANGRUN PRINTING - PRODUCT PAGE TEST SUITE')
  console.log('Testing for React Error #310 Fix')
  console.log('█'.repeat(80))

  const testUrls = [
    {
      url: 'https://gangrunprinting.com/products/asdfddddddddddddd-20',
      name: 'Test Product Page',
    },
    {
      url: 'https://gangrunprinting.com/products/professional-business-flyers-1759173065305',
      name: 'Professional Business Flyers',
    },
  ]

  const results = []

  for (const test of testUrls) {
    const result = await testProductPage(test.url, test.name)
    results.push(result)

    // Wait between tests
    if (testUrls.indexOf(test) < testUrls.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...\n')
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }

  // Final summary
  console.log('\n\n' + '█'.repeat(80))
  console.log('FINAL TEST SUMMARY')
  console.log('█'.repeat(80))

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.pageName}`)
    console.log(`   URL: ${result.url}`)
    console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`)
    console.log(`   React Error #310: ${result.hasReactError310 ? '❌ PRESENT' : '✅ FIXED'}`)
    console.log(`   Reload Loop: ${result.hasReloadLoop ? '❌ DETECTED' : '✅ STABLE'}`)
    console.log(`   Errors: ${result.errorCount || 0}`)
    console.log(`   Screenshot: ${result.screenshotPath || 'N/A'}`)
  })

  const allPassed = results.every((r) => r.success)
  const noReactErrors = results.every((r) => !r.hasReactError310)

  console.log('\n' + '='.repeat(80))
  console.log(`OVERALL TEST RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)
  console.log(`React Error #310 Status: ${noReactErrors ? '✅ FIXED' : '❌ STILL PRESENT'}`)
  console.log('='.repeat(80))

  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1)
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error running tests:', error)
  process.exit(1)
})
