#!/usr/bin/env node

/**
 * Test script for Paper Stock, Add-On, and Addon Set CRUD operations
 */

const API_BASE = 'http://localhost:3002/api'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testEndpoint(name, url, method = 'GET', body = null) {
  try {
    log(`\nTesting ${name} - ${method} ${url}`, 'blue')

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (response.ok) {
      log(`✅ ${name} - Status: ${response.status}`, 'green')
      return { success: true, data }
    } else {
      log(`❌ ${name} - Status: ${response.status}`, 'red')
      console.error('Error:', data)
      return { success: false, error: data }
    }
  } catch (error) {
    log(`❌ ${name} - Network Error`, 'red')
    console.error('Error:', error.message)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  log('========================================', 'yellow')
  log('Testing CRUD Operations', 'yellow')
  log('========================================', 'yellow')

  let results = {
    passed: 0,
    failed: 0,
    tests: [],
  }

  // Test Paper Stocks
  log('\n📝 Testing Paper Stocks', 'yellow')

  const paperStockGet = await testEndpoint('Paper Stock GET', `${API_BASE}/paper-stocks`)
  results.tests.push(paperStockGet)
  if (paperStockGet.success) results.passed++
  else results.failed++

  // Test creating a paper stock
  const testPaperStock = {
    name: `Test Paper Stock ${Date.now()}`,
    weight: 0.002,
    pricePerSqInch: 0.0025,
    tooltipText: 'Test paper stock for CRUD testing',
    isActive: true,
    coatings: [],
    sidesOptions: [],
  }

  const paperStockPost = await testEndpoint(
    'Paper Stock POST',
    `${API_BASE}/paper-stocks`,
    'POST',
    testPaperStock
  )
  results.tests.push(paperStockPost)
  if (paperStockPost.success) results.passed++
  else results.failed++

  // Test updating if creation was successful
  if (paperStockPost.success && paperStockPost.data?.id) {
    const updateData = {
      ...testPaperStock,
      name: `Updated ${testPaperStock.name}`,
      pricePerSqInch: 0.003,
    }

    const paperStockPut = await testEndpoint(
      'Paper Stock PUT',
      `${API_BASE}/paper-stocks/${paperStockPost.data.id}`,
      'PUT',
      updateData
    )
    results.tests.push(paperStockPut)
    if (paperStockPut.success) results.passed++
    else results.failed++

    // Test delete
    const paperStockDelete = await testEndpoint(
      'Paper Stock DELETE',
      `${API_BASE}/paper-stocks/${paperStockPost.data.id}`,
      'DELETE'
    )
    results.tests.push(paperStockDelete)
    if (paperStockDelete.success) results.passed++
    else results.failed++
  }

  // Test Add-ons
  log('\n🎯 Testing Add-ons', 'yellow')

  const addOnGet = await testEndpoint('Add-on GET', `${API_BASE}/add-ons`)
  results.tests.push(addOnGet)
  if (addOnGet.success) results.passed++
  else results.failed++

  // Test creating an add-on
  const testAddOn = {
    name: `Test Add-on ${Date.now()}`,
    description: 'Test add-on for CRUD testing',
    tooltipText: 'Test tooltip',
    pricingModel: 'FLAT',
    configuration: { price: 10.0 },
    additionalTurnaroundDays: 0,
    sortOrder: 999,
    isActive: true,
  }

  const addOnPost = await testEndpoint('Add-on POST', `${API_BASE}/add-ons`, 'POST', testAddOn)
  results.tests.push(addOnPost)
  if (addOnPost.success) results.passed++
  else results.failed++

  // Test updating if creation was successful
  if (addOnPost.success && addOnPost.data?.id) {
    const updateData = {
      ...testAddOn,
      name: `Updated ${testAddOn.name}`,
      description: 'Updated description',
    }

    const addOnPut = await testEndpoint(
      'Add-on PUT',
      `${API_BASE}/add-ons/${addOnPost.data.id}`,
      'PUT',
      updateData
    )
    results.tests.push(addOnPut)
    if (addOnPut.success) results.passed++
    else results.failed++

    // Test delete
    const addOnDelete = await testEndpoint(
      'Add-on DELETE',
      `${API_BASE}/add-ons/${addOnPost.data.id}`,
      'DELETE'
    )
    results.tests.push(addOnDelete)
    if (addOnDelete.success) results.passed++
    else results.failed++
  }

  // Test Addon Sets
  log('\n📦 Testing Addon Sets', 'yellow')

  const addonSetGet = await testEndpoint('Addon Set GET', `${API_BASE}/addon-sets`)
  results.tests.push(addonSetGet)
  if (addonSetGet.success) results.passed++
  else results.failed++

  // Test creating an addon set
  const testAddonSet = {
    name: `Test Addon Set ${Date.now()}`,
    description: 'Test addon set for CRUD testing',
    addOnIds: [],
  }

  const addonSetPost = await testEndpoint(
    'Addon Set POST',
    `${API_BASE}/addon-sets`,
    'POST',
    testAddonSet
  )
  results.tests.push(addonSetPost)
  if (addonSetPost.success) results.passed++
  else results.failed++

  // Test updating if creation was successful
  if (addonSetPost.success && addonSetPost.data?.id) {
    const updateData = {
      name: `Updated ${testAddonSet.name}`,
      description: 'Updated description',
      isActive: true,
      addOnItems: [],
    }

    const addonSetPut = await testEndpoint(
      'Addon Set PUT',
      `${API_BASE}/addon-sets/${addonSetPost.data.id}`,
      'PUT',
      updateData
    )
    results.tests.push(addonSetPut)
    if (addonSetPut.success) results.passed++
    else results.failed++

    // Test delete
    const addonSetDelete = await testEndpoint(
      'Addon Set DELETE',
      `${API_BASE}/addon-sets/${addonSetPost.data.id}`,
      'DELETE'
    )
    results.tests.push(addonSetDelete)
    if (addonSetDelete.success) results.passed++
    else results.failed++
  }

  // Summary
  log('\n========================================', 'yellow')
  log('Test Summary', 'yellow')
  log('========================================', 'yellow')
  log(`✅ Passed: ${results.passed}`, 'green')
  log(`❌ Failed: ${results.failed}`, 'red')
  log(`📊 Total: ${results.passed + results.failed}`, 'blue')

  if (results.failed > 0) {
    log('\n❌ Some tests failed. Check the output above for details.', 'red')
    process.exit(1)
  } else {
    log('\n✅ All tests passed!', 'green')
    process.exit(0)
  }
}

// Run the tests
runTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red')
  process.exit(1)
})
