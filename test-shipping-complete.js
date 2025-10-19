#!/usr/bin/env node
/**
 * Complete Shipping Test Suite
 * Tests Southwest Cargo + FedEx shipping rates for multiple locations
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function testShippingRates(destination) {
  const { city, state, zipCode } = destination;

  log(colors.cyan, `\n🧪 Testing: ${city}, ${state} ${zipCode}`);

  const postData = JSON.stringify({
    destination: {
      city,
      state,
      zipCode,
    },
    package: {
      weight: 5,
    },
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3020,
      path: '/api/shipping/rates',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ destination, result });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  log(colors.blue, '╔════════════════════════════════════════════════════╗');
  log(colors.blue, '║   🚚 COMPLETE SHIPPING TEST SUITE                 ║');
  log(colors.blue, '║   Testing Southwest Cargo + FedEx                 ║');
  log(colors.blue, '╚════════════════════════════════════════════════════╝');

  const testLocations = [
    { city: 'Phoenix', state: 'AZ', zipCode: '85034' },
    { city: 'Dallas', state: 'TX', zipCode: '75201' },
    { city: 'Los Angeles', state: 'CA', zipCode: '90001' },
    { city: 'Chicago', state: 'IL', zipCode: '60601' }, // No Southwest Cargo expected
  ];

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  for (const location of testLocations) {
    totalTests++;
    try {
      const { destination, result } = await testShippingRates(location);

      if (!result.success) {
        log(colors.red, `   ❌ FAIL: API returned error`);
        log(colors.red, `      Error: ${result.error}`);
        failedTests++;
        continue;
      }

      const { rates, metadata } = result;
      const southwestRates = rates.filter((r) =>
        r.providerName.includes('Southwest')
      );
      const fedexRates = rates.filter((r) => r.providerName.includes('FedEx'));

      log(colors.green, `   ✅ SUCCESS: Got ${rates.length} total rates`);
      log(colors.cyan, `      - FedEx: ${fedexRates.length} rates`);
      log(colors.cyan, `      - Southwest Cargo: ${southwestRates.length} rates`);

      if (southwestRates.length > 0) {
        log(colors.yellow, `      Southwest Cargo Options:`);
        southwestRates.forEach((rate) => {
          log(
            colors.yellow,
            `        • ${rate.providerName}: $${rate.rate.amount.toFixed(2)} (${rate.delivery.text})`
          );
        });
      } else {
        log(
          colors.yellow,
          `      ⚠️  No Southwest Cargo (expected for ${destination.state}?)`
        );
      }

      // Show cheapest options
      if (rates.length > 0) {
        const cheapest = rates.reduce((min, r) =>
          r.rate.amount < min.rate.amount ? r : min
        );
        log(
          colors.green,
          `      💰 Cheapest: ${cheapest.providerName} - $${cheapest.rate.amount.toFixed(2)}`
        );
      }

      passedTests++;
    } catch (error) {
      log(colors.red, `   ❌ ERROR: ${error.message}`);
      failedTests++;
    }
  }

  // Summary
  log(colors.blue, '\n╔════════════════════════════════════════════════════╗');
  log(colors.blue, '║   📊 TEST SUMMARY                                  ║');
  log(colors.blue, '╚════════════════════════════════════════════════════╝');
  log(colors.cyan, `Total Tests: ${totalTests}`);
  log(colors.green, `✅ Passed: ${passedTests}`);
  if (failedTests > 0) {
    log(colors.red, `❌ Failed: ${failedTests}`);
  } else {
    log(colors.green, '🎉 ALL TESTS PASSED!');
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  log(colors.red, '❌ Test suite failed:', error);
  process.exit(1);
});
