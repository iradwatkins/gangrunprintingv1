/**
 * Weight Calculation Test
 * Calculate total weight for 5000 pieces at 24" x 24" for each paper type
 */

// Industry standard weights (lbs per square inch)
const paperTypes = [
  { name: '12pt Cardstock', weightPerSqIn: 0.000293 },
  { name: '14pt Cardstock', weightPerSqIn: 0.000346 },
  { name: '16pt Cardstock', weightPerSqIn: 0.000399 },
  { name: '100 lb Gloss Text', weightPerSqIn: 0.000266 },
]

// Product specifications
const quantity = 5000
const width = 24 // inches
const height = 24 // inches
const areaPerPiece = width * height // square inches

console.log('='.repeat(80))
console.log('WEIGHT CALCULATION TEST')
console.log('='.repeat(80))
console.log(`\nProduct Specifications:`)
console.log(`  Quantity: ${quantity.toLocaleString()} pieces`)
console.log(`  Size: ${width}" × ${height}" (${areaPerPiece} sq in per piece)`)
console.log(`\nFormula: Weight = Paper Weight per sq in × Area × Quantity`)
console.log('='.repeat(80))
console.log()

let totalAllPapers = 0

paperTypes.forEach((paper) => {
  const weight = paper.weightPerSqIn * areaPerPiece * quantity
  totalAllPapers += weight

  console.log(`${paper.name}:`)
  console.log(`  Paper Weight: ${paper.weightPerSqIn} lbs/sq in`)
  console.log(`  Calculation: ${paper.weightPerSqIn} × ${areaPerPiece} × ${quantity}`)
  console.log(`  Total Weight: ${weight.toFixed(2)} lbs`)
  console.log()
})

console.log('='.repeat(80))
console.log(`TOTAL WEIGHT (All 4 paper types combined): ${totalAllPapers.toFixed(2)} lbs`)
console.log('='.repeat(80))
console.log()

// Show packaging weight consideration
const packagingWeight = 2.0 // Typical packaging for bulk orders
console.log(`📦 WITH PACKAGING:`)
paperTypes.forEach((paper) => {
  const weight = paper.weightPerSqIn * areaPerPiece * quantity
  const withPackaging = weight + packagingWeight
  console.log(`  ${paper.name}: ${withPackaging.toFixed(2)} lbs (includes ${packagingWeight} lbs packaging)`)
})
console.log()

// Compare with current database values
console.log('='.repeat(80))
console.log('COMPARISON WITH CURRENT DATABASE VALUES:')
console.log('='.repeat(80))
console.log()

const databaseValues = [
  { name: '12pt C2S Cardstock', dbWeight: 0.0004, correctWeight: 0.000293 },
  { name: '14pt C2S Cardstock', dbWeight: 0.0015, correctWeight: 0.000346 },
  { name: '16pt C2S Cardstock', dbWeight: 0.0015, correctWeight: 0.000399 },
  { name: '100 lb Gloss Text', dbWeight: 0.0002, correctWeight: 0.000266 },
]

databaseValues.forEach((paper) => {
  const currentCalc = paper.dbWeight * areaPerPiece * quantity
  const correctCalc = paper.correctWeight * areaPerPiece * quantity
  const difference = currentCalc - correctCalc
  const percentOff = ((difference / correctCalc) * 100).toFixed(1)

  console.log(`${paper.name}:`)
  console.log(`  Database weight: ${paper.dbWeight} lbs/sq in`)
  console.log(`  Correct weight:  ${paper.correctWeight} lbs/sq in`)
  console.log(`  Current calc:    ${currentCalc.toFixed(2)} lbs`)
  console.log(`  Correct calc:    ${correctCalc.toFixed(2)} lbs`)
  console.log(`  Difference:      ${difference > 0 ? '+' : ''}${difference.toFixed(2)} lbs (${percentOff > 0 ? '+' : ''}${percentOff}%)`)
  console.log()
})
