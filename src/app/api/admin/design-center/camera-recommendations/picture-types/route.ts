/**
 * API: Get picture types for a camera
 *
 * GET /api/admin/design-center/camera-recommendations/picture-types?camera=DSLR%20Camera
 *
 * Returns list of picture types this camera is best for
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPictureTypesForCamera } from '@/lib/ai/camera-recommendations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const camera = searchParams.get('camera')

    if (!camera) {
      return NextResponse.json(
        { error: 'Camera parameter required' },
        { status: 400 }
      )
    }

    const pictureTypes = await getPictureTypesForCamera(camera)
    return NextResponse.json(pictureTypes)
  } catch (error) {
    console.error('Error fetching picture types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch picture types' },
      { status: 500 }
    )
  }
}
