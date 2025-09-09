import sgMail from '@sendgrid/mail'
import { prisma } from '@/lib/prisma'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@gangrunprinting.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'GangRun Printing'

// Email templates
const templates = {
  orderConfirmation: (data: any) => ({
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
          <h1>GangRun Printing</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Thank you for your order!</h2>
          <p>Hi ${data.customerName || 'Valued Customer'},</p>
          <p>We've received your order and will begin processing it shortly.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Total:</strong> $${data.total.toFixed(2)}</p>
            <p><strong>Status:</strong> ${data.status}</p>
          </div>
          
          <h3>Order Items</h3>
          <ul>
            ${data.items.map((item: any) => `
              <li>${item.productName} - Qty: ${item.quantity} - $${item.price.toFixed(2)}</li>
            `).join('')}
          </ul>
          
          <p>You can track your order status at any time by visiting:</p>
          <p><a href="${process.env.NEXTAUTH_URL}/track?order=${data.orderNumber}" style="color: #0066cc;">Track Your Order</a></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            If you have any questions, please contact us at support@gangrunprinting.com
          </p>
        </div>
      </div>
    `,
    text: `
      Order Confirmation - ${data.orderNumber}
      
      Thank you for your order!
      
      Order Number: ${data.orderNumber}
      Total: $${data.total.toFixed(2)}
      Status: ${data.status}
      
      Track your order: ${process.env.NEXTAUTH_URL}/track?order=${data.orderNumber}
    `
  }),

  paymentReceived: (data: any) => ({
    subject: `Payment Received - Order ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
          <h1>GangRun Printing</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Payment Received!</h2>
          <p>We've successfully received your payment for order ${data.orderNumber}.</p>
          
          <div style="background-color: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4caf50;">
            <p><strong>Amount Paid:</strong> $${data.amount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod || 'Credit Card'}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId || 'N/A'}</p>
          </div>
          
          <p>Your order is now being processed and will move to production shortly.</p>
          
          <p><a href="${process.env.NEXTAUTH_URL}/track?order=${data.orderNumber}" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Track Order</a></p>
        </div>
      </div>
    `,
    text: `Payment received for order ${data.orderNumber}. Amount: $${data.amount.toFixed(2)}`
  }),

  orderShipped: (data: any) => ({
    subject: `Your Order Has Shipped! - ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
          <h1>GangRun Printing</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Your order is on its way!</h2>
          <p>Great news! Your order ${data.orderNumber} has been shipped.</p>
          
          <div style="background-color: #fff3e0; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ff9800;">
            <h3>Tracking Information</h3>
            <p><strong>Carrier:</strong> ${data.carrier || 'Standard Shipping'}</p>
            <p><strong>Tracking Number:</strong> ${data.trackingNumber || 'Not available'}</p>
            ${data.trackingUrl ? `<p><a href="${data.trackingUrl}" style="color: #0066cc;">Track Package</a></p>` : ''}
            <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery || '3-5 business days'}</p>
          </div>
          
          <h3>Shipping Address</h3>
          <p>${data.shippingAddress?.address || ''}<br>
          ${data.shippingAddress?.city || ''}, ${data.shippingAddress?.state || ''} ${data.shippingAddress?.zipCode || ''}</p>
          
          <p><a href="${process.env.NEXTAUTH_URL}/track?order=${data.orderNumber}" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Order Details</a></p>
        </div>
      </div>
    `,
    text: `Your order ${data.orderNumber} has shipped. Tracking: ${data.trackingNumber}`
  }),

  orderDelivered: (data: any) => ({
    subject: `Order Delivered - ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
          <h1>GangRun Printing</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Your order has been delivered!</h2>
          <p>Order ${data.orderNumber} was successfully delivered.</p>
          
          <div style="background-color: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p>We hope you're happy with your purchase!</p>
            <p>If you have any issues or feedback, please don't hesitate to contact us.</p>
          </div>
          
          <p><a href="${process.env.NEXTAUTH_URL}/review?order=${data.orderNumber}" style="display: inline-block; background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Leave a Review</a></p>
        </div>
      </div>
    `,
    text: `Your order ${data.orderNumber} has been delivered.`
  }),

  orderCancelled: (data: any) => ({
    subject: `Order Cancelled - ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
          <h1>GangRun Printing</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Order Cancellation</h2>
          <p>Your order ${data.orderNumber} has been cancelled.</p>
          
          <div style="background-color: #ffebee; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f44336;">
            <p><strong>Reason:</strong> ${data.reason || 'Customer request'}</p>
            ${data.refundAmount ? `<p><strong>Refund Amount:</strong> $${data.refundAmount.toFixed(2)}</p>` : ''}
            ${data.refundAmount ? '<p>Your refund will be processed within 3-5 business days.</p>' : ''}
          </div>
          
          <p>If you have any questions about this cancellation, please contact our support team.</p>
        </div>
      </div>
    `,
    text: `Your order ${data.orderNumber} has been cancelled.`
  })
}

// Send email function
export async function sendEmail(
  to: string,
  template: keyof typeof templates,
  data: any
) {
  try {
    const emailContent = templates[template](data)
    
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    }

    const result = await sgMail.send(msg)
    console.log(`Email sent successfully: ${template} to ${to}`)
    return { success: true, messageId: result[0].headers['x-message-id'] }
  } catch (error: any) {
    console.error('SendGrid error:', error)
    if (error.response) {
      console.error('SendGrid response error:', error.response.body)
    }
    return { success: false, error: error.message }
  }
}

// Process pending notifications
export async function processPendingNotifications() {
  try {
    const pendingNotifications = await prisma.notification.findMany({
      where: { sent: false },
      include: {
        order: {
          include: {
            items: true,
            user: true
          }
        }
      },
      take: 10 // Process 10 at a time
    })

    for (const notification of pendingNotifications) {
      const order = notification.order
      let template: keyof typeof templates | null = null
      const emailData: any = {
        orderNumber: order.orderNumber,
        customerName: order.user?.name,
        total: order.total,
        status: order.status,
        items: order.items,
        shippingAddress: order.shippingAddress
      }

      switch (notification.type) {
        case 'ORDER_CONFIRMED':
          template = 'orderConfirmation'
          break
        case 'PAYMENT_RECEIVED':
          template = 'paymentReceived'
          emailData.amount = order.total
          emailData.transactionId = order.squarePaymentId
          break
        case 'ORDER_SHIPPED':
          template = 'orderShipped'
          emailData.trackingNumber = order.trackingNumber
          emailData.carrier = order.carrier
          break
        case 'ORDER_DELIVERED':
          template = 'orderDelivered'
          break
        case 'ORDER_REFUNDED':
          template = 'orderCancelled'
          emailData.refundAmount = order.refundAmount
          break
      }

      if (template && order.email) {
        const result = await sendEmail(order.email, template, emailData)
        
        // Update notification status
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            sent: result.success,
            sentAt: result.success ? new Date() : null,
            error: result.error
          }
        })
      }
    }
  } catch (error) {
    console.error('Error processing notifications:', error)
  }
}

// Send test email
export async function sendTestEmail(to: string) {
  return sendEmail(to, 'orderConfirmation', {
    orderNumber: 'TEST-123456',
    customerName: 'Test Customer',
    total: 99.99,
    status: 'PROCESSING',
    items: [
      { productName: 'Business Cards', quantity: 500, price: 49.99 },
      { productName: 'Flyers', quantity: 100, price: 50.00 }
    ]
  })
}