'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileImage, File, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChunkedUpload } from '@/hooks/useChunkedUpload'

interface UploadedFile {
  fileId: string
  originalName: string
  size: number
  mimeType: string
  thumbnailUrl?: string
  uploadedAt: string
  isImage: boolean
  error?: string
}

interface FileUploadZoneProps {
  onFilesUploaded?: (files: UploadedFile[]) => void
  maxFiles?: number
  maxFileSize?: number // in MB
  maxTotalSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/svg+xml',
  'image/webp',
  'application/postscript',
  'application/x-photoshop',
  'application/vnd.adobe.photoshop',
  'application/vnd.adobe.illustrator',
]

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (mimeType: string, isImage: boolean) => {
  if (isImage) return FileImage
  return File
}

export default function FileUploadZone({
  onFilesUploaded,
  maxFiles = 10,
  maxFileSize = 10, // MB
  maxTotalSize = 50, // MB
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
}: FileUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize chunked upload hook
  const chunkedUpload = useChunkedUpload({
    chunkSize: 10 * 1024 * 1024, // 10MB chunks
    maxRetries: 5,
    timeout: 60000,
    onProgress: (progress) => {
      // Progress is handled by chunkedUpload.progress
    },
    onError: (error) => {
      setErrors((prev) => [...prev, error.message])
    },
  })

  const validateFiles = (files: FileList): { valid: File[]; errors: string[] } => {
    const validFiles: File[] = []
    const fileErrors: string[] = []

    // Check total number of files
    if (uploadedFiles.length + files.length > maxFiles) {
      fileErrors.push(`Maximum ${maxFiles} files allowed`)
      return { valid: [], errors: fileErrors }
    }

    let totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        fileErrors.push(`"${file.name}" has unsupported file type`)
        continue
      }

      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        fileErrors.push(`"${file.name}" exceeds ${maxFileSize}MB limit`)
        continue
      }

      // Check total size
      totalSize += file.size
      if (totalSize > maxTotalSize * 1024 * 1024) {
        fileErrors.push(`Total file size would exceed ${maxTotalSize}MB limit`)
        break
      }

      validFiles.push(file)
    }

    return { valid: validFiles, errors: fileErrors }
  }

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return

    setUploading(true)
    setErrors([])
    setTotalFiles(files.length)

    const successfulUploads: UploadedFile[] = []

    try {
      // Upload files sequentially with chunking
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setCurrentFileIndex(i + 1)

        console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`)

        try {
          // Use chunked upload for this file
          const result = await chunkedUpload.uploadFile(file)

          // After successful upload, get merged file data from the chunk endpoint
          // The last chunk returns the merged file
          const uploadedFile: UploadedFile = {
            fileId: result.sessionId,
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
            isImage: file.type.startsWith('image/'),
          }

          successfulUploads.push(uploadedFile)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Upload failed'
          setErrors((prev) => [...prev, `${file.name}: ${errorMsg}`])
          console.error(`Failed to upload ${file.name}:`, error)
        }
      }

      // Update state with all successful uploads
      if (successfulUploads.length > 0) {
        const updatedFiles = [...uploadedFiles, ...successfulUploads]
        setUploadedFiles(updatedFiles)
        onFilesUploaded?.(updatedFiles)
      }
    } catch (error) {
      setErrors((prev) => [...prev, error instanceof Error ? error.message : 'Upload failed'])
    } finally {
      setUploading(false)
      setCurrentFileIndex(0)
      setTotalFiles(0)
      chunkedUpload.reset()
    }
  }

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (disabled || uploading) return

      const { valid, errors: validationErrors } = validateFiles(files)

      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      if (valid.length > 0) {
        await uploadFiles(valid)
      }
    },
    [disabled, uploading, uploadedFiles]
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setDragActive(true)
      }
    },
    [disabled]
  )

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled || uploading) return

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [disabled, uploading, handleFiles]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
      }
      // Reset input value to allow re-uploading same file
      e.target.value = ''
    },
    [handleFiles]
  )

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter((file) => file.fileId !== fileId)
    setUploadedFiles(updatedFiles)
    onFilesUploaded?.(updatedFiles)
  }

  const clearErrors = () => setErrors([])

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          multiple
          accept={acceptedTypes.join(',')}
          className="hidden"
          disabled={disabled || uploading}
          name="fileUpload"
          type="file"
          onChange={handleFileInput}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              {chunkedUpload.retryAttempt > 0 ? (
                <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
              ) : (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Uploading file {currentFileIndex} of {totalFiles}
                {chunkedUpload.totalChunks > 1 &&
                  ` (chunk ${chunkedUpload.currentChunk}/${chunkedUpload.totalChunks})`}
              </p>
              {chunkedUpload.retryAttempt > 0 && (
                <p className="text-xs text-orange-600 font-medium">
                  Retry attempt {chunkedUpload.retryAttempt} of 5...
                </p>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${chunkedUpload.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-center text-gray-500">
                {Math.round(chunkedUpload.progress)}%
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium">
                {dragActive ? 'Drop your files here' : 'Upload your design files'}
              </p>
              <p className="text-sm text-gray-500 mt-1">Drag and drop or click to select files</p>
              <p className="text-xs text-gray-400 mt-2">
                PDF, JPG, PNG, SVG, AI, PSD • Max {maxFileSize}MB per file • {maxFiles} files max
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Upload Errors</h3>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
              <Button
                className="mt-2 text-red-600 hover:text-red-800"
                size="sm"
                variant="ghost"
                onClick={clearErrors}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</h3>
          <div className="grid grid-cols-1 gap-3">
            {uploadedFiles.map((file) => {
              const FileIcon = getFileIcon(file.mimeType, file.isImage)

              return (
                <div
                  key={file.fileId}
                  className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50"
                >
                  {/* Thumbnail or Icon */}
                  <div className="flex-shrink-0">
                    {file.thumbnailUrl ? (
                      <img
                        alt={file.originalName}
                        className="w-12 h-12 rounded object-cover border"
                        loading="lazy"
                        src={file.thumbnailUrl}
                        onError={(e) => {
                          // Fallback to icon if thumbnail fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <FileIcon
                      className={`w-12 h-12 text-gray-400 ${file.thumbnailUrl ? 'hidden' : ''}`}
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.mimeType.split('/')[1].toUpperCase()}
                    </p>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <Button
                      className="text-red-600 hover:text-red-800"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.fileId)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
