#!/usr/bin/env tsx
/**
 * Southwest Cargo Diagnostic Script
 * Diagnoses why 82 airports are not showing on locations page
 * Run with: npx tsx diagnose-southwest-issue.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DiagnosticResult {
  test: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  details?: any
}

const results: DiagnosticResult[] = []

async function runDiagnostics() {
  console.log('🔍 Southwest Cargo Airport Diagnostic Report')
  console.log('='.repeat(80))
  console.log('\n')

  // Test 1: Check database airport count
  await testDatabaseAirportCount()

  // Test 2: Check for specific Southwest airports
  await testSpecificAirports()

  // Test 3: Check airport data structure
  await testAirportDataStructure()

  // Test 4: Check for hardcoded locations
  await testForHardcodedLocations()

  // Test 5: Check API route file exists
  await testApiRouteExists()

  // Test 6: Check locations page implementation
  await testLocationsPageImplementation()

  // Print results
  console.log('\n')
  console.log('📊 DIAGNOSTIC RESULTS')
  console.log('='.repeat(80))
  console.log('\n')

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${index + 1}. ${icon} ${result.test}`)
    console.log(`   Status: ${result.status}`)
    console.log(`   ${result.message}`)
    if (result.details) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2))
    }
    console.log('')
  })

  // Summary
  const passed = results.filter((r) => r.status === 'PASS').length
  const failed = results.filter((r) => r.status === 'FAIL').length
  const warnings = results.filter((r) => r.status === 'WARNING').length

  console.log('='.repeat(80))
  console.log(`SUMMARY: ${passed} passed, ${failed} failed, ${warnings} warnings`)
  console.log('='.repeat(80))
  console.log('\n')

  // Root cause analysis
  if (failed > 0) {
    console.log('🔧 ROOT CAUSE ANALYSIS & FIXES')
    console.log('='.repeat(80))
    console.log('\n')
    analyzeAndProvideFixes()
  }

  await prisma.$disconnect()
}

/**
 * Test 1: Database Airport Count
 */
async function testDatabaseAirportCount() {
  try {
    const count = await prisma.airport.count({
      where: {
        carrier: 'SOUTHWEST_CARGO',
        isActive: true,
      },
    })

    if (count === 82) {
      results.push({
        test: 'Database Airport Count',
        status: 'PASS',
        message: `Database contains exactly 82 active Southwest Cargo airports`,
        details: { count },
      })
    } else if (count === 0) {
      results.push({
        test: 'Database Airport Count',
        status: 'FAIL',
        message: `Database contains NO airports. Seeding required.`,
        details: { count, expected: 82 },
      })
    } else {
      results.push({
        test: 'Database Airport Count',
        status: 'FAIL',
        message: `Database contains ${count} airports instead of 82`,
        details: { count, expected: 82, missing: 82 - count },
      })
    }
  } catch (error: any) {
    results.push({
      test: 'Database Airport Count',
      status: 'FAIL',
      message: `Database query failed: ${error.message}`,
    })
  }
}

/**
 * Test 2: Check for Specific Airports
 */
async function testSpecificAirports() {
  const requiredAirports = ['MDW', 'ATL', 'DAL', 'PHX', 'LAS', 'DEN', 'LAX', 'SEA']

  try {
    const foundAirports = await prisma.airport.findMany({
      where: {
        code: { in: requiredAirports },
        carrier: 'SOUTHWEST_CARGO',
        isActive: true,
      },
      select: { code: true },
    })

    const foundCodes = foundAirports.map((a) => a.code)
    const missingCodes = requiredAirports.filter((code) => !foundCodes.includes(code))

    if (missingCodes.length === 0) {
      results.push({
        test: 'Major Airports Check',
        status: 'PASS',
        message: `All ${requiredAirports.length} major Southwest airports found`,
        details: { found: foundCodes },
      })
    } else {
      results.push({
        test: 'Major Airports Check',
        status: 'FAIL',
        message: `Missing ${missingCodes.length} major airports`,
        details: { missing: missingCodes, found: foundCodes },
      })
    }
  } catch (error: any) {
    results.push({
      test: 'Major Airports Check',
      status: 'FAIL',
      message: `Database query failed: ${error.message}`,
    })
  }
}

/**
 * Test 3: Check Airport Data Structure
 */
async function testAirportDataStructure() {
  try {
    const sampleAirport = await prisma.airport.findFirst({
      where: {
        carrier: 'SOUTHWEST_CARGO',
        isActive: true,
      },
    })

    if (!sampleAirport) {
      results.push({
        test: 'Airport Data Structure',
        status: 'FAIL',
        message: 'No airports found to check structure',
      })
      return
    }

    const requiredFields = ['id', 'code', 'name', 'address', 'city', 'state', 'zip', 'hours']
    const hasAllFields = requiredFields.every((field) => field in sampleAirport)

    if (hasAllFields) {
      results.push({
        test: 'Airport Data Structure',
        status: 'PASS',
        message: 'Airport records have all required fields',
        details: {
          sample: {
            code: sampleAirport.code,
            name: sampleAirport.name,
            city: sampleAirport.city,
            state: sampleAirport.state,
          },
        },
      })
    } else {
      results.push({
        test: 'Airport Data Structure',
        status: 'FAIL',
        message: 'Airport records missing required fields',
        details: { sampleAirport },
      })
    }
  } catch (error: any) {
    results.push({
      test: 'Airport Data Structure',
      status: 'FAIL',
      message: `Database query failed: ${error.message}`,
    })
  }
}

