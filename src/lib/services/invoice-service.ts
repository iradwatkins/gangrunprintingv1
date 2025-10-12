/**
 * Invoice Service
 *
 * Handles all invoice-related business logic:
 * - Invoice generation
 * - Invoice numbering
 * - Payment tracking
 * - Email notifications
 */

import { prisma } from '@/lib/prisma';
import { Prisma, PaymentMethodType } from '@prisma/client';
import { randomUUID } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface CreateInvoiceParams {
  orderId: string;
  paymentDueDate?: Date;
  customMessage?: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceId: string;
  order: {
    id: string;
    orderNumber: string;
    total: number;
    subtotal: number;
    tax: number;
    shipping: number;
    items: {
      productName: string;
      quantity: number;
      price: number;
      options?: any;
    }[];
    customer: {
      name: string | null;
      email: string;
      phone: string | null;
    };
    shippingAddress: any;
  };
  paymentDueDate: Date;
  paymentLink: string;
  status: 'pending' | 'viewed' | 'paid' | 'overdue';
}

export interface RecordPaymentParams {
  invoiceId: string;
  paymentMethodType: PaymentMethodType;
  squarePaymentId?: string;
  paymentIntentId?: string;
  notes?: string;
}

// ============================================================================
// INVOICE NUMBER GENERATION
// ============================================================================

/**
 * Generate unique invoice number in format: INV-YYYY-XXXXXX
 * Example: INV-2025-000123
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Find the last invoice for this year
  const lastInvoice = await prisma.order.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      invoiceNumber: true,
    },
  });

  let sequence = 1;

  if (lastInvoice?.invoiceNumber) {
    // Extract sequence number from last invoice
    const parts = lastInvoice.invoiceNumber.split('-');
    const lastSequence = parseInt(parts[2], 10);
    sequence = lastSequence + 1;
  }

  // Format: INV-2025-000123 (6 digits, zero-padded)
  return `INV-${year}-${sequence.toString().padStart(6, '0')}`;
}

/**
 * Generate unique invoice ID (UUID v4)
 * Used for public invoice view URLs
 */
export function generateInvoiceId(): string {
  return randomUUID();
}

// ============================================================================
// INVOICE CREATION
// ============================================================================

/**
 * Create invoice for an order
 * Sets invoice number, invoice ID, and payment due date
 */
export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceDetails> {
  const { orderId, paymentDueDate, customMessage } = params;

  // Get order with items and customer info
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      OrderItem: {
        include: {
          OrderItemAddOn: {
            include: {
              AddOn: true,
            },
          },
        },
      },
      User: true,
    },
  });

  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  if (order.invoiceNumber) {
    throw new Error(`Order ${orderId} already has an invoice: ${order.invoiceNumber}`);
  }

  // Calculate due date (default: 7 days from now)
  const dueDate = paymentDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Generate invoice identifiers
  const invoiceNumber = await generateInvoiceNumber();
  const invoiceId = generateInvoiceId();

  // Update order with invoice details
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      invoiceNumber,
      invoiceId,
      paymentDueDate: dueDate,
      invoiceSentAt: new Date(),
    },
    include: {
      OrderItem: {
        include: {
          OrderItemAddOn: {
            include: {
              AddOn: true,
            },
          },
        },
      },
      User: true,
    },
  });

  // Create status history entry
  await prisma.statusHistory.create({
    data: {
      orderId: order.id,
      fromStatus: order.status,
      toStatus: order.status,
      notes: `Invoice ${invoiceNumber} generated and sent to customer`,
      changedBy: order.createdByAdminId || undefined,
    },
  });

  // Build invoice details
  const paymentLink = `${process.env.NEXT_PUBLIC_URL}/invoice/${invoiceId}`;

  return buildInvoiceDetails(updatedOrder, paymentLink);
}

/**
 * Get invoice details by invoice ID
 */
export async function getInvoiceByInvoiceId(invoiceId: string): Promise<InvoiceDetails | null> {
  const order = await prisma.order.findUnique({
    where: { invoiceId },
    include: {
      OrderItem: {
        include: {
          OrderItemAddOn: {
            include: {
              AddOn: true,
            },
          },
        },
      },
      User: true,
    },
  });

  if (!order) {
    return null;
  }

  const paymentLink = `${process.env.NEXT_PUBLIC_URL}/invoice/${invoiceId}`;
  return buildInvoiceDetails(order, paymentLink);
}

