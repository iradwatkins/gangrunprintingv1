/**
 * Send Invoice API
 *
 * POST /api/admin/orders/[id]/send-invoice
 *
 * Generates invoice for an order and sends email to customer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import { createInvoice } from '@/lib/services/invoice-service';
import { sendInvoiceEmail } from '@/lib/email/invoice-email';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const sendInvoiceSchema = z.object({
  paymentDueDate: z.string().datetime().optional(),
  customMessage: z.string().optional(),
});

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate authentication and admin role
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = sendInvoiceSchema.parse(body);

    const orderId = params.id;

    // Create invoice
    const invoice = await createInvoice({
      orderId,
      paymentDueDate: validated.paymentDueDate ? new Date(validated.paymentDueDate) : undefined,
      customMessage: validated.customMessage,
    });

    // Send invoice email to customer
    await sendInvoiceEmail({
      to: invoice.order.customer.email,
      customerName: invoice.order.customer.name || 'Valued Customer',
      invoiceNumber: invoice.invoiceNumber,
      orderNumber: invoice.order.orderNumber,
      items: invoice.order.items,
      subtotal: invoice.order.subtotal,
      tax: invoice.order.tax,
      shipping: invoice.order.shipping,
      total: invoice.order.total,
      paymentDueDate: invoice.paymentDueDate,
      paymentLink: invoice.paymentLink,
      customMessage: validated.customMessage,
    });

    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        invoiceId: invoice.invoiceId,
        paymentLink: invoice.paymentLink,
        paymentDueDate: invoice.paymentDueDate,
        sentAt: new Date(),
      },
      message: `Invoice ${invoice.invoiceNumber} sent to ${invoice.order.customer.email}`,
    });
  } catch (error) {
    console.error('Error sending invoice:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to send invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
