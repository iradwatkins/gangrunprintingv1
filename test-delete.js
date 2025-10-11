#!/usr/bin/env node

/**
 * Test Product Delete Functionality
 * Tests both individual and bulk delete operations
 */

const https = require('https')

const BASE_URL = 'https://gangrunprinting.com'

// Disable SSL verification for testing
const agent = new https.Agent({ rejectUnauthorized: false })

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        ...options,
        agent,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data ? JSON.parse(data) : null,
            })
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data,
            })
          }
        })
      }
    )

    req.on('error', reject)

    if (options.body) {
      req.write(JSON.stringify(options.body))
    }

    req.end()
  })
}

async function getAuthCookie() {
  // First, get the login page to get cookies
  const loginResponse = await makeRequest('/auth/signin', {
    method: 'GET',
  })

  const cookies = loginResponse.headers['set-cookie'] || []
  return cookies.map((c) => c.split(';')[0]).join('; ')
}

async function testDeleteFunctionality() {
  console.log('🧪 Testing Product Delete Functionality\n')

  try {
    // Get auth cookie
    console.log('1️⃣  Getting authentication...')
    const cookie = await getAuthCookie()

    // Create test products
    console.log('2️⃣  Creating test products...')
    const testProducts = []

    for (let i = 0; i < 3; i++) {
      const response = await makeRequest('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: {
          name: `Test Delete Product ${Date.now()}-${i}`,
          slug: `test-delete-${Date.now()}-${i}`,
          sku: `TEST-DEL-${Date.now()}-${i}`,
          description: 'Test product for delete functionality',
          categoryId: null,
          basePrice: 10.0,
          isActive: true,
        },
      })

      if (response.status === 201 || response.status === 200) {
        testProducts.push(response.data)
        console.log(`   ✅ Created product: ${response.data.name || response.data.Name}`)
      } else {
        console.log(`   ❌ Failed to create product ${i}:`, response.status, response.data)
      }
    }

    if (testProducts.length === 0) {
      console.log('❌ No test products created. Cannot test delete.')
      return
    }

    // Test individual delete
    console.log('\n3️⃣  Testing individual delete...')
    const productToDelete = testProducts[0]
    const productId = productToDelete.id || productToDelete.Id

    const deleteResponse = await makeRequest(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        Cookie: cookie,
      },
    })

    if (deleteResponse.status === 200) {
      console.log('   ✅ Individual delete successful')
    } else {
      console.log('   ❌ Individual delete failed:', deleteResponse.status, deleteResponse.data)
    }

    // Test bulk delete
    if (testProducts.length > 1) {
      console.log('\n4️⃣  Testing bulk delete...')
      const bulkDeleteIds = testProducts.slice(1).map((p) => p.id || p.Id)

      const bulkDeleteResponse = await makeRequest('/api/products/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: {
          productIds: bulkDeleteIds,
        },
      })

      if (bulkDeleteResponse.status === 200) {
        console.log('   ✅ Bulk delete successful:', bulkDeleteResponse.data.message)
      } else {
        console.log('   ❌ Bulk delete failed:', bulkDeleteResponse.status, bulkDeleteResponse.data)
      }
    }

    console.log('\n✅ Delete functionality tests completed!')
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDeleteFunctionality()
