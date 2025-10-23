/**
 * Enhanced Product Activity Monitor
 * Monitors Docker logs, analyzes patterns, and provides detailed diagnostics
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Configuration
const LOG_FILE = `product-activity-detailed-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
const ANALYSIS_FILE = `product-activity-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`

// Activity tracking
const activity = {
  startTime: new Date().toISOString(),
  events: [],
  apiCalls: [],
  errors: [],
  imageUploads: [],
  authEvents: [],
  databaseOps: [],
  summary: {
    totalEvents: 0,
    totalApiCalls: 0,
    totalErrors: 0,
    totalImageUploads: 0,
    productCreationAttempts: 0,
    productCreationSuccesses: 0,
    productCreationFailures: 0,
    imageUploadAttempts: 0,
    imageUploadSuccesses: 0,
    imageUploadFailures: 0,
  },
}

// Log to file with timestamp
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] [${type}] ${message}`
  console.log(logEntry)
  fs.appendFileSync(LOG_FILE, logEntry + '\n')
}

// Parse and categorize log lines
function parseLogLine(line) {
  const timestamp = new Date().toISOString()
  const event = { timestamp, raw: line, type: 'unknown', parsed: {} }

  // API Request patterns
  if (line.match(/POST.*\/api\/products(?!\/)/)) {
    event.type = 'api_product_create'
    event.parsed = { method: 'POST', endpoint: '/api/products' }
    activity.summary.productCreationAttempts++
    activity.apiCalls.push(event)
  } else if (line.match(/PUT.*\/api\/products\/[a-zA-Z0-9-]+$/)) {
    event.type = 'api_product_update'
    const match = line.match(/\/api\/products\/([a-zA-Z0-9-]+)/)
    event.parsed = { method: 'PUT', endpoint: '/api/products', productId: match ? match[1] : null }
    activity.apiCalls.push(event)
  } else if (line.match(/DELETE.*\/api\/products\/[a-zA-Z0-9-]+$/)) {
    event.type = 'api_product_delete'
    const match = line.match(/\/api\/products\/([a-zA-Z0-9-]+)/)
    event.parsed = {
      method: 'DELETE',
      endpoint: '/api/products',
      productId: match ? match[1] : null,
    }
    activity.apiCalls.push(event)
  } else if (line.match(/POST.*\/api\/products\/upload-image/)) {
    event.type = 'api_image_upload'
    event.parsed = { method: 'POST', endpoint: '/api/products/upload-image' }
    activity.summary.imageUploadAttempts++
    activity.imageUploads.push(event)
  }

  // Authentication patterns
  else if (line.match(/auth|session|cookie/i)) {
    event.type = 'auth_event'

    if (line.match(/No session ID found/)) {
      event.parsed.issue = 'missing_session_cookie'
      activity.errors.push({ ...event, error: 'Missing session cookie' })
    } else if (line.match(/Unauthorized|Admin access required/)) {
      event.parsed.issue = 'unauthorized'
      activity.errors.push({ ...event, error: 'Unauthorized access' })
    } else if (line.match(/session.*validated|authenticated/i)) {
      event.parsed.status = 'authenticated'
    }

    activity.authEvents.push(event)
  }

  // Success patterns
  else if (line.match(/Product.*created successfully|status.*20[01]/i)) {
    event.type = 'success'

    if (line.match(/Product.*created/i)) {
      event.parsed.operation = 'product_creation'
      activity.summary.productCreationSuccesses++
    } else if (line.match(/image.*upload/i)) {
      event.parsed.operation = 'image_upload'
      activity.summary.imageUploadSuccesses++
    }
  }

  // Error patterns
  else if (line.match(/error|failed|exception/i)) {
    event.type = 'error'

    // Extract error details
    const errorMatch = line.match(/error[:\s]+([^,\n]+)/i)
    event.parsed.message = errorMatch ? errorMatch[1].trim() : line.substring(0, 200)

    // Categorize errors
    if (line.match(/ECONNREFUSED|ETIMEDOUT/)) {
      event.parsed.category = 'network_error'
    } else if (line.match(/Prisma|Database/i)) {
      event.parsed.category = 'database_error'
    } else if (line.match(/MinIO|S3/i)) {
      event.parsed.category = 'storage_error'
    } else if (line.match(/auth|session|unauthorized/i)) {
      event.parsed.category = 'auth_error'
    } else if (line.match(/validation|invalid/i)) {
      event.parsed.category = 'validation_error'
    } else {
      event.parsed.category = 'unknown_error'
    }

    activity.errors.push(event)
    activity.summary.totalErrors++

    // Check if it's a product creation failure
    if (line.match(/product/i) && line.match(/create|save/i)) {
      activity.summary.productCreationFailures++
    }
    // Check if it's an image upload failure
    else if (line.match(/image|upload/i)) {
      activity.summary.imageUploadFailures++
    }
  }

  // Database operations
  else if (line.match(/prisma|sql|database/i)) {
    event.type = 'database_operation'

    if (line.match(/insert|create/i)) {
      event.parsed.operation = 'insert'
    } else if (line.match(/update/i)) {
      event.parsed.operation = 'update'
    } else if (line.match(/delete/i)) {
      event.parsed.operation = 'delete'
    } else if (line.match(/select|find/i)) {
      event.parsed.operation = 'query'
    }

    activity.databaseOps.push(event)
  }

  // MinIO/Storage operations
  else if (line.match(/minio|s3|bucket|storage/i)) {
    event.type = 'storage_operation'

    if (line.match(/upload/i)) {
      event.parsed.operation = 'upload'
    } else if (line.match(/delete/i)) {
      event.parsed.operation = 'delete'
    }
  }

  activity.events.push(event)
  activity.summary.totalEvents++

  return event
}

// Analyze and report findings
function generateReport() {
  log('\n========================================', 'REPORT')
  log('📊 ACTIVITY SUMMARY', 'REPORT')
  log('========================================', 'REPORT')
  log(`Total Events Captured: ${activity.summary.totalEvents}`, 'REPORT')
  log(`Total API Calls: ${activity.apiCalls.length}`, 'REPORT')
  log(`Total Errors: ${activity.summary.totalErrors}`, 'REPORT')
  log('', 'REPORT')

  log('🔨 PRODUCT CREATION:', 'REPORT')
  log(`  Attempts: ${activity.summary.productCreationAttempts}`, 'REPORT')
  log(`  Successes: ${activity.summary.productCreationSuccesses}`, 'REPORT')
  log(`  Failures: ${activity.summary.productCreationFailures}`, 'REPORT')
  log('', 'REPORT')

  log('🖼️  IMAGE UPLOADS:', 'REPORT')
  log(`  Attempts: ${activity.summary.imageUploadAttempts}`, 'REPORT')
  log(`  Successes: ${activity.summary.imageUploadSuccesses}`, 'REPORT')
  log(`  Failures: ${activity.summary.imageUploadFailures}`, 'REPORT')
  log('', 'REPORT')

  if (activity.errors.length > 0) {
    log('❌ ERRORS DETECTED:', 'REPORT')

    // Group errors by category
    const errorsByCategory = {}
    activity.errors.forEach((err) => {
      const category = err.parsed?.category || 'uncategorized'
      if (!errorsByCategory[category]) {
        errorsByCategory[category] = []
      }
      errorsByCategory[category].push(err)
    })

    Object.keys(errorsByCategory).forEach((category) => {
      log(`  ${category}: ${errorsByCategory[category].length} occurrence(s)`, 'REPORT')
      errorsByCategory[category].slice(0, 3).forEach((err) => {
        log(`    - ${err.parsed?.message || err.raw.substring(0, 100)}`, 'REPORT')
      })
    })
    log('', 'REPORT')
  }

  if (activity.authEvents.length > 0) {
    log('🔐 AUTHENTICATION EVENTS:', 'REPORT')
    const authIssues = activity.authEvents.filter((e) => e.parsed?.issue)
    if (authIssues.length > 0) {
      log(`  ⚠️  Issues detected: ${authIssues.length}`, 'REPORT')
      authIssues.forEach((issue) => {
        log(`    - ${issue.parsed.issue}`, 'REPORT')
      })
    } else {
      log(`  ✅ No authentication issues detected`, 'REPORT')
    }
    log('', 'REPORT')
  }

  log('========================================', 'REPORT')
  log('💾 Full analysis saved to: ' + ANALYSIS_FILE, 'REPORT')
  log('========================================', 'REPORT')

  // Save detailed analysis to JSON
  fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(activity, null, 2))
}

// Main monitoring function
function startMonitoring() {
  console.log('==========================================')
  console.log('🔍 Enhanced Product Activity Monitor')
  console.log('==========================================')
  console.log('')
  console.log('This script will monitor and analyze:')
  console.log('  ✓ Product creation/update/delete operations')
  console.log('  ✓ Image upload attempts and results')
  console.log('  ✓ Authentication and session activity')
  console.log('  ✓ Database operations')
  console.log('  ✓ Error patterns and diagnostics')
  console.log('')
  console.log(`📝 Logs: ${LOG_FILE}`)
  console.log(`📊 Analysis: ${ANALYSIS_FILE}`)
  console.log('')
  console.log('✅ Monitoring started. Perform your actions now...')
  console.log('   (Create product, upload images, save, etc.)')
  console.log('')
  console.log('Press Ctrl+C to stop and view report')
  console.log('==========================================')
  console.log('')

  log('=== MONITORING STARTED ===')
  log('Waiting for activity...')
  log('')

  // Spawn Docker logs process
  const dockerLogs = spawn('docker', ['logs', '-f', '--tail=0', 'gangrunprinting_app'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  // Process stdout
  dockerLogs.stdout.on('data', (data) => {
    const lines = data.toString().split('\n')
    lines.forEach((line) => {
      if (line.trim()) {
        const event = parseLogLine(line)

        // Log important events to console
        if (event.type !== 'unknown') {
          const emoji =
            {
              api_product_create: '🔨',
              api_product_update: '✏️',
              api_product_delete: '🗑️',
              api_image_upload: '🖼️',
              auth_event: '🔐',
              error: '❌',
              success: '✅',
              database_operation: '💾',
              storage_operation: '📦',
            }[event.type] || 'ℹ️'

          log(`${emoji} [${event.type}] ${line.substring(0, 150)}`, event.type)
        }
      }
    })
  })

  // Process stderr
  dockerLogs.stderr.on('data', (data) => {
    const lines = data.toString().split('\n')
    lines.forEach((line) => {
      if (line.trim()) {
        parseLogLine(line)
        log(`⚠️  [STDERR] ${line.substring(0, 150)}`, 'stderr')
      }
    })
  })

  // Handle process exit
  dockerLogs.on('close', (code) => {
    log(`Docker logs process exited with code ${code}`)
    generateReport()
  })

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    log('\n=== MONITORING STOPPED ===')
    dockerLogs.kill()
    setTimeout(() => {
      generateReport()
      process.exit(0)
    }, 1000)
  })
}

// Start monitoring
startMonitoring()
