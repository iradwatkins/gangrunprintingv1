import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from '@/components/product/product-detail-client'
// import { ComponentErrorBoundary } from '@/components/error-boundary'
import { Metadata } from 'next'

// Force dynamic rendering to prevent chunk loading issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

// This is a SERVER COMPONENT - no 'use client' directive
// It fetches data on the server and avoids all JSON parsing issues

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params

  try {
    // Look up by slug or SKU
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { sku: slug }
        ],
        isActive: true
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
      description: product.shortDescription || product.description || `Order ${product.name} from GangRun Printing`,
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
  // Basic slug validation: alphanumeric with hyphens
  // Prevent excessively long slugs that might be attacks
  const slugRegex = /^[a-z0-9-]{1,100}$/
  return slugRegex.test(slug)
}

async function getProduct(slug: string) {
  // Enhanced logging for debugging
  console.log('[Product Page] Looking up product by slug/sku:', slug)

  // Validate slug format to prevent potential issues
  if (!isValidSlug(slug)) {
    console.warn(`[Product Page] Invalid slug format: ${slug}`)
    return null
  }

  try {
    // Try to find by slug first, then by SKU (for backward compatibility)
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { sku: slug }
        ],
        isActive: true,
      },
      include: {
        productCategory: true,
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
        productPaperStockSets: {
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
        productQuantityGroups: {
          include: {
            QuantityGroup: true,
          },
        },
        productSizeGroups: {
          include: {
            SizeGroup: true,
          },
        },
        productAddOnSets: {
          include: {
            AddOnSet: {
              include: {
                addOnSetItems: {
                  include: {
                    AddOn: true,
                  },
                },
              },
            },
          },
        },
        productTurnaroundTimeSets: {
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
    console.error('[Product Page] Database error fetching product:', error)
    // Log additional context for debugging
    console.error('[Product Page] Error details:', {
      slug,
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params to fix Next.js 15 warning
  const { slug } = await params


  // Validate slug before processing
  if (!slug || typeof slug !== 'string') {
    console.error('[Product Page] Invalid slug parameter:', slug)
    notFound()
  }

  // Fetch product data on the server
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Transform the product data to match client component expectations
  // Add defensive checks for all nested data
  const transformedProduct = {
    ...product,
    id: product.id, // Explicitly include ID
    ProductCategory: product.productCategory || { id: '', name: 'Uncategorized' },
    ProductImage: product.productImages || [],
    // Ensure all required fields have safe defaults
    basePrice: product.basePrice ?? 0,
    setupFee: product.setupFee ?? 0,
    productionTime: product.productionTime ?? 5,
    description: product.description || '',
    shortDescription: product.shortDescription || '',
  }

  console.log('[Product Page] Passing product to client:', {
    id: transformedProduct.id,
    name: transformedProduct.name,
    hasId: !!transformedProduct.id
  })

  // Pass the server-fetched data to the client component with error boundary
  return (
    // Error boundary temporarily disabled for build
    <ProductDetailClient product={transformedProduct as any} />
  )
}
