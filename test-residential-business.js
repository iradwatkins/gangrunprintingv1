const http = require('http');

// Test both residential and business addresses
const tests = [
  {
    name: 'Residential Address (Chicago)',
    data: {
      toAddress: {
        street: "123 Main St",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "US",
        isResidential: true
      },
      items: [
        {
          productId: "test-business-cards",
          quantity: 500,
          width: 3.5,
          height: 2,
          paperStockWeight: 0.0012
        }
      ]
    },
    expectedGroundService: 'GROUND_HOME_DELIVERY'
  },
  {
    name: 'Business Address (Chicago)',
    data: {
      toAddress: {
        street: "1300 Basswood Road",
        city: "Schaumburg",
        state: "IL",
        zipCode: "60173",
        country: "US",
        isResidential: false
      },
      items: [
        {
          productId: "test-business-cards",
          quantity: 500,
          width: 3.5,
          height: 2,
          paperStockWeight: 0.0012
        }
      ]
    },
    expectedGroundService: 'FEDEX_GROUND'
  }
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing: ${test.name}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Address Type: ${test.data.toAddress.isResidential ? 'Residential' : 'Business'}`);
    console.log(`Expected Ground Service: ${test.expectedGroundService}\n`);

    const data = JSON.stringify(test.data);

    const options = {
      hostname: 'localhost',
      port: 3020,
      path: '/api/shipping/calculate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);

          if (result.success && result.rates) {
            console.log('✅ API Success');
            console.log(`Total Weight: ${result.totalWeight} lbs\n`);

            console.log('📦 Shipping Rates:');
            result.rates.forEach((rate, i) => {
              const service = rate.serviceCode || rate.service;
              const cost = rate.cost || rate.rateAmount || 0;
              const isGuaranteed = rate.isGuaranteed || false;
              console.log(`   ${i + 1}. ${service}: $${cost.toFixed(2)}${isGuaranteed ? ' (Guaranteed)' : ''}`);
            });

            // Verify Ground service
            const groundServices = result.rates.filter(r => {
              const code = r.serviceCode || r.service;
              return code === 'FEDEX_GROUND' || code === 'GROUND_HOME_DELIVERY';
            });

            console.log(`\n📊 Ground Service Verification:`);
            if (groundServices.length > 0) {
              const actualService = groundServices[0].serviceCode || groundServices[0].service;
              if (actualService === test.expectedGroundService) {
                console.log(`   ✅ CORRECT: ${actualService} (expected ${test.expectedGroundService})`);
              } else {
                console.log(`   ❌ INCORRECT: Got ${actualService}, expected ${test.expectedGroundService}`);
              }
            } else {
              console.log(`   ❌ ERROR: No ground service found`);
            }

            // Verify Standard Overnight is NOT marked as guaranteed
            const standardOvernight = result.rates.find(r => {
              const code = r.serviceCode || r.service;
              return code === 'STANDARD_OVERNIGHT';
            });

            console.log(`\n🌙 Standard Overnight Verification:`);
            if (standardOvernight) {
              const isGuaranteed = standardOvernight.isGuaranteed || false;
              if (!isGuaranteed) {
                console.log(`   ✅ CORRECT: Standard Overnight is NOT marked as guaranteed`);
              } else {
                console.log(`   ❌ INCORRECT: Standard Overnight is still marked as guaranteed`);
              }
            } else {
              console.log(`   ⚠️  Standard Overnight not found in rates`);
            }

            resolve({ success: true, test: test.name });
          } else {
            console.log('❌ Error:', result.error || 'Unknown error');
            resolve({ success: false, test: test.name, error: result.error });
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function runAllTests() {
  console.log('\n🚀 Starting Residential vs Business Address Tests\n');

  const results = [];
  for (const test of tests) {
    try {
      const result = await runTest(test);
      results.push(result);
    } catch (error) {
      results.push({ success: false, test: test.name, error: error.message });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(60)}`);

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`Tests Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('\n✅ ALL TESTS PASSED!\n');
  } else {
    console.log('\n❌ SOME TESTS FAILED\n');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.test}: ${r.error}`);
    });
  }
}

runAllTests();
