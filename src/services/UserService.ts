import { type Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { logger, logBusinessEvent, logError, logSecurity } from '@/lib/logger-safe'
import {
  type CreateUserInput,
  type UpdateUserInput,
  type UserSearchFilters,
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

export class UserService {
  private readonly context: ServiceContext

  constructor(context: ServiceContext) {
    this.context = context
  }

  /**
   * Create a new user with role validation
   */
  async createUser(input: CreateUserInput): Promise<ServiceResult<any>> {
    try {
      // Validate input
      await this.validateCreateUserInput(input)

      // Check for existing user
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new ConflictError(`User with email ${input.email} already exists`)
      }

      // Validate role assignment permissions
      if (input.role && input.role !== 'USER') {
        await this.validateRoleAssignment(input.role)
      }

      const user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: (input.role || 'USER') as any,
          emailVerified: input.emailVerified || false,
        } as any,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      logBusinessEvent('user_created', {
        userId: user.id,
        email: user.email,
        role: user.role,
        createdBy: this.context.userId,
        requestId: this.context.requestId,
      })

      if (input.role && input.role !== 'USER') {
        logSecurity('privileged_user_created', {
          userId: user.id,
          email: user.email,
          role: user.role,
          createdBy: this.context.userId,
          requestId: this.context.requestId,
        })
      }

      return {
        success: true,
        data: user,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to create user')
      logError(normalizedError, {
        operation: 'create_user',
        input: { email: input.email, role: input.role },
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Get user by ID with security filtering
   */
  async getUserById(
    userId: string,
    includePrivateData: boolean = false
  ): Promise<ServiceResult<any>> {
    try {
      // Check if requesting user can access private data
      if (includePrivateData && !(await this.canAccessPrivateUserData(userId))) {
        throw new ForbiddenError('Insufficient permissions to access private user data')
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          // Include private data only if authorized
          ...(includePrivateData && {
            metadata: true,
            Orders: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                total: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          }),
        },
      })

      if (!user) {
        throw new NotFoundError('User', userId)
      }

      return {
        success: true,
        data: user,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to get user')
      logError(normalizedError, {
        operation: 'get_user_by_id',
        userId,
        includePrivateData,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Update user with role change validation
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<ServiceResult<any>> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
      })

      if (!existingUser) {
        throw new NotFoundError('User', userId)
      }

      // Validate role change permissions
      if (input.role && input.role !== existingUser.role) {
        await this.validateRoleChange(existingUser.role, input.role)
      }

      // Check update permissions
      if (!(await this.canUpdateUser(userId))) {
        throw new ForbiddenError('Insufficient permissions to update this user')
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...input,
          updatedAt: new Date(),
        } as any,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      logBusinessEvent('user_updated', {
        userId,
        changes: input,
        updatedBy: this.context.userId,
        requestId: this.context.requestId,
      })

      // Log security event for role changes
      if (input.role && input.role !== existingUser.role) {
        logSecurity('user_role_changed', {
          userId,
          email: existingUser.email,
          oldRole: existingUser.role,
          newRole: input.role,
          changedBy: this.context.userId,
          requestId: this.context.requestId,
        })
      }

      return {
        success: true,
        data: updatedUser,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to update user')
      logError(normalizedError, {
        operation: 'update_user',
        userId,
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
   * Search users with filtering and pagination
   */
  async searchUsers(
    filters: UserSearchFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ServiceResult<PaginatedResult<any>>> {
    try {
      // Check search permissions
      if (!(await this.canSearchUsers())) {
        throw new ForbiddenError('Insufficient permissions to search users')
      }

      const where: Prisma.UserWhereInput = this.buildUserWhereClause(filters)
      const orderBy = this.buildUserOrderByClause(pagination)

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                Order: true,
              },
            },
          },
          orderBy,
          skip: (pagination.page - 1) * pagination.limit,
          take: pagination.limit,
        }),
        prisma.user.count({ where }),
      ])

      const totalPages = Math.ceil(total / pagination.limit)

      const result: PaginatedResult<any> = {
        data: users,
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
      const normalizedError = normalizeError(error, 'Failed to search users')
      logError(normalizedError, {
        operation: 'search_users',
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
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<ServiceResult<any>> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          emailVerified: true,
        },
      })

      logBusinessEvent('email_verified', {
        userId,
        email: user.email,
        verifiedBy: this.context.userId,
        requestId: this.context.requestId,
      })

      return {
        success: true,
        data: user,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to verify email')
      logError(normalizedError, {
        operation: 'verify_email',
        userId,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(userId: string, reason?: string): Promise<ServiceResult<any>> {
    try {
      // Check permissions
      if (!(await this.canDeactivateUser(userId))) {
        throw new ForbiddenError('Insufficient permissions to deactivate this user')
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
      })

      if (!user) {
        throw new NotFoundError('User', userId)
      }

      // Update user to mark as deactivated
      const deactivatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })

      logBusinessEvent('user_deactivated', {
        userId,
        email: user.email,
        reason,
        deactivatedBy: this.context.userId,
        requestId: this.context.requestId,
      })

      logSecurity('user_deactivated', {
        userId,
        email: user.email,
        role: user.role,
        reason,
        deactivatedBy: this.context.userId,
        requestId: this.context.requestId,
      })

      return {
        success: true,
        data: deactivatedUser,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to deactivate user')
      logError(normalizedError, {
        operation: 'deactivate_user',
        userId,
        reason,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string): Promise<ServiceResult<any>> {
    try {
      if (!(await this.canAccessPrivateUserData(userId))) {
        throw new ForbiddenError('Insufficient permissions to access user activity')
      }

      const [orderStats, recentActivity] = await Promise.all([
        // Order statistics
        prisma.order.groupBy({
          by: ['status'],
          where: { userId },
          _count: true,
          _sum: { total: true },
        }),
        // Recent activity
        prisma.order.findMany({
          where: { userId },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ])

      const totalOrders = orderStats.reduce((sum, stat) => sum + stat._count, 0)
      const totalSpent = orderStats.reduce((sum, stat) => sum + (stat._sum.total || 0), 0)

      const summary = {
        totalOrders,
        totalSpent,
        ordersByStatus: orderStats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat._count
            return acc
          },
          {} as Record<string, number>
        ),
        recentOrders: recentActivity,
      }

      return {
        success: true,
        data: summary,
      }
    } catch (error) {
      const normalizedError = normalizeError(error, 'Failed to get user activity summary')
      logError(normalizedError, {
        operation: 'get_user_activity_summary',
        userId,
        requestId: this.context.requestId,
      })

      return {
        success: false,
        error: normalizedError.message,
      }
    }
  }

  // Private helper methods

  private async validateCreateUserInput(input: CreateUserInput): Promise<void> {
    if (!input.email || !input.name) {
      throw new ValidationError('Email and name are required')
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.email)) {
      throw new ValidationError('Invalid email format')
    }

    if (input.name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters long')
    }

    if (input.role && !this.isValidRole(input.role)) {
      throw new ValidationError(`Invalid role: ${input.role}`)
    }
  }

  private async validateRoleAssignment(role: string): Promise<void> {
    // Only ADMIN users can assign privileged roles
    if (!this.context.userRole || this.context.userRole !== 'ADMIN') {
      throw new ForbiddenError('Only administrators can assign privileged roles')
    }
  }

  private async validateRoleChange(currentRole: string, newRole: string): Promise<void> {
    // Only ADMIN users can change roles
    if (!this.context.userRole || this.context.userRole !== 'ADMIN') {
      throw new ForbiddenError('Only administrators can change user roles')
    }

    // Prevent changing the last admin
    if (currentRole === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      })

      if (adminCount <= 1) {
        throw new ValidationError('Cannot remove the last administrator')
      }
    }
  }

  private async canAccessPrivateUserData(userId: string): Promise<boolean> {
    // Users can access their own data, admins can access any user's data
    return this.context.userId === userId || this.context.userRole === 'ADMIN'
  }

  private async canUpdateUser(userId: string): Promise<boolean> {
    // Users can update themselves, admins can update anyone
    return this.context.userId === userId || this.context.userRole === 'ADMIN'
  }

  private async canSearchUsers(): Promise<boolean> {
    // Only admins and managers can search users
    return ['ADMIN', 'MANAGER'].includes(this.context.userRole || '')
  }

  private async canDeactivateUser(userId: string): Promise<boolean> {
    // Only admins can deactivate users, and they can't deactivate themselves
    return this.context.userRole === 'ADMIN' && this.context.userId !== userId
  }

  private isValidRole(role: string): boolean {
    const validRoles = ['USER', 'MANAGER', 'ADMIN']
    return validRoles.includes(role)
  }

  private buildUserWhereClause(filters: UserSearchFilters): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {}

    if (filters.role) {
      where.role = filters.role as any
    }

    if (filters.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified
    }

    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {}
      if (filters.createdAfter) {
        where.createdAt.gte = filters.createdAfter
      }
      if (filters.createdBefore) {
        where.createdAt.lte = filters.createdBefore
      }
    }

    return where
  }

  private buildUserOrderByClause(
    pagination: PaginationOptions
  ): Prisma.UserOrderByWithRelationInput {
    const sortBy = pagination.sortBy || 'createdAt'
    const sortOrder = pagination.sortOrder || 'desc'

    return {
      [sortBy]: sortOrder,
    }
  }
}

export default UserService
