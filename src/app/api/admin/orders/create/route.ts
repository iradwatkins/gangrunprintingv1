/**
 * Admin Order Creation API
 *
 * POST /api/admin/orders/create
 *
 * Allows admins to create orders on behalf of customers.
 * Supports both existing customers and creating new customer accounts.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { randomBytes } from 'crypto';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const shippingAddressSchema = z.object({
  name: z.string(),
  company: z.string().optional(),
  street: z.string(),
  street2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string().default('United States'),
  phone: z.string().optional(),
});

const orderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productSku: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  options: z.record(z.any()).optional(),
  paperStockId: z.string().optional(),
  dimensions: z.record(z.any()).optional(),
  calculatedWeight: z.number().optional(),
  addOns: z
    .array(
      z.object({
        addOnId: z.string(),
        configuration: z.record(z.any()),
        calculatedPrice: z.number(),
      })
    )
    .optional(),
});

const createOrderSchema = z.object({
  // Customer info - either existing or new
  customerId: z.string().optional(),
  newCustomer: z
    .object({
      email: z.string().email(),
      name: z.string(),
      phone: z.string().optional(),
    })
    .optional(),

  // Order items
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),

  // Pricing
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().positive(),

  // Addresses
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema.optional(),

  // Optional fields
  shippingMethod: z.string().optional(),
  carrier: z.enum(['FEDEX', 'UPS', 'SOUTHWEST_CARGO']).optional(),
  adminNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  customerNotes: z.string().optional(),
  rushOrder: z.boolean().optional(),
  priorityLevel: z.number().int().min(1).max(5).optional(),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
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
    const validated = createOrderSchema.parse(body);

    // Validate customer info - must provide either customerId or newCustomer
    if (!validated.customerId && !validated.newCustomer) {
      return NextResponse.json(
        { error: 'Either customerId or newCustomer must be provided' },
        { status: 400 }
      );
    }

    if (validated.customerId && validated.newCustomer) {
      return NextResponse.json(
        { error: 'Cannot provide both customerId and newCustomer' },
        { status: 400 }
      );
    }

    // Handle customer creation or lookup
    let customerId: string;
    let customerEmail: string;

    if (validated.newCustomer) {
      // Check if customer with this email already exists
      const existingCustomer = await prisma.user.findUnique({
        where: { email: validated.newCustomer.email },
      });

      if (existingCustomer) {
        // Use existing customer instead of creating new one
        customerId = existingCustomer.id;
        customerEmail = existingCustomer.email;
      } else {
        // Create new customer account
        const newCustomer = await prisma.user.create({
          data: {
            id: `user_${randomBytes(16).toString('hex')}`,
            email: validated.newCustomer.email,
            name: validated.newCustomer.name,
            phoneNumber: validated.newCustomer.phone,
            role: 'CUSTOMER',
            emailVerified: false,
          },
        });

        customerId = newCustomer.id;
        customerEmail = newCustomer.email;
      }
    } else {
      // Use existing customer
      const customer = await prisma.user.findUnique({
        where: { id: validated.customerId },
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      customerId = customer.id;
      customerEmail = customer.email;
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        id: `ord_${randomBytes(16).toString('hex')}`,
        orderNumber,
        userId: customerId,
        email: customerEmail,
        phone: validated.shippingAddress.phone || null,
        createdByAdminId: user.id,

        // Pricing
        subtotal: validated.subtotal,
        tax: validated.tax,
        shipping: validated.shipping,
        total: validated.total,

        // Addresses (stored as JSON)
        shippingAddress: validated.shippingAddress,
        billingAddress: validated.billingAddress || validated.shippingAddress,

        // Status
        status: 'PENDING_PAYMENT',
        paymentMethodType: 'SQUARE_INVOICE', // Default for admin-created orders

        // Optional fields
        shippingMethod: validated.shippingMethod,
        carrier: validated.carrier,
        adminNotes: validated.adminNotes,
        internalNotes: validated.internalNotes,
        customerNotes: validated.customerNotes,
        rushOrder: validated.rushOrder || false,
        priorityLevel: validated.priorityLevel || 3,

        // Create order items
        OrderItem: {
          create: validated.items.map((item) => ({
            id: `oi_${randomBytes(16).toString('hex')}`,
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            price: item.price,
            options: item.options,
            paperStockId: item.paperStockId,
            dimensions: item.dimensions,
            calculatedWeight: item.calculatedWeight,

            // Create addons if provided
            OrderItemAddOn: item.addOns
              ? {
                  create: item.addOns.map((addOn) => ({
                    id: `oia_${randomBytes(16).toString('hex')}`,
                    addOnId: addOn.addOnId,
                    configuration: addOn.configuration,
                    calculatedPrice: addOn.calculatedPrice,
                  })),
                }
              : undefined,
          })),
        },

        // Create status history entry
        StatusHistory: {
          create: {
            id: `sh_${randomBytes(16).toString('hex')}`,
            toStatus: 'PENDING_PAYMENT',
            notes: 'Order created by admin',
            changedBy: user.id,
          },
        },
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
        StatusHistory: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          customerId: order.userId,
          customerEmail: order.email,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        },
        message: 'Order created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin order:', error);

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
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generate unique order number
 * Format: GR-YYYYMMDD-XXXX
 * Example: GR-20251012-0123
 */
async function generateOrderNumber(): Promise<string> {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD

  // Find last order for today
  const prefix = `GR-${dateStr}-`;

  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      orderNumber: true,
    },
  });

  let sequence = 1;

  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2], 10);
    sequence = lastSequence + 1;
  }

  return `${prefix}${sequence.toString().padStart(4, '0')}`;
}
