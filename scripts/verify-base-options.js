#!/usr/bin/env node

/**
 * Script to verify all base options are correctly set up
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function verifyBaseOptions() {
  const API_BASE = 'http://localhost:3002/api'

  // Expected base options
  const expectedPaperStocks = [
    '16pt C2S Cardstock',
    '9pt C2S Cardstock',
    '100 lb Uncoated Cover (14pt)',
    '100 lb Gloss Text',
    '60 lb Offset',
    '12pt C2S Cardstock',
    '14pt C2S Cardstock',
  ]

  const expectedSidesOptions = [
    'Different Image both sides',
    'Image front side only/blank Back',
    'Same Image Both sides',
    'Your Image Front/ Our image Back',
  ]

  const expectedCoatingOptions = [
    'High Gloss UV',
    'High Gloss UV on ONE SIDE',
    'Gloss Aqueous',
    'Matte Aqueous',
  ]

  try {
    log('========================================', 'cyan')
    log('Verifying Base Options', 'cyan')
    log('========================================', 'cyan')

    // Verify Paper Stocks
    log('\n📝 Verifying Paper Stocks...', 'yellow')
    const paperStocksRes = await fetch(`${API_BASE}/paper-stocks`)
    const paperStocks = await paperStocksRes.json()

    const paperStockNames = paperStocks.map((s) => s.name).sort()
    const expectedSorted = expectedPaperStocks.sort()

    let paperStocksMatch = true
    expectedSorted.forEach((expected) => {
      if (paperStockNames.includes(expected)) {
        log(`✅ ${expected}`, 'green')
      } else {
        log(`❌ Missing: ${expected}`, 'red')
        paperStocksMatch = false
      }
    })

    // Check for extra items
    paperStockNames.forEach((actual) => {
      if (!expectedSorted.includes(actual)) {
        log(`⚠️  Extra: ${actual}`, 'yellow')
        paperStocksMatch = false
      }
    })

    // Verify Sides Options
    log('\n🔄 Verifying Sides Options...', 'yellow')
    const sidesRes = await fetch(`${API_BASE}/sides-options`)
    const sidesOptions = await sidesRes.json()

    const sidesNames = sidesOptions.map((s) => s.name).sort()
    const expectedSidesSorted = expectedSidesOptions.sort()

    let sidesMatch = true
    expectedSidesSorted.forEach((expected) => {
      if (sidesNames.includes(expected)) {
        log(`✅ ${expected}`, 'green')
      } else {
        log(`❌ Missing: ${expected}`, 'red')
        sidesMatch = false
      }
    })

    // Check for extra items
    sidesNames.forEach((actual) => {
      if (!expectedSidesSorted.includes(actual)) {
        log(`⚠️  Extra: ${actual}`, 'yellow')
        sidesMatch = false
      }
    })

    // Verify Coating Options
    log('\n✨ Verifying Coating Options...', 'yellow')
    const coatingRes = await fetch(`${API_BASE}/coating-options`)
    const coatingOptions = await coatingRes.json()

    const coatingNames = coatingOptions.map((c) => c.name).sort()
    const expectedCoatingSorted = expectedCoatingOptions.sort()

    let coatingMatch = true
    expectedCoatingSorted.forEach((expected) => {
      if (coatingNames.includes(expected)) {
        log(`✅ ${expected}`, 'green')
      } else {
        log(`❌ Missing: ${expected}`, 'red')
        coatingMatch = false
      }
    })

    // Check for extra items
    coatingNames.forEach((actual) => {
      if (!expectedCoatingSorted.includes(actual)) {
        log(`⚠️  Extra: ${actual}`, 'yellow')
        coatingMatch = false
      }
    })

    // Summary
    log('\n========================================', 'cyan')
    log('Verification Summary', 'cyan')
    log('========================================', 'cyan')

    const allMatch = paperStocksMatch && sidesMatch && coatingMatch

    if (allMatch) {
      log('\n✅ All base options are correctly configured!', 'green')
      log(`\n📊 Totals:`, 'blue')
      log(
        `Paper Stocks: ${paperStockNames.length}/7`,
        paperStockNames.length === 7 ? 'green' : 'red'
      )
      log(`Sides Options: ${sidesNames.length}/4`, sidesNames.length === 4 ? 'green' : 'red')
      log(`Coating Options: ${coatingNames.length}/4`, coatingNames.length === 4 ? 'green' : 'red')
    } else {
      log('\n⚠️  Some base options are not correctly configured', 'yellow')
      log('Please run the update-base-options.js script to fix this', 'yellow')
    }

    // Test relationships
    log('\n🔗 Testing Relationships...', 'yellow')
    if (paperStocks.length > 0) {
      const firstStock = paperStocks[0]
      if (firstStock.paperStockCoatings && firstStock.paperStockCoatings.length > 0) {
        log(
          `✅ Paper stocks have coating relationships (${firstStock.paperStockCoatings.length} coatings)`,
          'green'
        )
      } else {
        log(`⚠️  Paper stocks missing coating relationships`, 'yellow')
      }

      if (firstStock.paperStockSides && firstStock.paperStockSides.length > 0) {
        log(
          `✅ Paper stocks have sides relationships (${firstStock.paperStockSides.length} sides)`,
          'green'
        )
      } else {
        log(`⚠️  Paper stocks missing sides relationships`, 'yellow')
      }
    }

    return allMatch
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red')
    return false
  }
}

// Run verification
verifyBaseOptions()
  .then((success) => {
    if (success) {
      log('\n🎉 Verification complete - all base options ready!', 'green')
      process.exit(0)
    } else {
      log('\n❌ Verification failed - please check the issues above', 'red')
      process.exit(1)
    }
  })
  .catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, 'red')
    process.exit(1)
  })
