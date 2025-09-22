import { type NextRequest, NextResponse } from 'next/server'
import { getMinioClient, BUCKETS } from '@/lib/minio-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    // Get session ID from request
    const sessionHeader = request.headers.get('x-session-id')
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    const sessionId = sessionHeader || `session_${ip.replace(/\./g, '_')}_`

    // Try to find the thumbnail for this file ID
    const client = getMinioClient()

    // List objects to find the thumbnail path
    const objectsStream = client.listObjectsV2(BUCKETS.UPLOADS, `temp/`, true)

    let thumbnailPath = null

    for await (const obj of objectsStream) {
      if (obj.name?.includes(`thumbnails/${fileId}.jpg`)) {
        thumbnailPath = obj.name
        break
      }
    }

    if (!thumbnailPath) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 })
    }

    // Get the thumbnail object
    const thumbnailStream = await client.getObject(BUCKETS.UPLOADS, thumbnailPath)

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of thumbnailStream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return the thumbnail with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to serve thumbnail' }, { status: 500 })
  }
}
