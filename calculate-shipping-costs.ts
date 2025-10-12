/**
 * Calculate Shipping Costs for Each Paper Type
 * Order: 5000 pieces × 4" × 6"
 *
 * Using FedEx Ground rates as baseline
 * Assumptions:
 * - Origin: Dallas, TX (typical warehouse location)
 * - Destination: Average US distance (~1000 miles)
 * - Package dimensions: 12" × 10" × 8" (typical box for 5000 4×6 postcards)
 * - Rates based on 2024 FedEx Ground pricing
 */

interface ShippingRate {
  paperType: string
  weight: number
  productWeight: number
  totalWeight: number
  fedexGround: string
  fedex2Day: string
  fedexOvernight: string
  savings?: string
}

// Paper types with current database weights
const paperTypes = [
  { name: '9pt C2S Cardstock', weight: 0.0002977 },
  { name: '12pt C2S Cardstock', weight: 0.0004 },
  { name: '14pt C2S Cardstock', weight: 0.0005 },
  { name: '16pt C2S Cardstock', weight: 0.0005 },
  { name: '100 lb Gloss Text', weight: 0.0002 },
  { name: '100 lb Uncoated Cover', weight: 0.0002 },
  { name: '60 lb Offset', weight: 0.0002 },
]

const quantity = 5000
const width = 4
const height = 6
const areaPerPiece = width * height
const packagingWeight = 1.0

// FedEx Ground rate tiers (approximate 2024 rates for Zone 5, ~1000 miles)
function getFedExGroundRate(weight: number): string {
  if (weight <= 10) return '$12-18'
  if (weight <= 20) return '$18-25'
  if (weight <= 30) return '$25-35'
  if (weight <= 40) return '$35-45'
  if (weight <= 50) return '$45-55'
  if (weight <= 70) return '$55-70'
  if (weight <= 100) return '$70-90'
  if (weight <= 150) return '$90-120'
  return '$120+'
}

// FedEx 2-Day rate (typically 2-3x Ground)
function getFedEx2DayRate(weight: number): string {
  if (weight <= 10) return '$35-50'
  if (weight <= 20) return '$50-70'
  if (weight <= 30) return '$70-95'
  if (weight <= 40) return '$95-125'
  if (weight <= 50) return '$125-155'
  if (weight <= 70) return '$155-200'
  if (weight <= 100) return '$200-260'
  if (weight <= 150) return '$260-340'
  return '$340+'
}

// FedEx Overnight (typically 4-5x Ground)
function getFedExOvernightRate(weight: number): string {
  if (weight <= 10) return '$75-110'
  if (weight <= 20) return '$110-155'
  if (weight <= 30) return '$155-215'
  if (weight <= 40) return '$215-280'
  if (weight <= 50) return '$280-350'
  if (weight <= 70) return '$350-450'
  if (weight <= 100) return '$450-580'
  if (weight <= 150) return '$580-750'
  return '$750+'
}

console.log('================================================================================')
console.log('SHIPPING COST CALCULATOR - 5000 × 4" × 6"')
console.log('================================================================================\n')

console.log('Package Details:')
console.log('  Dimensions: 12" × 10" × 8" (typical box)')
console.log('  Origin: Dallas, TX')
console.log('  Destination: Average US (~1000 miles, Zone 5)')
console.log('  Carrier: FedEx\n')

console.log('Formula: Weight = (Paper Weight × 24 sq in × 5000) + 1 lb packaging\n')
console.log('================================================================================\n')

const rates: ShippingRate[] = []

paperTypes.forEach((paper) => {
  const productWeight = paper.weight * areaPerPiece * quantity
  const totalWeight = productWeight + packagingWeight
  const roundedWeight = Math.round(totalWeight * 10) / 10

  rates.push({
    paperType: paper.name,
    weight: paper.weight,
    productWeight: productWeight,
    totalWeight: roundedWeight,
    fedexGround: getFedExGroundRate(roundedWeight),
    fedex2Day: getFedEx2DayRate(roundedWeight),
    fedexOvernight: getFedExOvernightRate(roundedWeight),
  })
})

