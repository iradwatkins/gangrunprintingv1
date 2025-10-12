/**
 * Invoice Email Service
 *
 * Sends professional invoice emails to customers via Resend
 */

import { sendEmail } from '@/lib/resend'

export interface SendInvoiceEmailParams {
  to: string
  customerName: string
  invoiceNumber: string
  orderNumber: string
  items: Array<{
    productName: string
    quantity: number
    price: number
    options?: any
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  paymentDueDate: Date
  paymentLink: string
  customMessage?: string
}

/**
 * Generate invoice email HTML template
 */
function getInvoiceEmailHTML(params: SendInvoiceEmailParams): string {
  const {
    customerName,
    invoiceNumber,
    orderNumber,
    items,
    subtotal,
    tax,
    shipping,
    total,
    paymentDueDate,
    paymentLink,
    customMessage,
  } = params

  const formattedDueDate = new Date(paymentDueDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const itemsHTML = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${item.productName}</strong>
        ${item.options ? `<br><span style="font-size: 12px; color: #666;">${JSON.stringify(item.options)}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">GangRun Printing</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Invoice</p>
            </td>
          </tr>

          <!-- Invoice Info -->
          <tr>
            <td style="padding: 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Bill To:</p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">${customerName}</p>
                  </td>
                  <td align="right">
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Invoice #</p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #667eea;">${invoiceNumber}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Order Number:</p>
                    <p style="margin: 0; font-size: 16px; color: #333;">${orderNumber}</p>
                  </td>
                  <td align="right">
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Due Date:</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #e53e3e;">${formattedDueDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${customMessage ? `
          <!-- Custom Message -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px;">
                <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">${customMessage}</p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 4px;">
                <thead>
                  <tr style="background-color: #f7fafc;">
                    <th style="padding: 15px; text-align: left; color: #666; font-weight: 600; font-size: 14px; border-bottom: 2px solid #eee;">Item</th>
                    <th style="padding: 15px; text-align: center; color: #666; font-weight: 600; font-size: 14px; border-bottom: 2px solid #eee;">Qty</th>
                    <th style="padding: 15px; text-align: right; color: #666; font-weight: 600; font-size: 14px; border-bottom: 2px solid #eee;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="70%"></td>
                  <td width="30%">
                    <table width="100%" cellpadding="5" cellspacing="0">
                      <tr>
                        <td style="color: #666; font-size: 14px;">Subtotal:</td>
                        <td align="right" style="font-size: 14px;">$${(subtotal / 100).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px;">Tax:</td>
                        <td align="right" style="font-size: 14px;">$${(tax / 100).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px;">Shipping:</td>
                        <td align="right" style="font-size: 14px;">$${(shipping / 100).toFixed(2)}</td>
                      </tr>
                      <tr style="border-top: 2px solid #eee;">
                        <td style="padding-top: 10px; font-weight: bold; font-size: 18px; color: #333;">Total:</td>
                        <td align="right" style="padding-top: 10px; font-weight: bold; font-size: 18px; color: #667eea;">$${(total / 100).toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Button -->
          <tr>
            <td style="padding: 0 30px 40px 30px;" align="center">
              <a href="${paymentLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">Pay Invoice Now</a>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 12px;">Or copy this link: <a href="${paymentLink}" style="color: #667eea;">${paymentLink}</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f7fafc; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; line-height: 1.6;">
                <strong>Payment Terms:</strong> Payment is due by ${formattedDueDate}. Late payments may incur additional fees.
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                Questions? Contact us at <a href="mailto:support@gangrunprinting.com" style="color: #667eea; text-decoration: none;">support@gangrunprinting.com</a> or call (555) 123-4567
              </p>
              <p style="margin: 20px 0 0 0; color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} GangRun Printing. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Generate plain text version of invoice email
 */
function getInvoiceEmailText(params: SendInvoiceEmailParams): string {
  const {
    customerName,
    invoiceNumber,
    orderNumber,
    items,
    subtotal,
    tax,
    shipping,
    total,
    paymentDueDate,
    paymentLink,
    customMessage,
  } = params

  const formattedDueDate = new Date(paymentDueDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const itemsText = items
    .map(
      (item) =>
        `${item.productName} - Qty: ${item.quantity} - $${(item.price / 100).toFixed(2)}`
    )
    .join('\n')

  return `
GANGRUN PRINTING - INVOICE

Invoice Number: ${invoiceNumber}
Order Number: ${orderNumber}
Bill To: ${customerName}
Due Date: ${formattedDueDate}

${customMessage ? `\nMESSAGE:\n${customMessage}\n` : ''}

ITEMS:
${itemsText}

TOTALS:
Subtotal: $${(subtotal / 100).toFixed(2)}
Tax: $${(tax / 100).toFixed(2)}
Shipping: $${(shipping / 100).toFixed(2)}
-----------------------------------
TOTAL: $${(total / 100).toFixed(2)}

PAY INVOICE:
${paymentLink}

Payment is due by ${formattedDueDate}.

Questions? Contact us at support@gangrunprinting.com or call (555) 123-4567

© ${new Date().getFullYear()} GangRun Printing. All rights reserved.
  `.trim()
}

/**
 * Send invoice email to customer
 */
export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<void> {
  try {
    const html = getInvoiceEmailHTML(params)
    const text = getInvoiceEmailText(params)

    await sendEmail({
      to: params.to,
      subject: `Invoice ${params.invoiceNumber} - GangRun Printing`,
      html,
      text,
      replyTo: 'billing@gangrunprinting.com',
    })

    console.log(`✅ Invoice ${params.invoiceNumber} sent to ${params.to}`)
  } catch (error) {
    console.error('❌ Failed to send invoice email:', error)
    throw new Error(`Failed to send invoice email: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
