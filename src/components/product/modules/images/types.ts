import {
  StandardModuleProps,
  StandardModuleValue,
  ImageItem,
  ImageValue,
  type ImageModuleProps as StandardImageModuleProps,
  type ImageModuleValue as StandardImageModuleValue,
} from '../types/StandardModuleTypes'

/**
 * Upload States - Critical for Image Module architecture
 * System MUST work without any uploads (always optional)
 */
export enum ImageUploadState {
  NONE = 'none', // No upload needed (system works fine)
  PENDING = 'pending', // Upload ready to start
  UPLOADING = 'uploading', // Upload in progress
  PROCESSING = 'processing', // File being processed
  COMPLETED = 'completed', // Upload successful
  FAILED = 'failed', // Upload failed (doesn't block system)
  CANCELLED = 'cancelled', // Upload cancelled by user
}

/**
 * Image file with upload tracking
 */
export interface ImageFile {
  id: string
  name: string
  size: number
  type: string
  url?: string // URL after successful upload
  thumbnailUrl?: string // Thumbnail URL
  uploadState: ImageUploadState
  uploadProgress?: number // 0-100 for progress tracking
  errorMessage?: string // Error details if upload fails
  uploadedAt?: Date // When upload completed
  metadata?: {
    width?: number
    height?: number
    resolution?: number
  }
}

/**
 * Image upload configuration
 */
export interface ImageUploadConfig {
  maxFiles: number // Maximum files allowed
  maxFileSize: number // Maximum file size in bytes
  acceptedTypes: string[] // Accepted MIME types
  requiresUpload: boolean // Whether upload is required (should always be false)
  allowMultiple: boolean // Allow multiple file selection
  enablePreview: boolean // Show image previews
  enableThumbnails: boolean // Generate thumbnails
}

/**
 * Image module state
 */
export interface ImageModuleState {
  files: ImageFile[]
  selectedFiles: string[] // IDs of selected files
  isDragOver: boolean
  uploadQueue: string[] // Files waiting to upload
  config: ImageUploadConfig
}

/**
 * Image Module Props - Always Optional
 * CRITICAL: Never required, never blocks pricing/checkout
 */
export interface ImageModuleProps extends Omit<StandardImageModuleProps, 'onChange'> {
  images: ImageFile[] // Current images
  config?: Partial<ImageUploadConfig> // Upload configuration
  onChange: (images: ImageFile[]) => void
  onUploadStart?: (files: File[]) => void
  onUploadProgress?: (fileId: string, progress: number) => void
  onUploadComplete?: (fileId: string, result: ImageFile) => void
  onUploadError?: (fileId: string, error: string) => void
  // Optional styling
  uploadAreaClassName?: string
  previewClassName?: string
  showUploadArea?: boolean // Whether to show upload UI
  showPendingMessage?: boolean // Show "pending upload" message
}

/**
 * Image Module Value - Current state
 */
export interface ImageModuleValue extends Omit<StandardImageModuleValue, 'value'> {
  images: ImageFile[]
  uploadState: ImageUploadState
  hasUploads: boolean // Whether any files are uploaded
  isPending: boolean // Whether uploads are pending
  isUploading: boolean // Whether actively uploading
  errorCount: number // Number of failed uploads
  completedCount: number // Number of successful uploads
}

/**
 * Upload operation result
 */
export interface ImageUploadResult {
  success: boolean
  fileId: string
  url?: string
  thumbnailUrl?: string
  error?: string
  metadata?: any
}

/**
 * Default configuration - Always optional, never required
 */
export const DEFAULT_IMAGE_CONFIG: ImageUploadConfig = {
  maxFiles: 10,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  requiresUpload: false, // CRITICAL: Always false
  allowMultiple: true,
  enablePreview: true,
  enableThumbnails: true,
}

/**
 * Image module error types specific to uploads
 */
export enum ImageModuleError {
  FILE_TOO_LARGE = 'file_too_large',
  INVALID_FILE_TYPE = 'invalid_file_type',
  TOO_MANY_FILES = 'too_many_files',
  UPLOAD_FAILED = 'upload_failed',
  PROCESSING_FAILED = 'processing_failed',
  NETWORK_ERROR = 'network_error',
  STORAGE_ERROR = 'storage_error',
}
