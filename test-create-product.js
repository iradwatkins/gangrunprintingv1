/**
 * Test Product Creation API
 * Diagnose why product creation is failing with 500 error
 */

const fetch = require('node-fetch');

async function testProductCreation() {
  console.log('🧪 Testing Product Creation API\n');
  console.log('======================================================================\n');

  try {
    // First, get required IDs
    console.log('1️⃣  Fetching required data (categories, paper stocks, etc.)...\n');

    // Get categories
    const categoriesRes = await fetch('http://localhost:3002/api/product-categories');
    const categories = await categoriesRes.json();
    console.log(`   ✅ Categories: ${categories.data.length} found`);
    const category = categories.data.find(c => c.name === 'Landing Page Groups') || categories.data[0];
    console.log(`   → Using category: ${category.name} (${category.id})`);

    // Get paper stock sets
    const paperRes = await fetch('http://localhost:3002/api/paper-stock-sets');
    const paperSets = await paperRes.json();
    console.log(`   ✅ Paper Stock Sets: ${paperSets.data.length} found`);
    const paperSet = paperSets.data[0];
    console.log(`   → Using paper set: ${paperSet.name} (${paperSet.id})`);

    // Get quantity groups
    const qtyRes = await fetch('http://localhost:3002/api/quantity-groups');
    const qtyGroups = await qtyRes.json();
    console.log(`   ✅ Quantity Groups: ${qtyGroups.data.length} found`);
    const qtyGroup = qtyGroups.data[0];
    console.log(`   → Using quantity group: ${qtyGroup.name} (${qtyGroup.id})`);

    // Get size groups
    const sizeRes = await fetch('http://localhost:3002/api/size-groups');
    const sizeGroups = await sizeRes.json();
    console.log(`   ✅ Size Groups: ${sizeGroups.data.length} found`);
    const sizeGroup = sizeGroups.data[0];
    console.log(`   → Using size group: ${sizeGroup.name} (${sizeGroup.id})\n`);

    // 2. Create test product
    console.log('2️⃣  Creating test product...\n');

    const testProduct = {
      name: `Manual Test Product ${Date.now()}`,
      sku: `manual-test-${Date.now()}`,
      categoryId: category.id,
      description: 'This is a manually created test product',
      shortDescription: 'Manual test product',
      isActive: true,
      isFeatured: false,
      basePrice: 0.05,
      setupFee: 0,
      productionTime: 3,
      rushAvailable: false,
      rushDays: null,
      rushFee: null,
      paperStockSetId: paperSet.id,
      quantityGroupId: qtyGroup.id,
      sizeGroupId: sizeGroup.id,
      selectedAddOns: [],
      turnaroundTimeSetId: null,
      addOnSetId: null,
      designSetId: null,
      images: [],
    };

    console.log('   📦 Product Data:');
    console.log(JSON.stringify(testProduct, null, 2));
    console.log('');

    // Note: This will fail because we're not authenticated
    // But it will show us if there are validation errors
    const createRes = await fetch('http://localhost:3002/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testProduct),
    });

    console.log(`   Response Status: ${createRes.status} ${createRes.statusText}\n`);

    const result = await createRes.json();
    console.log('   Response Body:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    if (createRes.status === 401 || createRes.status === 403) {
      console.log('✅ VALIDATION PASSED - Product schema is correct!');
      console.log('❌ AUTHENTICATION REQUIRED - You need to be logged in as ADMIN\n');
      console.log('📍 To create products:');
      console.log('   1. Go to: https://gangrunprinting.com/sign-in');
      console.log('   2. Sign in with admin account');
      console.log('   3. Go to: https://gangrunprinting.com/admin/products/new');
      console.log('   4. Fill out the form and submit\n');
    } else if (createRes.status === 201) {
      console.log('✅ SUCCESS! Product created successfully!');
    } else {
      console.log(`❌ ERROR: Unexpected status ${createRes.status}`);
      console.log('   This might be a validation error or server issue\n');
    }

    console.log('======================================================================');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error);
  }
}

testProductCreation();
