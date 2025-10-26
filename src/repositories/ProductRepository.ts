import { type PrismaClient, type Prisma } from '@prisma/client'
import { cache } from 'react'

// Repository pattern for data access abstraction
export class ProductRepository {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // Find product by ID with optimized includes
  async findById(id: string, include?: Prisma.ProductInclude) {
    return this.prisma.product.findUnique({
      where: { id },
      include: include || {
        ProductCategory: true,
        ProductImage: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  }

  // Find product by slug with SEO optimization
  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        ProductCategory: true,
        ProductImage: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
  }

  // Get products with pagination and filters
  async findMany(options: {
    page?: number
    limit?: number
    categoryId?: string
    search?: string
    sortBy?: 'name' | 'price' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
  }) {
    const {
      page = 1,
      limit = 20,
      categoryId,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      isActive = true,
    } = options

    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive,
      ...(categoryId && { categoryId: categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          ProductCategory: true,
          ProductImage: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Get product configuration data with optimized queries
  async getConfigurationData(productId: string) {
    const includes = {
      productPaperStockSets: {
        include: {
          paperStockSet: {
            include: {
              paperStockItems: {
                include: {
                  paperStock: {
                    include: {
                      paperStockCoatings: {
                        include: { coating: true },
                        orderBy: { sortOrder: 'asc' } as const,
                      },
                      paperStockSides: {
                        include: { sidesOption: true },
                        where: { isEnabled: true },
                        orderBy: { sortOrder: 'asc' } as const,
                      },
                    },
                  },
                },
                orderBy: { sortOrder: 'asc' } as const,
              },
            },
          },
        },
        where: { isDefault: true },
      },
      productQuantityGroups: {
        include: { quantityGroup: true },
        where: { isDefault: true },
      },
      productSizeGroups: {
        include: { sizeGroup: true },
        where: { isDefault: true },
      },
      productTurnaroundTimeSets: {
        include: {
          turnaroundTimeSet: {
            include: {
              turnaroundTimeItems: {
                include: { turnaroundTime: true },
                orderBy: { sortOrder: 'asc' } as const,
              },
            },
          },
        },
        where: { isDefault: true },
      },
      productAddonSets: {
        include: {
          addonSet: {
            include: {
              addonItems: {
                include: { addon: true },
                where: { isEnabled: true },
                orderBy: { sortOrder: 'asc' } as const,
              },
            },
          },
        },
        where: { isDefault: true },
      },
    }

    return this.prisma.product.findUnique({
      where: { id: productId },
      include: includes as any,
    })
  }

  // Get related products for cross-selling
  async getRelatedProducts(productId: string, limit = 4) {
    // First get the product to find its category
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    })

    if (!product) return []

    // Get other products in the same category
    return this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true,
      },
      include: {
        ProductImage: {
          where: { isPrimary: true },
          take: 1,
        },
        ProductCategory: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  // Search products with full-text search
  async searchProducts(
    query: string,
    options: {
      categoryId?: string
      limit?: number
      page?: number
    } = {}
  ) {
    const { categoryId, limit = 20, page = 1 } = options
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(categoryId && { categoryId: categoryId }),
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          shortDescription: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          ProductCategory: true,
          ProductImage: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.product.count({ where }),
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  // Get product categories with product counts
  async getCategories() {
    return this.prisma.productCategory.findMany({
      include: {
        _count: {
          select: {
            Product: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  // Update product view count for analytics
  async incrementViewCount(productId: string) {
    // Note: viewCount field removed from schema - tracking via analytics instead
    return this.prisma.product.findUnique({
      where: { id: productId },
    })
  }

  // Get popular products based on view counts
  async getPopularProducts(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        ProductCategory: true,
        ProductImage: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
    })
  }

  // Get recently added products
  async getRecentProducts(limit = 8) {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        ProductCategory: true,
        ProductImage: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })
  }

  // Bulk operations for admin
  async updateMany(ids: string[], data: Prisma.ProductUpdateInput) {
    return this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data,
    })
  }

  async deleteMany(ids: string[]) {
    return this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false }, // Soft delete
    })
  }
}

// Create cached repository instance
export const createProductRepository = cache((prisma: PrismaClient) => {
  return new ProductRepository(prisma)
})
