import { type NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCurrentTenant } from '@/lib/tenants/resolver'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const namespace = searchParams.get('namespace')
    const locale = searchParams.get('locale')
    const source = searchParams.get('source')
    const unapproved = searchParams.get('unapproved') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get tenant context
    const tenantContext = await getCurrentTenant()
    const tenantId = tenantContext?.tenant?.id

    // Build where clause
    const where: Record<string, unknown> = {
      OR: [
        { tenantId: null }, // Global translations
        { tenantId: tenantId }, // Tenant-specific translations
      ],
    }

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { value: { contains: search, mode: 'insensitive' } },
        { namespace: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (namespace && namespace !== 'all') {
      where.namespace = namespace
    }

    if (locale && locale !== 'all') {
      where.locale = locale
    }

    if (source && source !== 'all') {
      where.source = source
    }

    if (unapproved) {
      where.isApproved = false
    }

    // Get translations with pagination
    const [translations, total] = await Promise.all([
      prisma.translation.findMany({
        where,
        orderBy: [{ namespace: 'asc' }, { key: 'asc' }, { locale: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.translation.count({ where }),
    ])

    return NextResponse.json({
      translations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, namespace = 'common', locale, value, context } = body

    if (!key || !locale || !value) {
      return NextResponse.json({ error: 'Key, locale, and value are required' }, { status: 400 })
    }

    // Get tenant context
    const tenantContext = await getCurrentTenant()
    const tenantId = tenantContext?.tenant?.id

    // Check for duplicate
    const existing = await prisma.translation.findFirst({
      where: {
        tenantId,
        key,
        namespace,
        locale,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Translation already exists for this key and locale' },
        { status: 409 }
      )
    }

    // Create translation
    const translation = await prisma.translation.create({
      data: {
        tenantId,
        key,
        namespace,
        locale,
        value,
        context,
        source: 'MANUAL',
        isApproved: true, // Manual translations are auto-approved
        translatedBy: 'admin', // TODO: Get from auth context
      },
    })

    return NextResponse.json(translation, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create translation' }, { status: 500 })
  }
}
