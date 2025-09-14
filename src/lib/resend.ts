import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const { data, error } = await resend.emails.send({
      from: template.from || `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      reply_to: template.replyTo,
      attachments: template.attachments
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error('Email sending error:', error)
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
    `
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
    `
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
    `
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
    `
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
    `
  })
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

export default resend