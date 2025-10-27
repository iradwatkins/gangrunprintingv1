/**
 * API: Get recommended angles for camera + picture type
 *
 * GET /api/admin/design-center/camera-recommendations/angles?camera=DSLR%20Camera&pictureType=Product%20Photography
 *
 * Returns list of recommended angles for this combination
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAnglesForPictureType } from '@/lib/ai/camera-recommendations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const camera = searchParams.get('camera')
    const pictureType = searchParams.get('pictureType')

    if (!camera || !pictureType) {
      return NextResponse.json(
        { error: 'Camera and pictureType parameters required' },
        { status: 400 }
      )
    }

    const angles = await getAnglesForPictureType(camera, pictureType)
    return NextResponse.json(angles)
  } catch (error) {
    console.error('Error fetching angles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch angles' },
      { status: 500 }
    )
  }
}
