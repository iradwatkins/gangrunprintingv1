#!/usr/bin/env node

// Simple test script to create a product via the API

const testProductCreation = async () => {
  console.log('=== Testing Product Creation ===\n')

  // Test data for a simple business card product
  const productData = {
    name: 'Test Business Cards',
    sku: 'test-business-cards',
    categoryId: 'business-cards',
    description: 'Test product for API validation',
    isActive: true,
    isFeatured: false,
    paperStockId: 'cmfmved0f000013pxt2616umy', // 16pt C2S Cardstock
    quantityGroupId: 'cmfk2y9d0000u10ij4f2rvy3g', // Business Card Quantities
    sizeGroupId: 'cmfk2y9bs000k10ij4vmmgkgf', // Business Card Sizes
    basePrice: 0,
    setupFee: 0,
    productionTime: 3
  }

  console.log('Product Data:', JSON.stringify(productData, null, 2))
  console.log('\n---')

  try {
    console.log('\nSending POST request to /api/products/simple...')

    const response = await fetch('http://localhost:3002/api/products/simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you'd need proper authentication here
        'Cookie': 'auth-session=your-session-cookie'
      },
      body: JSON.stringify(productData)
    })

    console.log('Response Status:', response.status)

    const result = await response.json()

    if (!response.ok) {
      console.error('\n❌ Product creation failed:')
      console.error(JSON.stringify(result, null, 2))
      process.exit(1)
    }

    console.log('\n✅ Product created successfully!')
    console.log('\nCreated Product:')
    console.log('- ID:', result.id)
    console.log('- Name:', result.name)
    console.log('- SKU:', result.sku)
    console.log('- Slug:', result.slug)

    if (result.ProductCategory) {
      console.log('- Category:', result.ProductCategory.name)
    }

    if (result.productPaperStocks?.[0]) {
      console.log('- Paper Stock:', result.productPaperStocks[0].paperStock.name)
    }

    if (result.productQuantityGroups?.[0]) {
      console.log('- Quantity Group:', result.productQuantityGroups[0].quantityGroup.name)
    }

    if (result.productSizeGroups?.[0]) {
      console.log('- Size Group:', result.productSizeGroups[0].sizeGroup.name)
    }

    console.log('\n=== Test Complete ===')

    // Now test deletion
    console.log('\n=== Testing Product Deletion ===')
    const deleteResponse = await fetch(`http://localhost:3002/api/products/${result.id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': 'auth-session=your-session-cookie'
      }
    })

    if (deleteResponse.ok) {
      console.log('✅ Product deleted successfully')
    } else {
      console.log('❌ Failed to delete product')
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the test
testProductCreation()