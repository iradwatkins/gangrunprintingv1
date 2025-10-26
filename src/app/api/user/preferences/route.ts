import { type NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const preferenceSchema = z.object({
  preferredLanguage: z.enum(['en', 'es']).optional(),
})

// PATCH - Update user preferences
export async function PATCH(req: NextRequest) {
  try {
    const { user } = await validateRequest()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = preferenceSchema.parse(body)

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        preferredLanguage: validatedData.preferredLanguage,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        preferredLanguage: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user preferences:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid preference data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
