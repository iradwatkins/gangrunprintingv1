/**
 * SEO Brain API - Telegram Webhook
 *
 * POST /api/seo-brain/webhook
 *
 * Handles responses from Telegram bot
 */

import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seoBrain } from '@/lib/seo-brain/orchestrator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract message from Telegram webhook
    const message = body.message
    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const text = message.text.trim().toUpperCase()

    // Check if this is a decision response (A, B, or C)
    if (!['A', 'B', 'C'].includes(text)) {
      return NextResponse.json({ ok: true })
    }

    console.log('[SEO Brain Webhook] Received decision:', text)

    // Find most recent pending decision
    const pendingDecision = await prisma.sEOBrainDecision.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })

    if (!pendingDecision) {
      console.log('[SEO Brain Webhook] No pending decisions found')
      return NextResponse.json({ ok: true })
    }

    // Update decision with user response
    await prisma.sEOBrainDecision.update({
      where: { id: pendingDecision.id },
      data: {
        selectedOption: text,
        respondedAt: new Date(),
        status: 'APPROVED',
      },
    })

    console.log('[SEO Brain Webhook] Decision approved:', text, 'for', pendingDecision.id)

    // Execute the decision
    await seoBrain.executeDecision(pendingDecision.id, text)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[SEO Brain Webhook] Error:', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    webhook: 'SEO Brain Telegram Webhook',
  })
}
