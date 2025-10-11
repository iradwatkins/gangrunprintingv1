/**
 * Test what's actually being displayed on the frontend product pages
 */

async function testFrontendDisplay() {
  const products = [
    {
      name: 'Premium Business Cards',
      url: 'http://localhost:3002/products/premium-business-cards',
    },
    {
      name: 'Marketing Flyers',
      url: 'http://localhost:3002/products/marketing-flyers',
    },
    {
      name: 'Professional Large Format Posters',
      url: 'http://localhost:3002/products/professional-large-format-posters',
    },
  ]

  for (const product of products) {
    try {
      const response = await fetch(product.url)
      const html = await response.text()

      // Check for configuration elements
      const hasQuantityLabel = html.includes('QUANTITY') || html.includes('Quantity')
      const hasSizeLabel = html.includes('PRINT SIZE') || html.includes('Size')
      const hasSidesLabel = html.includes('SIDES')
      const hasPaperLabel = html.includes('PAPER')
      const hasCoatingLabel = html.includes('COATING')

      // Check for dropdown/select elements
      const selectCount = (html.match(/role="combobox"/g) || []).length

      // Check for error messages
      const hasError =
        html.includes('Error loading configuration') ||
        html.includes('Failed to fetch configuration')
      if (hasError) {
      }
    } catch (error) {}
  }
}

// Run the test
testFrontendDisplay()
