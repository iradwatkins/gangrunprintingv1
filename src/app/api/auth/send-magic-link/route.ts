import { type NextRequest, NextResponse } from 'next/server'
import { sendMagicLink } from '@/lib/auth'
import { z } from 'zod'

const sendMagicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = sendMagicLinkSchema.parse(body)

    await sendMagicLink(email, name)

    return NextResponse.json(
      {
        message: 'Magic link sent to your email address',
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to send magic link',
      },
      { status: 500 }
    )
  }
}