/**
 * Test 4: Check for Hardcoded Locations
 */
async function testForHardcodedLocations() {
  const fs = require('fs')
  const path = require('path')

  try {
    const locationsPagePath = path.join(process.cwd(), 'src/app/(customer)/locations/page.tsx')

    if (!fs.existsSync(locationsPagePath)) {
      results.push({
        test: 'Hardcoded Locations Check',
        status: 'FAIL',
        message: 'Locations page file not found',
      })
      return
    }

    const content = fs.readFileSync(locationsPagePath, 'utf-8')

    // Check for hardcoded airport arrays
    const hasHardcodedSouthwest =
      content.includes('const southwest') ||
      content.includes('const airCargo') ||
      content.match(/const\s+\w+\s*=\s*\[\s*{\s*code:\s*['"]/)

    if (hasHardcodedSouthwest) {
      results.push({
        test: 'Hardcoded Locations Check',
        status: 'WARNING',
        message: 'Locations page may contain hardcoded airport data',
        details: {
          note: 'Check for const arrays with airport objects in locations/page.tsx',
        },
      })
    } else {
      results.push({
        test: 'Hardcoded Locations Check',
        status: 'PASS',
        message: 'No obvious hardcoded airport data found in locations page',
      })
    }
  } catch (error: any) {
    results.push({
      test: 'Hardcoded Locations Check',
      status: 'FAIL',
      message: `File check failed: ${error.message}`,
    })
  }
}

/**
 * Test 5: Check API Route Exists
 */
async function testApiRouteExists() {
  const fs = require('fs')
  const path = require('path')

  try {
    const apiRoutePath = path.join(process.cwd(), 'src/app/api/airports/route.ts')

    if (!fs.existsSync(apiRoutePath)) {
      results.push({
        test: 'API Route Check',
        status: 'FAIL',
        message: 'API route /api/airports/route.ts does not exist',
      })
      return
    }

    const content = fs.readFileSync(apiRoutePath, 'utf-8')

    // Check for proper API implementation
    const hasGetMethod = content.includes('export async function GET')
    const hasPrismaQuery = content.includes('prisma.airport')
    const hasIsActiveFilter = content.includes('isActive: true')

    if (hasGetMethod && hasPrismaQuery && hasIsActiveFilter) {
      results.push({
        test: 'API Route Check',
        status: 'PASS',
        message: 'API route exists and appears correctly implemented',
      })
    } else {
      results.push({
        test: 'API Route Check',
        status: 'WARNING',
        message: 'API route exists but may have implementation issues',
        details: {
          hasGetMethod,
          hasPrismaQuery,
          hasIsActiveFilter,
        },
      })
    }
  } catch (error: any) {
    results.push({
      test: 'API Route Check',
      status: 'FAIL',
      message: `File check failed: ${error.message}`,
    })
  }
}

/**
 * Test 6: Check Locations Page Implementation
 */
async function testLocationsPageImplementation() {
  const fs = require('fs')
  const path = require('path')

  try {
    const locationsPagePath = path.join(process.cwd(), 'src/app/(customer)/locations/page.tsx')

    if (!fs.existsSync(locationsPagePath)) {
      results.push({
        test: 'Locations Page Implementation',
        status: 'FAIL',
        message: 'Locations page file not found',
      })
      return
    }

    const content = fs.readFileSync(locationsPagePath, 'utf-8')

    // Check for proper implementation
    const hasFetchAirports = content.includes('/api/airports')
    const hasUseEffect = content.includes('useEffect')
    const hasSetState = content.includes('setAirCargoLocations')

    if (hasFetchAirports && hasUseEffect && hasSetState) {
      results.push({
        test: 'Locations Page Implementation',
        status: 'PASS',
        message: 'Locations page appears to fetch airports from API',
      })
    } else {
      results.push({
        test: 'Locations Page Implementation',
        status: 'FAIL',
        message: 'Locations page may not be fetching airports properly',
        details: {
          hasFetchAirports,
          hasUseEffect,
          hasSetState,
        },
      })
    }
  } catch (error: any) {
    results.push({
      test: 'Locations Page Implementation',
      status: 'FAIL',
      message: `File check failed: ${error.message}`,
    })
  }
}

/**
 * Analyze results and provide fixes
 */
function analyzeAndProvideFixes() {
  const failedTests = results.filter((r) => r.status === 'FAIL')

  failedTests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.test}`)
    console.log(`   Issue: ${test.message}`)

    if (test.test === 'Database Airport Count') {
      console.log(`   Fix: Run the seed script to add airports to database:`)
      console.log(`   $ npx tsx src/scripts/seed-southwest-airports.ts`)
    } else if (test.test === 'API Route Check') {
      console.log(`   Fix: Check API route implementation at:`)
      console.log(`   src/app/api/airports/route.ts`)
    } else if (test.test === 'Locations Page Implementation') {
      console.log(`   Fix: Check frontend implementation at:`)
      console.log(`   src/app/(customer)/locations/page.tsx`)
      console.log(`   Ensure useEffect is calling fetch('/api/airports')`)
    }

    console.log('')
  })
}

// Run diagnostics
runDiagnostics().catch(console.error)
