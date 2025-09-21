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
            sides: 'Double',
          },
        },
        {
          productName: 'Flyers',
          quantity: 500,
          price: 150.0,
          options: {
            size: '8.5" x 11"',
            paperStock: '100lb Gloss',
            coating: 'Aqueous',
            sides: 'Double',
          },
        },
      ],
      status: 'PENDING_PAYMENT',
      createdAt: new Date().toISOString(),
    },
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
      receivedAt: new Date().toISOString(),
    },
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
      updatedAt: new Date().toISOString(),
    },
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
      uploadedAt: new Date().toISOString(),
    },
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
      assignedAt: new Date().toISOString(),
    },
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
      shippedAt: new Date().toISOString(),
    },
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
      alertedAt: new Date().toISOString(),
    },
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
      issues: [{ orderId: 'issue-001', type: 'file_missing', severity: 'medium' }],
      generatedAt: new Date().toISOString(),
    },
  },
]

// Send webhook
async function sendWebhook(event: TestEvent): Promise<boolean> {
  try {
    const payload = {
      event: event.event,
      data: event.data,
      timestamp: new Date().toISOString(),
      source: 'gangrunprinting-test',
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(N8N_API_KEY && { 'X-N8N-API-Key': N8N_API_KEY }),
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const result = await response.text()

      if (result) {
        try {
          const json = JSON.parse(result)

        } catch {

        }
      }
      return true
    } else {

      const error = await response.text()
      if (error) {

      }
      return false
    }
  } catch (error: any) {

    return false
  }
}

// Test connection
async function testConnection(): Promise<boolean> {

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'GET',
    })

    if (response.status === 404) {

      return true
    } else if (response.status === 405) {

      return true
    } else if (response.ok) {

      return true
    } else {

      return false
    }
  } catch (error: any) {

    return false
  }
}

// Main execution
async function main() {

  // Test connection first
  const connected = await testConnection()

  if (!connected) {

    process.exit(1)
  }

  const results: { name: string; success: boolean }[] = []

  for (const event of testEvents) {
    const success = await sendWebhook(event)
    results.push({ name: event.name, success })

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  // Summary

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  if (failed > 0) {

    results
      .filter((r) => !r.success)
      .forEach((r) => {

      })

  } else {

  }

  // Test payload example

  if (N8N_API_KEY) {

  }
  console.log(
    `  -d '${JSON.stringify(
      {
        event: 'order.created',
        data: {
          orderNumber: 'TEST-001',
          customerEmail: 'test@example.com',
          total: 99.99,
        },
        timestamp: new Date().toISOString(),
        source: 'gangrunprinting',
      },
      null,
      2
    )}'`
  )
}

// Run tests
main().catch((error) => {
  console.error(`\n${RED}Fatal error:${RESET}`, error)
  process.exit(1)
})
