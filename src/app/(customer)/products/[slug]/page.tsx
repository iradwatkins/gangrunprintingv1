import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from '@/components/product/product-detail-client'
import { ComponentErrorBoundary } from '@/components/error-boundary'

// This is a SERVER COMPONENT - no 'use client' directive
// It fetches data on the server and avoids all JSON parsing issues

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        ProductCategory: true,
        ProductImage: {
          orderBy: { sortOrder: 'asc' },
        },
        productPaperStockSets: {
          include: {
            paperStockSet: {
              include: {
                paperStockItems: {
                  include: {
                    paperStock: true,
                  },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        productQuantityGroups: {
          include: {
            quantityGroup: true,
          },
        },
        productSizeGroups: {
          include: {
            sizeGroup: true,
          },
        },
        productAddOns: {
          include: {
            addOn: true,
          },
        },
      },
    })

    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params to fix Next.js 15 warning
  const { slug } = await params

  // Fetch product data on the server
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Pass the server-fetched data to the client component
  return (
    <ComponentErrorBoundary componentName="ProductDetailClient">
      <ProductDetailClient product={product} />
    </ComponentErrorBoundary>
  )
}
