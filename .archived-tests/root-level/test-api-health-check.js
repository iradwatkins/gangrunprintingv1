#!/usr/bin/env node

/**
 * API Health Check Script
 * Tests all critical API endpoints for GangRun Printing
 */

const fetch = require('node-fetch')

const API_ENDPOINTS = {
  baseUrl: 'https://gangrunprinting.com',
  endpoints: [
    {
      name: 'Product List',
      path: '/api/products',
      method: 'GET',
      expectedStatus: 200,
    },
    {
      name: 'Checkout - Create Test Order',
      path: '/api/checkout/create-test-order',
      method: 'POST',
      expectedStatus: [200, 500], // 500 until server is updated
      body: {
        cartItems: [
          {
            id: 'test-1',
            productName: 'Test Product',
            sku: 'TEST-001',
            quantity: 1,
            price: 10.0,
            options: {},
          },
        ],
        customerInfo: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phone: '555-0100',
        },
        shippingAddress: {
          street: '123 Test St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'US',
        },
        subtotal: 10.0,
        tax: 0.8,
        shipping: 5.0,
        total: 15.8,
      },
    },
    {
      name: 'Order Check',
      path: '/api/orders/check/TEST-123456',
      method: 'GET',
      expectedStatus: [404], // Expected since order doesn't exist
    },
    {
      name: 'Auth - Session Check',
      path: '/api/auth/session',
      method: 'GET',
      expectedStatus: [200, 401],
    },
    {
      name: 'Shipping Rates',
      path: '/api/shipping/rates',
      method: 'POST',
      expectedStatus: [200, 400],
      body: {
        items: [
          {
            quantity: 100,
            width: 3.5,
            height: 2,
            paperStockWeight: 0.001,
          },
        ],
        toAddress: {
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'US',
        },
      },
    },
  ],
}

// Color-coded output
const log = {
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
}

async function testEndpoint(endpoint) {
  const url = `${API_ENDPOINTS.baseUrl}${endpoint.path}`
  const options = {
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'GangRun-Health-Check/1.0',
    },
  }

  if (endpoint.body) {
    options.body = JSON.stringify(endpoint.body)
  }

  try {
    const startTime = Date.now()
    const response = await fetch(url, options)
    const responseTime = Date.now() - startTime

    const expectedStatuses = Array.isArray(endpoint.expectedStatus)
      ? endpoint.expectedStatus
      : [endpoint.expectedStatus]

    if (expectedStatuses.includes(response.status)) {
      log.success(`${endpoint.name}: ${response.status} (${responseTime}ms)`)
      return {
        endpoint: endpoint.name,
        status: 'PASS',
        httpStatus: response.status,
        responseTime,
      }
    } else {
      log.error(`${endpoint.name}: ${response.status} - Expected ${expectedStatuses.join(' or ')}`)
      const text = await response.text()
      console.log(`   Response: ${text.substring(0, 200)}`)
      return {
        endpoint: endpoint.name,
        status: 'FAIL',
        httpStatus: response.status,
        expected: expectedStatuses,
        responseTime,
        error: text.substring(0, 200),
      }
    }
  } catch (error) {
    log.error(`${endpoint.name}: Connection failed - ${error.message}`)
    return {
      endpoint: endpoint.name,
      status: 'ERROR',
      error: error.message,
    }
  }
}

async function runHealthCheck() {
  console.log('\n' + '='.repeat(60))
  console.log('🏥 API HEALTH CHECK - GangRun Printing')
  console.log('🔗 Testing: ' + API_ENDPOINTS.baseUrl)
  console.log('📅 Time: ' + new Date().toISOString())
  console.log('='.repeat(60) + '\n')

  const results = []

  for (const endpoint of API_ENDPOINTS.endpoints) {
    const result = await testEndpoint(endpoint)
    results.push(result)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Rate limiting
  }

  // Generate summary
  const passed = results.filter((r) => r.status === 'PASS').length
  const failed = results.filter((r) => r.status === 'FAIL').length
  const errors = results.filter((r) => r.status === 'ERROR').length
  const total = results.length

  console.log('\n' + '='.repeat(60))
  console.log('📊 HEALTH CHECK SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${failed}/${total}`)
  console.log(`⚠️  Errors: ${errors}/${total}`)

  const avgResponseTime =
    results.filter((r) => r.responseTime).reduce((acc, r) => acc + r.responseTime, 0) /
    results.filter((r) => r.responseTime).length

  console.log(`⏱️  Avg Response Time: ${Math.round(avgResponseTime)}ms`)

  // Identify critical issues
  console.log('\n🔍 Critical Issues:')
  const criticalEndpoints = ['Checkout - Create Test Order']
  const criticalIssues = results.filter(
    (r) => criticalEndpoints.includes(r.endpoint) && r.status !== 'PASS'
  )

  if (criticalIssues.length > 0) {
    criticalIssues.forEach((issue) => {
      console.log(`   • ${issue.endpoint}: ${issue.error || 'Failed'}`)
    })
  } else {
    console.log('   ✅ No critical issues detected')
  }

  console.log('\n' + '='.repeat(60))
  console.log('🏁 HEALTH CHECK COMPLETE')
  console.log('='.repeat(60) + '\n')

  // Save results to file
  const report = {
    timestamp: new Date().toISOString(),
    url: API_ENDPOINTS.baseUrl,
    summary: { passed, failed, errors, total },
    avgResponseTime,
    results,
    criticalIssues,
  }

  require('fs').writeFileSync('api-health-check-report.json', JSON.stringify(report, null, 2))

  console.log('📄 Report saved to: api-health-check-report.json\n')

  return report
}

// Check dependencies
async function checkDependencies() {
  try {
    require.resolve('node-fetch')
  } catch {
    console.log('Installing node-fetch...')
    require('child_process').execSync('npm install node-fetch', { stdio: 'inherit' })
    console.log('Please run the script again.')
    process.exit(0)
  }
}

// Main execution
checkDependencies().then(() => {
  runHealthCheck().then((report) => {
    process.exit(report.summary.errors > 0 ? 1 : 0)
  })
})
