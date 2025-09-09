#!/usr/bin/env npx tsx

import { config } from 'dotenv'
config()

console.log('Environment Check:')
console.log('==================')
console.log('Square Environment:', process.env.SQUARE_ENVIRONMENT)
console.log('Square Token:', process.env.SQUARE_ACCESS_TOKEN?.substring(0, 10) + '...')
console.log('Square Location ID:', process.env.SQUARE_LOCATION_ID)
console.log('SendGrid Key:', process.env.SENDGRID_API_KEY?.substring(0, 10) + '...')
console.log('N8N Webhook:', process.env.N8N_WEBHOOK_URL)
console.log('MinIO Access Key:', process.env.MINIO_ACCESS_KEY)

// Quick Square test with better error handling
import { SquareClient, SquareEnvironment } from 'square'

async function testSquare() {
  console.log('\nTesting Square API...')
  try {
    const client = new SquareClient({
      squareVersion: '2024-08-21',
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.SQUARE_ENVIRONMENT === 'production' 
        ? SquareEnvironment.Production 
        : SquareEnvironment.Sandbox,
    } as any)

    const { locations } = await client.locations.list()
    console.log('✓ Square API working!')
    console.log('  Locations found:', locations?.length || 0)
    if (locations && locations.length > 0) {
      console.log('  First location:', locations[0].name, '(' + locations[0].id + ')')
    }
  } catch (error: any) {
    console.log('✗ Square API failed!')
    console.log('  Error:', error.message || error)
    if (error.errors) {
      console.log('  Details:', JSON.stringify(error.errors, null, 2))
    }
  }
}

testSquare()