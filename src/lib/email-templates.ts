import { EMAIL_STYLES, SERVICE_ENDPOINTS } from '@/config/constants'

export function getOrderConfirmationEmail(orderData: {
  orderNumber: string
  customerName: string
  email: string
  items: Array<{
    name: string
    quantity: number
    price: number
    options?: any
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
    subject: `Order Confirmation - ${orderData.orderNumber} | GangRun Printing`,
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
      
      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://gangrunprinting.com/track?order=${orderData.orderNumber}" style="display: inline-block; background-color: #000000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 5px;">Track Order</a>
        <a href="https://gangrunprinting.com/products" style="display: inline-block; background-color: #f3f4f6; color: #111827; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 5px;">Continue Shopping</a>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Questions about your order? Contact us at<br>
          <a href="mailto:support@gangrunprinting.com" style="color: #000000; text-decoration: none;">support@gangrunprinting.com</a> | 
          <a href="tel:+1234567890" style="color: #000000; text-decoration: none;">(123) 456-7890</a>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} GangRun Printing. All rights reserved.
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

Questions? Contact us at support@gangrunprinting.com or call (123) 456-7890

© ${new Date().getFullYear()} GangRun Printing. All rights reserved.
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

Questions? Contact us at support@gangrunprinting.com
    `,
  }
}
