/**
 * File-Specific Rate Limiter
 *
 * Advanced rate limiting specifically for file operations
 * including size-based limits and progressive penalties
 */

import {
  checkRateLimit,
  getRateLimitIdentifier,
  getClientIp,
  RateLimitResult,
} from './rate-limiter'
import { logger } from '@/lib/logger-safe'

// File operation specific rate limits
interface FileRateLimitConfig {
  maxFiles: number // Maximum number of files
  maxTotalSize: number // Maximum total size in bytes
  windowMs: number // Time window in milliseconds
  blockDurationMs?: number // Block duration if exceeded
  keyPrefix: string
}

// Track file upload metrics per identifier
interface FileUploadMetrics {
  fileCount: number
  totalSize: number
  lastUpload: number
  resetTime: number
  blocked: boolean
  blockExpiry?: number
  violations: number // Track repeat violations for progressive penalties
}

// In-memory store for file upload metrics
const fileMetricsStore = new Map<string, FileUploadMetrics>()

// Cleanup old entries every 15 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [key, metrics] of fileMetricsStore.entries()) {
      if (
        metrics.resetTime < now &&
        (!metrics.blocked || (metrics.blockExpiry && metrics.blockExpiry < now))
      ) {
        fileMetricsStore.delete(key)
      }
    }
  },
  15 * 60 * 1000
)

// File operation rate limits
export const FILE_RATE_LIMITS = {
  // Customer file uploads (artwork submission)
  CUSTOMER_UPLOAD: {
    maxFiles: 10, // 10 files
    maxTotalSize: 100 * 1024 * 1024, // 100MB total
    windowMs: 60 * 60 * 1000, // per hour
    blockDurationMs: 30 * 60 * 1000, // block for 30 minutes
    keyPrefix: 'customer_upload',
  },

  // Admin proof uploads (smaller files but more frequent)
  ADMIN_PROOF_UPLOAD: {
    maxFiles: 50, // 50 files
    maxTotalSize: 500 * 1024 * 1024, // 500MB total
    windowMs: 60 * 60 * 1000, // per hour
    blockDurationMs: 10 * 60 * 1000, // block for 10 minutes
    keyPrefix: 'admin_proof',
  },

  // File downloads
  DOWNLOAD: {
    maxFiles: 100, // 100 downloads
    maxTotalSize: 1024 * 1024 * 1024, // 1GB total
    windowMs: 60 * 60 * 1000, // per hour
    blockDurationMs: 5 * 60 * 1000, // block for 5 minutes
    keyPrefix: 'download',
  },

  // Temporary file associations
  TEMP_ASSOCIATION: {
    maxFiles: 20, // 20 associations
    maxTotalSize: 200 * 1024 * 1024, // 200MB total
    windowMs: 60 * 60 * 1000, // per hour
    blockDurationMs: 60 * 60 * 1000, // block for 1 hour
    keyPrefix: 'temp_assoc',
  },
} as const

export interface FileRateLimitResult {
  allowed: boolean
  remaining: {
    files: number
    size: number
  }
  current: {
    files: number
    size: number
  }
  limits: {
    maxFiles: number
    maxTotalSize: number
  }
  resetTime: number
  blocked?: boolean
  blockExpiry?: number
  reason?: string
  progressivePenalty?: {
    violations: number
    additionalBlockTime: number
  }
}

/**
 * Check file-specific rate limits
 */
