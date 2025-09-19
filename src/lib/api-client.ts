/**
 * Centralized API client for consistent fetch handling
 * Provides standardized error handling, retries, and response parsing
 */

import { logger } from '@/lib/logger'

export interface ApiClientConfig {
  baseUrl?: string
  timeout?: number
  retries?: number
  headers?: HeadersInit
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly response?: unknown

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.response = response
  }
}

class ApiClient {
  private baseUrl: string
  private timeout: number
  private retries: number
  private defaultHeaders: HeadersInit

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || ''
    this.timeout = config.timeout || 30000
    this.retries = config.retries || 3
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    }
  }

  /**
   * Performs a GET request
   */
  async get<T = unknown>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' })
  }

  /**
   * Performs a POST request
   */
  async post<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * Performs a PUT request
   */
  async put<T = unknown>(url: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * Performs a DELETE request
   */
  async delete<T = unknown>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' })
  }

  /**
   * Uploads a file using FormData
   */
  async upload<T = unknown>(url: string, formData: FormData, options?: RequestInit): Promise<ApiResponse<T>> {
    const headers = { ...this.defaultHeaders }
    delete (headers as Record<string, string>)['Content-Type'] // Let browser set content-type for FormData

    return this.request<T>(url, {
      ...options,
      method: 'POST',
      headers,
      body: formData,
    })
  }

  /**
   * Main request handler with retry logic
   */
  private async request<T = unknown>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const response = await fetch(fullUrl, requestOptions)
        clearTimeout(timeoutId)

        // Check if response is ok
        if (!response.ok) {
          const errorBody = await this.parseResponse(response)
          throw new ApiError(
            errorBody?.error || `Request failed with status ${response.status}`,
            response.status,
            errorBody
          )
        }

        // Parse successful response
        const data = await this.parseResponse<T>(response)
        return {
          success: true,
          data,
          statusCode: response.status,
        }
      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx)
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
          logger.warn(`API client error: ${error.message}`, { url: fullUrl, statusCode: error.statusCode })
          return {
            success: false,
            error: error.message,
            statusCode: error.statusCode,
          }
        }

        // Don't retry on abort
        if (error instanceof Error && error.name === 'AbortError') {
          logger.error('Request timeout', { url: fullUrl })
          return {
            success: false,
            error: 'Request timeout',
            statusCode: 408,
          }
        }

        // Log retry attempt
        if (attempt < this.retries - 1) {
          logger.debug(`Retrying request (attempt ${attempt + 1}/${this.retries})`, { url: fullUrl })
          await this.delay(Math.pow(2, attempt) * 1000) // Exponential backoff
        }
      }
    }

    // All retries failed
    logger.error('All retry attempts failed', { url: fullUrl, error: lastError })
    return {
      success: false,
      error: lastError?.message || 'Request failed after all retries',
      statusCode: 500,
    }
  }

  /**
   * Parses response body safely
   */
  private async parseResponse<T = unknown>(response: Response): Promise<T | null> {
    const contentType = response.headers.get('content-type')

    if (!contentType || !contentType.includes('application/json')) {
      return null
    }

    try {
      const text = await response.text()
      if (!text) return null

      // Remove BOM if present
      const cleanText = text.replace(/^\uFEFF/, '')
      return JSON.parse(cleanText) as T
    } catch (error) {
      logger.warn('Failed to parse response as JSON', { error })
      return null
    }
  }

  /**
   * Delay helper for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance for general use
export const apiClient = new ApiClient()

// Export class for custom instances
export { ApiClient }

/**
 * Helper function for standardized API calls in components
 */
export async function callApi<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  const response = await apiClient.request<T>(url, options)

  if (!response.success) {
    return { error: response.error }
  }

  return { data: response.data }
}