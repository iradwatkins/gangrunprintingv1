import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Client as MinioClient } from 'minio'
import { validateRequest } from '@/lib/auth'

const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
})

const bucketName = process.env.MINIO_BUCKET_NAME || 'gangrun-uploads'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { id } = await params

    // Get order with all related data
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        OrderItem: {
          include: {
            OrderItemAddOn: true,
          },
        },
        File: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Collect all file paths to delete from MinIO
    const filesToDelete: string[] = []

    // Get uploaded files from order items
    for (const item of order.OrderItem) {
      if (item.options && typeof item.options === 'object') {
        const options = item.options as any

        // Check for uploadedImages array
        if (Array.isArray(options.uploadedImages)) {
          for (const file of options.uploadedImages) {
            if (file.url) {
              // Extract path from URL (remove domain/bucket prefix)
              const urlObj = new URL(file.url)
              const path = urlObj.pathname.split('/').slice(2).join('/') // Remove /bucket/ prefix
              if (path) {
                filesToDelete.push(path)
              }
            }
          }
        }
      }
    }

    // Get files from File model
    for (const file of order.File) {
      if (file.fileUrl) {
        try {
          const urlObj = new URL(file.fileUrl)
          const path = urlObj.pathname.split('/').slice(2).join('/') // Remove /bucket/ prefix
          if (path) {
            filesToDelete.push(path)
          }
        } catch (e) {
          console.error('Error parsing file URL:', e)
        }
      }
    }

    // Delete files from MinIO
    const deleteErrors: string[] = []
    for (const filePath of filesToDelete) {
      try {
        await minioClient.removeObject(bucketName, filePath)
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error)
        deleteErrors.push(filePath)
      }
    }

    // Delete order from database (cascade will handle related records)
    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
      filesDeleted: filesToDelete.length - deleteErrors.length,
      fileErrors: deleteErrors.length,
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
