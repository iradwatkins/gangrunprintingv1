import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRequest } from '@/lib/auth';
import { z } from 'zod';

// GET - List all files for an order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest();
    const orderId = params.id;

    // Verify order exists and user has access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        User: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdmin = session?.user?.role === 'ADMIN';
    const isOwner = session?.user?.email === order.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get all files for the order
    const files = await prisma.orderFile.findMany({
      where: {
        orderId,
        isVisible: true,
      },
      include: {
        FileMessage: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Include last 5 messages per file
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter out admin-only files for customers
    const visibleFiles = isAdmin
      ? files
      : files.filter((file) => file.notifyCustomer || file.uploadedByRole === 'CUSTOMER');

    return NextResponse.json({
      files: visibleFiles,
      count: visibleFiles.length,
    });
  } catch (error) {
    console.error('Error fetching order files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// POST - Upload a new file
const uploadSchema = z.object({
  filename: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  fileType: z.enum(['CUSTOMER_ARTWORK', 'ADMIN_PROOF', 'PRODUCTION_FILE', 'REFERENCE', 'ATTACHMENT']).default('CUSTOMER_ARTWORK'),
  label: z.string().optional(),
  approvalStatus: z.enum(['WAITING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED']).optional(),
  message: z.string().optional(), // Optional message with upload
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest();
    const orderId = params.id;

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const {
      checkRateLimit,
      getRateLimitIdentifier,
      getClientIp,
      formatRateLimitError,
      addRateLimitHeaders,
      RATE_LIMITS
    } = await import('@/lib/security/rate-limiter');

    const clientIp = getClientIp(request.headers);
    const rateLimitId = getRateLimitIdentifier(clientIp, user.id);
    const rateLimitResult = checkRateLimit(rateLimitId, RATE_LIMITS.FILE_UPLOAD);

    if (!rateLimitResult.allowed) {
      const errorResponse = NextResponse.json(
        { error: formatRateLimitError(rateLimitResult) },
        { status: 429 }
      );
      addRateLimitHeaders(errorResponse.headers, rateLimitResult);
      return errorResponse;
    }

    // Verify order exists and user has access
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const isAdmin = user.role === 'ADMIN';
    const isOwner = user.email === order.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = uploadSchema.parse(body);

    // File validation and sanitization
    const { validateFile } = await import('@/lib/security/file-validator');

    if (data.filename && data.fileSize && data.mimeType) {
      const validationResult = await validateFile(
        data.filename,
        data.fileSize,
        data.mimeType,
        orderId
      );

      if (!validationResult.valid) {
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 }
        );
      }

      // Use sanitized filename
      data.filename = validationResult.sanitizedFilename || data.filename;
    }

    // Determine upload role and approval status
    const uploadedByRole = isAdmin ? 'ADMIN' : 'CUSTOMER';
    const approvalStatus = data.approvalStatus || (uploadedByRole === 'ADMIN' ? 'WAITING' : 'NOT_REQUIRED');

    // Create the file record
    const orderFile = await prisma.orderFile.create({
      data: {
        orderId,
        filename: data.filename,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        thumbnailUrl: data.thumbnailUrl,
        fileType: data.fileType,
        label: data.label,
        approvalStatus,
        uploadedBy: user.id,
        uploadedByRole,
        notifyCustomer: uploadedByRole === 'ADMIN',
        notifyAdmin: uploadedByRole === 'CUSTOMER',
      },
    });

    // Add initial message if provided
    if (data.message) {
      await prisma.fileMessage.create({
        data: {
          orderFileId: orderFile.id,
          message: data.message,
          authorId: user.id,
          authorRole: isAdmin ? 'admin' : 'customer',
          authorName: user.name || user.email,
        },
      });
    }

    // Send email notification based on uploadedByRole
    try {
      if (uploadedByRole === 'ADMIN' && data.fileType === 'ADMIN_PROOF' && approvalStatus === 'WAITING') {
        // Admin uploaded a proof for customer approval - notify customer
        const { FileApprovalEmailService } = await import('@/lib/email/file-approval-email-service');
        const orderWithUser = await prisma.order.findUnique({
          where: { id: orderId },
          include: { User: { select: { name: true } } },
        });

        if (orderWithUser) {
          await FileApprovalEmailService.sendProofReadyNotification(
            {
              id: orderWithUser.id,
              orderNumber: orderWithUser.orderNumber,
              email: orderWithUser.email,
              User: orderWithUser.User,
            },
            {
              id: orderFile.id,
              label: orderFile.label || undefined,
              filename: orderFile.filename,
            },
            data.message
          );
        }
      }
    } catch (emailError) {
      console.error('Failed to send file upload email:', emailError);
      // Don't fail the request if email fails
    }

    // Add rate limit headers to response
    const response = NextResponse.json(orderFile, { status: 201 });
    addRateLimitHeaders(response.headers, rateLimitResult);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
