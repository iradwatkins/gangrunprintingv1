/**
 * API: Get complete recommendation with auto-fill modifiers
 *
 * GET /api/admin/design-center/camera-recommendations/recommendation?camera=DSLR%20Camera&pictureType=Product%20Photography&angle=Eye%20Level
 *
 * Returns complete recommendation with technical, style, and negative modifiers
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRecommendation } from '@/lib/ai/camera-recommendations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const camera = searchParams.get('camera')
    const pictureType = searchParams.get('pictureType')
    const angle = searchParams.get('angle')

    if (!camera || !pictureType || !angle) {
      return NextResponse.json(
        { error: 'Camera, pictureType, and angle parameters required' },
        { status: 400 }
      )
    }

    const recommendation = await getRecommendation(camera, pictureType, angle)

    if (!recommendation) {
      return NextResponse.json(
        { error: 'No recommendation found for this combination' },
        { status: 404 }
      )
    }

    return NextResponse.json(recommendation)
  } catch (error) {
    console.error('Error fetching recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendation' },
      { status: 500 }
    )
  }
}