export function checkFileRateLimit(
  identifier: string,
  config: FileRateLimitConfig,
  fileSize?: number,
  fileCount: number = 1
): FileRateLimitResult {
  const key = `${config.keyPrefix}:${identifier}`
  const now = Date.now()

  let metrics = fileMetricsStore.get(key)

  // Check if currently blocked
  if (metrics?.blocked && metrics.blockExpiry && metrics.blockExpiry > now) {
    return {
      allowed: false,
      remaining: { files: 0, size: 0 },
      current: { files: metrics.fileCount, size: metrics.totalSize },
      limits: { maxFiles: config.maxFiles, maxTotalSize: config.maxTotalSize },
      resetTime: metrics.blockExpiry,
      blocked: true,
      blockExpiry: metrics.blockExpiry,
      reason: 'Temporarily blocked due to rate limit violation',
      progressivePenalty: {
        violations: metrics.violations,
        additionalBlockTime: calculateProgressivePenalty(metrics.violations),
      },
    }
  }

  // Initialize or reset if window expired
  if (!metrics || metrics.resetTime < now) {
    metrics = {
      fileCount: 0,
      totalSize: 0,
      lastUpload: now,
      resetTime: now + config.windowMs,
      blocked: false,
      violations: metrics?.violations || 0, // Preserve violation count
    }
    fileMetricsStore.set(key, metrics)
  }

  // Calculate new totals after this operation
  const newFileCount = metrics.fileCount + fileCount
  const newTotalSize = metrics.totalSize + (fileSize || 0)

  // Check file count limit
  if (newFileCount > config.maxFiles) {
    return handleRateLimitViolation(identifier, config, metrics, now, 'File count limit exceeded')
  }

  // Check total size limit
  if (newTotalSize > config.maxTotalSize) {
    return handleRateLimitViolation(
      identifier,
      config,
      metrics,
      now,
      'Total file size limit exceeded'
    )
  }

  // Update metrics
  metrics.fileCount = newFileCount
  metrics.totalSize = newTotalSize
  metrics.lastUpload = now
  fileMetricsStore.set(key, metrics)

  // Log successful operation
  logger.debug('File rate limit check passed', {
    identifier,
    operation: config.keyPrefix,
    fileCount: newFileCount,
    totalSizeMB: (newTotalSize / 1024 / 1024).toFixed(2),
    remainingFiles: config.maxFiles - newFileCount,
    remainingSizeMB: ((config.maxTotalSize - newTotalSize) / 1024 / 1024).toFixed(2),
  })

  return {
    allowed: true,
    remaining: {
      files: config.maxFiles - newFileCount,
      size: config.maxTotalSize - newTotalSize,
    },
    current: {
      files: newFileCount,
      size: newTotalSize,
    },
    limits: {
      maxFiles: config.maxFiles,
      maxTotalSize: config.maxTotalSize,
    },
    resetTime: metrics.resetTime,
  }
}

/**
 * Handle rate limit violations with progressive penalties
 */
function handleRateLimitViolation(
  identifier: string,
  config: FileRateLimitConfig,
  metrics: FileUploadMetrics,
  now: number,
  reason: string
): FileRateLimitResult {
  // Increment violation count
  metrics.violations = (metrics.violations || 0) + 1

  // Calculate progressive penalty
  const basePenalty = config.blockDurationMs || 30 * 60 * 1000 // 30 minutes default
  const additionalPenalty = calculateProgressivePenalty(metrics.violations)
  const totalBlockDuration = basePenalty + additionalPenalty

  // Apply block
  metrics.blocked = true
  metrics.blockExpiry = now + totalBlockDuration

  const key = `${config.keyPrefix}:${identifier}`
  fileMetricsStore.set(key, metrics)

  // Log violation
  logger.warn('File rate limit violation', {
    identifier,
    operation: config.keyPrefix,
    reason,
    violations: metrics.violations,
    blockDurationMs: totalBlockDuration,
    additionalPenaltyMs: additionalPenalty,
  })

  return {
    allowed: false,
    remaining: { files: 0, size: 0 },
    current: { files: metrics.fileCount, size: metrics.totalSize },
    limits: { maxFiles: config.maxFiles, maxTotalSize: config.maxTotalSize },
    resetTime: metrics.blockExpiry,
    blocked: true,
    blockExpiry: metrics.blockExpiry,
    reason,
    progressivePenalty: {
      violations: metrics.violations,
      additionalBlockTime: additionalPenalty,
    },
  }
}

/**
 * Calculate progressive penalty based on violation count
 */
