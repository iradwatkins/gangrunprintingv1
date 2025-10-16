/**
 * Test Shipping Weight Calculation with Updated Database Values
 * Test Case: 5000 pieces × 24" × 24" for each paper type
 */

// Updated database weights (just verified from database)
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
const width = 24 // inches
const height = 24 // inches
const areaPerPiece = width * height // 576 sq in

// Packaging weight for large orders
const packagingWeight = 2.0 // lbs

console.log('================================================================================')
console.log('SHIPPING WEIGHT TEST WITH UPDATED DATABASE VALUES')
console.log('================================================================================')
console.log(`\nOrder Specifications:`)
console.log(`  Quantity: ${quantity.toLocaleString()} pieces`)
console.log(`  Size: ${width}" × ${height}" (${areaPerPiece} sq in per piece)`)
console.log(`  Packaging: ${packagingWeight} lbs added per order`)
console.log(`\nFormula: Weight = (Paper Weight × Width × Height × Quantity) + Packaging`)
console.log('================================================================================\n')

paperTypes.forEach((paper) => {
  // Calculate product weight
  const productWeight = paper.weight * areaPerPiece * quantity

  // Add packaging
  const totalWeight = productWeight + packagingWeight

  // Round to 1 decimal (standard for shipping)
  const roundedWeight = Math.round(totalWeight * 10) / 10

  console.log(`${paper.name}:`)
  console.log(`  Database weight: ${paper.weight} lbs/sq in`)
  console.log(`  Product weight: ${productWeight.toFixed(2)} lbs`)
  console.log(`  + Packaging: ${packagingWeight} lbs`)
  console.log(`  Total shipping weight: ${roundedWeight} lbs`)
  console.log()
})

console.log('================================================================================')
console.log('REAL-WORLD SHIPPING EXAMPLE')
console.log('================================================================================\n')

// Example: Business Cards
const businessCardExample = {
  name: '1000 Business Cards (3.5" × 2") on 14pt Cardstock',
  quantity: 1000,
  width: 3.5,
  height: 2,
  paperWeight: 0.0005, // 14pt from database
  packaging: 0.5, // Small order packaging
}

const bcArea = businessCardExample.width * businessCardExample.height
const bcWeight = businessCardExample.paperWeight * bcArea * businessCardExample.quantity
const bcTotal = bcWeight + businessCardExample.packaging
const bcRounded = Math.round(bcTotal * 10) / 10

console.log(`${businessCardExample.name}:`)
console.log(`  Area: ${bcArea} sq in`)
console.log(`  Product weight: ${bcWeight.toFixed(2)} lbs`)
console.log(`  + Packaging: ${businessCardExample.packaging} lbs`)
console.log(`  Total shipping weight: ${bcRounded} lbs`)
console.log(`  Estimated shipping cost (FedEx Ground): ~$15-25`)
console.log()

// Example: Large Format Posters
const posterExample = {
  name: '500 Posters (24" × 36") on 100lb Gloss Text',
  quantity: 500,
  width: 24,
  height: 36,
  paperWeight: 0.0002, // 100lb Gloss from database
  packaging: 3.0, // Larger packaging for posters
}

const posterArea = posterExample.width * posterExample.height
const posterWeight = posterExample.paperWeight * posterArea * posterExample.quantity
const posterTotal = posterWeight + posterExample.packaging
const posterRounded = Math.round(posterTotal * 10) / 10

console.log(`${posterExample.name}:`)
console.log(`  Area: ${posterArea} sq in`)
console.log(`  Product weight: ${posterWeight.toFixed(2)} lbs`)
console.log(`  + Packaging: ${posterExample.packaging} lbs`)
console.log(`  Total shipping weight: ${posterRounded} lbs`)
console.log(`  Estimated shipping cost (FedEx Ground): ~$35-50`)
console.log()

console.log('================================================================================')
console.log('WEIGHT ACCURACY CHECK')
console.log('================================================================================\n')

// Compare with industry standards
const industryStandards = [
  { name: '12pt Cardstock', dbWeight: 0.0004, industryWeight: 0.000293 },
  { name: '14pt Cardstock', dbWeight: 0.0005, industryWeight: 0.000346 },
  { name: '16pt Cardstock', dbWeight: 0.0005, industryWeight: 0.000399 },
]

industryStandards.forEach((paper) => {
  const diff = paper.dbWeight - paper.industryWeight
  const percentOff = ((diff / paper.industryWeight) * 100).toFixed(1)
  const status = Math.abs(parseFloat(percentOff)) < 20 ? '✅ CLOSE' : '⚠️ NEEDS ADJUSTMENT'

  console.log(`${paper.name}:`)
  console.log(`  Database: ${paper.dbWeight} lbs/sq in`)
  console.log(`  Industry: ${paper.industryWeight} lbs/sq in`)
  console.log(`  Difference: ${diff > 0 ? '+' : ''}${(diff * 1000).toFixed(4)} (${percentOff > 0 ? '+' : ''}${percentOff}%) ${status}`)
  console.log()
})

console.log('================================================================================')
