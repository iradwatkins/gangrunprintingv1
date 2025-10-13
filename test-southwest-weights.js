#!/usr/bin/env node

/**
 * Test Southwest Cargo pricing across different weight tiers
 */

const http = require('http');

const testCases = [
  { weight: 5.9, quantity: 250, desc: "5.9 lbs (Tier 1: 0-50 lbs)" },
  { weight: 75, quantity: 5000, desc: "75 lbs (Tier 2: 51-100 lbs)" },
  { weight: 150, quantity: 10000, desc: "150 lbs (Tier 3: 101+ lbs)" }
];

async function testWeight(testCase) {
  return new Promise((resolve, reject) => {
    const payload = {
      toAddress: {
        street: "123 Main Street",
        city: "Dallas",
        state: "TX",
        zipCode: "75201",
        country: "US"
      },
      items: [
        {
          productId: "prod_postcard_4x6",
          quantity: testCase.quantity,
          width: 4,
          height: 6,
          paperStockWeight: 0.0009
        }
      ]
    };

    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/shipping/calculate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Southwest Cargo Pricing Test Suite');
  console.log('=' .repeat(70));
  console.log('');

  for (const testCase of testCases) {
    console.log(`📦 ${testCase.desc}`);
    console.log('-'.repeat(70));

    try {
      const response = await testWeight(testCase);

      if (!response.success) {
        console.log('❌ API Error:', response.error);
        console.log('');
        continue;
      }

      const southwestRates = response.rates.filter(r => r.carrier === 'SOUTHWEST_CARGO');

      if (southwestRates.length === 0) {
        console.log('❌ No Southwest Cargo rates returned');
        console.log('');
        continue;
      }

      console.log(`   Weight: ${response.totalWeight} lbs`);
      southwestRates.forEach(rate => {
        console.log(`   ${rate.serviceName}: $${rate.rateAmount.toFixed(2)} (${rate.estimatedDays} days)`);
      });
      console.log('');

    } catch (error) {
      console.log('❌ Test failed:', error.message);
      console.log('');
    }
  }

  console.log('✅ All tests complete!');
}

runTests();
