/**
 * API type definitions for Gang Run Printing
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  metadata?: Record<string, unknown>
  requestId: string
  timestamp?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: unknown
  statusCode: number
  requestId: string
  timestamp?: string
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface DatabaseError {
  code: string
  message: string
  detail?: string
}

export interface RequestContext {
  requestId: string
  userId?: string
  sessionId?: string
  timestamp: number
  ip?: string
  userAgent?: string
  referer?: string
}

export interface FileUploadResponse {
  id: string
  url: string
  thumbnailUrl?: string
  mediumUrl?: string
  largeUrl?: string
  webpUrl?: string
  blurDataUrl?: string
  width: number
  height: number
  size: number
  mimeType: string
  metadata?: {
    originalSize: number
    compressedSize: number
    compressionRatio: number
    profileUsed?: string
  }
}