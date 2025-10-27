/**
 * API Route: GET /api/modifiers
 *
 * Purpose: Fetch all modifier presets for Design Center quick-select UI
 *
 * Returns modifiers grouped by category:
 * {
 *   STYLE: [...],
 *   TECHNICAL: [...],
 *   NEGATIVE: [...],
 *   HOLIDAY: [...],
 *   LOCATION: [...]
 * }
 *
 * Date: October 27, 2025
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ModifierCategory } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface ModifiersByCategory {
  [key: string]: Array<{
    id: string
    label: string
    value: string
    description: string | null
    sortOrder: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    // Get optional category filter from query params
    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category')

    // Fetch modifiers
    const modifiers = await prisma.modifierPreset.findMany({
      where: {
        isActive: true,
        ...(categoryParam && {
          category: categoryParam as ModifierCategory,
        }),
      },
      select: {
        id: true,
        category: true,
        label: true,
        value: true,
        description: true,
        sortOrder: true,
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    })

    // Group by category
    const grouped: ModifiersByCategory = modifiers.reduce(
      (acc: ModifiersByCategory, modifier) => {
        const category = modifier.category
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push({
          id: modifier.id,
          label: modifier.label,
          value: modifier.value,
          description: modifier.description,
          sortOrder: modifier.sortOrder,
        })
        return acc
      },
      {} as ModifiersByCategory
    )

    // Return grouped modifiers
    return NextResponse.json({
      success: true,
      data: grouped,
      meta: {
        total: modifiers.length,
        categories: Object.keys(grouped),
      },
    })
  } catch (error) {
    console.error('Error fetching modifiers:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch modifiers',
      },
      { status: 500 }
    )
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
