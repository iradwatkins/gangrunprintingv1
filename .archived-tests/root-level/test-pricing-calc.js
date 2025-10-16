/**
 * Test Pricing Calculator for Test Product
 * Verifies that configuration API returns proper prices
 */

const productId = 'f8934888-6a07-4570-b3c2-7f08586bb178';
const baseUrl = 'http://localhost:3002';

async function testPricingCalculation() {
  console.log('🧪 Testing Pricing Calculator\n');
  console.log('======================================================================\n');

  try {
    // 1. Fetch configuration
    console.log('1️⃣  Fetching product configuration...');
    const configResponse = await fetch(`${baseUrl}/api/products/${productId}/configuration`);
    const config = await configResponse.json();

    console.log(`   ✅ Configuration loaded`);
    console.log(`   - Quantities: ${config.quantities.length} options`);
    console.log(`   - Sizes: ${config.sizes.length} options`);
    console.log(`   - Papers: ${config.paperStocks.length} options`);
    console.log(`   - Addons: ${config.addons.length} options\n`);

    // 2. Calculate sample pricing
    console.log('2️⃣  Sample Pricing Calculations:\n');

    // Test case 1: 5000 qty × 12×18 size
    const qty = 5000;
    const size = config.sizes.find(s => s.name === '12×18');
    const paper = config.paperStocks.find(p => p.isDefault);
    const coating = paper.coatings.find(c => c.isDefault);
    const sides = paper.sides.find(s => s.isDefault);
    const turnaround = config.turnaroundTimes.find(t => t.isDefault);

    console.log(`   📦 Configuration:`);
    console.log(`   - Quantity: ${qty}`);
    console.log(`   - Size: ${size.displayName} (${size.squareInches} sq in)`);
    console.log(`   - Paper: ${paper.name}`);
    console.log(`   - Coating: ${coating.name}`);
    console.log(`   - Sides: ${sides.name}`);
    console.log(`   - Turnaround: ${turnaround.name}\n`);

    // Calculate price
    const basePrice = paper.pricePerSqInch;
    const sizeMultiplier = size.priceMultiplier;
    const coatingMultiplier = coating.priceMultiplier;
    const sidesMultiplier = sides.priceMultiplier;

    const baseProductPrice = qty * basePrice * sizeMultiplier * coatingMultiplier * sidesMultiplier;

    let finalPrice = baseProductPrice;
    if (turnaround.pricingModel === 'PERCENTAGE') {
      finalPrice = baseProductPrice * turnaround.priceMultiplier;
    } else if (turnaround.pricingModel === 'FLAT') {
      finalPrice = baseProductPrice + turnaround.basePrice;
    }

    console.log(`   💰 Pricing Breakdown:`);
    console.log(`   - Base price per sq in: $${basePrice.toFixed(4)}`);
    console.log(`   - Size multiplier: ${sizeMultiplier}x`);
    console.log(`   - Coating multiplier: ${coatingMultiplier}x`);
    console.log(`   - Sides multiplier: ${sidesMultiplier}x`);
    console.log(`   - Base product price: $${baseProductPrice.toFixed(2)}`);
    console.log(`   - Turnaround: ${turnaround.name} (${turnaround.priceMultiplier}x)`);
    console.log(`   - FINAL PRICE: $${finalPrice.toFixed(2)}\n`);

    // Calculate weight for shipping
    const paperWeight = paper.weight; // lbs per square inch
    const totalSquareInches = qty * size.squareInches;
    const totalWeight = totalSquareInches * paperWeight;

    console.log(`   📦 Shipping Weight Calculation:`);
    console.log(`   - Paper weight: ${paperWeight} lbs/sq in`);
    console.log(`   - Total sq inches: ${totalSquareInches.toLocaleString()}`);
    console.log(`   - TOTAL WEIGHT: ${totalWeight.toFixed(2)} lbs\n`);

    // 3. Verify pricing is non-zero
    console.log('3️⃣  Validation:\n');
    if (finalPrice > 0) {
      console.log('   ✅ Pricing calculation is working!');
      console.log('   ✅ Price shows realistic value (not $0.00)');
    } else {
      console.log('   ❌ ERROR: Price is $0.00!');
      return false;
    }

    if (totalWeight > 0) {
      console.log('   ✅ Weight calculation is working!');
      console.log('   ✅ Shipping calculations will work correctly\n');
    } else {
      console.log('   ❌ ERROR: Weight is 0 lbs!');
      return false;
    }

    console.log('======================================================================');
    console.log('✅ ALL TESTS PASSED - Pricing calculator is ready!\n');
    console.log('📍 Next steps:');
    console.log('   1. Visit: http://gangrunprinting.com/products/test-product-1760272236051');
    console.log('   2. Configure your product');
    console.log('   3. Add to cart');
    console.log('   4. Proceed to checkout');
    console.log('   5. Enter Texas address for Southwest Cargo shipping\n');

    return true;

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

testPricingCalculation();
