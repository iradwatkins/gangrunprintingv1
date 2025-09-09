import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all vendors or a specific vendor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only admins can view vendors
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('id');

    if (vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
          vendorPaperStocks: {
            include: {
              paperStock: true
            }
          },
          vendorProducts: {
            include: {
              product: true
            }
          },
          orders: {
            select: {
              id: true,
              referenceNumber: true,
              status: true,
              total: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!vendor) {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(vendor);
    }

    // Get all vendors
    const vendors = await prisma.vendor.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            orders: true,
            vendorProducts: true,
            vendorPaperStocks: true
          }
        }
      }
    });

    return NextResponse.json(vendors);

  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

// CREATE a new vendor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      contactEmail,
      orderEmail,
      phone,
      website,
      address,
      supportedCarriers,
      turnaroundDays,
      minimumOrderAmount,
      shippingCostFormula,
      n8nWebhookUrl,
      notes
    } = body;

    // Validate required fields
    if (!name || !contactEmail) {
      return NextResponse.json(
        { error: 'Name and contact email are required' },
        { status: 400 }
      );
    }

    // Check if vendor with same name exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { name }
    });

    if (existingVendor) {
      return NextResponse.json(
        { error: 'Vendor with this name already exists' },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        contactEmail,
        orderEmail: orderEmail || contactEmail,
        phone,
        website,
        address,
        supportedCarriers: supportedCarriers || [],
        turnaroundDays: turnaroundDays || 3,
        minimumOrderAmount,
        shippingCostFormula,
        n8nWebhookUrl,
        notes,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      vendor
    });

  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

// UPDATE a vendor
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      vendor
    });

  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

// DELETE a vendor
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // Check if vendor has active orders
    const activeOrders = await prisma.order.count({
      where: {
        vendorId: id,
        status: {
          notIn: ['DELIVERED', 'CANCELLED', 'REFUNDED']
        }
      }
    });

    if (activeOrders > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vendor with active orders' },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const vendor = await prisma.vendor.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}