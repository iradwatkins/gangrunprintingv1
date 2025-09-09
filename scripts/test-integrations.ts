#!/usr/bin/env npx tsx

/**
 * Integration Testing Script for GangRun Printing
 * Tests all critical integrations before deployment
 */

import { config } from 'dotenv'
import { prisma } from '../src/lib/prisma'
import * as Minio from 'minio'
import sgMail from '@sendgrid/mail'
import { SquareClient, SquareEnvironment } from 'square'

// Load environment variables
config()

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

interface TestResult {
  name: string
  success: boolean
  message: string
  details?: any
}

const tests: TestResult[] = []

// Test helper
async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  try {
    await testFn()
    tests.push({ name, success: true, message: 'Passed' })
    console.log(`${GREEN}✓${RESET} ${name}`)
  } catch (error: any) {
    tests.push({ name, success: false, message: error.message, details: error })
    console.log(`${RED}✗${RESET} ${name}: ${error.message}`)
  }
}

// 1. Test Database Connection
async function testDatabase() {
  await prisma.$connect()
  const count = await prisma.user.count()
  console.log(`  └─ Found ${count} users in database`)
  await prisma.$disconnect()
}

// 2. Test Square API
async function testSquare() {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    throw new Error('SQUARE_ACCESS_TOKEN not configured')
  }

  const client = new SquareClient({
    squareVersion: '2024-08-21',
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production' 
      ? SquareEnvironment.Production 
      : SquareEnvironment.Sandbox,
  } as any)

  try {
    // Test with a simple API call to list locations
    const { locations } = await client.locations.list()
    
    if (locations && locations.length > 0) {
      const location = locations[0]
      console.log(`  └─ Location: ${location.name || 'Unknown'}`)
      console.log(`  └─ Status: ${location.status || 'Unknown'}`)
      console.log(`  └─ Location ID: ${location.id}`)
    } else {
      console.log(`  └─ No locations found`)
    }
  } catch (error: any) {
    if (error.errors) {
      throw new Error(error.errors[0]?.detail || 'Square API error')
    }
    throw error
  }
}

// 3. Test SendGrid
async function testSendGrid() {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured')
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  // Verify sender
  const msg = {
    to: 'test@example.com',
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'test@gangrunprinting.com',
      name: process.env.SENDGRID_FROM_NAME || 'GangRun Printing'
    },
    subject: 'Test Email - Do Not Send',
    text: 'This is a test',
    html: '<p>This is a test</p>',
    mailSettings: {
      sandboxMode: {
        enable: true // This prevents actual sending
      }
    }
  }

  await sgMail.send(msg as any)
  console.log(`  └─ From: ${msg.from.email}`)
  console.log(`  └─ Sandbox mode: Email validated but not sent`)
}

// 4. Test MinIO
async function testMinIO() {
  if (!process.env.MINIO_ACCESS_KEY) {
    throw new Error('MINIO_ACCESS_KEY not configured')
  }

  const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY!,
  })

  const bucketName = process.env.MINIO_BUCKET_NAME || 'gangrun-uploads'
  const exists = await minioClient.bucketExists(bucketName)
  
  if (!exists) {
    console.log(`  └─ Creating bucket: ${bucketName}`)
    await minioClient.makeBucket(bucketName, 'us-east-1')
  } else {
    console.log(`  └─ Bucket exists: ${bucketName}`)
  }
}

// 5. Test N8N Webhook
async function testN8N() {
  if (!process.env.N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL not configured')
  }

  const testPayload = {
    event: 'test',
    timestamp: new Date().toISOString(),
    source: 'integration-test'
  }

  const response = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.N8N_API_KEY && {
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`
      })
    },
    body: JSON.stringify(testPayload)
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  console.log(`  └─ Webhook URL: ${process.env.N8N_WEBHOOK_URL}`)
  console.log(`  └─ Response: ${response.status} ${response.statusText}`)
}

// 6. Test Auth Configuration
async function testAuth() {
  if (!process.env.AUTH_SECRET) {
    throw new Error('AUTH_SECRET not configured')
  }

  if (process.env.AUTH_SECRET.length < 32) {
    throw new Error('AUTH_SECRET should be at least 32 characters')
  }

  console.log(`  └─ AUTH_SECRET length: ${process.env.AUTH_SECRET.length} characters`)
  console.log(`  └─ Google OAuth: ${process.env.AUTH_GOOGLE_ID ? 'Configured' : 'Not configured'}`)
}

// Main execution
async function main() {
  console.log('\n================================================')
  console.log('  GangRun Printing - Integration Tests')
  console.log('================================================\n')

  // Run all tests
  await runTest('Database Connection', testDatabase)
  await runTest('Square API', testSquare)
  await runTest('SendGrid Email', testSendGrid)
  await runTest('MinIO Storage', testMinIO)
  await runTest('N8N Webhook', testN8N)
  await runTest('Authentication', testAuth)

  // Summary
  console.log('\n================================================')
  console.log('  Test Summary')
  console.log('================================================')
  
  const passed = tests.filter(t => t.success).length
  const failed = tests.filter(t => !t.success).length
  
  console.log(`\n  Total: ${tests.length}`)
  console.log(`  ${GREEN}Passed: ${passed}${RESET}`)
  console.log(`  ${RED}Failed: ${failed}${RESET}`)

  if (failed > 0) {
    console.log('\n  Failed Tests:')
    tests.filter(t => !t.success).forEach(t => {
      console.log(`  ${RED}✗ ${t.name}${RESET}`)
      console.log(`    └─ ${t.message}`)
    })
    process.exit(1)
  } else {
    console.log(`\n  ${GREEN}✓ All tests passed! Ready for deployment.${RESET}\n`)
  }
}

// Error handling
main().catch(error => {
  console.error(`\n${RED}Fatal error:${RESET}`, error)
  process.exit(1)
})