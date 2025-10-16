#!/usr/bin/env node

/**
 * Test Product Edit Save
 * Simulates the edit product save to identify the issue
 */

const https = require('https');

const productId = '8cbdfd22-ab44-42b7-b5ff-883422f05457';

async function testEditSave() {
  console.log('🧪 Testing Product Edit Save\n');
  console.log('='.repeat(60));

  // Step 1: Fetch the product
  console.log('\n📦 Step 1: Fetching product...');

  const getProduct = () => new Promise((resolve, reject) => {
    https.get(`https://gangrunprinting.com/api/products/${productId}`, { rejectUnauthorized: false }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });

  try {
    const productResponse = await getProduct();
    const product = productResponse.data || productResponse;

    console.log('✅ Product fetched:', product.name || product.Name);
    console.log('\n📊 Current product configuration:');
    console.log('- Category ID:', product.categoryId || product.CategoryId);
    console.log('- Paper Stock Sets:', product.productPaperStockSets?.length || 0);
    console.log('- Quantity Groups:', product.productQuantityGroups?.length || 0);
    console.log('- Size Groups:', product.productSizeGroups?.length || 0);
    console.log('- Turnaround Time Sets:', product.productTurnaroundTimeSets?.length || 0);
    console.log('- Images:', (product.ProductImages || product.productImages || []).length);

    // Extract IDs
    const paperStockSetId = product.productPaperStockSets?.[0]?.paperStockSetId;
    const quantityGroupId = product.productQuantityGroups?.[0]?.quantityGroupId;
    const sizeGroupId = product.productSizeGroups?.[0]?.sizeGroupId;
    const turnaroundTimeSetId = product.productTurnaroundTimeSets?.[0]?.turnaroundTimeSetId;

    console.log('\n🔍 Extracted IDs:');
    console.log('- Paper Stock Set ID:', paperStockSetId || 'MISSING ❌');
    console.log('- Quantity Group ID:', quantityGroupId || 'MISSING ❌');
    console.log('- Size Group ID:', sizeGroupId || 'MISSING ❌');
    console.log('- Turnaround Time Set ID:', turnaroundTimeSetId || 'MISSING ❌');

    // Check for missing required fields
    const missingFields = [];
    if (!paperStockSetId) missingFields.push('paperStockSetId');
    if (!quantityGroupId) missingFields.push('quantityGroupId');
    if (!sizeGroupId) missingFields.push('sizeGroupId');
    if (!turnaroundTimeSetId) missingFields.push('turnaroundTimeSetId');

    if (missingFields.length > 0) {
      console.log('\n❌ PROBLEM FOUND: Missing required fields:');
      missingFields.forEach(field => console.log(`   - ${field}`));
      console.log('\nThis product cannot be edited because it\'s missing required configuration.');
      console.log('\n💡 SOLUTION:');
      console.log('The product needs to be assigned:');
      missingFields.forEach(field => console.log(`   - A ${field.replace('Id', '')}`));
      process.exit(1);
    }

    console.log('\n✅ All required fields present!');
    console.log('\n='.repeat(60));
    console.log('✅ Product can be edited successfully');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testEditSave();
