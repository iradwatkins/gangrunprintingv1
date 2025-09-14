import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  getPresignedDownloadUrl,
  deleteFile,
  getFileMetadata,
  BUCKETS 
} from '@/lib/minio-client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { user, session } = await validateRequest()
    
    // Get file record from database
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            userId: true,
            email: true
          }
        }
      }
    })
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    // Check authorization
    const isOwner = file.order?.email === session?.user?.email
    const isAdmin = (session?.user as any)?.role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get file metadata from MinIO
    const metadata = await getFileMetadata(BUCKETS.UPLOADS, file.fileUrl)
    
    // Generate presigned download URL
    const downloadUrl = await getPresignedDownloadUrl(
      BUCKETS.UPLOADS,
      file.fileUrl,
      3600 // 1 hour expiry
    )
    
    return NextResponse.json({
      file: {
        ...file,
        metadata,
        downloadUrl
      }
    })
  } catch (error) {
    console.error('Error fetching file:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { user, session } = await validateRequest()
    
    // Only admins can delete files
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get file record
    const file = await prisma.file.findUnique({
      where: { id }
    })
    
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    // Delete from MinIO
    await deleteFile(BUCKETS.UPLOADS, file.fileUrl)
    
    // Delete from database
    await prisma.file.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}