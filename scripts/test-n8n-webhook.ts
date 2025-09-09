#!/usr/bin/env npx tsx

/**
 * N8N Webhook Testing Script
 * Tests all webhook events for GangRun Printing
 */

import { config } from 'dotenv'
config()

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.agistaffers.com/webhook/gangrun'
const N8N_API_KEY = process.env.N8N_API_KEY || ''

// Colors for output
const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RESET = '\x1b[0m'

interface TestEvent {
  name: string
  event: string
  data: any
}

// Test events
const testEvents: TestEvent[] = [
  {
    name: 'Order Created',
    event: 'order.created',
    data: {
      orderId: 'test-001',
      orderNumber: 'GRP-TEST-001',
      customerEmail: 'test@example.com',
      total: 299.99,
      items: [
        {
          productName: 'Business Cards - Premium',
          quantity: 1000,
          price: 149.99,
          options: {
            size: '3.5" x 2"',
            paperStock: '16pt Silk',
            coating: 'UV Coating',
            sides: 'Double'
          }
        },
        {
          productName: 'Flyers',
          quantity: 500,
          price: 150.00,
          options: {
            size: '8.5" x 11"',
            paperStock: '100lb Gloss',
            coating: 'Aqueous',
            sides: 'Double'
          }
        }
      ],
      status: 'PENDING_PAYMENT',
      createdAt: new Date().toISOString()
    }
  },
  {
    name: 'Payment Received',
    event: 'payment.received',
    data: {
      orderId: 'test-001',
      orderNumber: 'GRP-TEST-001',
      amount: 299.99,
      paymentMethod: 'card',
      transactionId: 'sq_trans_123456789',
      customerEmail: 'test@example.com',
      receivedAt: new Date().toISOString()
    }
  },
  {
    name: 'Order Status Changed',
    event: 'order.status_changed',
    data: {
      orderId: 'test-001',
      orderNumber: 'GRP-TEST-001',
      previousStatus: 'PENDING_PAYMENT',
      newStatus: 'PAID',
      customerEmail: 'test@example.com',
      updatedAt: new Date().toISOString()
    }
  },
  {
    name: 'File Uploaded',
    event: 'file.uploaded',
    data: {
      orderId: 'test-001',
      orderNumber: 'GRP-TEST-001',
      fileName: 'business-cards-design.pdf',
      fileSize: 2548576,
      fileType: 'application/pdf',
      uploadedBy: 'test@example.com',
      uploadedAt: new Date().toISOString()
    }
  },
  {
    name: 'Vendor Assigned',
    event: 'vendor.assigned',
    data: {
      orderId: 'test-001',
      orderNumber: 'GRP-TEST-001',
      vendorId: 'vendor-001',
      vendorName: 'Premium Print Co',
      vendorEmail: 'orders@premiumprint.com',
      assignedAt: new Date().toISOString()
    }
  },
  {
    name: 'Order Shipped',
    event: 'order.shipped',
    data: {
      orderId: 'test-001',
      orderNumber: 'GRP-TEST-001',
      trackingNumber: '1Z999AA10123456784',
      carrier: 'UPS',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      customerEmail: 'test@example.com',
      shippedAt: new Date().toISOString()
    }
  },
  {
    name: 'Low Stock Alert',
    event: 'inventory.low_stock',
    data: {
      productId: 'prod-001',
      productName: '16pt Silk Business Cards',
      currentStock: 5,
      minimumStock: 10,
      sku: 'BC-16PT-SILK',
      alertedAt: new Date().toISOString()
    }
  },
  {
    name: 'Daily Report',
    event: 'report.daily',
    data: {
      date: new Date().toISOString().split('T')[0],
      ordersCreated: 15,
      ordersCompleted: 12,
      totalRevenue: 4567.89,
      pendingOrders: 8,
      issues: [
        { orderId: 'issue-001', type: 'file_missing', severity: 'medium' }
      ],
      generatedAt: new Date().toISOString()
    }
  }
]

