import { type Prisma } from '@prisma/client'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { logger, logBusinessEvent, logError } from '@/lib/logger-safe'
import {
  type CreateVendorInput,
  type UpdateVendorInput,
  type VendorSearchFilters,
  type PaginationOptions,
  type PaginatedResult,
  type ServiceContext,
  type ServiceResult,
} from '@/types/service'
import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
  normalizeError,
} from '@/exceptions/AppError'

export class VendorService {
  private readonly context: ServiceContext

  constructor(context: ServiceContext) {
    this.context = context
  }

  /**
   * Create a new vendor
   */
  async createVendor(input: CreateVendorInput): Promise<ServiceResult<any>> {
    try {
      // Check permissions
      await this.checkAdminPermissions()

      // Validate input
      await this.validateCreateVendorInput(input)

      // Check for existing vendor with same name or email
      const existingVendor = await prisma.vendor.findFirst({
        where: {
          OR: [{ name: input.name }, { contactEmail: input.contactEmail }],
        },
      })

      if (existingVendor) {
        throw new ConflictError(
          `Vendor with name '${input.name}' or email '${input.contactEmail}' already exists`
        )
      }

      const vendor = await prisma.vendor.create({
        data: {
          id: `vendor_${randomBytes(16).toString('hex')}`,
          name: input.name,
          contactEmail: input.contactEmail,
          orderEmail: input.orderEmail,
          phone: input.phone,
          website: input.website,
          address: input.address as any,
          supportedCarriers: input.supportedCarriers,
          isActive: true,
          turnaroundDays: input.turnaroundDays,
          minimumOrderAmount: input.minimumOrderAmount,
          shippingCostFormula: input.shippingCostFormula,
          n8nWebhookUrl: input.n8nWebhookUrl,
          apiCredentials: input.apiCredentials as any,
          notes: input.notes,
        },
        select: {
          id: true,
          name: true,
          contactEmail: true,
          orderEmail: true,
          phone: true,
          website: true,
          address: true,
          supportedCarriers: true,
          isActive: true,
          turnaroundDays: true,
          minimumOrderAmount: true,
          shippingCostFormula: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      logBusinessEvent('vendor_created', {
        vendorId: vendor.id,
        vendorName: vendor.name,
        contactEmail: vendor.contactEmail,
        createdBy: this.context.userId,
        requestId: this.context.requestId,
      })

      return {
        success: true,
        data: vendor,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to create vendor')
      logError(normalizedError, {
        operation: 'create_vendor',
        input: { name: input.name, contactEmail: input.contactEmail },
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Get vendor by ID with optional products
   */
  async getVendorById(
    vendorId: string,
    includeProducts: boolean = false
  ): Promise<ServiceResult<any>> {
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
          VendorProduct: includeProducts
            ? {
                include: {
                  Product: {
                    select: {
                      id: true,
                      name: true,
                      sku: true,
                      basePrice: true,
                      isActive: true,
                    },
                  },
                },
              }
            : false,
          Order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              VendorProduct: true,
              Order: true,
            },
          },
        },
      })

      if (!vendor) {
        throw new NotFoundError('Vendor', vendorId)
      }

      // Remove sensitive data for non-admin users
      if (this.context.userRole !== 'ADMIN') {
        delete (vendor as any).apiCredentials
        delete (vendor as any).n8nWebhookUrl
      }

      return {
        success: true,
        data: vendor,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to get vendor')
      logError(normalizedError, {
        operation: 'get_vendor_by_id',
        vendorId,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Update vendor information
   */
  async updateVendor(vendorId: string, input: UpdateVendorInput): Promise<ServiceResult<any>> {
    try {
      // Check permissions
      await this.checkAdminPermissions()

      // Check if vendor exists
      const existingVendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true, name: true, contactEmail: true },
      })

      if (!existingVendor) {
        throw new NotFoundError('Vendor', vendorId)
      }

      // Check for name/email conflicts if they're being changed
      if (input.name || input.contactEmail) {
        const conflictWhere: Prisma.VendorWhereInput = {
          AND: [
            { id: { not: vendorId } },
            {
              OR: [
                ...(input.name ? [{ name: input.name }] : []),
                ...(input.contactEmail ? [{ contactEmail: input.contactEmail }] : []),
              ],
            },
          ],
        }

        const conflictingVendor = await prisma.vendor.findFirst({
          where: conflictWhere,
        })

        if (conflictingVendor) {
          throw new ConflictError('Another vendor with this name or email already exists')
        }
      }

      const updatedVendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          ...input,
          address: input.address as any,
          apiCredentials: input.apiCredentials as any,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          contactEmail: true,
          orderEmail: true,
          phone: true,
          website: true,
          address: true,
          supportedCarriers: true,
          isActive: true,
          turnaroundDays: true,
          minimumOrderAmount: true,
          shippingCostFormula: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      logBusinessEvent('vendor_updated', {
        vendorId,
        vendorName: existingVendor.name,
        changes: input,
        updatedBy: this.context.userId,
        requestId: this.context.requestId,
      })

      return {
        success: true,
        data: updatedVendor,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to update vendor')
      logError(normalizedError, {
        operation: 'update_vendor',
        vendorId,
        input,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Search vendors with filtering and pagination
   */
  async searchVendors(
    filters: VendorSearchFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ServiceResult<PaginatedResult<any>>> {
    try {
      const where: Prisma.VendorWhereInput = this.buildVendorWhereClause(filters)
      const orderBy = this.buildVendorOrderByClause(pagination)

      const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({
          where,
          select: {
            id: true,
            name: true,
            contactEmail: true,
            phone: true,
            website: true,
            supportedCarriers: true,
            isActive: true,
            turnaroundDays: true,
            minimumOrderAmount: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                VendorProduct: true,
                Order: true,
              },
            },
          },
          orderBy,
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        prisma.vendor.count({ where }),
      ])

      const totalPages = Math.ceil(total / pagination.limit)

      const result: PaginatedResult<any> = {
        data: vendors,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1,
        },
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to search vendors')
      logError(normalizedError, {
        operation: 'search_vendors',
        filters,
        pagination,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Activate/deactivate vendor
   */
  async toggleVendorStatus(vendorId: string, isActive: boolean): Promise<ServiceResult<any>> {
    try {
      // Check permissions
      await this.checkAdminPermissions()

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true, name: true, isActive: true },
      })

      if (!vendor) {
        throw new NotFoundError('Vendor', vendorId)
      }

      const updatedVendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          isActive,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          isActive: true,
        },
      })

      logBusinessEvent('vendor_status_changed', {
        vendorId,
        vendorName: vendor.name,
        oldStatus: vendor.isActive,
        newStatus: isActive,
        changedBy: this.context.userId,
        requestId: this.context.requestId,
      })

      return {
        success: true,
        data: updatedVendor,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to toggle vendor status')
      logError(normalizedError, {
        operation: 'toggle_vendor_status',
        vendorId,
        isActive,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Add product to vendor catalog
   */
  async addVendorProduct(
    vendorId: string,
    productId: string,
    vendorSku?: string,
    vendorPrice?: number,
    isPreferred: boolean = false
  ): Promise<ServiceResult<any>> {
    try {
      // Check permissions
      await this.checkAdminPermissions()

      // Verify vendor exists
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true, name: true },
      })

      if (!vendor) {
        throw new NotFoundError('Vendor', vendorId)
      }

      // Verify product exists
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, sku: true },
      })

      if (!product) {
        throw new NotFoundError('Product', productId)
      }

      // Check if relationship already exists
      const existingRelation = await prisma.vendorProduct.findUnique({
        where: {
          vendorId_productId: {
            vendorId,
            productId,
          },
        },
      })

      if (existingRelation) {
        throw new ConflictError('Product is already associated with this vendor')
      }

      const vendorProduct = await prisma.vendorProduct.create({
        data: {
          id: `vp_${randomBytes(16).toString('hex')}`,
          vendorId,
          productId,
          vendorSku,
          vendorPrice,
          isPreferred,
        },
        include: {
          Vendor: {
            select: { id: true, name: true },
          },
          Product: {
            select: { id: true, name: true, sku: true },
          },
        },
      })

      logBusinessEvent('vendor_product_added', {
        vendorId,
        vendorName: vendor.name,
        productId,
        productName: product.name,
        vendorSku,
        addedBy: this.context.userId,
        requestId: this.context.requestId,
      })

      return {
        success: true,
        data: vendorProduct,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to add vendor product')
      logError(normalizedError, {
        operation: 'add_vendor_product',
        vendorId,
        productId,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Remove product from vendor catalog
   */
  async removeVendorProduct(vendorId: string, productId: string): Promise<ServiceResult<any>> {
    try {
      // Check permissions
      await this.checkAdminPermissions()

      const vendorProduct = await prisma.vendorProduct.findUnique({
        where: {
          vendorId_productId: {
            vendorId,
            productId,
          },
        },
        include: {
          Vendor: { select: { name: true } },
          Product: { select: { name: true } },
        },
      })

      if (!vendorProduct) {
        throw new NotFoundError('Vendor product relationship')
      }

      await prisma.vendorProduct.delete({
        where: {
          vendorId_productId: {
            vendorId,
            productId,
          },
        },
      })

      logBusinessEvent('vendor_product_removed', {
        vendorId,
        vendorName: vendorProduct.Vendor.name,
        productId,
        productName: vendorProduct.Product.name,
        removedBy: this.context.userId,
        requestId: this.context.requestId,
      })

      return {
        success: true,
        data: { vendorId, productId },
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to remove vendor product')
      logError(normalizedError, {
        operation: 'remove_vendor_product',
        vendorId,
        productId,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Get vendor performance metrics
   */
  async getVendorPerformance(vendorId: string): Promise<ServiceResult<any>> {
    try {
      // Check permissions
      await this.checkAdminPermissions()

      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true, name: true },
      })

      if (!vendor) {
        throw new NotFoundError('Vendor', vendorId)
      }

      const [orderStats, productCount, avgTurnaround] = await Promise.all([
        // Order statistics
        prisma.order.groupBy({
          by: ['status'],
          where: { vendorId },
          _count: true,
          _sum: { total: true },
        }),
        // Product count
        prisma.vendorProduct.count({
          where: { vendorId },
        }),
        // Average turnaround time (simplified calculation)
        prisma.order.aggregate({
          where: {
            vendorId,
            status: 'DELIVERED',
            paidAt: { not: null },
            createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
          },
          _avg: {
            // This would need a computed field or additional logic to calculate actual turnaround
          },
        }),
      ])

      const totalOrders = orderStats.reduce((sum, stat) => sum + stat._count, 0)
      const totalRevenue = orderStats.reduce((sum, stat) => sum + (stat._sum.total || 0), 0)

      const performance = {
        vendorId,
        vendorName: vendor.name,
        totalOrders,
        totalRevenue,
        productCount,
        ordersByStatus: orderStats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat._count
            return acc
          },
          {} as Record<string, number>
        ),
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        completionRate:
          totalOrders > 0
            ? (orderStats.find((s) => s.status === 'DELIVERED')?._count || 0) / totalOrders
            : 0,
      }

      return {
        success: true,
        data: performance,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to get vendor performance')
      logError(normalizedError, {
        operation: 'get_vendor_performance',
        vendorId,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  // Private helper methods

  private async checkAdminPermissions(): Promise<void> {
    if (this.context.userRole !== 'ADMIN') {
      throw new ForbiddenError('Only administrators can manage vendors')
    }
  }

  private async validateCreateVendorInput(input: CreateVendorInput): Promise<void> {
    if (!input.name || !input.contactEmail) {
      throw new ValidationError('Vendor name and contact email are required')
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.contactEmail)) {
      throw new ValidationError('Invalid contact email format')
    }

    if (input.orderEmail && !emailRegex.test(input.orderEmail)) {
      throw new ValidationError('Invalid order email format')
    }

    if (!input.supportedCarriers || input.supportedCarriers.length === 0) {
      throw new ValidationError('At least one supported carrier is required')
    }

    if (input.turnaroundDays <= 0) {
      throw new ValidationError('Turnaround days must be greater than 0')
    }

    if (input.minimumOrderAmount !== undefined && input.minimumOrderAmount < 0) {
      throw new ValidationError('Minimum order amount cannot be negative')
    }
  }

  private buildVendorWhereClause(filters: VendorSearchFilters): Prisma.VendorWhereInput {
    const where: Prisma.VendorWhereInput = {}

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters.supportedCarrier) {
      where.supportedCarriers = {
        has: filters.supportedCarrier,
      }
    }

    if (filters.minTurnaroundDays !== undefined || filters.maxTurnaroundDays !== undefined) {
      where.turnaroundDays = {}
      if (filters.minTurnaroundDays !== undefined) {
        where.turnaroundDays.gte = filters.minTurnaroundDays
      }
      if (filters.maxTurnaroundDays !== undefined) {
        where.turnaroundDays.lte = filters.maxTurnaroundDays
      }
    }

    return where
  }

  private buildVendorOrderByClause(
    pagination: PaginationOptions
  ): Prisma.VendorOrderByWithRelationInput {
    const sortBy = pagination.sortBy || 'createdAt'
    const sortOrder = pagination.sortOrder || 'desc'

    return {
      [sortBy]: sortOrder,
    }
  }
}

export default VendorService
