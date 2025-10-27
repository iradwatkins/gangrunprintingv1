/**
 * API: Get all camera types
 *
 * GET /api/admin/design-center/camera-recommendations/cameras
 *
 * Returns list of available cameras
 */

import { NextResponse } from 'next/server'
import { getCameraTypes } from '@/lib/ai/camera-recommendations'

export async function GET() {
  try {
    const cameras = await getCameraTypes()
    return NextResponse.json(cameras)
  } catch (error) {
    console.error('Error fetching cameras:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cameras' },
      { status: 500 }
    )
  }
}
