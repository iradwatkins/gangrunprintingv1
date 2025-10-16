const https = require('https')

// Test slug
const testSlug = 'asdfddddddddddddd-20'

console.log(`Testing product page flow for slug: ${testSlug}\n`)

// Step 1: Get product by slug (simulating what server component does)
console.log('Step 1: Fetching product by slug from products API...')
https
  .get(`https://gangrunprinting.com/api/products`, (res) => {
    let data = ''
    res.on('data', (chunk) => (data += chunk))
    res.on('end', () => {
      try {
        const products = JSON.parse(data)
        const product = products.data.find((p) => p.Slug === testSlug)

        if (!product) {
          console.error(`❌ Product not found with slug: ${testSlug}`)
          return
        }

        console.log(`✅ Product found:`)
        console.log(`   ID: ${product.Id}`)
        console.log(`   Name: ${product.Name}`)
        console.log(`   Slug: ${product.Slug}`)

        // Step 2: Test configuration API with product ID
        const productId = product.Id
        console.log(`\nStep 2: Fetching configuration for product ID: ${productId}...`)

        https
          .get(
            `https://gangrunprinting.com/api/products/${productId}/configuration`,
            (configRes) => {
              let configData = ''
              configRes.on('data', (chunk) => (configData += chunk))
              configRes.on('end', () => {
                try {
                  const config = JSON.parse(configData)

                  if (config.error) {
                    console.error(`❌ Configuration API Error: ${config.error}`)
                  } else {
                    console.log(`✅ Configuration loaded successfully:`)
                    console.log(`   Quantities: ${config.quantities?.length || 0}`)
                    console.log(`   Sizes: ${config.sizes?.length || 0}`)
                    console.log(`   Paper Stocks: ${config.paperStocks?.length || 0}`)
                    console.log(`\n🎉 SUCCESS: Product page should work correctly!`)
                  }
                } catch (e) {
                  console.error(`❌ Failed to parse configuration:`, e.message)
                  console.error(`Response: ${configData}`)
                }
              })
            }
          )
          .on('error', (err) => {
            console.error(`❌ Configuration API request failed:`, err.message)
          })
      } catch (e) {
        console.error(`❌ Failed to parse products response:`, e.message)
      }
    })
  })
  .on('error', (err) => {
    console.error(`❌ Products API request failed:`, err.message)
  })
