import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from '@/components/product/product-detail-client'

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

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // Fetch product data on the server
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  // Pass the server-fetched data to the client component
  return <ProductDetailClient product={product} />
}
