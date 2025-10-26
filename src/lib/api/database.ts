import { prisma } from '@/lib/prisma'

/**
 * Common database query utilities
 */

export interface PaginationOptions {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Apply pagination to any Prisma query
 */
export function applyPagination(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 10))
  const skip = (page - 1) * limit

  return {
    skip,
    take: limit,
    page,
    limit,
  }
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const pages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  }
}

/**
 * Common database operations for CRUD resources
 */
export class CrudRepository<T extends { id: string }> {
  constructor(
    private model: any,
    private modelName: string
  ) {}

  async findMany(
    where: Record<string, unknown> = {},
    include: Record<string, unknown> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const { skip, take, page, limit } = applyPagination(pagination)

    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        include,
        skip,
        take,
        orderBy: pagination.sort
          ? { [pagination.sort]: pagination.order || 'desc' }
          : { createdAt: 'desc' },
      }),
      this.model.count({ where }),
    ])

    return createPaginatedResponse(data, total, page, limit)
  }

  async findById(id: string, include: Record<string, unknown> = {}): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
      include,
    })
  }

  async create(data: Record<string, unknown>, include: Record<string, unknown> = {}): Promise<T> {
    return await this.model.create({
      data,
      include,
    })
  }

  async update(
    id: string,
    data: Record<string, unknown>,
    include: Record<string, unknown> = {}
  ): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
      include,
    })
  }

  async delete(id: string): Promise<T> {
    return await this.model.delete({
      where: { id },
    })
  }

  async softDelete(id: string): Promise<T> {
    return await this.model.update({
      where: { id },
      data: { isActive: false },
    })
  }

  async exists(where: Record<string, unknown>): Promise<boolean> {
    const count = await this.model.count({ where })
    return count > 0
  }

  async count(where: Record<string, unknown> = {}): Promise<number> {
    return await this.model.count({ where })
  }
}

/**
 * Common WHERE clause builders
 */
export const whereBuilders = {
  search: (fields: string[], query?: string) => {
    if (!query) return {}

    return {
      OR: fields.map((field) => ({
        [field]: {
          contains: query,
          mode: 'insensitive' as const,
        },
      })),
    }
  },

  activeFilter: (active?: boolean) => {
    if (active === undefined) return {}
    return { isActive: active }
  },

  dateRange: (field: string, from?: Date, to?: Date) => {
    const conditions: Record<string, unknown> = {}

    if (from) {
      conditions.gte = from
    }

    if (to) {
      conditions.lte = to
    }

    return Object.keys(conditions).length > 0 ? { [field]: conditions } : {}
  },

  userOwnership: (userId?: string, email?: string) => {
    if (userId) return { userId }
    if (email) return { email }
    return {}
  },
}

/**
 * Transaction wrapper
 */
export async function withTransaction<T>(operation: (tx: typeof prisma) => Promise<T>): Promise<T> {
  return await prisma.$transaction(operation)
}
