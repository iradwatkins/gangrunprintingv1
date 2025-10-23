/**
 * File Validator
 *
 * Comprehensive file validation and security checks for uploads
 */

// Allowed MIME types for printing files
const ALLOWED_MIME_TYPES = {
  // PDF
  'application/pdf': { extension: '.pdf', maxSize: 50 * 1024 * 1024 }, // 50MB

  // Images
  'image/jpeg': { extension: '.jpg', maxSize: 25 * 1024 * 1024 }, // 25MB
  'image/jpg': { extension: '.jpg', maxSize: 25 * 1024 * 1024 },
  'image/png': { extension: '.png', maxSize: 25 * 1024 * 1024 },
  'image/svg+xml': { extension: '.svg', maxSize: 10 * 1024 * 1024 }, // 10MB
  'image/webp': { extension: '.webp', maxSize: 25 * 1024 * 1024 },

  // Design files
  'application/postscript': { extension: '.ai', maxSize: 100 * 1024 * 1024 }, // 100MB (AI/EPS)
  'application/x-photoshop': { extension: '.psd', maxSize: 100 * 1024 * 1024 }, // 100MB
  'application/vnd.adobe.photoshop': { extension: '.psd', maxSize: 100 * 1024 * 1024 },
  'application/illustrator': { extension: '.ai', maxSize: 100 * 1024 * 1024 },
  'application/vnd.adobe.illustrator': { extension: '.ai', maxSize: 100 * 1024 * 1024 },
} as const

// Dangerous file extensions that should never be allowed
const BLOCKED_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.pif',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.sh',
  '.app',
  '.deb',
  '.rpm',
  '.dmg',
  '.pkg',
  '.msi',
  '.dll',
  '.so',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.cgi',
  '.pl',
  '.py',
  '.rb',
]

// Maximum filename length
const MAX_FILENAME_LENGTH = 255

// Maximum total upload size per order
const MAX_TOTAL_SIZE_PER_ORDER = 500 * 1024 * 1024 // 500MB

export interface ValidationResult {
  valid: boolean
  error?: string
  sanitizedFilename?: string
  fileSize?: number
  mimeType?: string
}

/**
 * Validate file MIME type
 */
export function validateMimeType(mimeType: string): ValidationResult {
  if (!mimeType) {
    return { valid: false, error: 'File type is required' }
  }

  const normalized = mimeType.toLowerCase().trim()

  if (!ALLOWED_MIME_TYPES[normalized as keyof typeof ALLOWED_MIME_TYPES]) {
    return {
      valid: false,
      error: `File type "${mimeType}" is not allowed. Accepted types: PDF, JPG, PNG, SVG, AI, PSD, EPS`,
    }
  }

  return { valid: true, mimeType: normalized }
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize: number, mimeType: string): ValidationResult {
  if (!fileSize || fileSize <= 0) {
    return { valid: false, error: 'File size is required' }
  }

  const normalized = mimeType.toLowerCase().trim()
  const config = ALLOWED_MIME_TYPES[normalized as keyof typeof ALLOWED_MIME_TYPES]

  if (!config) {
    return { valid: false, error: 'Invalid MIME type for size validation' }
  }

  if (fileSize > config.maxSize) {
    const maxSizeMB = Math.floor(config.maxSize / (1024 * 1024))
    const actualSizeMB = (fileSize / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `File size (${actualSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB) for ${mimeType}`,
    }
  }

  return { valid: true, fileSize }
}

/**
 * Sanitize filename - remove dangerous characters and patterns
 */