/**
 * Track when customer views invoice
 */
export async function trackInvoiceView(invoiceId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { invoiceId },
    select: { id: true, invoiceViewedAt: true },
  });

  if (!order) {
    throw new Error(`Invoice ${invoiceId} not found`);
  }

  // Only record first view
  if (!order.invoiceViewedAt) {
    await prisma.order.update({
      where: { invoiceId },
      data: {
        invoiceViewedAt: new Date(),
      },
    });
  }
}

// ============================================================================
// PAYMENT PROCESSING
// ============================================================================

/**
 * Record payment for an invoice
 * Updates order status to PAID and records payment details
 */
export async function recordPayment(params: RecordPaymentParams): Promise<void> {
  const { invoiceId, paymentMethodType, squarePaymentId, paymentIntentId, notes } = params;

  const order = await prisma.order.findUnique({
    where: { invoiceId },
  });

  if (!order) {
    throw new Error(`Invoice ${invoiceId} not found`);
  }

  if (order.paidAt) {
    throw new Error(`Invoice ${invoiceId} has already been paid`);
  }

  // Update order with payment info
  await prisma.order.update({
    where: { invoiceId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      paymentMethodType,
      squarePaymentId: squarePaymentId || order.squarePaymentId,
      paymentIntentId,
    },
  });

  // Create status history entry
  await prisma.statusHistory.create({
    data: {
      orderId: order.id,
      fromStatus: order.status,
      toStatus: 'PAID',
      notes: notes || `Payment received via ${paymentMethodType}`,
      changedBy: order.createdByAdminId || undefined,
    },
  });
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(order: { paymentDueDate: Date | null; paidAt: Date | null }): boolean {
  if (order.paidAt) return false; // Paid invoices are never overdue
  if (!order.paymentDueDate) return false; // No due date set

  return order.paymentDueDate < new Date();
}

/**
 * Get invoice status
 */
export function getInvoiceStatus(order: {
  paidAt: Date | null;
  invoiceViewedAt: Date | null;
  paymentDueDate: Date | null;
}): 'pending' | 'viewed' | 'paid' | 'overdue' {
  if (order.paidAt) return 'paid';
  if (isInvoiceOverdue(order)) return 'overdue';
  if (order.invoiceViewedAt) return 'viewed';
  return 'pending';
}

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Get all unpaid invoices
 */
export async function getUnpaidInvoices() {
  return prisma.order.findMany({
    where: {
      invoiceNumber: { not: null },
      paidAt: null,
    },
    include: {
      User: true,
      OrderItem: true,
    },
    orderBy: {
      paymentDueDate: 'asc',
    },
  });
}

/**
 * Get overdue invoices
 */
export async function getOverdueInvoices() {
  return prisma.order.findMany({
    where: {
      invoiceNumber: { not: null },
      paidAt: null,
      paymentDueDate: {
        lt: new Date(),
      },
    },
    include: {
      User: true,
      OrderItem: true,
    },
    orderBy: {
      paymentDueDate: 'asc',
    },
  });
}

/**
 * Get invoices created by admin
 */
export async function getInvoicesByAdmin(adminId: string) {
  return prisma.order.findMany({
    where: {
      createdByAdminId: adminId,
      invoiceNumber: { not: null },
    },
    include: {
      User: true,
      OrderItem: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Build invoice details object from order
 */
function buildInvoiceDetails(order: any, paymentLink: string): InvoiceDetails {
  return {
    invoiceNumber: order.invoiceNumber!,
    invoiceId: order.invoiceId!,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      items: order.OrderItem.map((item: any) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        options: item.options,
      })),
      customer: {
        name: order.User?.name || null,
        email: order.email,
        phone: order.phone || null,
      },
      shippingAddress: order.shippingAddress,
    },
    paymentDueDate: order.paymentDueDate!,
    paymentLink,
    status: getInvoiceStatus(order),
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
