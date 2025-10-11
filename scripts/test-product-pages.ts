/**
 * Test script to verify product pages are working
 */

async function testProductPages() {
  const products = [
    {
      name: 'Premium Business Cards',
      slug: 'premium-business-cards',
      url: 'http://localhost:3002/products/premium-business-cards',
    },
    {
      name: 'Marketing Flyers',
      slug: 'marketing-flyers',
      url: 'http://localhost:3002/products/marketing-flyers',
    },
    {
      name: 'Professional Large Format Posters',
      slug: 'professional-large-format-posters',
      url: 'http://localhost:3002/products/professional-large-format-posters',
    },
  ]

  for (const product of products) {
    try {
      const response = await fetch(product.url)
      const status = response.status
      const statusText = response.statusText

      if (status === 200) {
        const html = await response.text()

        // Check if product name appears in the HTML
        const hasProductName = html.includes(product.name)

        // Check if configuration form is present
        const hasConfigForm = html.includes('QUANTITY') || html.includes('quantity')

        // Check if price is displayed
        const hasPrice = html.includes('$')

        // Check for API configuration endpoint
        const configUrl = `http://localhost:3002/api/products/${product.slug}/configuration`
        try {
          const configResponse = await fetch(configUrl)
        } catch (error) {}
      } else {
      }
    } catch (error) {}
  }
}

// Run the test
testProductPages()
