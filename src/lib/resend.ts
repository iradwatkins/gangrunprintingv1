import { Resend } from 'resend'
import { getMinioClient, BUCKETS } from './minio-client'
import { prisma } from './prisma'

let resend: Resend | null = null

function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY || '')
  }
  return resend
}

export interface EmailTemplate {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail(template: EmailTemplate) {
  try {
    const { data, error } = await getResendClient().emails.send({
      from: template.from || `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      reply_to: template.replyTo,
      attachments: template.attachments,
    })

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    throw error
  }
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (order: any) => ({
    subject: `Order Confirmation #${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <h2>Order Details:</h2>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Total:</strong> $${order.total}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>GangRun Printing Team</p>
      </div>
    `,
  }),

  orderStatusUpdate: (order: any) => ({
    subject: `Order #${order.orderNumber} - Status Update`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Status Update</h1>
        <p>Your order status has been updated.</p>
        <h2>Order Details:</h2>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>New Status:</strong> ${order.status}</p>
        ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p>You can track your order at any time by logging into your account.</p>
        <p>Best regards,<br>GangRun Printing Team</p>
      </div>
    `,
  }),

  quoteRequest: (quote: any) => ({
    subject: `Quote Request #${quote.quoteNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Quote Request Received</h1>
        <p>Thank you for requesting a quote!</p>
        <h2>Quote Details:</h2>
        <p><strong>Quote Number:</strong> ${quote.quoteNumber}</p>
        <p><strong>Product:</strong> ${quote.productName}</p>
        <p><strong>Quantity:</strong> ${quote.quantity}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p>Our team will review your request and send you a detailed quote within 24 hours.</p>
        <p>Best regards,<br>GangRun Printing Team</p>
      </div>
    `,
  }),

  passwordReset: (resetUrl: string) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset</h1>
        <p>You requested a password reset for your GangRun Printing account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>GangRun Printing Team</p>
      </div>
    `,
  }),

  welcomeEmail: (user: any) => ({
    subject: 'Welcome to GangRun Printing!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to GangRun Printing!</h1>
        <p>Hi ${user.name || 'there'},</p>
        <p>Thank you for creating an account with us. We're excited to help you with all your printing needs!</p>
        <h2>What's Next?</h2>
        <ul>
          <li>Browse our wide selection of products</li>
          <li>Upload your designs</li>
          <li>Get instant quotes</li>
          <li>Track your orders in real-time</li>
        </ul>
        <a href="https://gangrunprinting.com/products" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Start Shopping</a>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>GangRun Printing Team</p>
      </div>
    `,
  }),
}

// File attachment utilities
export async function downloadFileFromMinIO(bucketName: string, objectPath: string): Promise<Buffer> {
  try {
    const client = getMinioClient()

    return new Promise(async (resolve, reject) => {
      try {
        let chunks: Buffer[] = []
        const stream = await client.getObject(bucketName, objectPath)

        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk)
        })

        stream.on('end', () => {
          resolve(Buffer.concat(chunks))
        })

        stream.on('error', (error) => {
          reject(new Error(`Failed to download file from MinIO: ${error.message}`))
        })
      } catch (error) {
        reject(error)
      }
    })
  } catch (error) {
    console.error('Error downloading file from MinIO:', error)
    throw new Error(`Failed to download file: ${error.message}`)
  }
}

export async function getOrderFilesAsAttachments(orderId: string): Promise<{
  attachments: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
  orderFiles: Array<{
    filename: string
    fileUrl: string
    mimeType: string
    fileSize: number
  }>
}> {
  try {
    // Get order files from database
    const files = await prisma.file.findMany({
      where: { orderId },
      select: {
        filename: true,
        fileUrl: true,
        mimeType: true,
        fileSize: true,
      },
    })

    if (files.length === 0) {
      return { attachments: [], orderFiles: [] }
    }

    // Download files from MinIO and prepare as attachments
    const attachments = []
    for (const file of files) {
      try {
        const fileBuffer = await downloadFileFromMinIO(BUCKETS.UPLOADS, file.fileUrl)
        attachments.push({
          filename: file.filename,
          content: fileBuffer,
          contentType: file.mimeType,
        })
      } catch (error) {
        console.error(`Failed to download file ${file.filename}:`, error)
        // Continue with other files even if one fails
      }
    }

    return {
      attachments,
      orderFiles: files,
    }
  } catch (error) {
    console.error('Error getting order files as attachments:', error)
    return { attachments: [], orderFiles: [] }
  }
}

export async function sendOrderConfirmationWithFiles(orderData: {
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  items: any[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress?: any
  estimatedDelivery?: string
}) {
  try {
    // Get order files as attachments
    const { attachments, orderFiles } = await getOrderFilesAsAttachments(orderData.orderId)

    // Import email template function
    const { getOrderConfirmationEmail } = await import('./email-templates')

    // Generate email content with files
    const emailContent = getOrderConfirmationEmail({
      ...orderData,
      email: orderData.customerEmail,
      attachments,
      orderFiles,
    })

    // Send email with attachments
    const result = await sendEmail({
      to: orderData.customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      attachments: emailContent.attachments,
    })

    console.log(`Order confirmation email sent to ${orderData.customerEmail} with ${attachments.length} attachments`)
    return result
  } catch (error) {
    console.error('Error sending order confirmation with files:', error)
    throw error
  }
}

export async function sendAdminOrderNotification(orderData: {
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: any[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress?: any
  billingAddress?: any
  shippingMethod?: string
  specialInstructions?: string
  orderDate: Date
  paymentStatus?: string
  adminEmail?: string
}) {
  try {
    // Get order files as attachments
    const { attachments, orderFiles } = await getOrderFilesAsAttachments(orderData.orderId)

    // Import email template function
    const { getAdminOrderNotificationEmail } = await import('./email-templates')

    // Get admin email from environment or use provided one
    const adminEmail = orderData.adminEmail || process.env.ADMIN_EMAIL || 'iradwatkins@gmail.com'

    // Generate admin notification email content
    const emailContent = getAdminOrderNotificationEmail({
      ...orderData,
      attachments,
      orderFiles,
    })

    // Send email with attachments to admin
    const result = await sendEmail({
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      attachments: emailContent.attachments,
    })

    console.log(`Admin order notification sent to ${adminEmail} with ${attachments.length} files attached`)
    return result
  } catch (error) {
    console.error('Error sending admin order notification:', error)
    throw error
  }
}

// Batch email sending
export async function sendBatchEmails(emails: EmailTemplate[]) {
  const results = []
  for (const email of emails) {
    try {
      const result = await sendEmail(email)
      results.push({ success: true, ...result })
    } catch (error) {
      results.push({ success: false, error: error.message })
    }
  }
  return results
}

export default getResendClient
