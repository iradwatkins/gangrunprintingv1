import { NextResponse } from 'next/server'
import { checkMinioHealth, testMinioUpload, getMinioConfig } from '@/lib/minio-health'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get MinIO configuration
    const config = getMinioConfig()

    // Check MinIO health
    const healthCheck = await checkMinioHealth()

    // Test upload functionality
    const uploadTest = await testMinioUpload()

    return NextResponse.json({
      success: healthCheck.available && uploadTest.success,
      message: healthCheck.available ? 'MinIO is healthy and ready' : 'MinIO connection failed',
      config: {
        ...config,
        // Don't expose credentials
        hasCredentials: config.hasCredentials,
      },
      health: healthCheck,
      uploadTest,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('MinIO health check error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
