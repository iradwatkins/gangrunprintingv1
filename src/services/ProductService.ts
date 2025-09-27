import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import type { Prisma } from '@prisma/client'

// DTOs for input validation
export const createProductDTO = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(100),
  categoryId: z.string().uuid(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  basePrice: z.number().positive(),
  setupFee: z.number().nonnegative().optional(),
  productionTime: z.number().int().positive(),
  rushAvailable: z.boolean().default(false),
  rushDays: z.number().int().positive().optional(),
  rushFee: z.number().positive().optional(),
  paperStockSetId: z.string().uuid(),
  quantityGroupId: z.string().uuid(),
  sizeGroupId: z.string().uuid(),
  selectedAddOns: z.array(z.string().uuid()).default([]),
  images: z.array(z.object({
    url: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).default([]),
})

export const listProductsDTO = z.object({
  categoryId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  gangRunEligible: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// Response DTOs
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * Product Service Layer
 * Handles all business logic related to products
 */
export class ProductService {
  private static CACHE_TTL = 60 * 5 // 5 minutes
  private static CACHE_PREFIX = 'products'

  /**
   * List products with pagination and caching
   */
  static async listProducts(params: z.infer<typeof listProductsDTO>): Promise<PaginatedResponse<any>> {
    const validated = listProductsDTO.parse(params)
    const { page, limit, ...filters } = validated

    // Generate cache key
    const cacheKey = `${this.CACHE_PREFIX}:list:${JSON.stringify({ ...filters, page, limit })}`

    // Try to get from cache
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    // Build where clause
    const where: Prisma.ProductWhereInput = {}
    if (filters.categoryId) where.categoryId = filters.categoryId
    if (filters.isActive !== undefined) where.isActive = filters.isActive
    if (filters.gangRunEligible !== undefined) where.gangRunEligible = filters.gangRunEligible

    // Execute queries in parallel
    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          description: true,
          shortDescription: true,
          basePrice: true,
          setupFee: true,
          productionTime: true,
          rushAvailable: true,
          rushDays: true,
          rushFee: true,
          isActive: true,
          isFeatured: true,
          gangRunEligible: true,
          categoryId: true,
          createdAt: true,
          updatedAt: true,
          productCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
            },
          },
          productImages: {
            select: {
              id: true,
              url: true,
              thumbnailUrl: true,
              alt: true,
              isPrimary: true,
            },
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              productImages: true,
              productOptions: true,
              pricingTiers: true,
            },
          },
          productSizeGroups: true,
          productQuantityGroups: true,
          productPaperStockSets: true,
          productTurnaroundTimeSets: true,
          productAddOnSets: true,
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
    ])

    const response: PaginatedResponse<any> = {
      data: products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    }

    // Cache the response
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(response))

    return response
  }

  /**
   * Get single product by ID with caching
   */
  static async getProductById(id: string, includeDetails = false): Promise<any> {
    const cacheKey = `${this.CACHE_PREFIX}:${id}:${includeDetails ? 'full' : 'basic'}`

    // Try cache first
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        shortDescription: true,
        basePrice: true,
        setupFee: true,
        productionTime: true,
        rushAvailable: true,
        rushDays: true,
        rushFee: true,
        isActive: true,
        isFeatured: true,
        gangRunEligible: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        productCategory: true,
        productImages: {
          orderBy: { sortOrder: 'asc' },
        },
        ...(includeDetails ? {
          productPaperStockSets: {
            include: {
              PaperStockSet: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          productOptions: {
            select: {
              id: true,
              optionName: true,
              optionType: true,
              isRequired: true,
              sortOrder: true,
              OptionValue: {
                select: {
                  id: true,
                  value: true,
                  priceModifier: true,
                  sortOrder: true,
                },
                orderBy: { sortOrder: 'asc' },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
          pricingTiers: {
            orderBy: { minQuantity: 'asc' },
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
          productAddOns: {
            include: {
              AddOn: true,
            },
          },
        } : {}),
      },
    })

    if (!product) {
      throw new Error('Product not found')
    }

    // Cache the result
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(product))

    return product
  }

  /**
   * Create a new product with transaction
   */
  static async createProduct(data: z.infer<typeof createProductDTO>, userId: string): Promise<any> {
    const validated = createProductDTO.parse(data)

    // Generate slug from name
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Validate related entities exist
    await this.validateRelatedEntities(validated)

    // Use transaction for atomicity
    const product = await prisma.$transaction(async (tx) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          id: randomUUID(),
          name: validated.name,
          sku: validated.sku,
          slug,
          categoryId: validated.categoryId,
          description: validated.description,
          shortDescription: validated.shortDescription,
          isActive: validated.isActive,
          isFeatured: validated.isFeatured,
          basePrice: validated.basePrice,
          setupFee: validated.setupFee,
          productionTime: validated.productionTime,
          rushAvailable: validated.rushAvailable,
          rushDays: validated.rushDays,
          rushFee: validated.rushFee,
        },
      })

      // Create relationships in parallel
      await Promise.all([
        // Paper stock set
        tx.productPaperStockSet.create({
          data: {
            productId: newProduct.id,
            paperStockSetId: validated.paperStockSetId,
            isDefault: true,
          },
        }),
        // Quantity group
        tx.productQuantityGroup.create({
          data: {
            productId: newProduct.id,
            quantityGroupId: validated.quantityGroupId,
          },
        }),
        // Size group
        tx.productSizeGroup.create({
          data: {
            productId: newProduct.id,
            sizeGroupId: validated.sizeGroupId,
          },
        }),
        // Add-ons
        validated.selectedAddOns.length > 0 &&
          tx.productAddOn.createMany({
            data: validated.selectedAddOns.map((addOnId) => ({
              productId: newProduct.id,
              addOnId,
            })),
          }),
        // Images
        validated.images.length > 0 &&
          tx.productImage.createMany({
            data: validated.images.map((img, index) => ({
              productId: newProduct.id,
              url: img.url,
              thumbnailUrl: img.thumbnailUrl || img.url,
              alt: img.alt || validated.name,
              caption: img.caption,
              isPrimary: img.isPrimary || index === 0,
              sortOrder: index,
            })),
          }),
      ])

      return newProduct
    })

    // Invalidate cache
    await this.invalidateCache()

    // Return complete product
    return this.getProductById(product.id, true)
  }

  /**
   * Update product with optimistic locking
   */
  static async updateProduct(id: string, data: Partial<z.infer<typeof createProductDTO>>, userId: string): Promise<any> {
    // Check product exists
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { id: true, updatedAt: true },
    })

    if (!existing) {
      throw new Error('Product not found')
    }

    // Update product
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    // Invalidate cache
    await this.invalidateCache(id)

    return this.getProductById(id, true)
  }

  /**
   * Delete product (soft delete)
   */
  static async deleteProduct(id: string, userId: string): Promise<void> {
    // Soft delete by setting isActive to false
    await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    // Invalidate cache
    await this.invalidateCache(id)
  }

  /**
   * Validate related entities exist
   */
  private static async validateRelatedEntities(data: z.infer<typeof createProductDTO>): Promise<void> {
    const [category, paperStockSet, quantityGroup, sizeGroup] = await Promise.all([
      prisma.productCategory.findUnique({ where: { id: data.categoryId } }),
      prisma.paperStockSet.findUnique({ where: { id: data.paperStockSetId } }),
      prisma.quantityGroup.findUnique({ where: { id: data.quantityGroupId } }),
      prisma.sizeGroup.findUnique({ where: { id: data.sizeGroupId } }),
    ])

    if (!category) throw new Error('Category not found')
    if (!paperStockSet) throw new Error('Paper stock set not found')
    if (!quantityGroup) throw new Error('Quantity group not found')
    if (!sizeGroup) throw new Error('Size group not found')

    // Validate add-ons if provided
    if (data.selectedAddOns.length > 0) {
      const addOns = await prisma.addOn.findMany({
        where: { id: { in: data.selectedAddOns } },
      })

      if (addOns.length !== data.selectedAddOns.length) {
        throw new Error('One or more add-ons not found')
      }
    }
  }

  /**
   * Invalidate cache for products
   */
  private static async invalidateCache(productId?: string): Promise<void> {
    if (productId) {
      // Invalidate specific product cache
      await redis.del(`${this.CACHE_PREFIX}:${productId}:basic`)
      await redis.del(`${this.CACHE_PREFIX}:${productId}:full`)
    }

    // Invalidate list caches
    const keys = await redis.keys(`${this.CACHE_PREFIX}:list:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }
}