export function sanitizeFilename(filename: string): ValidationResult {
  if (!filename) {
    return { valid: false, error: 'Filename is required' }
  }

  // Check length
  if (filename.length > MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `Filename exceeds maximum length of ${MAX_FILENAME_LENGTH} characters`,
    }
  }

  // Check for blocked extensions
  const lowerFilename = filename.toLowerCase()
  for (const blockedExt of BLOCKED_EXTENSIONS) {
    if (lowerFilename.endsWith(blockedExt)) {
      return {
        valid: false,
        error: `File extension "${blockedExt}" is not allowed for security reasons`,
      }
    }
  }

  // Remove directory traversal attempts
  let sanitized = filename.replace(/\.\./g, '')
  sanitized = sanitized.replace(/[\/\\]/g, '')

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')

  // Remove potentially dangerous characters but keep spaces, dots, dashes, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._\-\s]/g, '_')

  // Collapse multiple spaces/underscores
  sanitized = sanitized.replace(/\s+/g, ' ')
  sanitized = sanitized.replace(/_+/g, '_')

  // Trim whitespace
  sanitized = sanitized.trim()

  // Ensure filename isn't empty after sanitization
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    return { valid: false, error: 'Invalid filename after sanitization' }
  }

  return { valid: true, sanitizedFilename: sanitized }
}

/**
 * Validate total upload size for an order
 */
export async function validateTotalOrderSize(
  orderId: string,
  newFileSize: number
): Promise<ValidationResult> {
  try {
    const { prisma } = await import('@/lib/prisma')

    // Get total size of existing files for this order
    const existingFiles = await prisma.orderFile.findMany({
      where: { orderId },
      select: { fileSize: true },
    })

    const currentTotalSize = existingFiles.reduce((sum, file) => sum + (file.fileSize || 0), 0)
    const newTotalSize = currentTotalSize + newFileSize

    if (newTotalSize > MAX_TOTAL_SIZE_PER_ORDER) {
      const currentMB = (currentTotalSize / (1024 * 1024)).toFixed(2)
      const maxMB = Math.floor(MAX_TOTAL_SIZE_PER_ORDER / (1024 * 1024))
      return {
        valid: false,
        error: `Total file size for order (${currentMB}MB) would exceed maximum allowed (${maxMB}MB)`,
      }
    }

    return { valid: true }
  } catch (error) {
    console.error('Error validating total order size:', error)
    return { valid: false, error: 'Failed to validate total order size' }
  }
}

/**
 * Comprehensive file validation
 */
export async function validateFile(
  filename: string,
  fileSize: number,
  mimeType: string,
  orderId?: string
): Promise<ValidationResult> {
  // Validate MIME type
  const mimeResult = validateMimeType(mimeType)
  if (!mimeResult.valid) return mimeResult

  // Validate file size
  const sizeResult = validateFileSize(fileSize, mimeType)
  if (!sizeResult.valid) return sizeResult

  // Sanitize filename
  const nameResult = sanitizeFilename(filename)
  if (!nameResult.valid) return nameResult

  // Validate total order size if orderId provided
  if (orderId) {
    const totalSizeResult = await validateTotalOrderSize(orderId, fileSize)
    if (!totalSizeResult.valid) return totalSizeResult
  }

  return {
    valid: true,
    sanitizedFilename: nameResult.sanitizedFilename,
    fileSize: sizeResult.fileSize,
    mimeType: mimeResult.mimeType,
  }
}

/**
 * Check if file extension matches MIME type
 */
export function validateExtensionMatchesMimeType(filename: string, mimeType: string): boolean {
  const extension = filename.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension) return false

  const normalized = mimeType.toLowerCase().trim()
  const config = ALLOWED_MIME_TYPES[normalized as keyof typeof ALLOWED_MIME_TYPES]

  if (!config) return false

  // Handle multiple possible extensions for same MIME type
  const allowedExtensions = [config.extension]
  if (normalized.includes('jpeg')) allowedExtensions.push('.jpeg', '.jpg')
  if (normalized.includes('postscript')) allowedExtensions.push('.ai', '.eps')

  return allowedExtensions.includes(extension)
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get allowed file types for user display
 */
export function getAllowedFileTypes(): string[] {
  return [
    'PDF (.pdf)',
    'Images (JPG, PNG, SVG, WebP)',
    'Adobe Illustrator (.ai)',
    'Adobe Photoshop (.psd)',
    'EPS (.eps)',
  ]
}

/**
 * Get maximum file size for MIME type
 */
export function getMaxFileSizeForType(mimeType: string): number {
  const normalized = mimeType.toLowerCase().trim()
  const config = ALLOWED_MIME_TYPES[normalized as keyof typeof ALLOWED_MIME_TYPES]
  return config?.maxSize || 10 * 1024 * 1024 // Default 10MB
}
