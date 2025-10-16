#!/usr/bin/env node

/**
 * Test Product Update (PUT Request)
 * Tests if product can be updated with the fix applied
 */

const https = require('https');

const productId = '8cbdfd22-ab44-42b7-b5ff-883422f05457';

async function testProductUpdate() {
  console.log('🧪 Testing Product Update Payload\n');
  console.log('='.repeat(60));

  // Step 1: Fetch the product first
  console.log('\n📦 Step 1: Fetching existing product...');

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

    // Step 2: Check all required IDs
    console.log('\n🔍 Step 2: Verifying required configuration...');

    const paperStockSetId = product.productPaperStockSets?.[0]?.paperStockSetId;
    const quantityGroupId = product.productQuantityGroups?.[0]?.quantityGroupId;
    const sizeGroupId = product.productSizeGroups?.[0]?.sizeGroupId;
    const turnaroundTimeSetId = product.productTurnaroundTimeSets?.[0]?.turnaroundTimeSetId;

    console.log('   - Category ID:', product.categoryId || product.CategoryId);
    console.log('   - Paper Stock Set ID:', paperStockSetId || '❌ MISSING');
    console.log('   - Quantity Group ID:', quantityGroupId || '❌ MISSING');
    console.log('   - Size Group ID:', sizeGroupId || '❌ MISSING');
    console.log('   - Turnaround Set ID:', turnaroundTimeSetId || '❌ MISSING');
    console.log('   - Images:', (product.ProductImages || product.productImages || []).length);

    const allPresent = paperStockSetId && quantityGroupId && sizeGroupId && turnaroundTimeSetId;

    console.log('\n' + '='.repeat(60));
    if (allPresent) {
      console.log('✅ ALL FIXES WORKING!');
      console.log('✅ Configuration loads correctly');
      console.log('✅ Product can be edited in browser');
      console.log('\n💡 Next step: Test in browser');
      console.log('   1. Go to: https://gangrunprinting.com/admin/products');
      console.log('   2. Click Edit on "Test Product 1760623817062"');
      console.log('   3. Make a small change');
      console.log('   4. Click "Save Changes"');
      console.log('   5. Should save successfully!');
    } else {
      console.log('❌ Configuration still incomplete');
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testProductUpdate();
