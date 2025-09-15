import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { CampaignService } from '@/lib/marketing/campaign-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, session } = await validateRequest()
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const metrics = await CampaignService.getCampaignMetrics(params.id)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching campaign metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}