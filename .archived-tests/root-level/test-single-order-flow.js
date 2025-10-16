#!/usr/bin/env node

/**
 * Single Customer Order Flow Test
 * Quick test to validate the order flow before running full 5-iteration test
 */

const { runOrderFlowTest } = require('./test-complete-customer-order-flow-fixed.js')

async function runSingleTest() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 SINGLE CUSTOMER ORDER FLOW TEST')
  console.log('🎯 Testing: https://gangrunprinting.com/products/asdfasd')
  console.log('📧 Customer: appvillagellc@gmail.com')
  console.log('='.repeat(60) + '\n')

  const result = await runOrderFlowTest(1)

  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST RESULT')
  console.log('='.repeat(60) + '\n')

  console.log(`Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(
    `Steps Completed: ${result.steps.filter((s) => s.success).length}/${result.steps.length}`
  )

  if (result.orderNumber) {
    console.log(`Order Number: ${result.orderNumber}`)
  }

  if (result.errors.length > 0) {
    console.log(`Errors: ${result.errors.join(', ')}`)
  }

  console.log(`Screenshots: ${result.screenshots.length}`)

  // Show step details
  console.log('\nStep Details:')
  result.steps.forEach((step, index) => {
    const status = step.success ? '✅' : '❌'
    console.log(`  ${status} Step ${step.step}: ${step.name}`)
    if (step.error) {
      console.log(`    Error: ${step.error}`)
    }
  })

  console.log('\n' + '='.repeat(60))
  console.log(`🎉 SINGLE TEST ${result.success ? 'COMPLETED SUCCESSFULLY' : 'FAILED'}`)
  console.log('='.repeat(60) + '\n')

  process.exit(result.success ? 0 : 1)
}

runSingleTest().catch((error) => {
  console.error(`Fatal error: ${error.message}`)
  process.exit(1)
})
