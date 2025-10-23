import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { withApiHandler, ApiError } from '@/lib/api/error-handler'
import { logger } from '@/lib/logger-safe'

export const GET = withApiHandler(
  async (request: NextRequest, context, params: { id: string }) => {
    const { user } = await validateRequest()
    const { id: orderId } = params

    if (!user) {
      throw ApiError.authentication()
    }

    // Only admins can download invoices
    if (user.role !== 'ADMIN') {
      throw ApiError.authorization('Only administrators can download invoices')
    }

    // Get the order with all details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        User: {
          select: { name: true, email: true },
        },
        OrderItem: {
          include: {
            OrderItemAddOn: {
              include: {
                AddOn: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw ApiError.notFound('Order')
    }

    logger.info('Generating invoice', {
      orderId,
      orderNumber: order.orderNumber,
      adminId: user.id,
      requestId: context.requestId,
    })

    // Create simple HTML invoice
    const invoiceHtml = generateInvoiceHtml(order)

    // Return HTML for now (could be enhanced to generate PDF)
    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.html"`,
      },
    })
  },
  {
    rateLimit: {
      keyPrefix: 'download_invoice',
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
    },
  }
)

function generateInvoiceHtml(order: any): string {
  const orderDate = new Date(order.createdAt).toLocaleDateString()
  const dueDate = order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'Pending'

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - ${order.orderNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; }
        .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
        .invoice-title { font-size: 20px; margin: 20px 0; }
        .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
        .invoice-details div { width: 45%; }
        .invoice-number { font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .amount { text-align: right; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #666; }
        .status-badge { 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold;
        }
        .status-paid { background-color: #dcfce7; color: #166534; }
        .status-pending { background-color: #fef3c7; color: #a16207; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">GangRun Printing</div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${order.orderNumber}</div>
    </div>

    <div class="invoice-details">
        <div>
            <h3>Bill To:</h3>
            <p><strong>${order.User?.name || 'Customer'}</strong></p>
            <p>${order.User?.email || order.email}</p>
            ${
              order.shippingAddress
                ? `
            <p>${order.shippingAddress.street}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
            `
                : ''
            }
        </div>
        <div>
            <h3>Invoice Details:</h3>
            <p><strong>Invoice Date:</strong> ${orderDate}</p>
            <p><strong>Payment Date:</strong> ${dueDate}</p>
            <p><strong>Status:</strong> 
                <span class="status-badge ${order.status === 'PENDING_PAYMENT' ? 'status-pending' : 'status-paid'}">
                    ${order.status === 'PENDING_PAYMENT' ? 'Pending' : 'Paid'}
                </span>
            </p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th class="amount">Unit Price</th>
                <th class="amount">Total</th>
            </tr>
        </thead>
        <tbody>
            ${order.OrderItem.map(
              (item: any) => `
                <tr>
                    <td>
                        <strong>${item.productName || 'Product'}</strong><br>
                        <small>SKU: ${item.productSku || 'N/A'}</small>
                        ${
                          item.options
                            ? `<br><small>${Object.entries(item.options)
                                .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
                                .join(', ')}</small>`
                            : ''
                        }
                    </td>
                    <td>${item.quantity}</td>
                    <td class="amount">$${(item.price / 100).toFixed(2)}</td>
                    <td class="amount">$${((item.price * item.quantity) / 100).toFixed(2)}</td>
                </tr>
            `
            ).join('')}
            
            <tr>
                <td colspan="3" class="amount"><strong>Subtotal:</strong></td>
                <td class="amount"><strong>$${(order.subtotal / 100).toFixed(2)}</strong></td>
            </tr>
            
            ${
              order.shipping > 0
                ? `
            <tr>
                <td colspan="3" class="amount">Shipping:</td>
                <td class="amount">$${(order.shipping / 100).toFixed(2)}</td>
            </tr>
            `
                : ''
            }
            
            ${
              order.tax > 0
                ? `
            <tr>
                <td colspan="3" class="amount">Tax:</td>
                <td class="amount">$${(order.tax / 100).toFixed(2)}</td>
            </tr>
            `
                : ''
            }
            
            <tr class="total-row">
                <td colspan="3" class="amount"><strong>TOTAL:</strong></td>
                <td class="amount"><strong>$${(order.total / 100).toFixed(2)}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>GangRun Printing | orders@gangrunprinting.com | 1-800-PRINTING</p>
    </div>
</body>
</html>
  `
}
