/**
 * Images Module Index
 * Always Optional Upload System
 *
 * CRITICAL ARCHITECTURE:
 * - NEVER required for pricing calculations
 * - NEVER blocks checkout process
 * - System works completely without uploads
 * - Shows "pending upload" states gracefully
 */

// Main components
export { ImageModule, useImageModule } from './ImageModule'
export { ImageUploader } from './ImageUploader'
export { ImagePreview } from './ImagePreview'

// Types and interfaces
export type {
  ImageFile,
  ImageUploadConfig,
  ImageModuleState,
  ImageModuleProps,
  ImageModuleValue,
  ImageUploadResult,
} from './types'

// Enums
export { ImageUploadState, ImageModuleError, DEFAULT_IMAGE_CONFIG } from './types'
