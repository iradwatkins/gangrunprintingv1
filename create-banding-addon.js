#!/usr/bin/env node

/**
 * Create Banding Add-On with Sub-Options
 * Price: $0.75/bundle
 */

const BASE_URL = 'http://localhost:3002'

async function createBandingAddOn() {
  console.log('🎯 Creating Banding Add-On...\n')

  // Step 1: Create the add-on
  console.log('Step 1: Creating base add-on...')
  const addOnData = {
    name: 'Banding',
    description: 'Professional bundling service with paper or rubber bands',
    tooltipText:
      'Have your product bundled in specific individual quantity groups with paper bands or rubber bands. Please choose the amount you would like in each bundle.',
    pricingModel: 'PER_UNIT',
    configuration: {
      pricePerUnit: 0.75,
      unitName: 'bundle',
    },
    additionalTurnaroundDays: 0,
    sortOrder: 1,
    isActive: true,
    adminNotes: 'Customer can choose banding type and items per bundle',
  }

  const createResponse = await fetch(`${BASE_URL}/api/add-ons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addOnData),
  })

  if (!createResponse.ok) {
    const error = await createResponse.json()
    console.error('❌ Failed to create add-on:', error)
    process.exit(1)
  }

  const addOn = await createResponse.json()
  console.log(`✅ Created add-on: ${addOn.name} (ID: ${addOn.id})\n`)

  // Step 2: Add sub-options
  console.log('Step 2: Adding sub-options...')
  const subOptions = [
    {
      name: 'Banding Type',
      optionType: 'SELECT',
      options: ['Paper Bands', 'Rubber Bands'],
      defaultValue: 'Paper Bands',
      isRequired: true,
      affectsPricing: false,
      tooltipText: 'Please select whether or not you want paper banding or rubber banding.',
      displayOrder: 0,
    },
    {
      name: 'Items/Bundle',
      optionType: 'NUMBER',
      options: null,
      defaultValue: '100',
      isRequired: true,
      affectsPricing: true,
      tooltipText:
        'Please enter the amount you want in each bundle. If you ordered 5000 quantity and entered 50, you would get 100 bundles.',
      displayOrder: 1,
    },
  ]

  const updateResponse = await fetch(`${BASE_URL}/api/add-ons/${addOn.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...addOnData,
      subOptions,
    }),
  })

  if (!updateResponse.ok) {
    const error = await updateResponse.json()
    console.error('❌ Failed to add sub-options:', error)
    process.exit(1)
  }

  const updatedAddOn = await updateResponse.json()
  console.log(`✅ Added ${subOptions.length} sub-options\n`)

  // Step 3: Verify the result
  console.log('Step 3: Verifying...')
  const verifyResponse = await fetch(`${BASE_URL}/api/add-ons/${addOn.id}`)
  const finalAddOn = await verifyResponse.json()

  console.log('\n📋 Final Add-On Configuration:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Name:          ${finalAddOn.name}`)
  console.log(
    `Price:         $${finalAddOn.configuration.pricePerUnit}/${finalAddOn.configuration.unitName}`
  )
  console.log(`Status:        ${finalAddOn.isActive ? 'Active ✅' : 'Inactive ❌'}`)
  console.log(`Sub-Options:   ${finalAddOn.addOnSubOptions?.length || 0}`)

  if (finalAddOn.addOnSubOptions?.length > 0) {
    console.log('\nSub-Options:')
    finalAddOn.addOnSubOptions.forEach((opt, idx) => {
      console.log(`  ${idx + 1}. ${opt.name} (${opt.optionType})`)
      console.log(`     Default: ${opt.defaultValue}`)
      console.log(`     Required: ${opt.isRequired ? 'Yes' : 'No'}`)
      console.log(`     Affects Pricing: ${opt.affectsPricing ? 'Yes' : 'No'}`)
      if (opt.options) {
        console.log(`     Options: ${opt.options.join(', ')}`)
      }
    })
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n✅ Banding add-on created successfully!')
  console.log(`🔗 View at: https://gangrunprinting.com/admin/add-ons\n`)
}

createBandingAddOn().catch((err) => {
  console.error('💥 Error:', err.message)
  process.exit(1)
})
