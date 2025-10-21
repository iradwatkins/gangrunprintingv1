import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import archiver from 'archiver'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch order with files
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        File: {
          select: {
            id: true,
            filename: true,
            fileUrl: true,
            fileType: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.File || order.File.length === 0) {
      return NextResponse.json({ error: 'No files found for this order' }, { status: 404 })
    }

    // Create a zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    })

    // Set response headers for download
    const headers = new Headers()
    headers.set('Content-Type', 'application/zip')
    headers.set('Content-Disposition', `attachment; filename="order-${order.orderNumber}-files.zip"`)

    // Handle archive errors
    archive.on('error', (err) => {
      console.error('Archive error:', err)
      throw err
    })

    // Add each file to the archive
    for (const file of order.File) {
      if (!file.fileUrl) continue

      try {
        // Fetch the file from MinIO or wherever it's stored
        const fileResponse = await fetch(file.fileUrl)

        if (!fileResponse.ok) {
          console.warn(`Failed to fetch file: ${file.filename}`)
          continue
        }

        // Get the file as a buffer
        const fileBuffer = await fileResponse.arrayBuffer()

        // Add to archive with proper filename
        const safeName = file.filename.replace(/[^a-z0-9._-]/gi, '_')
        archive.append(Buffer.from(fileBuffer), { name: safeName })
      } catch (error) {
        console.error(`Error adding file ${file.filename} to archive:`, error)
        // Continue with other files
      }
    }

    // Finalize the archive
    archive.finalize()

    // Convert archive stream to ReadableStream for Next.js
    const readableStream = new ReadableStream({
      start(controller) {
        archive.on('data', (chunk) => {
          controller.enqueue(chunk)
        })

        archive.on('end', () => {
          controller.close()
        })

        archive.on('error', (err) => {
          controller.error(err)
        })
      },
    })

    return new NextResponse(readableStream, { headers })
  } catch (error) {
    console.error('[Download Files API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to download files' },
      { status: 500 }
    )
  }
}
