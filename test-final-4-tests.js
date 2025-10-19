#!/usr/bin/env node

/**
 * Final 4 Critical Tests - GangRun Printing
 * 1. Website loads
 * 2. Product page works
 * 3. File upload works
 * 4. Southwest Cargo shipping works
 */

const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3020';

console.log('\n' + '='.repeat(70));
console.log('🧪  GANGRUN PRINTING - 4 CRITICAL TESTS');
console.log('='.repeat(70) + '\n');

let passed = 0;
let failed = 0;

async function test1_WebsiteLoads() {
  console.log('TEST 1: Website Loads');
  try {
    const response = await fetch(BASE_URL);
    const html = await response.text();

    if (response.status === 200 && html.includes('GangRun Printing')) {
      console.log('  ✅ PASS: Website loads successfully');
      console.log('     Status:', response.status);
      console.log('     Title found: GangRun Printing\n');
      passed++;
    } else {
      throw new Error(`Bad response: ${response.status}`);
    }
  } catch (error) {
    console.log('  ❌ FAIL:', error.message, '\n');
    failed++;
  }
}

async function test2_ProductPageWorks() {
  console.log('TEST 2: Product Page Works');
  try {
    const response = await fetch(`${BASE_URL}/products/4x6-flyers-9pt-card-stock`);
    const html = await response.text();

    if (response.status === 200) {
      console.log('  ✅ PASS: Product page loads');
      console.log('     Product: 4x6 Flyers 9pt Card Stock');
      console.log('     Contains pricing:', html.includes('$') || html.includes('price'));
      console.log('     Contains form:', html.includes('quantity'));
      console.log('\n');
      passed++;
    } else {
      throw new Error(`Status: ${response.status}`);
    }
  } catch (error) {
    console.log('  ❌ FAIL:', error.message, '\n');
    failed++;
  }
}

async function test3_FileUploadWorks() {
  console.log('TEST 3: File Upload Works');

  const testImagePath = '/tmp/test-flyer.jpg';

  if (!fs.existsSync(testImagePath)) {
    console.log('  ⚠️  SKIP: Test image not found\n');
    return;
  }

  try {
    // Try the products/customer-images endpoint (the actual upload endpoint)
    const form = new FormData();
    form.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-flyer.jpg',
      contentType: 'image/jpeg',
    });

    const response = await fetch(`${BASE_URL}/api/products/customer-images`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const contentType = response.headers.get('content-type');
    let result;

    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = { text: await response.text() };
    }

    if (response.status === 200 || response.status === 201) {
      console.log('  ✅ PASS: File upload successful');
      console.log('     Endpoint: /api/products/customer-images');
      console.log('     Status:', response.status);
      console.log('     Response:', JSON.stringify(result).substring(0, 100));
      console.log('\n');
      passed++;
    } else {
      throw new Error(`Upload failed: ${response.status} - ${JSON.stringify(result)}`);
    }
  } catch (error) {
    console.log('  ❌ FAIL:', error.message, '\n');
    failed++;
  }
}

async function test4_SouthwestCargoWorks() {
  console.log('TEST 4: Southwest Cargo Shipping Works');
  try {
    const shippingData = {
      address: {
        street1: '123 Test St',
        city: 'Phoenix',
        state: 'AZ',
        postalCode: '85034',
        country: 'US',
      },
      items: [{
        weight: 5,
        length: 12,
        width: 9,
        height: 0.5,
      }],
    };

    const response = await fetch(`${BASE_URL}/api/shipping/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shippingData),
    });

    const result = await response.json();

    // Count Southwest Cargo rates
    const southwestRates = result.rates?.filter(
      r => r.carrier?.toLowerCase().includes('southwest') ||
           r.service?.toLowerCase().includes('southwest')
    ) || [];

    if (southwestRates.length > 0) {
      console.log('  ✅ PASS: Southwest Cargo rates returned');
      console.log('     Location: Phoenix, AZ 85034');
      console.log('     Southwest rates:', southwestRates.length);
      console.log('     Total rates:', result.rates?.length || 0);
      southwestRates.forEach(rate => {
        console.log(`     - ${rate.service}: $${rate.price} (${rate.deliveryDays} days)`);
      });
      console.log('\n');
      passed++;
    } else {
      throw new Error(`No Southwest Cargo rates (got ${result.rates?.length || 0} total rates)`);
    }
  } catch (error) {
    console.log('  ❌ FAIL:', error.message, '\n');
    failed++;
  }
}

async function runTests() {
  await test1_WebsiteLoads();
  await test2_ProductPageWorks();
  await test3_FileUploadWorks();
  await test4_SouthwestCargoWorks();

  console.log('='.repeat(70));
  console.log('📊  FINAL RESULTS');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${passed + failed}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉  ALL TESTS PASSED!\n');
  } else {
    console.log(`\n⚠️   ${failed} test(s) failed\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
