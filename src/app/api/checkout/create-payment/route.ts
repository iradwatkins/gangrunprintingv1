import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSquareCheckout, createOrUpdateSquareCustomer } from '@/lib/square'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { randomUUID } from 'crypto'

// Zod schemas for checkout validation
const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
  country: z.string().default('US'),
  isResidential: z.boolean().optional(),
})

const cartItemSchema = z.object({
  id: z.string(),
  productName: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  options: z.record(z.string(), z.unknown()).optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
})

const uploadedImageSchema = z.object({
  id: z.string(),
  url: z.string().min(1),
  thumbnailUrl: z.string().optional(),
  fileName: z.string(),
  fileSize: z.number().optional(),
  uploadedAt: z.string().optional(),
})

const customerInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
})

const shippingRateSchema = z.object({
  carrier: z.string(),
  serviceName: z.string(),
  cost: z.number().nonnegative(),
  deliveryDays: z.number().optional(),
})

const createPaymentSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1, 'Cart must contain at least one item'),
  uploadedImages: z.array(uploadedImageSchema).optional(),
  customerInfo: customerInfoSchema,
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  shippingRate: shippingRateSchema.optional(),
  selectedAirportId: z.string().uuid().optional(),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().positive(),
})

interface CartItem {
  id: string
  productName: string
  sku: string
  quantity: number
  price: number
  options?: any
  fileName?: string
  fileSize?: number
}

interface UploadedImage {
  id: string
  url: string
  thumbnailUrl?: string
  fileName: string
  fileSize?: number
  uploadedAt?: string
}

export async function POST(request: NextRequest) {
  try {
    const { user, session } = await validateRequest()
    const rawBody = await request.json()

    // Validate request body with Zod
    const validation = createPaymentSchema.safeParse(rawBody)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const {
      cartItems,
      uploadedImages,
      customerInfo,
      shippingAddress,
      billingAddress,
      shippingRate,
      selectedAirportId,
      subtotal,
      tax,
      shipping,
      total,
    } = validation.data

    // Normalize email to lowercase for consistent lookup
    const normalizedEmail = customerInfo.email.toLowerCase()

    // Find or create customer
    let customer = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive',
        },
      },
    })

    if (!customer) {
      // Create new customer
      customer = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: normalizedEmail,
          name:
            `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim() || 'Customer',
          role: 'CUSTOMER',
          emailVerified: false,
          updatedAt: new Date(),
        },
      })
    }

    // Generate order number
    const orderNumber = `GRP-${Date.now().toString(36).toUpperCase()}`

    // Create or update Square customer
    const squareCustomer = await createOrUpdateSquareCustomer(
      normalizedEmail,
      `${customerInfo.firstName} ${customerInfo.lastName}`,
      customerInfo.phone
    )

    // Create order in database with PENDING_PAYMENT status
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const order = await prisma.order.create({
      data: {
        id: orderId,
        orderNumber,
        referenceNumber: orderNumber,
        updatedAt: new Date(),
        userId: customer.id,
        email: normalizedEmail,
        phone: customerInfo.phone,
        subtotal,
        tax,
        shipping,
        total,
        shippingMethod: shippingRate
          ? `${shippingRate.carrier} - ${shippingRate.serviceName}`
          : null,
        selectedAirportId,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        status: 'PENDING_PAYMENT',
        squareCustomerId: squareCustomer.id,
        // Store uploaded images in adminNotes as JSON
        adminNotes: uploadedImages ? JSON.stringify({ uploadedImages }) : undefined,
        OrderItem: {
          create: cartItems.map((item: CartItem) => ({
            id: `${orderNumber}-${item.id}`,
            productName: item.productName,
            productSku: item.sku,
            quantity: item.quantity,
            price: item.price,
            options: {
              ...item.options,
              fileName: item.fileName,
              fileSize: item.fileSize,
              uploadedImages: uploadedImages, // Store images with each item
            },
          })),
        },
      },
    })

    // Create Square checkout
    const lineItems = cartItems.map((item: CartItem) => ({
      name: `${item.productName} - ${item.options.size || 'Standard'}`,
      quantity: item.quantity.toString(),
      basePriceMoney: {
        amount: BigInt(Math.round(item.price * 100)), // Convert to cents
        currency: 'USD',
      },
    }))

    const checkout = await createSquareCheckout({
      amount: Math.round(total * 100), // Convert to cents
      orderNumber: order.orderNumber,
      email: customerInfo.email,
      items: lineItems,
    })

    // Update order with Square IDs
    await prisma.order.update({
      where: { id: order.id },
      data: {
        squareOrderId: checkout.orderId,
      },
    })

    // Note: Confirmation email will be sent by Square webhook after payment completes
    // Flow: Square webhook → OrderService.processPayment → OrderEmailService.sendOrderConfirmation

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.url,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('[Checkout] Error:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: error.issues,
        },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
