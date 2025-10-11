const https = require('https')

function testAdminProductsAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'gangrunprinting.com',
      port: 443,
      path: '/api/products?limit=10',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    console.log('🔍 Testing Admin Products API...\n')
    console.log('GET https://gangrunprinting.com/api/products?limit=10\n')

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode} ${res.statusMessage}`)

      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const response = JSON.parse(data)

          if (res.statusCode === 200 && response.data) {
            console.log(`✅ SUCCESS: Found ${response.data.length} products`)
            console.log(`📊 Total products in database: ${response.meta?.totalCount || 'Unknown'}`)

            console.log('\n📦 Recent Products:')
            response.data.slice(0, 5).forEach((product, index) => {
              console.log(
                `  ${index + 1}. ${product.Name || product.name} (SKU: ${product.Sku || product.sku})`
              )
            })

            // Look for our test products
            const testProducts = response.data.filter((p) =>
              (p.Name || p.name).includes('Professional Business Flyers')
            )

            if (testProducts.length > 0) {
              console.log(`\n🎯 Found ${testProducts.length} of our test products:`)
              testProducts.forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.Name || product.name}`)
                console.log(`     SKU: ${product.Sku || product.sku}`)
                console.log(`     Slug: ${product.Slug || product.slug}`)
              })
            }

            resolve({ success: true, products: response.data, testProducts })
          } else {
            console.log(`❌ API Error: ${response.error || 'Unknown error'}`)
            resolve({ success: false, error: response.error })
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', data.substring(0, 500))
          resolve({ success: false, error: 'Parse error' })
        }
      })
    })

    req.on('error', (e) => {
      console.error(`❌ Request failed: ${e.message}`)
      reject(e)
    })

    req.end()
  })
}

testAdminProductsAPI()
  .then((result) => {
    if (result.success) {
      console.log('\n✅ Admin products API is working correctly!')
      console.log('📋 Products are visible in the system')
    } else {
      console.log('\n❌ Admin products API test failed')
    }
  })
  .catch((err) => {
    console.error('Test failed:', err)
  })
