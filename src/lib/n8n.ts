import { prisma } from '@/lib/prisma'
import { SERVICE_ENDPOINTS } from '@/config/constants'

const N8N_BASE_URL = SERVICE_ENDPOINTS.N8N_WEBHOOK
const N8N_API_KEY = process.env.N8N_API_KEY || ''

interface N8NWebhookPayload {
  event: string
  data: any
  timestamp: string
  source: string
}

interface N8NResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
}

export class N8NClient {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || N8N_BASE_URL
    this.apiKey = apiKey || N8N_API_KEY
  }

  // Send webhook to N8N
  async sendWebhook(event: string, data: any): Promise<N8NResponse> {
    try {
      const payload: N8NWebhookPayload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        source: 'gangrunprinting',
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-N8N-API-Key': this.apiKey }),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Trigger order created workflow
  async triggerOrderCreated(order: any) {
    return this.sendWebhook('order.created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.email,
      total: order.total / 100,
      items: order.OrderItem?.map((item: any) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price / 100,
        options: item.options,
      })),
      status: order.status,
      createdAt: order.createdAt,
    })
  }

  // Trigger order status update workflow
  async triggerOrderStatusUpdate(order: any, previousStatus: string) {
    return this.sendWebhook('order.status_changed', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      previousStatus,
      newStatus: order.status,
      customerEmail: order.email,
      updatedAt: new Date().toISOString(),
    })
  }

  // Trigger payment received workflow
  async triggerPaymentReceived(order: any, paymentDetails: any) {
    return this.sendWebhook('payment.received', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total / 100,
      paymentMethod: paymentDetails.method || 'card',
      transactionId: paymentDetails.transactionId,
      customerEmail: order.email,
      receivedAt: new Date().toISOString(),
    })
  }

  // Trigger order shipped workflow
  async triggerOrderShipped(order: any, trackingInfo: any) {
    return this.sendWebhook('order.shipped', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      trackingNumber: trackingInfo.trackingNumber,
      carrier: trackingInfo.carrier,
      estimatedDelivery: trackingInfo.estimatedDelivery,
      customerEmail: order.email,
      shippedAt: new Date().toISOString(),
    })
  }

  // Trigger file uploaded workflow
  async triggerFileUploaded(order: any, fileInfo: any) {
    return this.sendWebhook('file.uploaded', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      fileType: fileInfo.type,
      uploadedBy: fileInfo.uploadedBy || order.email,
      uploadedAt: new Date().toISOString(),
    })
  }

  // Trigger order issue detected workflow
  async triggerOrderIssue(order: any, issue: any) {
    return this.sendWebhook('order.issue_detected', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      issueType: issue.type,
      issueDescription: issue.description,
      severity: issue.severity || 'medium',
      customerEmail: order.email,
      detectedAt: new Date().toISOString(),
    })
  }

  // Trigger vendor assignment workflow
  async triggerVendorAssignment(order: any, vendor: any) {
    return this.sendWebhook('vendor.assigned', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      assignedAt: new Date().toISOString(),
    })
  }

  // Trigger customer notification workflow
  async triggerCustomerNotification(order: any, notification: any) {
    return this.sendWebhook('notification.send', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      notificationType: notification.type,
      recipient: order.email,
      subject: notification.subject,
      scheduledAt: new Date().toISOString(),
    })
  }

  // Trigger daily report workflow
  async triggerDailyReport(reportData: any) {
    return this.sendWebhook('report.daily', {
      date: new Date().toISOString().split('T')[0],
      ordersCreated: reportData.ordersCreated,
      ordersCompleted: reportData.ordersCompleted,
      totalRevenue: reportData.totalRevenue,
      pendingOrders: reportData.pendingOrders,
      issues: reportData.issues,
      generatedAt: new Date().toISOString(),
    })
  }

  // Trigger inventory alert workflow
  async triggerInventoryAlert(product: any, currentStock: number) {
    return this.sendWebhook('inventory.low_stock', {
      productId: product.id,
      productName: product.name,
      currentStock,
      minimumStock: product.minimumStock || 10,
      sku: product.sku,
      alertedAt: new Date().toISOString(),
    })
  }
}

// Default N8N client instance
export const n8nClient = new N8NClient()

// Workflow trigger functions
export const N8NWorkflows = {
  // Order lifecycle workflows
  async onOrderCreated(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { OrderItem: true },
    })
    if (order) {
      await n8nClient.triggerOrderCreated(order)
    }
  },

  async onOrderStatusChanged(orderId: string, previousStatus: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (order) {
      await n8nClient.triggerOrderStatusUpdate(order, previousStatus)
    }
  },

  async onPaymentReceived(orderId: string, paymentDetails: any) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (order) {
      await n8nClient.triggerPaymentReceived(order, paymentDetails)
    }
  },

  async onOrderShipped(orderId: string, trackingInfo: any) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (order) {
      await n8nClient.triggerOrderShipped(order, trackingInfo)
    }
  },

  // File management workflows
  async onFileUploaded(orderId: string, fileInfo: any) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (order) {
      await n8nClient.triggerFileUploaded(order, fileInfo)
    }
  },

  // Issue management workflows
  async onIssueDetected(orderId: string, issue: any) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (order) {
      await n8nClient.triggerOrderIssue(order, issue)
    }
  },

  // Vendor management workflows
  async onVendorAssigned(orderId: string, vendorId: string) {
    const [order, vendor] = await Promise.all([
      prisma.order.findUnique({ where: { id: orderId } }),
      prisma.vendor.findUnique({ where: { id: vendorId } }),
    ])
    if (order && vendor) {
      await n8nClient.triggerVendorAssignment(order, vendor)
    }
  },

  // Notification workflows
  async sendCustomerNotification(orderId: string, notification: any) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })
    if (order) {
      await n8nClient.triggerCustomerNotification(order, notification)
    }
  },

  // Reporting workflows
  async generateDailyReport() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [ordersCreated, ordersCompleted, orders] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.order.count({
        where: {
          status: 'DELIVERED',
          updatedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ])

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0) / 100

    const pendingOrders = await prisma.order.count({
      where: {
        status: {
          in: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PRINTING'],
        },
      },
    })

    await n8nClient.triggerDailyReport({
      ordersCreated,
      ordersCompleted,
      totalRevenue,
      pendingOrders,
      issues: [],
    })
  },
}
