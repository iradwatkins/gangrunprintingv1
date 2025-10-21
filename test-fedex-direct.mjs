import { getShippingRegistry } from './src/lib/shipping/module-registry.ts'

const registry = getShippingRegistry()
const fedexModule = registry.getModule('fedex')

console.log('=== Testing FedEx Provider Directly ===\n')

// Test with residential address
const residentialRates = await fedexModule.provider.getRates(
  { street: '123 Main St', city: 'Chicago', state: 'IL', zipCode: '60173', country: 'US', isResidential: false },
  { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90210', country: 'US', isResidential: true },
  [{ weight: 5, dimensions: { length: 12, width: 9, height: 2 } }]
)

console.log('Residential (isResidential: true):')
console.log('Count:', residentialRates.length)
console.log('Service codes:', residentialRates.map(r => r.serviceCode).join(', '))
console.log('')

// Test with business address
const businessRates = await fedexModule.provider.getRates(
  { street: '123 Main St', city: 'Chicago', state: 'IL', zipCode: '60173', country: 'US', isResidential: false },
  { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zipCode: '90210', country: 'US', isResidential: false },
  [{ weight: 5, dimensions: { length: 12, width: 9, height: 2 } }]
)

console.log('Business (isResidential: false):')
console.log('Count:', businessRates.length)
console.log('Service codes:', businessRates.map(r => r.serviceCode).join(', '))
