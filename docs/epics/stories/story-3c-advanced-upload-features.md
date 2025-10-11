# Story 3c: Advanced Upload Features

## Story Title

Add Drag-and-Drop, Retry, and Multi-Upload Support

## Story Type

Feature Enhancement

## Story Points

1

## Priority

P2 - Medium (Nice-to-have enhancements)

## Story Description

As an **admin user**, I want advanced upload capabilities including drag-and-drop, retry for failures, and multiple simultaneous uploads, so that I can manage product images more efficiently.

## Background

This story adds convenience features on top of the basic upload functionality:

- Drag-and-drop for faster workflow
- Retry mechanism to handle transient failures
- Multiple simultaneous uploads for batch operations
- Cancel ability for in-progress uploads

## Acceptance Criteria

### Must Have

- [ ] Drag-and-drop files onto upload zone
- [ ] Visual feedback when dragging over zone
- [ ] Retry button appears on failed uploads
- [ ] Support uploading multiple files at once
- [ ] Cancel button for in-progress uploads

### Should Have

- [ ] Show total progress for multiple uploads
- [ ] Queue management for multiple files
- [ ] Retry all failed uploads at once

## Technical Details

### Implementation

```tsx
import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, RefreshCw, FileImage } from 'lucide-react'

interface UploadItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled'
  progress: number
  error?: string
  xhr?: XMLHttpRequest
  variants?: any
}

function AdvancedImageUpload({ maxFiles = 5, onUploadComplete }) {
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    dragCounter.current = 0

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'))

    if (files.length > 0) {
      handleMultipleFiles(files)
    }
  }, [])

  const handleMultipleFiles = (files: File[]) => {
    const newUploads = files.slice(0, maxFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending' as const,
      progress: 0,
    }))

    setUploads((prev) => [...prev, ...newUploads])

    // Start uploads
    newUploads.forEach((upload) => {
      startUpload(upload.id)
    })
  }

  const startUpload = (uploadId: string) => {
    setUploads((prev) =>
      prev.map((u) => {
        if (u.id !== uploadId) return u

        const xhr = new XMLHttpRequest()
        const formData = new FormData()
        formData.append('file', u.file)

        // Progress tracking
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setUploads((prev) =>
              prev.map((upload) => (upload.id === uploadId ? { ...upload, progress } : upload))
            )
          }
        })

        // Success
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText)
            setUploads((prev) =>
              prev.map((upload) =>
                upload.id === uploadId
                  ? { ...upload, status: 'success', progress: 100, variants: response.variants }
                  : upload
              )
            )
            onUploadComplete(response)
          } else {
            setUploads((prev) =>
              prev.map((upload) =>
                upload.id === uploadId
                  ? { ...upload, status: 'error', error: 'Upload failed' }
                  : upload
              )
            )
          }
        })

        // Error
        xhr.addEventListener('error', () => {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === uploadId
                ? { ...upload, status: 'error', error: 'Network error' }
                : upload
            )
          )
        })

        xhr.open('POST', '/api/products/upload-image')
        xhr.send(formData)

        return { ...u, status: 'uploading', xhr }
      })
    )
  }

  const cancelUpload = (uploadId: string) => {
    const upload = uploads.find((u) => u.id === uploadId)
    if (upload?.xhr) {
      upload.xhr.abort()
      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, status: 'cancelled', progress: 0 } : u))
      )
    }
  }

  const retryUpload = (uploadId: string) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === uploadId ? { ...u, status: 'pending', progress: 0, error: undefined } : u
      )
    )
    startUpload(uploadId)
  }

  const retryAllFailed = () => {
    const failed = uploads.filter((u) => u.status === 'error')
    failed.forEach((upload) => retryUpload(upload.id))
  }

  const removeUpload = (uploadId: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== uploadId))
  }

  const failedCount = uploads.filter((u) => u.status === 'error').length
  const totalProgress =
    uploads.length > 0 ? uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length : 0

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${
            isDragging
              ? 'border-primary bg-primary/10 scale-105'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload
          className={`mx-auto h-12 w-12 transition-colors ${
            isDragging ? 'text-primary' : 'text-gray-400'
          }`}
        />
        <p className="mt-2 text-sm">
          {isDragging ? (
            <span className="text-primary font-medium">Drop images here</span>
          ) : (
            <>
              Drag and drop images or{' '}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleMultipleFiles(Array.from(e.target.files))
                    }
                  }}
                />
              </label>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-1">Up to {maxFiles} images at once</p>
      </div>

      {/* Batch Actions */}
      {uploads.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="text-sm">
            <span className="font-medium">{uploads.length} files</span>
            {failedCount > 0 && <span className="text-red-600 ml-2">({failedCount} failed)</span>}
          </div>
          {failedCount > 0 && (
            <Button size="sm" variant="outline" onClick={retryAllFailed}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry All Failed
            </Button>
          )}
        </div>
      )}

      {/* Upload Items */}
      <div className="space-y-2">
        {uploads.map((upload) => (
          <div key={upload.id} className="flex items-center gap-3 p-3 border rounded">
            <FileImage className="h-8 w-8 text-gray-400" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{upload.file.name}</p>

              {upload.status === 'uploading' && (
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{upload.progress}%</span>
                </div>
              )}

              {upload.status === 'error' && <p className="text-xs text-red-600">{upload.error}</p>}

              {upload.status === 'success' && (
                <p className="text-xs text-green-600">Upload complete</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              {upload.status === 'uploading' && (
                <Button size="sm" variant="ghost" onClick={() => cancelUpload(upload.id)}>
                  <X className="h-4 w-4" />
                </Button>
              )}

              {upload.status === 'error' && (
                <Button size="sm" variant="ghost" onClick={() => retryUpload(upload.id)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}

              {(upload.status === 'success' ||
                upload.status === 'error' ||
                upload.status === 'cancelled') && (
                <Button size="sm" variant="ghost" onClick={() => removeUpload(upload.id)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Testing Requirements

### Manual Testing Checklist

- [ ] Drag single file onto zone
- [ ] Drag multiple files onto zone
- [ ] Visual feedback when dragging over
- [ ] Cancel upload in progress
- [ ] Retry failed upload
- [ ] Retry all failed uploads
- [ ] Upload 5 files simultaneously
- [ ] Remove completed uploads
- [ ] Test with mix of valid/invalid files

## Dependencies

- Drag and drop HTML5 API
- XMLHttpRequest for cancellable uploads
- Previous stories (3a and 3b) completed

## Definition of Done

- [ ] Drag-and-drop works smoothly
- [ ] Multiple uploads process correctly
- [ ] Retry mechanism functions
- [ ] Cancel stops upload immediately
- [ ] Visual feedback is clear
- [ ] Code reviewed
- [ ] Tested on multiple browsers

## Notes

- This is an enhancement story - core functionality must work first
- Consider file size limits for multiple uploads
- Ensure proper cleanup of cancelled XHR requests
- Mobile devices may not support drag-and-drop

## Estimation Breakdown

- Drag-and-drop implementation: 0.5 hours
- Multi-upload management: 0.5 hours
- Retry mechanism: 0.5 hours
- Cancel functionality: 0.5 hours
- Testing: 0.5 hours
- Total: ~2.5 hours (1 story point)
