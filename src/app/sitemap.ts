import { type MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { locales } from '@/i18n'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

// Helper function to create bilingual URL entries with hreflang alternates
function createBilingualEntry(
  path: string,
  baseUrl: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: `${baseUrl}/en${path}`,
        es: `${baseUrl}/es${path}`,
      },
    },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gangrunprinting.com'

  // Static pages - Create bilingual versions
  const staticPages: MetadataRoute.Sitemap = [
    ...createBilingualEntry('', baseUrl, new Date(), 'daily', 1), // Homepage
    ...createBilingualEntry('/products', baseUrl, new Date(), 'daily', 0.9),
    ...createBilingualEntry('/quote', baseUrl, new Date(), 'weekly', 0.8),
    ...createBilingualEntry('/faq', baseUrl, new Date(), 'weekly', 0.7),
    ...createBilingualEntry('/help-center', baseUrl, new Date(), 'weekly', 0.7),
    ...createBilingualEntry('/locations', baseUrl, new Date(), 'monthly', 0.7),
    ...createBilingualEntry('/faq/business-cards', baseUrl, new Date(), 'monthly', 0.6),
    ...createBilingualEntry('/faq/flyers', baseUrl, new Date(), 'monthly', 0.6),
    ...createBilingualEntry('/track', baseUrl, new Date(), 'weekly', 0.6),
    ...createBilingualEntry('/upload', baseUrl, new Date(), 'weekly', 0.6),
    ...createBilingualEntry('/about', baseUrl, new Date(), 'monthly', 0.5),
    ...createBilingualEntry('/contact', baseUrl, new Date(), 'monthly', 0.5),
    ...createBilingualEntry('/terms-of-service', baseUrl, new Date(), 'yearly', 0.4),
    ...createBilingualEntry('/privacy-policy', baseUrl, new Date(), 'yearly', 0.4),
  ]

  // Get all active product categories
  const categories = await prisma.productCategory.findMany({
    where: {
      isActive: true,
      isHidden: false,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Create bilingual category pages
  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((category) =>
    createBilingualEntry(`/category/${category.slug}`, baseUrl, category.updatedAt, 'weekly', 0.8)
  )

  // Get all active products
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Create bilingual product pages
  const productPages: MetadataRoute.Sitemap = products.flatMap((product) =>
    createBilingualEntry(`/products/${product.slug}`, baseUrl, product.updatedAt, 'weekly', 0.7)
  )

  // Get all city pages (if you have city-specific pages)
  const cityPages: MetadataRoute.Sitemap = []
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        Product: {
          select: {
            slug: true,
          },
          where: {
            isActive: true,
          },
        },
      },
    })

    // Create bilingual city pages
    cities.forEach((city) => {
      city.Product.forEach((product) => {
        const bilingualEntries = createBilingualEntry(
          `/print/${product.slug}/${city.slug}`,
          baseUrl,
          city.updatedAt,
          'weekly',
          0.6
        )
        cityPages.push(...bilingualEntries)
      })
    })
  } catch {
    // City table might not exist or have no data
  }

  return [...staticPages, ...categoryPages, ...productPages, ...cityPages]
}
