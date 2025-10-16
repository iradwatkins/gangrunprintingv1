#!/usr/bin/env node

/**
 * Test script for verifying upload functionality
 * Tests the /api/products/upload-image endpoint
 */

const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

const BASE_URL = 'http://localhost:3002'

// Create a test image file (1MB)
function createTestImage(sizeInMB = 1) {
  const sizeInBytes = sizeInMB * 1024 * 1024
  const buffer = Buffer.alloc(sizeInBytes)

  // PNG header
  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  pngHeader.copy(buffer, 0)

  const testFilePath = `/tmp/test-image-${sizeInMB}mb.png`
  fs.writeFileSync(testFilePath, buffer)
  return testFilePath
}

async function testUpload(fileSizeMB = 1) {
  console.log(`\n📸 Testing upload with ${fileSizeMB}MB file...`)

  try {
    // Create test image
    const testFile = createTestImage(fileSizeMB)
    console.log(`  ✅ Created test file: ${testFile}`)

    // Create form data
    const form = new FormData()
    form.append('file', fs.createReadStream(testFile), {
      filename: `test-${fileSizeMB}mb.png`,
      contentType: 'image/png',
    })

    // Make upload request
    const startTime = Date.now()
    console.log('  🚀 Sending upload request...')

    const response = await fetch(`${BASE_URL}/api/products/upload-image`, {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        Cookie: 'test-session=true', // Add a test session cookie
      },
      // Important: Don't set a short timeout
      signal: AbortSignal.timeout(60000), // 60 second timeout
    })

    const uploadTime = Date.now() - startTime

    console.log(`  📊 Response status: ${response.status}`)
    console.log(`  ⏱️  Upload time: ${uploadTime}ms`)

    if (response.ok) {
      const data = await response.json()
      console.log('  ✅ Upload successful!')
      if (data.data?.url) {
        console.log(`  🔗 URL: ${data.data.url}`)
      }
      return true
    } else {
      const errorText = await response.text()
      console.error(`  ❌ Upload failed: ${errorText}`)
      return false
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('  ❌ Upload timeout (connection closed)')
    } else if (error.code === 'ECONNRESET') {
      console.error('  ❌ Connection reset (ERR_CONNECTION_CLOSED)')
    } else {
      console.error(`  ❌ Error: ${error.message}`)
    }
    return false
  }
}

async function runTests() {
  console.log('🔍 Upload Endpoint Test Suite')
  console.log('='.repeat(50))

  // Test different file sizes
  const testSizes = [0.5, 1, 5, 8] // MB
  const results = []

  for (const size of testSizes) {
    const success = await testUpload(size)
    results.push({ size, success })

    // Wait between tests
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  // Summary
  console.log('\n📊 Test Summary:')
  console.log('='.repeat(50))
  results.forEach((r) => {
    const status = r.success ? '✅ PASS' : '❌ FAIL'
    console.log(`  ${r.size}MB: ${status}`)
  })

  const allPassed = results.every((r) => r.success)
  if (allPassed) {
    console.log('\n✅ All upload tests passed!')
  } else {
    console.log('\n❌ Some upload tests failed. Check configuration.')
  }
}

// Run tests
runTests().catch(console.error)
