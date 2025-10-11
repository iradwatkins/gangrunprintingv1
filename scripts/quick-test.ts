#!/usr/bin/env npx tsx

import { config } from 'dotenv'
config()

console.log('Square Token:', process.env.SQUARE_ACCESS_TOKEN?.substring(0, 10) + '...')

console.log('SendGrid Key:', process.env.SENDGRID_API_KEY?.substring(0, 10) + '...')

// Quick Square test with better error handling
import { SquareClient, SquareEnvironment } from 'square'

async function testSquare() {
  try {
    const client = new SquareClient({
      squareVersion: '2024-08-21',
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment:
        process.env.SQUARE_ENVIRONMENT === 'production'
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    } as any)

    const { locations } = await client.locations.list()

    if (locations && locations.length > 0) {
      console.log('  First location:', locations[0].name, '(' + locations[0].id + ')')
    }
  } catch (error: any) {
    if (error.errors) {
      console.log('  Details:', JSON.stringify(error.errors, null, 2))
    }
  }
}

testSquare()
