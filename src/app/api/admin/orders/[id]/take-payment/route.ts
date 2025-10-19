/**
 * Take Payment API
 *
 * POST /api/admin/orders/[id]/take-payment
 *
 * Allows admin to record immediate payment for an order (phone orders, in-person, manual methods)
 */

import { type NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const takePaymentSchema = z.object({
  paymentMethod: z.enum([
    'SQUARE_TERMINAL',    // Card swiped in person
    'SQUARE_VIRTUAL',     // Card entered by phone
    'PAY_LATER',          // Trusted customer payment
    'CHECK',              // Check payment
    'WIRE_TRANSFER',      // Bank transfer
    'CASH',               // Cash payment
  ]),

  // Square Terminal fields
  squareTerminalId: z.string().optional(),
  squarePaymentId: z.string().optional(),

  // Square Virtual Terminal fields (phone order)
  cardLast4: z.string().optional(),
  cardBrand: z.string().optional(),

  // Manual payment fields
  checkNumber: z.string().optional(),
  wireReferenceNumber: z.string().optional(),

  // General fields
  amount: z.number().positive().optional(), // Optional, defaults to order total
  paymentDate: z.string().datetime().optional(), // Optional, defaults to now
  notes: z.string().optional(),
});

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const validated = takePaymentSchema.parse(body);

    const { id: orderId } = await params;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        User: true,
        OrderItem: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if order is already paid
    if (order.paidAt) {
      return NextResponse.json(
        { error: 'Order has already been paid' },
        { status: 400 }
      );
    }

    // Validate amount (if provided, must match order total)
    const paymentAmount = validated.amount || order.total;
    if (paymentAmount !== order.total) {
      return NextResponse.json(
        {
          error: 'Payment amount does not match order total',
          expected: order.total,
          received: paymentAmount,
        },
        { status: 400 }
      );
    }

    // Determine payment date
    const paymentDate = validated.paymentDate
      ? new Date(validated.paymentDate)
      : new Date();

    // Build payment notes based on method
    let paymentNotes = validated.notes || '';

    switch (validated.paymentMethod) {
      case 'SQUARE_TERMINAL':
        paymentNotes = `Card payment via Square Terminal${validated.squareTerminalId ? ` (Terminal: ${validated.squareTerminalId})` : ''}. ${paymentNotes}`;
        break;
      case 'SQUARE_VIRTUAL':
        paymentNotes = `Card payment via phone${validated.cardLast4 ? ` (Card ending in ${validated.cardLast4})` : ''}${validated.cardBrand ? ` - ${validated.cardBrand}` : ''}. ${paymentNotes}`;
        break;
      case 'CHECK':
        paymentNotes = `Check payment${validated.checkNumber ? ` (Check #${validated.checkNumber})` : ''}. ${paymentNotes}`;
        break;
      case 'WIRE_TRANSFER':
        paymentNotes = `Wire transfer${validated.wireReferenceNumber ? ` (Ref: ${validated.wireReferenceNumber})` : ''}. ${paymentNotes}`;
        break;
      case 'CASH':
        paymentNotes = `Cash payment. ${paymentNotes}`;
        break;
      case 'PAY_LATER':
        paymentNotes = `Pay later arrangement (trusted customer). ${paymentNotes}`;
        break;
    }

    // Update order with payment information
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: paymentDate,
        paymentMethodType: validated.paymentMethod,
        squarePaymentId: validated.squarePaymentId || order.squarePaymentId,

        // Create status history entry
        StatusHistory: {
          create: {
            id: `sh_${randomBytes(16).toString('hex')}`,
            fromStatus: order.status,
            toStatus: 'PAID',
            notes: paymentNotes,
            changedBy: user.id,
          },
        },
      },
      include: {
        User: true,
        OrderItem: true,
        StatusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paidAt: updatedOrder.paidAt,
        paymentMethodType: updatedOrder.paymentMethodType,
        total: updatedOrder.total,
      },
      message: `Payment of $${(paymentAmount / 100).toFixed(2)} recorded successfully via ${validated.paymentMethod}`,
    });
  } catch (error) {
    console.error('Error taking payment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to record payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