// Display detailed breakdown
rates.forEach((rate, index) => {
  console.log(`${index + 1}. ${rate.paperType}`)
  console.log('─'.repeat(80))
  console.log(`   Paper weight: ${rate.weight} lbs/sq in`)
  console.log(`   Product weight: ${rate.productWeight.toFixed(2)} lbs`)
  console.log(`   Total shipping weight: ${rate.totalWeight} lbs\n`)
  console.log(`   📦 FedEx Ground (5-7 business days):     ${rate.fedexGround}`)
  console.log(`   📦 FedEx 2-Day (2 business days):        ${rate.fedex2Day}`)
  console.log(`   📦 FedEx Overnight (next business day):  ${rate.fedexOvernight}`)
  console.log()
})

console.log('================================================================================')
console.log('QUICK COMPARISON TABLE')
console.log('================================================================================\n')

console.log('Paper Type                     | Weight  | Ground    | 2-Day      | Overnight')
console.log('─'.repeat(80))

rates.forEach((rate) => {
  const name = rate.paperType.padEnd(30, ' ')
  const weight = `${rate.totalWeight} lbs`.padStart(7, ' ')
  const ground = rate.fedexGround.padStart(9, ' ')
  const twoDay = rate.fedex2Day.padStart(10, ' ')
  const overnight = rate.fedexOvernight.padStart(10, ' ')

  console.log(`${name} | ${weight} | ${ground} | ${twoDay} | ${overnight}`)
})

console.log('\n================================================================================')
console.log('COST-SAVING RECOMMENDATIONS')
console.log('================================================================================\n')

// Group by similar weights
const lightPapers = rates.filter(r => r.totalWeight <= 30)
const mediumPapers = rates.filter(r => r.totalWeight > 30 && r.totalWeight <= 50)
const heavyPapers = rates.filter(r => r.totalWeight > 50)

if (lightPapers.length > 0) {
  console.log('💡 LIGHT PAPERS (≤30 lbs):')
  lightPapers.forEach(r => console.log(`   - ${r.paperType}: ${r.totalWeight} lbs`))
  console.log('   Best value: FedEx Ground ($25-35)\n')
}

if (mediumPapers.length > 0) {
  console.log('💡 MEDIUM PAPERS (31-50 lbs):')
  mediumPapers.forEach(r => console.log(`   - ${r.paperType}: ${r.totalWeight} lbs`))
  console.log('   Best value: FedEx Ground ($45-55)\n')
}

if (heavyPapers.length > 0) {
  console.log('💡 HEAVY PAPERS (>50 lbs):')
  heavyPapers.forEach(r => console.log(`   - ${r.paperType}: ${r.totalWeight} lbs`))
  console.log('   Best value: FedEx Ground ($55-70) or freight for bulk orders\n')
}

console.log('================================================================================')
console.log('ADDITIONAL NOTES')
console.log('================================================================================\n')

console.log('📍 Rates vary by:')
console.log('   - Destination zone (Zone 2-8)')
console.log('   - Fuel surcharges (varies weekly)')
console.log('   - Residential vs commercial delivery')
console.log('   - Peak season surcharges (Nov-Jan)')
console.log()
console.log('💰 To reduce costs:')
console.log('   - Use commercial addresses (saves 10-15%)')
console.log('   - Ship to FedEx locations (Hold at Location)')
console.log('   - Consider regional carriers for nearby destinations')
console.log('   - For 100+ lbs, use LTL freight carriers')
console.log()
console.log('🚚 Alternative carriers to check:')
console.log('   - UPS Ground: Similar pricing to FedEx')
console.log('   - USPS Priority Mail: Good for <70 lbs')
console.log('   - Regional carriers: Often 20-30% cheaper for specific zones')
console.log()

console.log('================================================================================')
