#!/usr/bin/env node

/**
 * Create 4 Real Products via API
 * Using real data from the database
 */

const products = [
  {
    name: 'Premium Business Cards',
    sku: 'premium-business-cards',
    categoryId: 'cat_business_card',
    description:
      'High-quality premium business cards printed on professional card stock. Perfect for making a lasting impression.',
    shortDescription: 'Professional business cards that stand out',
    isActive: true,
    isFeatured: true,
    paperStockSetId: '5f35fd87-5e0c-4c1a-a484-c04191143763',
    quantityGroupId: 'cmg5i6poy000094pu856umjxa',
    sizeGroupId: 'b180aadd-1ed7-42e5-9640-9460a58e9f72',
    selectedAddOns: [],
    turnaroundTimeSetId: 'cmg46sc7u001k12ymd9w3p9uk',
    addOnSetId: null,
    productionTime: 3,
    rushAvailable: true,
    rushDays: 1,
    rushFee: 15.0,
    basePrice: 29.99,
    setupFee: 5.0,
    images: [],
  },
  {
    name: 'Marketing Flyers 8.5x11',
    sku: 'marketing-flyers-8-5x11',
    categoryId: 'cat_flyer',
    description:
      'Eye-catching marketing flyers printed in full color. Ideal for promotions, events, and advertising campaigns.',
    shortDescription: 'Full-color marketing flyers for promotions',
    isActive: true,
    isFeatured: true,
    paperStockSetId: '5f35fd87-5e0c-4c1a-a484-c04191143763',
    quantityGroupId: 'cmg5i6poy000094pu856umjxa',
    sizeGroupId: 'b180aadd-1ed7-42e5-9640-9460a58e9f72',
    selectedAddOns: [],
    turnaroundTimeSetId: 'cmg46sc7u001k12ymd9w3p9uk',
    addOnSetId: null,
    productionTime: 3,
    rushAvailable: true,
    rushDays: 2,
    rushFee: 20.0,
    basePrice: 49.99,
    setupFee: 10.0,
    images: [],
  },
  {
    name: 'Promotional Postcards',
    sku: 'promotional-postcards',
    categoryId: 'cat_postcard',
    description:
      'High-impact promotional postcards perfect for direct mail campaigns, event invitations, and customer outreach.',
    shortDescription: 'Professional postcards for direct mail',
    isActive: true,
    isFeatured: false,
    paperStockSetId: '5f35fd87-5e0c-4c1a-a484-c04191143763',
    quantityGroupId: 'cmg5i6poy000094pu856umjxa',
    sizeGroupId: 'b180aadd-1ed7-42e5-9640-9460a58e9f72',
    selectedAddOns: [],
    turnaroundTimeSetId: 'cmg46sc7u001k12ymd9w3p9uk',
    addOnSetId: null,
    productionTime: 3,
    rushAvailable: true,
    rushDays: 2,
    rushFee: 18.0,
    basePrice: 39.99,
    setupFee: 7.5,
    images: [],
  },
  {
    name: 'Professional Brochures',
    sku: 'professional-brochures',
    categoryId: 'cat_brochure',
    description:
      'Professionally designed tri-fold brochures that showcase your business, products, and services with stunning clarity.',
    shortDescription: 'Tri-fold brochures for business showcases',
    isActive: true,
    isFeatured: true,
    paperStockSetId: '5f35fd87-5e0c-4c1a-a484-c04191143763',
    quantityGroupId: 'cmg5i6poy000094pu856umjxa',
    sizeGroupId: 'b180aadd-1ed7-42e5-9640-9460a58e9f72',
    selectedAddOns: [],
    turnaroundTimeSetId: 'cmg46sc7u001k12ymd9w3p9uk',
    addOnSetId: null,
    productionTime: 5,
    rushAvailable: true,
    rushDays: 2,
    rushFee: 25.0,
    basePrice: 79.99,
    setupFee: 15.0,
    images: [],
  },
]

async function createProduct(productData) {
  try {
    console.log(`\n📦 Creating product: ${productData.name}...`)

    const response = await fetch('http://localhost:3002/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'auth_session=your_admin_session_here',
      },
      body: JSON.stringify(productData),
    })

    const result = await response.json()

    if (response.ok) {
      console.log(
        `✅ SUCCESS: ${productData.name} created with ID: ${result.data?.id || result.id}`
      )
      return { success: true, product: result }
    } else {
      console.error(`❌ FAILED: ${productData.name}`)
      console.error(`   Status: ${response.status}`)
      console.error(`   Error: ${result.error || 'Unknown error'}`)
      console.error(`   Details:`, JSON.stringify(result, null, 2))
      return { success: false, error: result }
    }
  } catch (error) {
    console.error(`❌ EXCEPTION creating ${productData.name}:`, error.message)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  Creating 4 Real Products for GangRun Printing')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('\n📋 Using REAL data from database:')
  console.log('   • Paper Stock Set: 5f35fd87-5e0c-4c1a-a484-c04191143763')
  console.log('   • Quantity Group: cmg5i6poy000094pu856umjxa')
  console.log('   • Size Group: b180aadd-1ed7-42e5-9640-9460a58e9f72')
  console.log('   • Turnaround Set: cmg46sc7u001k12ymd9w3p9uk')

  const results = []

  for (const product of products) {
    const result = await createProduct(product)
    results.push(result)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1s between requests
  }

  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  Summary')
  console.log('═══════════════════════════════════════════════════════════')

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`\n✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)

  if (failed > 0) {
    console.log('\n⚠️  Some products failed to create. Check errors above.')
    process.exit(1)
  } else {
    console.log('\n🎉 All products created successfully!')
    process.exit(0)
  }
}

main()
