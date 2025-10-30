import { NextRequest, NextResponse } from 'next/server'
import { validateRequest } from '@/lib/auth'

/**
 * AI Product Designer API
 * Generates SEO-optimized product content
 *
 * POST /api/ai-agents/create-product
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const { user } = await validateRequest()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productName, context = '', targetAudience = '', preview = true } = body

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    // Generate SEO-optimized content
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Generate short description (meta description optimized)
    const shortDescription = context
      ? `${productName} - ${context}. ${targetAudience ? `Perfect for ${targetAudience}.` : ''} High-quality printing services.`
      : `Professional ${productName} printing services. High-quality, fast turnaround, competitive pricing.`

    // Generate long description with SEO keywords
    const longDescription = `
<h2>Premium ${productName}</h2>
<p>${shortDescription.substring(0, 155)}</p>

<h3>Features & Benefits</h3>
<ul>
  <li>Professional-grade printing quality</li>
  <li>Fast turnaround times</li>
  <li>Competitive pricing</li>
  <li>Multiple size and finish options</li>
  <li>Free design review</li>
</ul>

${context ? `<p><strong>Special Features:</strong> ${context}</p>` : ''}
${targetAudience ? `<p><strong>Ideal For:</strong> ${targetAudience}</p>` : ''}

<h3>Why Choose GangRun Printing?</h3>
<p>GangRun Printing offers the highest quality ${productName} with exceptional customer service and competitive pricing. Our state-of-the-art printing technology ensures your products look professional and make a lasting impression.</p>

<h3>Specifications</h3>
<ul>
  <li>Various sizes available</li>
  <li>Multiple paper stocks and finishes</li>
  <li>Full-color printing</li>
  <li>Custom quantities</li>
</ul>
    `.trim()

    // Calculate SEO score based on content quality
    const seoScore = Math.min(
      100,
      50 + // Base score
      (shortDescription.length >= 120 && shortDescription.length <= 160 ? 15 : 0) + // Meta description length
      (productName.length > 0 ? 10 : 0) + // Has product name
      (context ? 10 : 0) + // Has context
      (targetAudience ? 10 : 0) + // Has target audience
      (longDescription.split(/\s+/).length >= 100 ? 5 : 0) // Sufficient content length
    )

    const response = {
      seoContent: {
        name: productName,
        slug: slug,
        shortDescription: shortDescription.substring(0, 160),
        description: longDescription,
        metaTitle: `${productName} | GangRun Printing`,
        metaDescription: shortDescription.substring(0, 155),
        seoScore: seoScore,
        keywords: [
          productName.toLowerCase(),
          'printing',
          'custom printing',
          'professional printing',
          ...(context ? context.toLowerCase().split(/\s+/).slice(0, 3) : []),
        ].filter(Boolean),
      },
      prompt: `Generate professional product content for: ${productName}${context ? ` (${context})` : ''}${targetAudience ? ` targeting ${targetAudience}` : ''}`,
      buildPhase: false,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('AI Product Designer error:', error)
    return NextResponse.json(
      { error: 'Failed to generate product content' },
      { status: 500 }
    )
  }
}
