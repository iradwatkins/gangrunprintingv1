import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import { z } from 'zod'

const settingSchema = z.object({
  key: z.string(),
  value: z.string(),
  category: z.string(),
  isEncrypted: z.boolean(),
  isActive: z.boolean(),
})

const requestSchema = z.object({
  settings: z.array(settingSchema),
})

// POST /api/admin/design-center/settings - Save API settings
export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = requestSchema.parse(body)

    // Upsert each setting
    const results = await Promise.all(
      settings.map(async (setting) => {
        // Only upsert if value is not empty
        if (!setting.value.trim()) {
          // If empty and exists, deactivate it
          const existing = await prisma.settings.findUnique({
            where: { key: setting.key },
          })

          if (existing) {
            return prisma.settings.update({
              where: { key: setting.key },
              data: { isActive: false },
            })
          }
          return null
        }

        return prisma.settings.upsert({
          where: { key: setting.key },
          create: {
            key: setting.key,
            value: setting.value,
            category: setting.category,
            isEncrypted: setting.isEncrypted,
            isActive: setting.isActive,
            description: getProviderDescription(setting.key),
          },
          update: {
            value: setting.value,
            isActive: setting.isActive,
            isEncrypted: setting.isEncrypted,
          },
        })
      })
    )

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      count: results.filter(Boolean).length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Error saving settings:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to save settings',
      },
      { status: 500 }
    )
  }
}

// GET /api/admin/design-center/settings - Get AI provider settings
export async function GET() {
  try {
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.settings.findMany({
      where: {
        category: 'ai_image_generation',
      },
      orderBy: { key: 'asc' },
    })

    // Mask sensitive values in response
    const maskedSettings = settings.map((setting) => ({
      ...setting,
      value: setting.value ? '••••••••' : null,
    }))

    return NextResponse.json({ settings: maskedSettings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
      },
      { status: 500 }
    )
  }
}

function getProviderDescription(key: string): string {
  const descriptions: Record<string, string> = {
    ai_google_imagen_api_key: 'Google Imagen 3 via Vertex AI',
    ai_openai_api_key: 'OpenAI DALL-E 3',
    ai_stability_api_key: 'Stability AI Stable Diffusion',
    ai_midjourney_api_key: 'Midjourney (third-party API)',
  }
  return descriptions[key] || 'AI Image Generation Provider'
}
