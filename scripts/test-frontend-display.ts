/**
 * Test what's actually being displayed on the frontend product pages
 */

async function testFrontendDisplay() {
  const products = [
    {
      name: 'Premium Business Cards',
      url: 'http://localhost:3002/products/premium-business-cards'
    },
    {
      name: 'Marketing Flyers',
      url: 'http://localhost:3002/products/marketing-flyers'
    },
    {
      name: 'Professional Large Format Posters',
      url: 'http://localhost:3002/products/professional-large-format-posters'
    }
  ]

  console.log('🔍 Testing Frontend Display of Configuration Options...\n')

  for (const product of products) {
    try {
      const response = await fetch(product.url)
      const html = await response.text()

      console.log(`📦 ${product.name}`)

      // Check for configuration elements
      const hasQuantityLabel = html.includes('QUANTITY') || html.includes('Quantity')
      const hasSizeLabel = html.includes('PRINT SIZE') || html.includes('Size')
      const hasSidesLabel = html.includes('SIDES')
      const hasPaperLabel = html.includes('PAPER')
      const hasCoatingLabel = html.includes('COATING')

      console.log(`   Configuration Elements:`)
      console.log(`   ✅ Quantity: ${hasQuantityLabel ? 'Present' : '❌ Missing'}`)
      console.log(`   ✅ Size: ${hasSizeLabel ? 'Present' : '❌ Missing'}`)
      console.log(`   ${hasSidesLabel ? '✅' : '❌'} Sides: ${hasSidesLabel ? 'Present' : 'Missing'}`)
      console.log(`   ${hasPaperLabel ? '✅' : '❌'} Paper: ${hasPaperLabel ? 'Present' : 'Missing'}`)
      console.log(`   ${hasCoatingLabel ? '✅' : '❌'} Coating: ${hasCoatingLabel ? 'Present' : 'Missing'}`)

      // Check for dropdown/select elements
      const selectCount = (html.match(/role="combobox"/g) || []).length
      console.log(`   Total Dropdowns: ${selectCount}`)

      // Check for error messages
      const hasError = html.includes('Error loading configuration') ||
                      html.includes('Failed to fetch configuration')
      if (hasError) {
        console.log(`   ⚠️  Error message detected`)
      }

      console.log('')

    } catch (error) {
      console.log(`❌ ${product.name} - Error: ${error}`)
      console.log('')
    }
  }

  console.log('📊 Analysis:')
  console.log('   If SIDES and COATING are missing, the configuration form is not')
  console.log('   rendering these dropdowns even though the data exists in the database.')
  console.log('   This suggests the ProductConfigurationForm component needs updating.')
}

// Run the test
testFrontendDisplay()