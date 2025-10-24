import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductDetailClient from '@/components/product/product-detail-client'
import { Metadata } from 'next'

// Server-side data fetching for product detail page
async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: slug }, { sku: slug }],
        isActive: true,
      },
      include: {
        ProductCategory: {
          select: {
            id: true,
            name: true,
          },
        },
        City: {
          select: {
            id: true,
            name: true,
            stateCode: true,
          },
        },
        ProductImage: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            largeUrl: true,
            mediumUrl: true,
            webpUrl: true,
            blurDataUrl: true,
            alt: true,
            caption: true,
            isPrimary: true,
            sortOrder: true,
            width: true,
            height: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
            updatedAt: true,
            productId: true,
          },
        },
        ProductPaperStockSet: {
          where: {
            PaperStockSet: {
              isActive: true,
            },
          },
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
          orderBy: {
            sortOrder: 'asc',
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
      },
    })

    return product
  } catch (error) {
    console.error('[Product Detail] Error fetching product:', error)
    return null
  }
}

// Server-side configuration fetching
async function getProductConfiguration(productId: string) {
  try {
    // Fetch product configuration including addons, turnaround times, etc.
    const [addons, turnaroundTimes, designs] = await Promise.all([
      // Fetch addons from ProductAddOnSet
      prisma.productAddOnSet
        .findMany({
          where: {
            productId: productId,
            AddOnSet: {
              isActive: true,
            },
          },
          include: {
            AddOnSet: {
              include: {
                AddOnSetItem: {
                  include: {
                    AddOn: {
                      include: {
                        AddOnSubOption: {
                          orderBy: {
                            sortOrder: 'asc',
                          },
                        },
                      },
                    },
                  },
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        })
        .then((sets) =>
          sets.flatMap((set) =>
            set.AddOnSet.AddOnSetItem.map((item) => ({
              ...item.AddOn,
              displayPosition: item.displayPosition,
            }))
          )
        ),
      // Fetch turnaround times
      prisma.productTurnaroundTimeSet
        .findMany({
          where: {
            productId: productId,
            TurnaroundTimeSet: {
              isActive: true,
            },
          },
          include: {
            TurnaroundTimeSet: {
              include: {
                TurnaroundTimeSetItem: {
                  include: {
                    TurnaroundTime: true,
                  },
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
          },
        })
        .then((sets) =>
          sets.flatMap((set) =>
            set.TurnaroundTimeSet.TurnaroundTimeSetItem.map((item) => item.TurnaroundTime)
          )
        ),
      // Fetch design options
      prisma.productDesignSet
        .findMany({
          where: {
            productId: productId,
            DesignSet: {
              isActive: true,
            },
          },
          include: {
            DesignSet: {
              include: {
                DesignSetItem: {
                  include: {
                    DesignOption: true,
                  },
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
          },
        })
        .then((sets) =>
          sets.flatMap((set) => set.DesignSet.DesignSetItem.map((item) => item.DesignOption))
        ),
    ])

    return {
      addons,
      turnaroundTimes,
      designs,
    }
  } catch (error) {
    console.error('[Product Detail] Error fetching configuration:', error)
    return {
      addons: [],
      turnaroundTimes: [],
      designs: [],
    }
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    }
  }

  const primaryImage = product.ProductImage.find((img) => img.isPrimary) || product.ProductImage[0]

  return {
    title: `${product.name} | GangRun Printing`,
    description:
      product.shortDescription ||
      product.description ||
      `Order ${product.name} from GangRun Printing. Professional quality printing with fast turnaround.`,
    openGraph: {
      title: product.name,
      description:
        product.shortDescription ||
        product.description ||
        `Order ${product.name} from GangRun Printing`,
      images: primaryImage
        ? [
            {
              url: primaryImage.url,
              width: primaryImage.width || 800,
              height: primaryImage.height || 600,
              alt: primaryImage.alt || product.name,
            },
          ]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description:
        product.shortDescription ||
        product.description ||
        `Order ${product.name} from GangRun Printing`,
      images: primaryImage ? [primaryImage.url] : [],
    },
  }
}

// Product detail page
export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  // Fetch product configuration server-side
  const configuration = await getProductConfiguration(product.id)

  // Transform data to match client component expectations
  const transformedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    basePrice: product.basePrice,
    setupFee: product.setupFee,
    productionTime: product.productionTime,
    isActive: product.isActive,
    ProductCategory: product.ProductCategory,
    City: product.City,
    ProductImage: product.ProductImage,
    productPaperStockSets: product.ProductPaperStockSet.map((pps) => ({
      paperStockSet: {
        id: pps.PaperStockSet.id,
        name: pps.PaperStockSet.name,
        description: pps.PaperStockSet.description,
        paperStockItems: pps.PaperStockSet.PaperStockSetItem.map((item) => ({
          id: item.id,
          paperStock: item.PaperStock,
          isDefault: item.isDefault,
          sortOrder: item.sortOrder,
        })),
      },
      isDefault: pps.isDefault,
    })),
    productQuantityGroups: product.ProductQuantityGroup.map((pqg) => ({
      quantityGroup: pqg.QuantityGroup,
    })),
    productSizeGroups: product.ProductSizeGroup.map((psg) => ({
      sizeGroup: psg.SizeGroup,
    })),
    seoFaqs: product.seoFaqs as any,
    metadata: product.metadata as any,
  }

  return <ProductDetailClient product={transformedProduct} configuration={configuration} />
}

// Enable static generation for product pages
export const dynamic = 'force-dynamic' // Changed to dynamic due to real-time pricing
export const revalidate = 60 // Revalidate every 60 seconds
