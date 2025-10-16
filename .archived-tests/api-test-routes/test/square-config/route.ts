import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    serverSide: {
      accessToken: process.env.SQUARE_ACCESS_TOKEN?.substring(0, 10) + '...',
      environment: process.env.SQUARE_ENVIRONMENT,
      locationId: process.env.SQUARE_LOCATION_ID,
      applicationId: process.env.SQUARE_APPLICATION_ID,
    },
    clientSide: {
      publicEnvironment: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT,
      publicLocationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      publicApplicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
    },
  })
}
