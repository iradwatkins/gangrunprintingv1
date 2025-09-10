import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Re-order functionality - creates a new cart from previous order
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the original order with all details
    const originalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: {
          include: {
            orderItemAddOns: {
              include: {
                addOn: true
              }
            }
          }
        },
        File: true
      }
    });

    if (!originalOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user owns the order or is admin
    if (session.user.role !== 'ADMIN' && originalOrder.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build re-order data structure
    const reorderData = {
      items: originalOrder.OrderItem.map(item => ({
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        price: item.price,
        options: item.options,
        addOns: item.orderItemAddOns.map(addon => ({
          addOnId: addon.addOnId,
          addOnName: addon.addOn.name,
          configuration: addon.configuration,
          price: addon.calculatedPrice
        }))
      })),
      files: originalOrder.File.map(file => ({
        filename: file.filename,
        fileUrl: file.fileUrl,
        fileSize: file.fileSize,
        mimeType: file.mimeType
      })),
      shippingAddress: originalOrder.shippingAddress,
      billingAddress: originalOrder.billingAddress,
      originalOrderId: originalOrder.id,
      originalOrderNumber: originalOrder.referenceNumber
    };

    // Return the re-order data for the frontend to pre-populate forms
    return NextResponse.json({
      success: true,
      reorderData,
      message: 'Order data loaded. Please review and update any necessary information before placing the new order.'
    });

  } catch (error) {
    console.error('Error preparing re-order:', error);
    return NextResponse.json(
      { error: 'Failed to prepare re-order' },
      { status: 500 }
    );
  }
}

// Get re-orderable items for a user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's delivered orders from the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: 'DELIVERED',
        createdAt: {
          gte: oneYearAgo
        }
      },
      select: {
        id: true,
        referenceNumber: true,
        createdAt: true,
        total: true,
        OrderItem: {
          select: {
            productName: true,
            quantity: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to last 20 delivered orders
    });

    return NextResponse.json({
      reorderableOrders: orders
    });

  } catch (error) {
    console.error('Error fetching re-orderable orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch re-orderable orders' },
      { status: 500 }
    );
  }
}