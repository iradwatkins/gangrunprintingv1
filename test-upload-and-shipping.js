#!/usr/bin/env node

/**
 * Test File Upload + Shipping APIs
 * Ensures both work 100%
 */

const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3020';
const TEST_IMAGE = '/tmp/test-flyer.jpg';

console.log('\n' + '='.repeat(70));
console.log('🧪  TESTING FILE UPLOAD + SHIPPING APIS');
console.log('='.repeat(70) + '\n');

async function test1_FileUpload() {
  console.log('TEST 1: File Upload API\n');

  if (!fs.existsSync(TEST_IMAGE)) {
    console.log('  ❌ Test image not found:', TEST_IMAGE);
    return false;
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(TEST_IMAGE), {
      filename: 'test-upload.jpg',
      contentType: 'image/jpeg',
    });
    form.append('fileType', 'CUSTOMER_ARTWORK');

    console.log('  📤 Uploading file...');

    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('  ✅ PASS: File uploaded successfully');
      console.log('     Status:', response.status);
      console.log('     Path:', result.path);
      console.log('     Filename:', result.filename);
      console.log('     Size:', result.size, 'bytes\n');
      return true;
    } else {
      console.log('  ❌ FAIL: Upload failed');
      console.log('     Status:', response.status);
      console.log('     Response:', JSON.stringify(result, null, 2), '\n');
      return false;
    }
  } catch (error) {
    console.log('  ❌ FAIL:', error.message, '\n');
    return false;
  }
}

async function test2_ShippingRates() {
  console.log('TEST 2: Shipping Rates API (Southwest Cargo)\n');

  const testLocations = [
    { city: 'Phoenix', state: 'AZ', zip: '85034', expectSouthwest: true },
    { city: 'Dallas', state: 'TX', zip: '75201', expectSouthwest: true },
    { city: 'Los Angeles', state: 'CA', zip: '90001', expectSouthwest: true },
  ];

  let allPassed = true;

  for (const location of testLocations) {
    try {
      // Use the CORRECT API schema
      const requestBody = {
        destination: {
          city: location.city,
          state: location.state,
          zipCode: location.zip,
          countryCode: 'US',
          isResidential: true,
        },
        package: {
          weight: 5, // 5 lbs
          dimensions: {
            length: 12,
            width: 9,
            height: 0.5,
          },
        },
      };

      console.log(`  📍 Testing: ${location.city}, ${location.state} ${location.zip}`);

      const response = await fetch(`${BASE_URL}/api/shipping/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        console.log(`     ❌ API Error: ${result.error || result.message}`);
        if (result.details) {
          console.log(`        Details:`, JSON.stringify(result.details, null, 2));
        }
        allPassed = false;
        continue;
      }

      // Count rates by provider
      const ratesByProvider = {};
      result.rates?.forEach(rate => {
        const provider = rate.provider || rate.carrier;
        ratesByProvider[provider] = (ratesByProvider[provider] || 0) + 1;
      });

      const southwestCount = ratesByProvider['southwest-cargo'] || 0;
      const fedexCount = ratesByProvider['fedex'] || 0;

      console.log(`     Total rates: ${result.rates?.length || 0}`);
      console.log(`     FedEx: ${fedexCount}`);
      console.log(`     Southwest Cargo: ${southwestCount}`);

      if (location.expectSouthwest && southwestCount === 0) {
        console.log(`     ❌ FAIL: No Southwest Cargo rates (expected for ${location.state})`);
        allPassed = false;
      } else if (location.expectSouthwest && southwestCount > 0) {
        console.log(`     ✅ PASS: Southwest Cargo rates found!`);

        // Show Southwest rates
        result.rates
          ?.filter(r => r.provider === 'southwest-cargo')
          .forEach(rate => {
            console.log(
              `        • ${rate.providerName}: $${rate.rate.amount} (${rate.delivery.text})`
            );
          });
      } else {
        console.log(`     ✅ PASS: Rates returned (Southwest not expected)`);
      }

      console.log('');
    } catch (error) {
      console.log(`     ❌ FAIL: ${error.message}\n`);
      allPassed = false;
    }
  }

  return allPassed;
}

async function main() {
  const test1Result = await test1_FileUpload();
  const test2Result = await test2_ShippingRates();

  console.log('='.repeat(70));
  console.log('📊  RESULTS');
  console.log('='.repeat(70));
  console.log(`File Upload API: ${test1Result ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Shipping Rates API: ${test2Result ? '✅ PASS' : '❌ FAIL'}`);

  if (test1Result && test2Result) {
    console.log('\n🎉  ALL TESTS PASSED - Both APIs working 100%!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️   Some tests failed - review output above\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
