import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(template: EmailTemplate) {
  const msg = {
    to: template.to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: process.env.SENDGRID_FROM_NAME!,
    },
    subject: template.subject,
    html: template.html,
    text: template.text || template.html.replace(/<[^>]*>/g, ''),
  }

  try {
    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('SendGrid error:', error)
    throw error
  }
}

export const emailTemplates = {
  orderConfirmation: (orderNumber: string, customerName: string, total: number) => ({
    subject: `Order Confirmation - #${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .button { display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
            </div>
            <div class="content">
              <h2>Thank you for your order, ${customerName}!</h2>
              <p>Your order <strong>#${orderNumber}</strong> has been received and is being processed.</p>
              <p><strong>Total Amount:</strong> $${total.toFixed(2)}</p>
              <p>We'll send you another email when your order is ready for production.</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/track/${orderNumber}" class="button">Track Your Order</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GangRun Printing. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  orderShipped: (orderNumber: string, trackingNumber: string, carrier: string) => ({
    subject: `Your Order #${orderNumber} Has Shipped!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Shipped</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .tracking-info { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Order Has Shipped!</h1>
            </div>
            <div class="content">
              <h2>Great news!</h2>
              <p>Your order <strong>#${orderNumber}</strong> has been shipped and is on its way to you.</p>
              <div class="tracking-info">
                <h3>Tracking Information</h3>
                <p><strong>Carrier:</strong> ${carrier}</p>
                <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              </div>
              <p>You can track your package using the tracking number above on the carrier's website.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GangRun Printing. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  orderStatusUpdate: (orderNumber: string, status: string, message: string) => ({
    subject: `Order #${orderNumber} - Status Update`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .status-badge { display: inline-block; padding: 5px 15px; background: #17a2b8; color: white; border-radius: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Status Update</h1>
            </div>
            <div class="content">
              <h2>Order #${orderNumber}</h2>
              <p>Your order status has been updated to: <span class="status-badge">${status}</span></p>
              <p>${message}</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/track/${orderNumber}" style="display: inline-block; padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px;">View Order Details</a>
              </p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} GangRun Printing. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
}