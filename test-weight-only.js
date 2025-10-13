/**
 * Test Weight Calculation
 * Formula: Paper Stock Weight × Size (width × height) × Quantity = Weight (lbs)
 */

// Sample paper stock weights from database
const paperStocks = {
  '60lb Offset': 0.0002,
  '100lb Gloss Text': 0.0002,
  '9pt C2S Cardstock': 0.0002977,
  '12pt C2S Cardstock': 0.0004,
  '14pt C2S Cardstock': 0.0005,
  '16pt C2S Cardstock': 0.0005,
}

// Test calculation function
function calculateWeight(paperStockWeight, width, height, quantity) {
  const areaInSquareInches = width * height
  const totalWeight = paperStockWeight * areaInSquareInches * quantity
  return totalWeight
}

console.log('🧪 Weight Calculation Test')
console.log('=' .repeat(80))
console.log('')

// Test 1: 5,000 × 12″×18″ on 16pt C2S Cardstock
console.log('Test 1: 5,000 × 12″×18″ on 16pt C2S Cardstock')
const test1 = calculateWeight(paperStocks['16pt C2S Cardstock'], 12, 18, 5000)
console.log(`  Paper Stock Weight: ${paperStocks['16pt C2S Cardstock']} lbs/sq in`)
console.log(`  Size: 12″ × 18″ = ${12 * 18} sq in`)
console.log(`  Quantity: 5,000 pieces`)
console.log(`  Formula: ${paperStocks['16pt C2S Cardstock']} × ${12 * 18} × 5000`)
console.log(`  Result: ${test1.toFixed(2)} lbs`)
console.log('')

// Test 2: 1,000 × 4″×6″ on 12pt C2S Cardstock
console.log('Test 2: 1,000 × 4″×6″ on 12pt C2S Cardstock')
const test2 = calculateWeight(paperStocks['12pt C2S Cardstock'], 4, 6, 1000)
console.log(`  Paper Stock Weight: ${paperStocks['12pt C2S Cardstock']} lbs/sq in`)
console.log(`  Size: 4″ × 6″ = ${4 * 6} sq in`)
console.log(`  Quantity: 1,000 pieces`)
console.log(`  Formula: ${paperStocks['12pt C2S Cardstock']} × ${4 * 6} × 1000`)
console.log(`  Result: ${test2.toFixed(2)} lbs`)
console.log('')

// Test 3: 10,000 × 8.5″×11″ on 60lb Offset
console.log('Test 3: 10,000 × 8.5″×11″ on 60lb Offset')
const test3 = calculateWeight(paperStocks['60lb Offset'], 8.5, 11, 10000)
console.log(`  Paper Stock Weight: ${paperStocks['60lb Offset']} lbs/sq in`)
console.log(`  Size: 8.5″ × 11″ = ${8.5 * 11} sq in`)
console.log(`  Quantity: 10,000 pieces`)
console.log(`  Formula: ${paperStocks['60lb Offset']} × ${8.5 * 11} × 10000`)
console.log(`  Result: ${test3.toFixed(2)} lbs`)
console.log('')

console.log('=' .repeat(80))
console.log('✅ Weight Calculation Formula:')
console.log('   Weight = Paper Stock Weight × Width × Height × Quantity')
console.log('   (No markup, no modifiers - just the raw calculation)')
console.log('')
