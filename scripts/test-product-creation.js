#!/usr/bin/env node

// Simple test script to create a product via the API

const testProductCreation = async () => {

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
    productionTime: 3,
  }

  console.log('Product Data:', JSON.stringify(productData, null, 2))

  try {

    const response = await fetch('http://localhost:3002/api/products/simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In production, you'd need proper authentication here
        Cookie: 'auth-session=your-session-cookie',
      },
      body: JSON.stringify(productData),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('\n❌ Product creation failed:')
      console.error(JSON.stringify(result, null, 2))
      process.exit(1)
    }

    if (result.ProductCategory) {

    }

    if (result.productPaperStocks?.[0]) {

    }

    if (result.productQuantityGroups?.[0]) {

    }

    if (result.productSizeGroups?.[0]) {

    }

    // Now test deletion

    const deleteResponse = await fetch(`http://localhost:3002/api/products/${result.id}`, {
      method: 'DELETE',
      headers: {
        Cookie: 'auth-session=your-session-cookie',
      },
    })

    if (deleteResponse.ok) {

    } else {

    }
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the test
testProductCreation()
