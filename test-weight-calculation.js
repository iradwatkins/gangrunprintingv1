const http = require('http');

// Test with real product configuration (business cards)
const testData = {
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
      quantity: 500, // 500 business cards
      width: 3.5,    // inches
      height: 2,     // inches
      paperStockWeight: 0.0012 // lbs per square inch (typical for 16pt cardstock)
    }
  ]
};

console.log('🧪 Testing Weight Calculation with Real Product Data\n');
console.log('📦 Test Configuration:');
console.log(`   Product: Business Cards`);
console.log(`   Quantity: ${testData.items[0].quantity} cards`);
console.log(`   Size: ${testData.items[0].width}" × ${testData.items[0].height}"`);
console.log(`   Paper Stock: ${testData.items[0].paperStockWeight} lbs/sq in (16pt cardstock)`);
console.log('');

// Calculate expected weight manually
const item = testData.items[0];
const area = item.width * item.height;
const expectedProductWeight = item.paperStockWeight * area * item.quantity;
const expectedPackagingWeight = 0.5; // Standard packaging weight
const expectedTotalWeight = expectedProductWeight + expectedPackagingWeight;

console.log('📐 Expected Calculation:');
console.log(`   Area per card: ${area} sq in`);
console.log(`   Product weight: ${item.paperStockWeight} × ${area} × ${item.quantity} = ${expectedProductWeight.toFixed(2)} lbs`);
console.log(`   Packaging weight: ${expectedPackagingWeight} lbs`);
console.log(`   Total weight: ${expectedTotalWeight.toFixed(2)} lbs`);
console.log('');

const data = JSON.stringify(testData);

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

console.log('🚀 Calling API...\n');
const startTime = Date.now();

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  Response Time: ${duration}ms\n`);

    try {
      const result = JSON.parse(responseData);

      if (result.success && result.rates) {
        console.log('✅ API Response:');
        console.log(`   Total Weight: ${result.totalWeight} lbs`);
        console.log(`   Number of Boxes: ${result.numBoxes}`);
        console.log(`   Box Summary: ${result.boxSummary}`);
        console.log('');

        // Verify weight calculation
        const actualWeight = parseFloat(result.totalWeight);
        const weightDiff = Math.abs(actualWeight - expectedTotalWeight);
        const isCorrect = weightDiff < 0.01; // Allow 0.01 lb tolerance

        if (isCorrect) {
          console.log('✅ WEIGHT CALCULATION CORRECT!');
          console.log(`   Expected: ${expectedTotalWeight.toFixed(2)} lbs`);
          console.log(`   Actual: ${actualWeight.toFixed(2)} lbs`);
          console.log(`   Difference: ${weightDiff.toFixed(4)} lbs`);
        } else {
          console.log('❌ WEIGHT CALCULATION INCORRECT!');
          console.log(`   Expected: ${expectedTotalWeight.toFixed(2)} lbs`);
          console.log(`   Actual: ${actualWeight.toFixed(2)} lbs`);
          console.log(`   Difference: ${weightDiff.toFixed(2)} lbs`);
        }
        console.log('');

        console.log('📦 Shipping Rates:');
        result.rates.forEach((rate, i) => {
          const service = rate.serviceCode || rate.service;
          const cost = rate.cost || rate.rateAmount || 0;
          const carrier = rate.carrier || 'FEDEX';
          console.log(`   ${i + 1}. ${carrier} - ${service}: $${cost.toFixed(2)}`);
        });
        console.log('');

        // Verify mandatory services
        const serviceCodes = result.rates.map(r => r.serviceCode || r.service);
        const mandatoryServices = ['FEDEX_GROUND', 'FEDEX_2_DAY', 'STANDARD_OVERNIGHT'];
        const missingServices = mandatoryServices.filter(s => !serviceCodes.includes(s) && !serviceCodes.includes(s.replace('_', '')));

        if (missingServices.length === 0) {
          console.log('✅ All mandatory services present');
        } else {
          console.log('⚠️  Missing mandatory services:', missingServices.join(', '));
        }

      } else {
        console.log('❌ Error:', result.error || 'Unknown error');
        console.log('Details:', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.log('❌ Failed to parse response:', e.message);
      console.log('Raw response:', responseData.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(data);
req.end();
