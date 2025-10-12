/**
 * Test Shipping Weight Calculation for 9pt Paper
 * Test Case: 5000 pieces × 4" × 6" on 9pt C2S Cardstock
 */

// 9pt paper weight from database
const paperWeight = 0.0002977 // lbs/sq in

// Test specifications
const quantity = 5000
const width = 4 // inches
const height = 6 // inches
const areaPerPiece = width * height // 24 sq in

// Packaging weight
const packagingWeight = 1.0 // lbs

console.log('================================================================================')
console.log('9PT C2S CARDSTOCK - DETAILED WEIGHT CALCULATION')
console.log('================================================================================\n')

console.log('Order Specifications:')
console.log(`  Quantity: ${quantity.toLocaleString()} pieces`)
console.log(`  Size: ${width}" × ${height}"`)
console.log(`  Area per piece: ${areaPerPiece} sq in`)
console.log(`  Paper: 9pt C2S Cardstock`)
console.log(`  Paper weight: ${paperWeight} lbs/sq in\n`)

console.log('Step-by-Step Calculation:')
console.log('─'.repeat(80))

// Step 1: Calculate area
console.log(`Step 1: Calculate area per piece`)
console.log(`  ${width}" × ${height}" = ${areaPerPiece} sq in\n`)

// Step 2: Calculate weight per piece
const weightPerPiece = paperWeight * areaPerPiece
console.log(`Step 2: Calculate weight per piece`)
console.log(`  ${paperWeight} lbs/sq in × ${areaPerPiece} sq in = ${weightPerPiece.toFixed(7)} lbs per piece\n`)

// Step 3: Calculate total product weight
const productWeight = weightPerPiece * quantity
console.log(`Step 3: Calculate total product weight`)
console.log(`  ${weightPerPiece.toFixed(7)} lbs × ${quantity} pieces = ${productWeight.toFixed(2)} lbs\n`)

// Step 4: Add packaging
const totalWeight = productWeight + packagingWeight
console.log(`Step 4: Add packaging weight`)
console.log(`  ${productWeight.toFixed(2)} lbs + ${packagingWeight} lbs = ${totalWeight.toFixed(2)} lbs\n`)

// Step 5: Round for shipping
const roundedWeight = Math.round(totalWeight * 10) / 10
console.log(`Step 5: Round to 1 decimal (shipping standard)`)
console.log(`  ${totalWeight.toFixed(2)} lbs → ${roundedWeight} lbs\n`)

console.log('─'.repeat(80))
console.log('\n✅ FINAL SHIPPING WEIGHT: ' + roundedWeight + ' lbs\n')
console.log('─'.repeat(80))

// Additional info
console.log('\nShipping Estimate:')
console.log(`  Weight: ${roundedWeight} lbs`)
console.log(`  Estimated FedEx Ground: $30-45 (depending on distance)`)
console.log(`  Estimated Southwest Cargo: $25-35 (if available)\n`)

// Compare with other paper types for context
console.log('================================================================================')
console.log('COMPARISON WITH OTHER PAPER TYPES (5000 × 4" × 6")')
console.log('================================================================================\n')

const comparisons = [
  { name: '9pt C2S Cardstock', weight: 0.0002977, basis: '~65 lb cover' },
  { name: '12pt C2S Cardstock', weight: 0.0004, basis: '~110 lb cover' },
  { name: '14pt C2S Cardstock', weight: 0.0005, basis: '~130 lb cover' },
  { name: '16pt C2S Cardstock', weight: 0.0005, basis: '~150 lb cover' },
]

comparisons.forEach((paper) => {
  const weight = paper.weight * areaPerPiece * quantity + packagingWeight
  const rounded = Math.round(weight * 10) / 10
  console.log(`${paper.name}:`)
  console.log(`  Basis weight: ${paper.basis}`)
  console.log(`  Total shipping: ${rounded} lbs\n`)
})

// Industry standard comparison
console.log('================================================================================')
console.log('INDUSTRY STANDARD COMPARISON FOR 9PT')
console.log('================================================================================\n')

// 9pt is approximately 65 lb cover
// Industry standard for 65 lb cover: ~0.000173 lbs/sq in
const industryWeight9pt = 0.000173
const industryCalc = industryWeight9pt * areaPerPiece * quantity + packagingWeight
const diff = totalWeight - industryCalc
const percentOff = ((diff / industryCalc) * 100).toFixed(1)

console.log(`Your database weight: ${paperWeight} lbs/sq in`)
console.log(`Industry standard:    ${industryWeight9pt} lbs/sq in`)
console.log(`\nYour calculation:     ${totalWeight.toFixed(2)} lbs`)
console.log(`Industry calculation: ${industryCalc.toFixed(2)} lbs`)
console.log(`Difference:           ${diff > 0 ? '+' : ''}${diff.toFixed(2)} lbs (${percentOff > 0 ? '+' : ''}${percentOff}%)`)

if (Math.abs(parseFloat(percentOff)) < 20) {
  console.log(`\n✅ GOOD: Within 20% of industry standard`)
} else {
  console.log(`\n⚠️ NOTICE: Over 20% difference from industry standard`)
}

console.log('\n================================================================================')
