import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from '@/components/product/product-detail-client'
// import { ComponentErrorBoundary } from '@/components/error-boundary'
import { type Metadata } from 'next'
import { generateAllProductSchemas } from '@/lib/schema-generators'
import { type PrismaProductImage } from '@/types/product'

// Force dynamic rendering to prevent chunk loading issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

// This is a SERVER COMPONENT - no 'use client' directive
// It fetches data on the server and avoids all JSON parsing issues

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  try {
    // Look up by slug or SKU
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: slug }, { sku: slug }],
        isActive: true,
      },
      select: {
        name: true,
        description: true,
        shortDescription: true,
      },
    })

    if (!product) {
      return {
        title: 'Product Not Found | GangRun Printing',
        description: 'The product you are looking for could not be found.',
      }
    }

    return {
      title: `${product.name} | GangRun Printing`,
      description:
        product.shortDescription ||
        product.description ||
        `Order ${product.name} from GangRun Printing`,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Products | GangRun Printing',
      description: 'Browse our printing products',
    }
  }
}

// Validate slug format
function isValidSlug(slug: string): boolean {
  // Basic slug validation: alphanumeric with hyphens and underscores
  // Prevent excessively long slugs that might be attacks
  const slugRegex = /^[a-z0-9-_]{1,100}$/
  return slugRegex.test(slug)
}

async function getProduct(slug: string) {
  // Validate slug format to prevent potential issues
  if (!isValidSlug(slug)) {
    return null
  }

  try {
    // Try to find by slug first, then by SKU (for backward compatibility)
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: slug }, { sku: slug }],
        isActive: true,
      },
      include: {
        ProductCategory: true,
        City: true, // Include city data for location-specific products
        ProductImage: {
          include: {
            Image: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        ProductPaperStockSet: {
          include: {
            PaperStockSet: {
              include: {
                PaperStockSetItem: {
                  include: {
                    PaperStock: true,
                  },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        ProductQuantityGroup: {
          include: {
            QuantityGroup: true,
          },
        },
        ProductSizeGroup: {
          include: {
            SizeGroup: true,
          },
        },
        ProductAddOnSet: {
          include: {
            AddOnSet: {
              include: {
                AddOnSetItem: {
                  include: {
                    AddOn: true,
                  },
                },
              },
            },
          },
        },
        ProductTurnaroundTimeSet: {
          include: {
            TurnaroundTimeSet: {
              include: {
                TurnaroundTimeSetItem: {
                  include: {
                    TurnaroundTime: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!product) {
      // Product not found for this slug
    } else {
      // Product successfully found
    }

    return product
  } catch (error) {
    // Error fetching product from database
    return null
  }
}

// Helper function to fetch product configuration - calls the API endpoint internally
async function getProductConfiguration(productId: string) {
  try {
    // Since we're on the server, we can call the API route handler directly
    // Import the GET function from the API route
    const { GET } = await import('@/app/api/products/[id]/configuration/route')

    // Create a mock request and params object
    const { NextRequest } = await import('next/server')
    const mockRequest = new NextRequest('http://localhost/api/products/' + productId + '/configuration')
    const mockParams = Promise.resolve({ id: productId })

    // Call the API handler directly
    const response = await GET(mockRequest, { params: mockParams })

    if (!response.ok) {
      return null
    }

    const configuration = await response.json()

    return configuration
  } catch (error) {
    // Error fetching configuration
    return null
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params to fix Next.js 15 warning
  const { slug } = await params

  // Validate slug before processing
  if (!slug || typeof slug !== 'string') {
    notFound()
  }

  // Fetch product data on the server
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Fetch product configuration on the server (CRITICAL FIX for hydration issue)
  const configuration = await getProductConfiguration(product.id)

  // Transform the product data to match client component expectations
  // Add defensive checks for all nested data
  const transformedProduct = {
    ...product,
    id: product.id, // Explicitly include ID
    ProductCategory: product.ProductCategory || { id: '', name: 'Uncategorized' },
    // Transform ProductImage to flatten the nested Image data
    ProductImage: (product.ProductImage || []).map((pi) => ({
      id: pi.Image?.id || pi.id,
      url: pi.Image?.url || '',
      thumbnailUrl: pi.Image?.thumbnailUrl || pi.Image?.url || '',
      largeUrl: pi.Image?.largeUrl,
      mediumUrl: pi.Image?.mediumUrl,
      webpUrl: pi.Image?.webpUrl,
      blurDataUrl: pi.Image?.blurDataUrl,
      alt: pi.Image?.alt || `${product.name} product image`,
      isPrimary: pi.isPrimary || false,
      sortOrder: pi.sortOrder || 0,
      width: pi.Image?.width,
      height: pi.Image?.height,
      fileSize: pi.Image?.fileSize,
      mimeType: pi.Image?.mimeType,
    })),
    // Ensure all required fields have safe defaults
    basePrice: product.basePrice ?? 0,
    setupFee: product.setupFee ?? 0,
    productionTime: product.productionTime ?? 5,
    description: product.description || '',
    shortDescription: product.shortDescription || '',
  }

  // Serialize configuration to ensure it's JSON-compatible for client hydration
  const serializedConfiguration = configuration ? JSON.parse(JSON.stringify(configuration)) : null

  // Generate JSON-LD structured data for SEO and AI
  const schemas = generateAllProductSchemas(transformedProduct as any)

  // Pass the server-fetched data to the client component with error boundary
  return (
    <>
      {/* JSON-LD Schema Markup for SEO and AI Search */}
      {schemas.map((schema, index) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={index}
          type="application/ld+json"
        />
      ))}

      {/* Error boundary temporarily disabled for build */}
      <ProductDetailClient
        configuration={serializedConfiguration}
        product={transformedProduct as any}
      />
    </>
  )
}
