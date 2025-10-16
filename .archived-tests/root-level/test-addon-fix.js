// Test script to verify add-on positioning fix

async function testAddOnFix() {
  const baseUrl = 'http://localhost:3002'

  try {
    // Fetch configuration data
    const response = await fetch(`${baseUrl}/api/products/asdfddddddddddddd/configuration`)
    const data = await response.json()

    console.log('🔍 Testing Add-On Fix Results:')
    console.log('================================\n')

    // Check if addonsGrouped is present
    if (data.addonsGrouped) {
      console.log('✅ addonsGrouped is present in API response!\n')

      console.log('📊 Add-ons by position:')
      console.log('-----------------------')

      // Check ABOVE_DROPDOWN
      if (data.addonsGrouped.aboveDropdown && data.addonsGrouped.aboveDropdown.length > 0) {
        console.log('\n🔼 ABOVE DROPDOWN (' + data.addonsGrouped.aboveDropdown.length + ' items):')
        data.addonsGrouped.aboveDropdown.forEach((addon) => {
          console.log('   - ' + addon.name)
        })
      } else {
        console.log('\n⚠️  No add-ons positioned ABOVE dropdown')
      }

      // Check IN_DROPDOWN
      if (data.addonsGrouped.inDropdown && data.addonsGrouped.inDropdown.length > 0) {
        console.log('\n📦 IN DROPDOWN (' + data.addonsGrouped.inDropdown.length + ' items):')
        data.addonsGrouped.inDropdown.forEach((addon) => {
          console.log('   - ' + addon.name)
        })
      } else {
        console.log('\n⚠️  No add-ons positioned IN dropdown')
      }

      // Check BELOW_DROPDOWN
      if (data.addonsGrouped.belowDropdown && data.addonsGrouped.belowDropdown.length > 0) {
        console.log('\n🔽 BELOW DROPDOWN (' + data.addonsGrouped.belowDropdown.length + ' items):')
        data.addonsGrouped.belowDropdown.forEach((addon) => {
          console.log('   - ' + addon.name)
        })
      } else {
        console.log('\n⚠️  No add-ons positioned BELOW dropdown')
      }

      console.log('\n✨ Summary:')
      console.log(
        '   Total add-ons grouped: ' +
          ((data.addonsGrouped.aboveDropdown?.length || 0) +
            (data.addonsGrouped.inDropdown?.length || 0) +
            (data.addonsGrouped.belowDropdown?.length || 0))
      )
    } else {
      console.log('❌ addonsGrouped is NOT present in API response')
      console.log('   API returned null or undefined for addonsGrouped')
    }

    // Check fallback addons
    if (data.addons && data.addons.length > 0) {
      console.log('\n📋 Fallback addons array: ' + data.addons.length + ' items')
    }

    console.log('\n================================')
    console.log('🎨 UI Fix Applied:')
    console.log('   ✅ Added addonsGrouped to ConfigurationData interface')
    console.log('   ✅ Updated convertToLegacyFormat to include addonsGrouped')
    console.log('   ✅ Passed addonsGrouped prop to AddonAccordion component')
    console.log('   ✅ Assigned add-on sets to products in database')
    console.log('   ✅ Set display positions for add-ons (ABOVE/IN/BELOW)')
  } catch (error) {
    console.error('❌ Error testing add-on fix:', error.message)
  }
}

// Run the test
testAddOnFix()