// Send webhook
async function sendWebhook(event: TestEvent): Promise<boolean> {
  try {
    const payload = {
      event: event.event,
      data: event.data,
      timestamp: new Date().toISOString(),
      source: 'gangrunprinting-test'
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'X-N8N-API-Key': N8N_API_KEY })
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      const result = await response.text()
      console.log(`${GREEN}✓${RESET} ${event.name}`)
      console.log(`  └─ Response: ${response.status} ${response.statusText}`)
      if (result) {
        try {
          const json = JSON.parse(result)
          console.log(`  └─ Data: ${JSON.stringify(json).substring(0, 100)}...`)
        } catch {
          console.log(`  └─ Data: ${result.substring(0, 100)}...`)
        }
      }
      return true
    } else {
      console.log(`${RED}✗${RESET} ${event.name}`)
      console.log(`  └─ Error: ${response.status} ${response.statusText}`)
      const error = await response.text()
      if (error) {
        console.log(`  └─ Details: ${error.substring(0, 200)}`)
      }
      return false
    }
  } catch (error: any) {
    console.log(`${RED}✗${RESET} ${event.name}`)
    console.log(`  └─ Error: ${error.message}`)
    return false
  }
}

// Test connection
async function testConnection(): Promise<boolean> {
  console.log(`\n${BLUE}Testing N8N Connection...${RESET}`)
  console.log(`URL: ${N8N_WEBHOOK_URL}`)
  
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'GET'
    })
    
    if (response.status === 404) {
      console.log(`${YELLOW}⚠${RESET} Webhook endpoint not found (404)`)
      console.log('  └─ This is expected if the webhook only accepts POST requests')
      return true
    } else if (response.status === 405) {
      console.log(`${GREEN}✓${RESET} Webhook endpoint exists (Method not allowed for GET)`)
      return true
    } else if (response.ok) {
      console.log(`${GREEN}✓${RESET} Webhook endpoint is accessible`)
      return true
    } else {
      console.log(`${RED}✗${RESET} Unexpected response: ${response.status}`)
      return false
    }
  } catch (error: any) {
    console.log(`${RED}✗${RESET} Connection failed: ${error.message}`)
    return false
  }
}

// Main execution
async function main() {
  console.log('\n================================================')
  console.log('  N8N Webhook Testing - GangRun Printing')
  console.log('================================================')

  // Test connection first
  const connected = await testConnection()
  
  if (!connected) {
    console.log(`\n${RED}Cannot connect to N8N webhook. Please check:${RESET}`)
    console.log('1. N8N workflow is active')
    console.log('2. Webhook URL is correct')
    console.log('3. N8N is accessible')
    process.exit(1)
  }

  console.log(`\n${BLUE}Sending Test Events...${RESET}`)
  console.log('================================================\n')

  const results: { name: string; success: boolean }[] = []
  
  for (const event of testEvents) {
    const success = await sendWebhook(event)
    results.push({ name: event.name, success })
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Summary
  console.log('\n================================================')
  console.log('  Test Summary')
  console.log('================================================')
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`\n  Total: ${results.length}`)
  console.log(`  ${GREEN}Successful: ${successful}${RESET}`)
  console.log(`  ${RED}Failed: ${failed}${RESET}`)

  if (failed > 0) {
    console.log('\n  Failed Events:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ${RED}✗ ${r.name}${RESET}`)
    })
    
    console.log(`\n${YELLOW}Note:${RESET} If all events failed with 404, the webhook may not be configured in N8N yet.`)
    console.log('Follow the setup instructions in n8n/README.md')
  } else {
    console.log(`\n${GREEN}✓ All webhook events sent successfully!${RESET}`)
  }

  // Test payload example
  console.log('\n================================================')
  console.log('  Example CURL Command')
  console.log('================================================\n')
  console.log(`curl -X POST ${N8N_WEBHOOK_URL} \\`)
  console.log(`  -H "Content-Type: application/json" \\`)
  if (N8N_API_KEY) {
    console.log(`  -H "X-N8N-API-Key: ${N8N_API_KEY}" \\`)
  }
  console.log(`  -d '${JSON.stringify({
    event: 'order.created',
    data: {
      orderNumber: 'TEST-001',
      customerEmail: 'test@example.com',
      total: 99.99
    },
    timestamp: new Date().toISOString(),
    source: 'gangrunprinting'
  }, null, 2)}'`)
}

// Run tests
main().catch(error => {
  console.error(`\n${RED}Fatal error:${RESET}`, error)
  process.exit(1)
})