/**
 * email-templates - component definitions
 * Auto-refactored by BMAD
 */

import {

export function getOrderConfirmationEmail(orderData: {
  orderNumber: string
  customerName: string
  email: string
  items: Array<{
    name: string
    quantity: number
    price: number
    options?: Record<string, unknown>
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  estimatedDelivery?: string
  shippingAddress?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
  orderFiles?: Array<{
    filename: string
    fileUrl: string
    mimeType: string
  }>
}) {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.name}</strong>
        ${item.options ? `<br><small style="color: #6b7280;">${JSON.stringify(item.options).replace(/[{}"]/g, '').replace(/,/g, ', ')}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${((item.price * item.quantity) / 100).toFixed(2)}</td>
    </tr>
  `
    )
    .join('')

  return {
    subject: `Order Confirmation - ${orderData.orderNumber} | ${APP_NAME}`,
    attachments: orderData.attachments,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: ${EMAIL_STYLES.CONTAINER_MAX_WIDTH}; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: #000000; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">GangRun Printing</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Printing Services</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #111827; margin-top: 0;">Thank You for Your Order!</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        Hi ${orderData.customerName || 'Valued Customer'},<br><br>
        We've received your order and it's being processed. You'll receive another email when your order ships.
      </p>

      <!-- Order Details -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #111827;">Order Details</h3>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
        ${orderData.estimatedDelivery ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>` : ''}
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Item</th>
            <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Price</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Order Summary -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
        <table style="width: 100%; margin-left: auto;">
          <tr>
            <td style="text-align: right; padding: 5px 10px; color: #4b5563;">Subtotal:</td>
            <td style="text-align: right; padding: 5px 0; color: #111827; font-weight: 500;">$${(orderData.subtotal / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: right; padding: 5px 10px; color: #4b5563;">Tax:</td>
            <td style="text-align: right; padding: 5px 0; color: #111827; font-weight: 500;">$${(orderData.tax / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: right; padding: 5px 10px; color: #4b5563;">Shipping:</td>
            <td style="text-align: right; padding: 5px 0; color: #111827; font-weight: 500;">$${(orderData.shipping / 100).toFixed(2)}</td>
          </tr>
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="text-align: right; padding: 10px 10px 5px; color: #111827; font-weight: 600; font-size: 18px;">Total:</td>
            <td style="text-align: right; padding: 10px 0 5px; color: #000000; font-weight: 700; font-size: 18px;">$${(orderData.total / 100).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      ${
        orderData.shippingAddress
          ? `
      <!-- Shipping Address -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #111827;">Shipping Address</h3>
        <p style="margin: 5px 0; color: #4b5563; line-height: 1.6;">
          ${orderData.shippingAddress.street || ''}<br>
          ${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.zip || ''}
        </p>
      </div>
      `
          : ''
      }

      ${
        orderData.orderFiles && orderData.orderFiles.length > 0
          ? `
      <!-- Uploaded Files Preview -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #111827;">Your Uploaded Files</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${orderData.orderFiles
            .map((file) => {
              const isImage = file.mimeType.startsWith('image/')
              return `
            <div style="border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; min-width: 120px; text-align: center;">
              ${
                isImage
                  ? `<img src="${SERVICE_ENDPOINTS.MINIO_PUBLIC}/${file.fileUrl}" alt="${file.filename}" style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 4px;">`
                  : `<div style="width: 100px; height: 100px; background-color: #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 12px;">📄</div>`
              }
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280; word-break: break-all;">${file.filename}</p>
            </div>`
            })
            .join('')}
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 15px; margin-bottom: 0;">Our design team will review these files and contact you if any adjustments are needed.</p>
      </div>
      `
          : ''
      }

      <!-- Order Timeline -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #111827;">What Happens Next?</h3>
        <div style="position: relative;">
          <div style="border-left: 2px solid #e5e7eb; margin-left: 10px; padding-left: 20px;">
            <div style="position: relative; margin-bottom: 20px;">
              <div style="position: absolute; left: -26px; top: 2px; width: 12px; height: 12px; background-color: #000000; border-radius: 50%;"></div>
              <h4 style="margin: 0 0 5px 0; color: #111827; font-size: 14px;">File Review (within 24 hours)</h4>
              <p style="margin: 0; color: #6b7280; font-size: 13px;">Our design team reviews your files for print quality and compatibility</p>
            </div>
            <div style="position: relative; margin-bottom: 20px;">
              <div style="position: absolute; left: -26px; top: 2px; width: 12px; height: 12px; background-color: #e5e7eb; border-radius: 50%;"></div>
              <h4 style="margin: 0 0 5px 0; color: #111827; font-size: 14px;">Production Start</h4>
              <p style="margin: 0; color: #6b7280; font-size: 13px;">Once approved, your order enters our production queue</p>
            </div>
            <div style="position: relative; margin-bottom: 20px;">
              <div style="position: absolute; left: -26px; top: 2px; width: 12px; height: 12px; background-color: #e5e7eb; border-radius: 50%;"></div>
              <h4 style="margin: 0 0 5px 0; color: #111827; font-size: 14px;">Quality Check & Shipping</h4>
              <p style="margin: 0; color: #6b7280; font-size: 13px;">Final quality inspection and preparation for shipping</p>
            </div>
            <div style="position: relative;">
              <div style="position: absolute; left: -26px; top: 2px; width: 12px; height: 12px; background-color: #e5e7eb; border-radius: 50%;"></div>
              <h4 style="margin: 0 0 5px 0; color: #111827; font-size: 14px;">Delivery</h4>
              <p style="margin: 0; color: #6b7280; font-size: 13px;">${orderData.estimatedDelivery || "You'll receive tracking information when shipped"}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://gangrunprinting.com/track?order=${orderData.orderNumber}" style="display: inline-block; background-color: #000000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 5px;">Track Order</a>
        <a href="https://gangrunprinting.com/products" style="display: inline-block; background-color: #f3f4f6; color: #111827; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 5px;">Continue Shopping</a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">

        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Questions about your order? Contact us at<br>
          <a href="mailto:${APP_EMAIL}" style="color: #000000; text-decoration: none;">${APP_EMAIL}</a> |
          <a href="tel:${APP_PHONE}" style="color: #000000; text-decoration: none;">${APP_PHONE}</a>
        </p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 6px;">
          <p style="color: #4b5563; font-size: 13px; margin: 0; font-weight: 500;">Need to make changes to your order?</p>
          <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">Contact us within 2 hours of placing your order for modifications.</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br>
          This email was sent to ${orderData.email}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Order Confirmation - ${orderData.orderNumber}

Thank you for your order!

Hi ${orderData.customerName || 'Valued Customer'},

We've received your order and it's being processed. You'll receive another email when your order ships.

Order Details:
- Order Number: ${orderData.orderNumber}
- Order Date: ${new Date().toLocaleDateString()}
${orderData.estimatedDelivery ? `- Estimated Delivery: ${orderData.estimatedDelivery}` : ''}

Order Items:
${orderData.items.map((item) => `- ${item.name} x${item.quantity} - $${((item.price * item.quantity) / 100).toFixed(2)}`).join('\n')}

Order Summary:
- Subtotal: $${(orderData.subtotal / 100).toFixed(2)}
- Tax: $${(orderData.tax / 100).toFixed(2)}
- Shipping: $${(orderData.shipping / 100).toFixed(2)}
- Total: $${(orderData.total / 100).toFixed(2)}

${
  orderData.shippingAddress
    ? `
Shipping Address:
${orderData.shippingAddress.street || ''}
${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.zip || ''}
`
    : ''
}

Track your order: https://gangrunprinting.com/track?order=${orderData.orderNumber}

What happens next:
1. File Review (within 24 hours)
2. Production Start
3. Quality Check & Shipping
4. Delivery${orderData.estimatedDelivery ? ` - ${orderData.estimatedDelivery}` : ''}

Questions? Contact us at ${APP_EMAIL} or call ${APP_PHONE}

Need to make changes? Contact us within 2 hours of placing your order.

© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
    `,
  }
}

export function getOrderStatusUpdateEmail(orderData: {
  orderNumber: string
  customerName: string
  status: string
  trackingNumber?: string
  estimatedDelivery?: string
}) {
  const statusMessages: Record<string, { title: string; message: string }> = {
    PROCESSING: {
      title: 'Your Order is Being Processed',
      message:
        "Our team has started working on your order. We'll notify you once it's ready for shipping.",
    },
    PRINTING: {
      title: 'Your Order is Being Printed',
      message:
        'Your order is currently in production. Our printing team is working to ensure the highest quality.',
    },
    READY_FOR_PICKUP: {
      title: 'Your Order is Ready for Pickup',
      message: 'Great news! Your order is ready for pickup at our location.',
    },
    SHIPPED: {
      title: 'Your Order Has Shipped',
      message: `Your order is on its way! ${orderData.trackingNumber ? `Track your package with tracking number: ${orderData.trackingNumber}` : ''}`,
    },
    DELIVERED: {
      title: 'Your Order Has Been Delivered',
      message: 'Your order has been successfully delivered. We hope you love your prints!',
    },
  }

  const statusInfo = statusMessages[orderData.status] || {
    title: 'Order Status Update',
    message: `Your order status has been updated to: ${orderData.status}`,
  }

  return {
    subject: `${statusInfo.title} - Order ${orderData.orderNumber}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: ${EMAIL_STYLES.CONTAINER_MAX_WIDTH}; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background-color: #000000; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">GangRun Printing</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Status Update</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #111827; margin-top: 0;">${statusInfo.title}</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        Hi ${orderData.customerName || 'Valued Customer'},<br><br>
        ${statusInfo.message}
      </p>

      <!-- Order Info -->
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 5px 0; color: #4b5563;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
        <p style="margin: 5px 0; color: #4b5563;"><strong>Status:</strong> ${orderData.status.replace(/_/g, ' ')}</p>
        ${orderData.trackingNumber ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>` : ''}
        ${orderData.estimatedDelivery ? `<p style="margin: 5px 0; color: #4b5563;"><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>` : ''}
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://gangrunprinting.com/track?order=${orderData.orderNumber}" style="display: inline-block; background-color: #000000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Track Order</a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px;">
          Questions? Contact us at support@gangrunprinting.com
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `${statusInfo.title}

Hi ${orderData.customerName || 'Valued Customer'},

${statusInfo.message}

Order Number: ${orderData.orderNumber}
Status: ${orderData.status.replace(/_/g, ' ')}
${orderData.trackingNumber ? `Tracking Number: ${orderData.trackingNumber}` : ''}

Track your order: https://gangrunprinting.com/track?order=${orderData.orderNumber}

Questions? Contact us at ${APP_EMAIL}
    `,
  }
}

export function getAdminOrderNotificationEmail(orderData: {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    options?: Record<string, unknown>
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
  billingAddress?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
  shippingMethod?: string
  orderFiles?: Array<{
    filename: string
    fileUrl: string
    mimeType: string
    fileSize: number
  }>
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
  specialInstructions?: string
  orderDate: Date
  paymentStatus?: string
}) {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
        <strong>${item.name}</strong>
        ${
          item.options
            ? `<br><small style="color: #6b7280; font-size: 12px;">${Object.entries(item.options)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}</small>`
            : ''
        }
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px;">$${(item.price / 100).toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px; font-weight: 600;">$${((item.price * item.quantity) / 100).toFixed(2)}</td>
    </tr>
  `
    )
    .join('')

  const filesHtml =
    orderData.orderFiles && orderData.orderFiles.length > 0
      ? `
    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">📎 Customer Files Attached (${orderData.orderFiles.length})</h4>
      <ul style="margin: 0; padding-left: 20px; color: #92400e;">
        ${orderData.orderFiles
          .map(
            (file) => `
          <li style="margin: 5px 0; font-size: 14px;">
            <strong>${file.filename}</strong>
            <span style="color: #6b7280;">(${
              file.fileSize > 1024 * 1024
                ? `${(file.fileSize / 1024 / 1024).toFixed(1)} MB`
                : `${(file.fileSize / 1024).toFixed(0)} KB`
            }) - ${file.mimeType}</span>
          </li>
        `
          )
          .join('')}
      </ul>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #92400e;">⚠️ Customer files are attached to this email for review</p>
    </div>
  `
      : '<p style="color: #ef4444; font-weight: 500; margin: 15px 0;">⚠️ No files uploaded by customer</p>'

  return {
    subject: `🚨 NEW ORDER: ${orderData.orderNumber} - $${(orderData.total / 100).toFixed(2)} from ${orderData.customerName}`,
    attachments: orderData.attachments,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Notification - Admin</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="margin: 0; font-size: 24px; font-weight: 700;">🚨 NEW ORDER RECEIVED</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 16px;">${APP_NAME} Admin Notification</p>
    </div>

    <!-- Priority Alert -->
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 0;">
      <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 16px;">⏰ Immediate Action Required - Customer Waiting for Confirmation</p>
    </div>

    <!-- Main Content -->
    <div style="background-color: white; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

      <!-- Quick Overview -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; padding: 15px; background-color: #f8fafc; border-radius: 6px;">
        <div>
          <h3 style="margin: 0 0 5px 0; color: #111827; font-size: 16px;">Order Details</h3>
          <p style="margin: 2px 0; color: #4b5563; font-size: 14px;"><strong>Order #:</strong> ${orderData.orderNumber}</p>
          <p style="margin: 2px 0; color: #4b5563; font-size: 14px;"><strong>Date:</strong> ${orderData.orderDate.toLocaleDateString()} ${orderData.orderDate.toLocaleTimeString()}</p>
          <p style="margin: 2px 0; color: #4b5563; font-size: 14px;"><strong>Total:</strong> <span style="color: #059669; font-weight: 600; font-size: 16px;">$${(orderData.total / 100).toFixed(2)}</span></p>
        </div>
        <div>
          <h3 style="margin: 0 0 5px 0; color: #111827; font-size: 16px;">Customer Info</h3>
          <p style="margin: 2px 0; color: #4b5563; font-size: 14px;"><strong>Name:</strong> ${orderData.customerName}</p>
          <p style="margin: 2px 0; color: #4b5563; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${orderData.customerEmail}" style="color: #2563eb;">${orderData.customerEmail}</a></p>
          ${orderData.customerPhone ? `<p style="margin: 2px 0; color: #4b5563; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${orderData.customerPhone}" style="color: #2563eb;">${orderData.customerPhone}</a></p>` : ''}
        </div>
      </div>

      <!-- Customer Files Alert -->
      ${filesHtml}

      <!-- Order Items -->
      <h3 style="color: #111827; margin: 25px 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📦 Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Product</th>
            <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Qty</th>
            <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Unit Price</th>
            <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Order Summary -->
      <div style="border: 2px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 20px 0; background-color: #fafafa;">
        <table style="width: 100%; margin: 0;">
          <tr>
            <td style="text-align: right; padding: 4px 15px; color: #4b5563; font-size: 14px;">Subtotal:</td>
            <td style="text-align: right; padding: 4px 0; color: #111827; font-weight: 500; font-size: 14px; width: 100px;">$${(orderData.subtotal / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: right; padding: 4px 15px; color: #4b5563; font-size: 14px;">Tax:</td>
            <td style="text-align: right; padding: 4px 0; color: #111827; font-weight: 500; font-size: 14px;">$${(orderData.tax / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="text-align: right; padding: 4px 15px; color: #4b5563; font-size: 14px;">Shipping (${orderData.shippingMethod || 'Standard'}):</td>
            <td style="text-align: right; padding: 4px 0; color: #111827; font-weight: 500; font-size: 14px;">$${(orderData.shipping / 100).toFixed(2)}</td>
          </tr>
          <tr style="border-top: 2px solid #374151;">
            <td style="text-align: right; padding: 8px 15px 4px; color: #111827; font-weight: 700; font-size: 18px;">TOTAL:</td>
            <td style="text-align: right; padding: 8px 0 4px; color: #059669; font-weight: 800; font-size: 20px;">$${(orderData.total / 100).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      ${
        orderData.shippingAddress
          ? `
      <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">📍 Shipping Address</h3>
        <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.4;">
          ${orderData.shippingAddress.street || ''}<br>
          ${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.zip || ''}
        </p>
      </div>
      `
          : ''
      }

      <!-- Special Instructions -->
      ${
        orderData.specialInstructions
          ? `
      <div style="background-color: #fefce8; border: 1px solid #eab308; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #a16207; font-size: 16px;">📝 Special Instructions</h3>
        <p style="margin: 0; color: #a16207; font-size: 14px; font-style: italic;">${orderData.specialInstructions}</p>
      </div>
      `
          : ''

      }

      <!-- Quick Actions -->
      <div style="text-align: center; margin: 25px 0; padding: 20px; background-color: #f8fafc; border-radius: 6px;">
        <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 16px;">⚡ Quick Actions</h3>
        <a href="https://gangrunprinting.com/admin/orders/${orderData.orderNumber}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px; font-size: 14px;">📋 View Full Order</a>
        <a href="mailto:${orderData.customerEmail}?subject=Re: Order ${orderData.orderNumber}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px; font-size: 14px;">📧 Email Customer</a>
        ${orderData.customerPhone ? `<a href="tel:${orderData.customerPhone}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px; font-size: 14px;">📞 Call Customer</a>` : ''}
      </div>

      <!-- Processing Checklist -->
      <div style="background-color: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #047857; font-size: 16px;">✅ Processing Checklist</h3>
        <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px;">
          <li>Review customer files for print quality and specifications</li>
          <li>Verify order details and pricing accuracy</li>
          <li>Contact customer if files need revision or have questions</li>
          <li>Update order status once review is complete</li>
          <li>Schedule production and update estimated delivery</li>
        </ul>
      </div>

      <!-- Footer -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 25px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          📧 Admin notification sent to ${ADMIN_EMAIL}<br>
          🕐 ${new Date().toLocaleString()} | Order received: ${orderData.orderDate.toLocaleString()}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
NEW ORDER NOTIFICATION - IMMEDIATE ACTION REQUIRED

Order Number: ${orderData.orderNumber}
Customer: ${orderData.customerName} (${orderData.customerEmail})
${orderData.customerPhone ? `Phone: ${orderData.customerPhone}` : ''}
Order Date: ${orderData.orderDate.toLocaleString()}
Total: $${(orderData.total / 100).toFixed(2)}

CUSTOMER FILES: ${orderData.orderFiles ? `${orderData.orderFiles.length} files attached` : 'NO FILES UPLOADED'}

ORDER ITEMS:
${orderData.items.map((item, index) => `${index + 1}. ${item.name} x${item.quantity} - $${((item.price * item.quantity) / 100).toFixed(2)}`).join('\n')}

ORDER SUMMARY:
Subtotal: $${(orderData.subtotal / 100).toFixed(2)}
Tax: $${(orderData.tax / 100).toFixed(2)}
Shipping: $${(orderData.shipping / 100).toFixed(2)}
TOTAL: $${(orderData.total / 100).toFixed(2)}

${orderData.shippingAddress ? `SHIPPING ADDRESS:\n${orderData.shippingAddress.street}\n${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zip}` : ''}

${orderData.specialInstructions ? `SPECIAL INSTRUCTIONS:\n${orderData.specialInstructions}` : ''}

PROCESSING CHECKLIST:
- Review customer files for print quality
- Verify order details and pricing
- Contact customer if files need revision
- Update order status once review complete
- Schedule production and update delivery estimate

View order: https://gangrunprinting.com/admin/orders/${orderData.orderNumber}
Email customer: ${orderData.customerEmail}
${orderData.customerPhone ? `Call customer: ${orderData.customerPhone}` : ''}

Admin notification sent: ${new Date().toLocaleString()}
    `,
  }
}
