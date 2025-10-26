'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import toast from '@/lib/toast'
import Image from 'next/image'

interface UploadedFile {
  id: string
  file: File
  preview?: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
  url?: string
}

interface ArtworkUploadProps {
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSizeMB?: number
}

const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'application/postscript': ['.ai', '.eps'],
  'image/svg+xml': ['.svg'],
  'application/illustrator': ['.ai'],
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function ArtworkUpload({
  onFilesChange,
  maxFiles = 10,
  maxSizeMB = 50,
}: ArtworkUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve(undefined)
        reader.readAsDataURL(file)
      } else {
        resolve(undefined)
      }
    })
  }

  const uploadFile = async (file: File): Promise<{ success: boolean; url?: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/temporary', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return { success: true, url: data.url }
    } catch (error) {
      console.error('Upload error:', error)
      return { success: false }
    }
  }

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const newFiles = Array.from(fileList)

      // Validate file count
      if (files.length + newFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Validate file sizes and types
      const validFiles = newFiles.filter((file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`${file.name} is too large (max ${maxSizeMB}MB)`)
          return false
        }

        const isValidType = Object.keys(ACCEPTED_FILE_TYPES).some(
          (type) => file.type === type || file.name.toLowerCase().endsWith(type.split('/')[1])
        )

        if (!isValidType) {
          toast.error(`${file.name} is not a supported file type`)
          return false
        }

        return true
      })

      if (validFiles.length === 0) return

      // Create file objects with preview
      const uploadedFiles: UploadedFile[] = await Promise.all(
        validFiles.map(async (file) => {
          const preview = await createPreview(file)
          return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview,
            status: 'uploading' as const,
            progress: 0,
          }
        })
      )

      // Add to state immediately
      const updatedFiles = [...files, ...uploadedFiles]
      setFiles(updatedFiles)

      // Upload files in parallel and wait for all to complete
      Promise.all(
        uploadedFiles.map(async (uploadedFile) => {
          const result = await uploadFile(uploadedFile.file)

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id
                ? {
                    ...f,
                    status: result.success ? 'success' : 'error',
                    url: result.url,
                    progress: 100,
                  }
                : f
            )
          )

          return { uploadedFile, result }
        })
      ).then((results) => {
        // After ALL files are uploaded, update parent component once
        let finalFiles = [...updatedFiles]
        results.forEach(({ uploadedFile, result }) => {
          if (result.success) {
            finalFiles = finalFiles.map((f) =>
              f.id === uploadedFile.id ? { ...f, status: 'success' as const, url: result.url } : f
            )
          }
        })

        // Call onFilesChange only once with all files updated
        onFilesChange(finalFiles)

        const successCount = results.filter(r => r.result.success).length
        toast.success(`${successCount} file(s) uploaded successfully`)
      })
    },
    [files, maxFiles, maxSizeMB, onFilesChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
        e.target.value = '' // Reset input
      }
    },
    [handleFiles]
  )

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((f) => f.id !== id)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
    toast.success('File removed')
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card
        className={cn(
          'relative border-2 border-dashed transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-primary/50',
          files.length === 0 && 'p-12'
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          multiple
          accept={Object.values(ACCEPTED_FILE_TYPES).flat().join(',')}
          className="hidden"
          id="artwork-upload"
          type="file"
          onChange={handleFileInput}
        />

        {files.length === 0 ? (
          <label
            className="flex flex-col items-center justify-center cursor-pointer"
            htmlFor="artwork-upload"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Your Artwork</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Drag and drop your files here, or click to browse
            </p>
            <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
              Choose Files
            </span>
            <p className="text-xs text-muted-foreground mt-4">
              PDF, AI, EPS, JPG, PNG, SVG • Max {maxSizeMB}MB per file • Up to {maxFiles} files
            </p>
          </label>
        ) : (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">
                Uploaded Files ({files.length}/{maxFiles})
              </h4>
              <label className="cursor-pointer" htmlFor="artwork-upload">
                <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                  <Upload className="w-4 h-4" />
                  Add More
                </span>
              </label>
            </div>

            {/* File Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="relative group border rounded-lg overflow-hidden bg-muted/30 aspect-square"
                >
                  {/* Preview */}
                  <div className="w-full h-full flex items-center justify-center p-2">
                    {uploadedFile.preview ? (
                      <Image
                        fill
                        alt={uploadedFile.file.name}
                        className="object-cover"
                        src={uploadedFile.preview}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <File className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground truncate w-full px-2">
                          {uploadedFile.file.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-1 right-1">
                    {uploadedFile.status === 'uploading' && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {uploadedFile.status === 'success' && (
                      <CheckCircle2 className="w-6 h-6 text-green-500 bg-white rounded-full" />
                    )}
                    {uploadedFile.status === 'error' && (
                      <AlertCircle className="w-6 h-6 text-red-500 bg-white rounded-full" />
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    className="absolute top-1 left-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    type="button"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* File Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadedFile.file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Helper Text */}
      {files.length > 0 && (
        <p className="text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-500" />
          {files.filter((f) => f.status === 'success').length} of {files.length} files uploaded
          successfully
        </p>
      )}
    </div>
  )
}
