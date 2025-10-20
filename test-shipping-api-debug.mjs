/**
 * Debug shipping API - Test various request formats
 */

// Test different request formats to find the validation issue

const tests = [
  {
    name: 'Test 1: Valid request (like curl)',
    body: {
      destination: {
        zipCode: '90210',
        state: 'CA',
        city: 'Beverly Hills',
        street: '123 Main St',
        countryCode: 'US',
        isResidential: true,
      },
      packages: [{ weight: 1 }],
    },
  },
  {
    name: 'Test 2: With dimensions',
    body: {
      destination: {
        zipCode: '90210',
        state: 'CA',
        city: 'Beverly Hills',
        street: '123 Main St',
        countryCode: 'US',
        isResidential: true,
      },
      packages: [
        {
          weight: 1,
          dimensions: { length: 10, width: 10, height: 2 },
        },
      ],
    },
  },
  {
    name: 'Test 3: Zero weight (SHOULD FAIL)',
    body: {
      destination: {
        zipCode: '90210',
        state: 'CA',
        city: 'Beverly Hills',
        street: '123 Main St',
        countryCode: 'US',
        isResidential: true,
      },
      packages: [{ weight: 0 }],
    },
  },
  {
    name: 'Test 4: Undefined dimensions (valid)',
    body: {
      destination: {
        zipCode: '90210',
        state: 'CA',
        city: 'Beverly Hills',
        street: '123 Main St',
        countryCode: 'US',
        isResidential: true,
      },
      packages: [{ weight: 1, dimensions: undefined }],
    },
  },
  {
    name: 'Test 5: Empty packages array (should use default)',
    body: {
      destination: {
        zipCode: '90210',
        state: 'CA',
        city: 'Beverly Hills',
        street: '123 Main St',
        countryCode: 'US',
        isResidential: true,
      },
      packages: [],
    },
  },
]

async function runTests() {
  console.log('🧪 Testing Shipping API Validation\n')

  for (const test of tests) {
    console.log('=' .repeat(60))
    console.log(test.name)
    console.log('='.repeat(60))
    console.log('📤 Request:', JSON.stringify(test.body, null, 2))

    try {
      const response = await fetch('http://localhost:3020/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body),
      })

      console.log(`\n📥 Status: ${response.status} ${response.statusText}`)

      const data = await response.json()

      if (response.ok) {
        console.log('✅ SUCCESS')
        console.log(`   Got ${data.rates?.length || 0} rates`)
      } else {
        console.log('❌ FAILED')
        console.log('   Error:', data.error)
        if (data.details) {
          console.log('   Details:', JSON.stringify(data.details, null, 2))
        }
      }
    } catch (error) {
      console.log('❌ EXCEPTION:', error.message)
    }

    console.log('\n')
  }

  console.log('=' .repeat(60))
  console.log('DIAGNOSIS COMPLETE')
  console.log('='.repeat(60))
}

runTests().catch(console.error)
