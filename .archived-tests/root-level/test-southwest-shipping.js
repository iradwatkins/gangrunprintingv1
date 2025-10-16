#!/usr/bin/env node

/**
 * Test script for Southwest Cargo shipping rates
 * Tests shipping API with Dallas, TX address (guaranteed to be in service area)
 */

const http = require('http');

const testPayload = {
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
      quantity: 250,
      width: 4,
      height: 6,
      paperStockWeight: 0.0009 // 9pt paper
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

console.log('🧪 Testing Southwest Cargo Shipping Rates');
console.log('==========================================');
console.log('Test Address: Dallas, TX 75201');
console.log('Product: 250x 4x6 Postcards on 9pt paper');
console.log('');
console.log('Sending request to http://localhost:3002/api/shipping/calculate');
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Response received');
    console.log('Status:', res.statusCode);
    console.log('');

    try {
      const response = JSON.parse(data);

      console.log('📦 Total Weight:', response.totalWeight, 'lbs');
      console.log('📦 Boxes:', response.numBoxes);
      console.log('');

      if (response.rates && response.rates.length > 0) {
        console.log('✅ Shipping Rates Found:', response.rates.length);
        console.log('');

        // Group by carrier
        const fedexRates = response.rates.filter(r => r.carrier === 'FEDEX');
        const southwestRates = response.rates.filter(r => r.carrier === 'SOUTHWEST_CARGO');

        if (fedexRates.length > 0) {
          console.log('📦 FedEx Options:', fedexRates.length);
          fedexRates.forEach(rate => {
            console.log(`   - ${rate.serviceName}: $${rate.rateAmount.toFixed(2)} (${rate.estimatedDays} days)`);
          });
          console.log('');
        }

        if (southwestRates.length > 0) {
          console.log('✈️  Southwest Cargo Options:', southwestRates.length);
          southwestRates.forEach(rate => {
            console.log(`   - ${rate.serviceName}: $${rate.rateAmount.toFixed(2)} (${rate.estimatedDays} days)`);
          });
          console.log('');
          console.log('✅ SUCCESS: Southwest Cargo is working!');
        } else {
          console.log('❌ FAIL: No Southwest Cargo rates returned');
          console.log('');
          console.log('Check PM2 logs for details:');
          console.log('  pm2 logs gangrunprinting --lines 100 | grep Southwest');
        }
      } else {
        console.log('❌ FAIL: No rates returned at all');
        console.log('');
        console.log('Full response:', JSON.stringify(response, null, 2));
      }
    } catch (e) {
      console.error('❌ Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(JSON.stringify(testPayload));
req.end();
