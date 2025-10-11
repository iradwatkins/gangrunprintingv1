// Product Catalog Redis Cache
// Implements caching layer for product data to improve performance

import { getRedisClient } from './client'
import type { Product, Category, PaperStock, TurnaroundTime } from '@prisma/client'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
}

export class ProductCache {
  private redis = getRedisClient()
  private defaultTTL = 3600 // 1 hour default cache
  private prefix = 'product_cache:'

  // Product caching
  async getProduct(productId: string): Promise<Product | null> {
    const key = `${this.prefix}product:${productId}`
    const cached = await this.redis.get(key)

    if (cached) {
      return JSON.parse(cached)
    }

    return null
  }

  async setProduct(product: Product, ttl?: number): Promise<void> {
    const key = `${this.prefix}product:${product.id}`
    await this.redis.setex(key, ttl || this.defaultTTL, JSON.stringify(product))
  }

  async deleteProduct(productId: string): Promise<void> {
    const key = `${this.prefix}product:${productId}`
    await this.redis.del(key)
  }

  // Product list caching with pagination
  async getProductList(
    page: number,
    limit: number,
    categoryId?: string
  ): Promise<{ products: Product[]; total: number } | null> {
    const key = `${this.prefix}products:page:${page}:limit:${limit}${
      categoryId ? `:category:${categoryId}` : ''
    }`

    const cached = await this.redis.get(key)

    if (cached) {
      return JSON.parse(cached)
    }

    return null
  }

  async setProductList(
    data: { products: Product[]; total: number },
    page: number,
    limit: number,
    categoryId?: string,
    ttl?: number
  ): Promise<void> {
    const key = `${this.prefix}products:page:${page}:limit:${limit}${
      categoryId ? `:category:${categoryId}` : ''
    }`

    await this.redis.setex(key, ttl || this.defaultTTL, JSON.stringify(data))
  }

  // Category caching
  async getCategories(): Promise<Category[] | null> {
    const key = `${this.prefix}categories:all`
    const cached = await this.redis.get(key)

    if (cached) {
      return JSON.parse(cached)
    }

    return null
  }

  async setCategories(categories: Category[], ttl?: number): Promise<void> {
    const key = `${this.prefix}categories:all`
    await this.redis.setex(
      key,
      ttl || this.defaultTTL * 2, // Categories change less frequently
      JSON.stringify(categories)
    )
  }

  // Paper stock caching
  async getPaperStocks(productId?: string): Promise<PaperStock[] | null> {
    const key = productId
      ? `${this.prefix}paper_stocks:product:${productId}`
      : `${this.prefix}paper_stocks:all`

    const cached = await this.redis.get(key)

    if (cached) {
      return JSON.parse(cached)
    }

    return null
  }

  async setPaperStocks(paperStocks: PaperStock[], productId?: string, ttl?: number): Promise<void> {
    const key = productId
      ? `${this.prefix}paper_stocks:product:${productId}`
      : `${this.prefix}paper_stocks:all`

    await this.redis.setex(key, ttl || this.defaultTTL, JSON.stringify(paperStocks))
  }

  // Turnaround time caching
  async getTurnaroundTimes(productId?: string): Promise<TurnaroundTime[] | null> {
    const key = productId
      ? `${this.prefix}turnaround:product:${productId}`
      : `${this.prefix}turnaround:all`

    const cached = await this.redis.get(key)

    if (cached) {
      return JSON.parse(cached)
    }

    return null
  }

  async setTurnaroundTimes(
    times: TurnaroundTime[],
    productId?: string,
    ttl?: number
  ): Promise<void> {
    const key = productId
      ? `${this.prefix}turnaround:product:${productId}`
      : `${this.prefix}turnaround:all`

    await this.redis.setex(key, ttl || this.defaultTTL, JSON.stringify(times))
  }

  // Pricing cache (changes frequently, shorter TTL)
  async getProductPricing(
    productId: string,
    quantity: number,
    options?: string
  ): Promise<number | null> {
    const key = `${this.prefix}pricing:${productId}:qty:${quantity}${
      options ? `:opts:${options}` : ''
    }`

    const cached = await this.redis.get(key)

    if (cached) {
      return parseFloat(cached)
    }

    return null
  }

  async setProductPricing(
    productId: string,
    quantity: number,
    price: number,
    options?: string,
    ttl?: number
  ): Promise<void> {
    const key = `${this.prefix}pricing:${productId}:qty:${quantity}${
      options ? `:opts:${options}` : ''
    }`

    await this.redis.setex(
      key,
      ttl || 300, // 5 minutes for pricing
      price.toString()
    )
  }

  // Cache invalidation
  async invalidateProduct(productId: string): Promise<void> {
    const pattern = `${this.prefix}*${productId}*`
    const keys = await this.redis.keys(pattern)

    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async invalidateCategory(categoryId: string): Promise<void> {
    // Invalidate category and related product lists
    const patterns = [
      `${this.prefix}categories:*`,
      `${this.prefix}products:*category:${categoryId}*`,
    ]

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    }
  }

  async invalidateAll(): Promise<void> {
    const pattern = `${this.prefix}*`
    const keys = await this.redis.keys(pattern)

    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  // Warmup cache (can be run on server start or via cron)
  async warmupCache(products: Product[], categories: Category[]): Promise<void> {
    // Cache categories
    await this.setCategories(categories, 7200) // 2 hours

    // Cache individual products
    const promises = products.map((product) => this.setProduct(product, 3600))

    await Promise.all(promises)
  }

  // Cache statistics
  async getCacheStats(): Promise<{
    keys: number
    memory: string
    hits: number
    misses: number
  }> {
    const info = await this.redis.info('stats')
    const keys = await this.redis.dbsize()

    // Parse Redis INFO stats
    const stats = {
      keys,
      memory: 'N/A',
      hits: 0,
      misses: 0,
    }

    const lines = info.split('\r\n')
    lines.forEach((line) => {
      if (line.includes('keyspace_hits:')) {
        stats.hits = parseInt(line.split(':')[1])
      }
      if (line.includes('keyspace_misses:')) {
        stats.misses = parseInt(line.split(':')[1])
      }
    })

    return stats
  }
}

// Export singleton instance
export const productCache = new ProductCache()
