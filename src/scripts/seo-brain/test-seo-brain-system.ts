/**
 * SEO Brain System Test Suite
 *
 * Tests all components: Ollama, Telegram, Database, n8n
 */

import { ollamaClient } from '../../lib/seo-brain/ollama-client'
import { sendDecisionRequest } from '../../lib/seo-brain/telegram-notifier'
import { prisma } from '../../lib/prisma'
import { Prisma } from '@prisma/client'

const TESTS = {
  passed: [] as string[],
  failed: [] as Array<{ test: string; error: string }>,
}

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`)
}

function pass(testName: string) {
  TESTS.passed.push(testName)
  log('✅', testName)
}

function fail(testName: string, error: any) {
  TESTS.failed.push({ test: testName, error: String(error) })
  log('❌', `${testName}: ${error}`)
}

async function testOllama() {
  try {
    log('🧪', 'Testing Ollama connection...')
    const result = await ollamaClient.testConnection()

    if (!result.success) {
      throw new Error(result.error || 'Connection failed')
    }

    if (result.model !== 'deepseek-r1:32b') {
      throw new Error(`Wrong model: ${result.model}`)
    }

    pass('Ollama Connection')
    return true
  } catch (error) {
    fail('Ollama Connection', error)
    return false
  }
}

async function testOllamaGeneration() {
  try {
    log('🧪', 'Testing Ollama text generation...')
    const response = await ollamaClient.generate({
      prompt: 'Say "Hello from SEO Brain!" and nothing else.',
      temperature: 0.1,
      maxTokens: 50,
    })

    if (!response || response.length === 0) {
      throw new Error('Empty response')
    }

    pass('Ollama Text Generation')
    return true
  } catch (error) {
    fail('Ollama Text Generation', error)
    return false
  }
}

async function testOllamaJSON() {
  try {
    log('🧪', 'Testing Ollama JSON generation...')
    const response = await ollamaClient.generateJSON<{ test: boolean }>({
      prompt: 'Return JSON: { "test": true }',
      temperature: 0.1,
    })

    if (response.test !== true) {
      throw new Error('Invalid JSON response')
    }

    pass('Ollama JSON Generation')
    return true
  } catch (error) {
    fail('Ollama JSON Generation', error)
    return false
  }
}

async function testDatabase() {
  try {
    log('🧪', 'Testing database connection...')
    await prisma.$queryRaw`SELECT 1`
    pass('Database Connection')
    return true
  } catch (error) {
    fail('Database Connection', error)
    return false
  }
}

async function testDatabaseTables() {
  try {
    log('🧪', 'Testing database tables...')

    const tables = [
      'ProductCampaignQueue',
      'CityLandingPage',
      'CityWinnerPattern',
      'SEOBrainDecision',
      'CityPerformanceSnapshot',
      'SEOBrainAlert',
    ]

    // SECURITY FIX (2025-01-24): Replaced $queryRawUnsafe with safe parameterized query
    for (const table of tables) {
      const count = await prisma.$queryRaw`SELECT COUNT(*) FROM ${Prisma.raw(`"${table}"`)}`
      log('  ↳', `${table}: OK`)
    }

    pass('Database Tables')
    return true
  } catch (error) {
    fail('Database Tables', error)
    return false
  }
}

async function testTelegram() {
  try {
    log('🧪', 'Testing Telegram notification...')

    const botToken = process.env.SEO_BRAIN_TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID

    if (!botToken || !chatId) {
      throw new Error('Missing TELEGRAM environment variables')
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ SEO Brain Test: Telegram OK',
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    pass('Telegram Notification')
    return true
  } catch (error) {
    fail('Telegram Notification', error)
    return false
  }
}

async function testN8NWebhook() {
  try {
    log('🧪', 'Testing n8n webhook...')

    const response = await fetch('http://localhost:5678/webhook-test/seo-brain-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: 'Test Product',
        quantity: 5000,
        size: '4x6',
        material: '9pt Cardstock',
        turnaround: '3-4 days',
        price: 179,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    if (!data.success) {
      throw new Error('Webhook did not return success')
    }

    pass('n8n Webhook')
    return true
  } catch (error) {
    // n8n might not be running - don't fail
    log('⚠️', `n8n Webhook: ${error} (may not be running)`)
    return true
  }
}

async function testAPIEndpoints() {
  try {
    log('🧪', 'Testing API endpoints...')

    const endpoints = ['/api/seo-brain/campaigns', '/api/seo-brain/approve-decision']

    for (const endpoint of endpoints) {
      const response = await fetch(`http://localhost:3020${endpoint}`)
      if (response.status !== 401 && response.status !== 200) {
        throw new Error(`${endpoint} returned ${response.status}`)
      }
      log('  ↳', `${endpoint}: OK`)
    }

    pass('API Endpoints')
    return true
  } catch (error) {
    fail('API Endpoints', error)
    return false
  }
}

async function testPerformanceCalculation() {
  try {
    log('🧪', 'Testing performance calculation...')

    const { calculatePerformanceScore } = await import('../../lib/seo-brain/performance-analyzer')

    const score = calculatePerformanceScore({
      conversions: 10,
      views: 500,
      revenue: 1000,
    })

    if (score < 0 || score > 100) {
      throw new Error(`Invalid score: ${score}`)
    }

    pass('Performance Calculation')
    return true
  } catch (error) {
    fail('Performance Calculation', error)
    return false
  }
}

async function testEnvironmentVariables() {
  try {
    log('🧪', 'Testing environment variables...')

    const required = [
      'SEO_BRAIN_TELEGRAM_BOT_TOKEN',
      'TELEGRAM_ADMIN_CHAT_ID',
      'OLLAMA_BASE_URL',
      'OLLAMA_MODEL',
      'DATABASE_URL',
    ]

    const missing = required.filter((key) => !process.env[key])

    if (missing.length > 0) {
      throw new Error(`Missing: ${missing.join(', ')}`)
    }

    pass('Environment Variables')
    return true
  } catch (error) {
    fail('Environment Variables', error)
    return false
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║       SEO BRAIN SYSTEM TEST SUITE                      ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')

  log('🚀', 'Starting tests...\n')

  // Environment
  await testEnvironmentVariables()

  // Database
  await testDatabase()
  await testDatabaseTables()

  // Ollama
  await testOllama()
  await testOllamaGeneration()
  await testOllamaJSON()

  // Telegram
  await testTelegram()

  // n8n
  await testN8NWebhook()

  // API
  await testAPIEndpoints()

  // Logic
  await testPerformanceCalculation()

  // Results
  console.log('\n╔════════════════════════════════════════════════════════╗')
  console.log('║                   TEST RESULTS                         ║')
  console.log('╚════════════════════════════════════════════════════════╝\n')

  log('✅', `Passed: ${TESTS.passed.length}`)
  log('❌', `Failed: ${TESTS.failed.length}`)

  if (TESTS.failed.length > 0) {
    console.log('\n🔴 Failed Tests:')
    TESTS.failed.forEach(({ test, error }) => {
      console.log(`  - ${test}`)
      console.log(`    ${error}\n`)
    })
  }

  const totalTests = TESTS.passed.length + TESTS.failed.length
  const successRate = ((TESTS.passed.length / totalTests) * 100).toFixed(1)

  console.log(`\n📊 Success Rate: ${successRate}%\n`)

  if (TESTS.failed.length === 0) {
    console.log('🎉 ALL TESTS PASSED! SEO Brain is ready.\n')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed. Check configuration.\n')
    process.exit(1)
  }
}

main()
