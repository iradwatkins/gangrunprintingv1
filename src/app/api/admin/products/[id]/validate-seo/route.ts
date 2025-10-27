/**
 * Product SEO Validation API Endpoint
 *
 * POST /api/admin/products/[id]/validate-seo
 *
 * Purpose: Validate and score product names for SEO quality using AI
 *
 * Date: October 27, 2025
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateProductName } from '@/lib/seo/product-name-validator'

/**
 * POST /api/admin/products/[id]/validate-seo
 * Validate a product name for SEO quality and provide improvement suggestions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication check
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin-only endpoint
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // 2. Fetch the product
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // 3. Validate the product name
    const validation = await validateProductName(product.name, {
      categoryName: product.category?.name,
      description: product.description || undefined,
      suggestOptimization: true,
    })

    // 4. Update product SEO fields in database
    await prisma.product.update({
      where: { id: params.id },
      data: {
        seoScore: validation.score,
        lastOptimizedAt: new Date(),
      },
    })

    // 5. Return validation result
    return NextResponse.json({
      success: true,
      validation,
      message: `SEO score: ${validation.score}/100 (${validation.category})`,
    })
  } catch (error) {
    console.error('Error validating product SEO:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to validate product SEO',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/products/[id]/validate-seo
 * Get the current SEO score for a product (from database)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication check
    const { user } = await validateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch product SEO data
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        seoScore: true,
        lastOptimizedAt: true,
        seoKeywords: true,
        seoMetaTitle: true,
        seoMetaDescription: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      seo: {
        score: product.seoScore,
        lastValidated: product.lastOptimizedAt,
        productName: product.name,
        keywords: product.seoKeywords,
        metaTitle: product.seoMetaTitle,
        metaDescription: product.seoMetaDescription,
      },
    })
  } catch (error) {
    console.error('Error fetching product SEO:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch product SEO data',
      },
      { status: 500 }
    )
  }
}