function calculateProgressivePenalty(violations: number): number {
  if (violations <= 1) return 0

  // Progressive penalties:
  // 2nd violation: +15 minutes
  // 3rd violation: +30 minutes
  // 4th violation: +1 hour
  // 5+ violations: +2 hours
  const penalties = [
    0, // 1st violation: no additional penalty
    15 * 60 * 1000, // 2nd: +15 minutes
    30 * 60 * 1000, // 3rd: +30 minutes
    60 * 60 * 1000, // 4th: +1 hour
    120 * 60 * 1000, // 5+: +2 hours
  ]

  const index = Math.min(violations - 1, penalties.length - 1)
  return penalties[index]
}

/**
 * Check file upload rate limit for HTTP request
 */
export function checkFileUploadRateLimit(
  headers: Headers,
  userId?: string,
  sessionId?: string,
  fileSize?: number,
  fileCount: number = 1,
  isAdmin: boolean = false
): FileRateLimitResult {
  const ip = getClientIp(headers)
  const identifier = getRateLimitIdentifier(ip, userId, sessionId)

  const config = isAdmin ? FILE_RATE_LIMITS.ADMIN_PROOF_UPLOAD : FILE_RATE_LIMITS.CUSTOMER_UPLOAD

  return checkFileRateLimit(identifier, config, fileSize, fileCount)
}

/**
 * Check file download rate limit
 */
export function checkFileDownloadRateLimit(
  headers: Headers,
  userId?: string,
  sessionId?: string,
  fileSize?: number
): FileRateLimitResult {
  const ip = getClientIp(headers)
  const identifier = getRateLimitIdentifier(ip, userId, sessionId)

  return checkFileRateLimit(identifier, FILE_RATE_LIMITS.DOWNLOAD, fileSize, 1)
}

/**
 * Check temporary file association rate limit
 */
export function checkTempAssociationRateLimit(
  headers: Headers,
  userId?: string,
  sessionId?: string,
  totalFileSize?: number,
  fileCount: number = 1
): FileRateLimitResult {
  const ip = getClientIp(headers)
  const identifier = getRateLimitIdentifier(ip, userId, sessionId)

  return checkFileRateLimit(identifier, FILE_RATE_LIMITS.TEMP_ASSOCIATION, totalFileSize, fileCount)
}

/**
 * Format file rate limit error message
 */
export function formatFileRateLimitError(result: FileRateLimitResult): string {
  if (result.blocked) {
    const minutesUntilReset = Math.ceil((result.blockExpiry! - Date.now()) / (60 * 1000))
    let message = `File upload temporarily blocked. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`

    if (result.progressivePenalty && result.progressivePenalty.violations > 1) {
      message += ` (${result.progressivePenalty.violations} violations - extended penalty applied)`
    }

    return message
  }

  const reason = result.reason || 'Rate limit exceeded'
  const resetTime = Math.ceil((result.resetTime - Date.now()) / (60 * 1000))

  return `${reason}. Limits reset in ${resetTime} minute${resetTime !== 1 ? 's' : ''}.`
}

/**
 * Get file upload metrics for monitoring
 */
export function getFileUploadMetrics(
  identifier: string,
  keyPrefix: string
): FileUploadMetrics | null {
  const key = `${keyPrefix}:${identifier}`
  return fileMetricsStore.get(key) || null
}

/**
 * Clear file rate limits for identifier (admin override)
 */
export function clearFileRateLimits(identifier: string, keyPrefix?: string): void {
  if (keyPrefix) {
    const key = `${keyPrefix}:${identifier}`
    fileMetricsStore.delete(key)
  } else {
    // Clear all file rate limits for identifier
    for (const [key] of fileMetricsStore.entries()) {
      if (key.includes(identifier)) {
        fileMetricsStore.delete(key)
      }
    }
  }
}

/**
 * Get all file upload statistics for monitoring dashboard
 */
export function getAllFileUploadStats(): Array<{
  identifier: string
  operation: string
  metrics: FileUploadMetrics
}> {
  const stats: Array<{
    identifier: string
    operation: string
    metrics: FileUploadMetrics
  }> = []

  for (const [key, metrics] of fileMetricsStore.entries()) {
    const [operation, ...identifierParts] = key.split(':')
    const identifier = identifierParts.join(':')

    stats.push({
      identifier,
      operation,
      metrics,
    })
  }

  return stats
}
