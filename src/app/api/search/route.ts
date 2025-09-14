import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, cacheKeys } from '@/lib/redis'
import { logSearch } from '@/components/GoogleAnalytics'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const inStock = searchParams.get('inStock') === 'true'

    // Generate cache key
    const cacheKey = `search:${JSON.stringify({
      query, category, minPrice, maxPrice, sortBy, page, limit, inStock
    })}`

    // Try to get from cache
    const cached = await cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Build search conditions
    const where: any = {
      AND: []
    }

    // Text search
    if (query) {
      where.AND.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: query.split(' ') } }
        ]
      })
    }

    // Category filter
    if (category) {
      where.AND.push({
        productCategory: {
          name: { equals: category, mode: 'insensitive' }
        }
      })
    }

    // Price range filter
    if (minPrice || maxPrice) {
      const priceFilter: any = {}
      if (minPrice) priceFilter.gte = parseFloat(minPrice)
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice)
      where.AND.push({ basePrice: priceFilter })
    }

    // Stock filter
    if (inStock) {
      where.AND.push({ inStock: true })
    }

    // Clean up empty AND array if no filters
    if (where.AND.length === 0) {
      delete where.AND
    }

    // Determine order by
    let orderBy: any = {}
    switch (sortBy) {
      case 'price_asc':
        orderBy = { basePrice: 'asc' }
        break
      case 'price_desc':
        orderBy = { basePrice: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
        orderBy = { orderCount: 'desc' }
        break
      default:
        // For relevance, we'll sort by a combination of factors
        orderBy = [
          { featured: 'desc' },
          { orderCount: 'desc' },
          { createdAt: 'desc' }
        ]
    }

    // Execute search with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          productCategory: true,
          images: {
            take: 1,
            orderBy: { order: 'asc' }
          },
          sizes: true,
          paperStocks: true,
          coatingOptions: true,
        }
      }),
      prisma.product.count({ where })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Format response
    const response = {
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        category: product.productCategory?.name,
        image: product.images[0]?.url || null,
        inStock: product.inStock,
        featured: product.featured,
        turnaroundTime: product.turnaroundTime,
        sizes: product.sizes.length,
        paperStocks: product.paperStocks.length,
        coatingOptions: product.coatingOptions.length,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      facets: {
        categories: await getCategories(),
        priceRange: await getPriceRange(where),
        attributes: await getAttributes(where)
      }
    }

    // Cache the response for 5 minutes
    await cache.set(cacheKey, response, 300)

    // Log search to analytics
    if (query) {
      logSearch(query)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}

// Get available categories with counts
async function getCategories() {
  const categories = await prisma.productCategory.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { products: true }
      }
    },
    orderBy: {
      products: {
        _count: 'desc'
      }
    }
  })

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: cat._count.products
  }))
}

// Get price range for filters
async function getPriceRange(where: any) {
  const result = await prisma.product.aggregate({
    where,
    _min: { basePrice: true },
    _max: { basePrice: true },
    _avg: { basePrice: true }
  })

  return {
    min: result._min.basePrice || 0,
    max: result._max.basePrice || 1000,
    avg: result._avg.basePrice || 0
  }
}

// Get available attributes for filtering
async function getAttributes(where: any) {
  const products = await prisma.product.findMany({
    where,
    select: {
      sizes: { select: { name: true } },
      paperStocks: { select: { name: true } },
      coatingOptions: { select: { name: true } },
      turnaroundTime: true
    }
  })

  // Aggregate unique attributes
  const sizes = new Set<string>()
  const paperStocks = new Set<string>()
  const coatings = new Set<string>()
  const turnaroundTimes = new Set<string>()

  products.forEach(product => {
    product.sizes.forEach(s => sizes.add(s.name))
    product.paperStocks.forEach(p => paperStocks.add(p.name))
    product.coatingOptions.forEach(c => coatings.add(c.name))
    if (product.turnaroundTime) turnaroundTimes.add(product.turnaroundTime)
  })

  return {
    sizes: Array.from(sizes),
    paperStocks: Array.from(paperStocks),
    coatings: Array.from(coatings),
    turnaroundTimes: Array.from(turnaroundTimes)
  }
}

// Autocomplete suggestions
export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Check cache first
    const cacheKey = `autocomplete:${query}`
    const cached = await cache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Get product name suggestions
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { startsWith: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        name: true,
        productCategory: {
          select: { name: true }
        }
      },
      take: 10,
      orderBy: {
        orderCount: 'desc'
      }
    })

    // Get category suggestions
    const categories = await prisma.productCategory.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' }
      },
      select: {
        name: true
      },
      take: 5
    })

    const suggestions = {
      products: products.map(p => ({
        text: p.name,
        category: p.productCategory?.name,
        type: 'product'
      })),
      categories: categories.map(c => ({
        text: c.name,
        type: 'category'
      }))
    }

    // Cache for 1 hour
    await cache.set(cacheKey, suggestions, 3600)

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}