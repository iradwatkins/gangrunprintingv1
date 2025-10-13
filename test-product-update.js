/**
 * Test Product Update
 * Tests the PUT /api/products/[id] endpoint
 */

const baseUrl = 'http://localhost:3002'

// Test updating a product
async function testProductUpdate() {
  console.log('\n=== Testing Product Update ===\n')

  try {
    // First, get a product to update
    console.log('1. Fetching existing products...')
    const listRes = await fetch(`${baseUrl}/api/products?limit=1`)
    if (!listRes.ok) {
      throw new Error(`Failed to fetch products: ${listRes.status}`)
    }

    const listData = await listRes.json()
    const products = listData.data || listData
    if (!products || products.length === 0) {
      throw new Error('No products found to test update')
    }

    const testProduct = products[0]
    console.log(`Found product: ${testProduct.name || testProduct.Name} (ID: ${testProduct.id || testProduct.Id})`)

    // Get full product details
    const productId = testProduct.id || testProduct.Id
    console.log(`\n2. Fetching full product details for ${productId}...`)
    const getRes = await fetch(`${baseUrl}/api/products/${productId}`)
    if (!getRes.ok) {
      throw new Error(`Failed to fetch product: ${getRes.status}`)
    }

    const getData = await getRes.json()
    const product = getData.data || getData
    console.log('Product details:', JSON.stringify(product, null, 2))

    // Prepare update data
    console.log('\n3. Preparing update data...')
    const updateData = {
      name: product.name || product.Name,
      sku: product.sku || product.Sku,
      categoryId: product.categoryId || product.CategoryId,
      description: product.description || product.Description || '',
      shortDescription: product.shortDescription || product.ShortDescription || '',
      isActive: product.isActive ?? product.IsActive ?? true,
      isFeatured: product.isFeatured ?? product.IsFeatured ?? false,
      basePrice: product.basePrice || product.BasePrice || 0,
      setupFee: product.setupFee || product.SetupFee || 0,
      productionTime: product.productionTime || product.ProductionTime || 3,
      rushAvailable: product.rushAvailable || product.RushAvailable || false,
      rushDays: product.rushDays || product.RushDays || 1,
      rushFee: product.rushFee || product.RushFee || 0,
      images: product.productImages || product.ProductImages || [],
      paperStockSetId: product.productPaperStockSets?.[0]?.paperStockSetId ||
                       product.productPaperStockSets?.[0]?.PaperStockSet?.id || null,
      quantityGroupId: product.productQuantityGroups?.[0]?.quantityGroupId ||
                       product.productQuantityGroups?.[0]?.QuantityGroup?.id || null,
      sizeGroupId: product.productSizeGroups?.[0]?.sizeGroupId ||
                   product.productSizeGroups?.[0]?.SizeGroup?.id || null,
      turnaroundTimeSetId: product.productTurnaroundTimeSets?.[0]?.turnaroundTimeSetId ||
                           product.productTurnaroundTimeSets?.[0]?.TurnaroundTimeSet?.id || null,
      addOnSetId: product.productAddOnSets?.[0]?.addOnSetId ||
                  product.productAddOnSets?.[0]?.AddOnSet?.id || null,
      designSetId: product.productDesignSets?.[0]?.designSetId ||
                   product.productDesignSets?.[0]?.DesignSet?.id || null,
      options: [],
      pricingTiers: [],
    }

    console.log('Update data:', JSON.stringify(updateData, null, 2))

    // Make the update request (need auth cookie)
    console.log('\n4. Attempting to update product (without auth - will fail)...')
    const updateRes = await fetch(`${baseUrl}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    console.log(`Response status: ${updateRes.status}`)
    const updateResult = await updateRes.json()
    console.log('Response:', JSON.stringify(updateResult, null, 2))

    if (updateRes.ok) {
      console.log('\n✅ Product update successful!')
    } else {
      console.log('\n❌ Product update failed (expected - no auth)')
      console.log('Error:', updateResult.error || updateResult.message)
    }

    // Show what fields are being sent
    console.log('\n5. Data structure analysis:')
    console.log('Required fields present:')
    console.log('  - name:', !!updateData.name)
    console.log('  - sku:', !!updateData.sku)
    console.log('  - categoryId:', !!updateData.categoryId)
    console.log('  - paperStockSetId:', !!updateData.paperStockSetId)
    console.log('  - quantityGroupId:', !!updateData.quantityGroupId)
    console.log('  - sizeGroupId:', !!updateData.sizeGroupId)
    console.log('  - turnaroundTimeSetId:', !!updateData.turnaroundTimeSetId)

  } catch (error) {
    console.error('\n❌ Error during test:', error.message)
    throw error
  }
}

// Run the test
testProductUpdate()
  .then(() => {
    console.log('\n=== Test Complete ===\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n=== Test Failed ===')
    console.error(error)
    process.exit(1)
  })
