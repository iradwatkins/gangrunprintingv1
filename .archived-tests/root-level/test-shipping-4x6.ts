/**
 * Test Shipping Weight Calculation
 * Test Case: 5000 pieces × 4" × 6" for each paper type
 */

// Current database weights
const paperTypes = [
  { name: '9pt C2S Cardstock', weight: 0.0002977 },
  { name: '12pt C2S Cardstock', weight: 0.0004 },
  { name: '14pt C2S Cardstock', weight: 0.0005 },
  { name: '16pt C2S Cardstock', weight: 0.0005 },
  { name: '100 lb Gloss Text', weight: 0.0002 },
  { name: '100 lb Uncoated Cover (14pt)', weight: 0.0002 },
  { name: '60 lb Offset', weight: 0.0002 },
]

// Test specifications
const quantity = 5000
const width = 4 // inches
const height = 6 // inches
const areaPerPiece = width * height // 24 sq in

// Packaging weight
const packagingWeight = 1.0 // lbs for this size order

console.log('================================================================================')
console.log('SHIPPING WEIGHT CALCULATION: 5000 × 4" × 6"')
console.log('================================================================================')
console.log(`\nOrder Specifications:`)
console.log(`  Quantity: ${quantity.toLocaleString()} pieces`)
console.log(`  Size: ${width}" × ${height}"`)
console.log(`  Area per piece: ${areaPerPiece} sq in`)
console.log(`  Packaging: ${packagingWeight} lbs`)
console.log(`\nFormula: Weight = (Paper Weight × Area × Quantity) + Packaging`)
console.log('================================================================================\n')

let totalAllTypes = 0

paperTypes.forEach((paper) => {
  // Calculate product weight
  const productWeight = paper.weight * areaPerPiece * quantity

  // Add packaging
  const totalWeight = productWeight + packagingWeight

  // Round to 1 decimal (standard for shipping)
  const roundedWeight = Math.round(totalWeight * 10) / 10

  totalAllTypes += totalWeight

  console.log(`${paper.name}:`)
  console.log(`  Paper weight: ${paper.weight} lbs/sq in`)
  console.log(`  Calculation: ${paper.weight} × ${areaPerPiece} sq in × ${quantity} pcs`)
  console.log(`  Product weight: ${productWeight.toFixed(2)} lbs`)
  console.log(`  + Packaging: ${packagingWeight} lbs`)
  console.log(`  = Total shipping weight: ${roundedWeight} lbs`)
  console.log()
})

console.log('================================================================================')
console.log(`TOTAL WEIGHT (All paper types combined): ${totalAllTypes.toFixed(2)} lbs`)
console.log('================================================================================\n')

// Show individual totals clearly
console.log('SUMMARY TABLE:')
console.log('─'.repeat(80))
console.log('Paper Type                          | Product Weight | Total Weight')
console.log('─'.repeat(80))

paperTypes.forEach((paper) => {
  const productWeight = paper.weight * areaPerPiece * quantity
  const totalWeight = productWeight + packagingWeight
  const roundedWeight = Math.round(totalWeight * 10) / 10

  const namePadded = paper.name.padEnd(35, ' ')
  const productPadded = `${productWeight.toFixed(2)} lbs`.padStart(14, ' ')
  const totalPadded = `${roundedWeight} lbs`.padStart(12, ' ')

  console.log(`${namePadded} | ${productPadded} | ${totalPadded}`)
})

console.log('─'.repeat(80))
console.log()

// Compare with industry standards
console.log('================================================================================')
console.log('WEIGHT ACCURACY vs INDUSTRY STANDARDS')
console.log('================================================================================\n')

const industryComparison = [
  { name: '12pt C2S Cardstock', dbWeight: 0.0004, industryWeight: 0.000293 },
  { name: '14pt C2S Cardstock', dbWeight: 0.0005, industryWeight: 0.000346 },
  { name: '16pt C2S Cardstock', dbWeight: 0.0005, industryWeight: 0.000399 },
]

industryComparison.forEach((paper) => {
  const dbCalc = paper.dbWeight * areaPerPiece * quantity + packagingWeight
  const industryCalc = paper.industryWeight * areaPerPiece * quantity + packagingWeight
  const diff = dbCalc - industryCalc
  const percentOff = ((diff / industryCalc) * 100).toFixed(1)

  console.log(`${paper.name}:`)
  console.log(`  Your database: ${dbCalc.toFixed(2)} lbs`)
  console.log(`  Industry std:  ${industryCalc.toFixed(2)} lbs`)
  console.log(`  Difference:    ${diff > 0 ? '+' : ''}${diff.toFixed(2)} lbs (${percentOff > 0 ? '+' : ''}${percentOff}%)`)
  console.log()
})

console.log('================================================================================')
