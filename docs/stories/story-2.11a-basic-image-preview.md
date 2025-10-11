# Story 3a: Basic Image Preview

## Story Title

Implement Basic Image Preview and Upload for Products

## Story Type

Feature Enhancement

## Story Points

2

## Priority

P1 - High (Foundation for image management)

## Story Description

As an **admin user**, I want to preview images before uploading them and receive clear feedback on upload success or failure, so that I can ensure I'm adding the correct images to products.

## Background

Current state lacks basic image feedback:

- No preview before upload commitment
- Unclear if upload succeeded
- No validation feedback for file issues
- Users often upload wrong images and must start over

This story focuses on the essential preview and feedback functionality, laying the foundation for more advanced features.

## Acceptance Criteria

### Must Have

- [ ] Image preview displays immediately after file selection
- [ ] File size validation with clear error message (max 10MB)
- [ ] File type validation (JPG, PNG, GIF only)
- [ ] Success message when upload completes
- [ ] Error message with reason when upload fails
- [ ] Uploaded image displays in product form
- [ ] Basic loading state during upload

### Should Have

- [ ] Preview shows image dimensions
- [ ] File size displayed in human-readable format
- [ ] Ability to remove/clear selected image before upload
- [ ] Preview maintains aspect ratio

## Technical Details

### Implementation

```tsx
// Simplified ProductImageUpload Component
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif']

function ProductImageUpload({ onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please select a JPG, PNG, or GIF image'
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const error = validateFile(file)
    if (error) {
      setStatus({ type: 'error', message: error })
      return
    }

    // Create preview
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setStatus({ type: null, message: '' })
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setStatus({ type: null, message: '' })

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/products/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setStatus({
        type: 'success',
        message: 'Image uploaded successfully!',
      })
      onUploadComplete(data)
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Upload failed. Please try again.',
      })
    } finally {
      setUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview('')
    setStatus({ type: null, message: '' })
    if (preview) URL.revokeObjectURL(preview)
  }

  return (
    <div className="space-y-4">
      {/* File Input */}
      {!selectedFile && (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <label className="block mt-2">
            <span className="text-sm text-gray-600">Click to select an image</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF up to 10MB</p>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="border rounded-lg p-4">
          <div className="flex gap-4">
            <div className="relative w-32 h-32">
              <Image src={preview} alt="Preview" fill className="object-contain rounded" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{selectedFile?.name}</p>
              <p className="text-xs text-gray-500">
                {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleUpload} disabled={uploading} size="sm">
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button onClick={clearSelection} disabled={uploading} variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {status.type && (
        <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
          {status.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
```

## Testing Requirements

### Manual Testing Checklist

- [ ] Select valid image and see preview
- [ ] Try uploading image larger than 10MB
- [ ] Try uploading non-image file
- [ ] Upload JPG, PNG, and GIF formats
- [ ] Clear selection and select new image
- [ ] Verify upload success message
- [ ] Verify error message on failure
- [ ] Check loading state during upload
- [ ] Test on mobile devices

## Dependencies

- Next.js Image component
- File validation utilities
- Basic upload endpoint (`/api/products/upload-image`)
- shadcn/ui Alert and Button components

## Definition of Done

- [ ] Image preview works immediately on selection
- [ ] File validation prevents invalid uploads
- [ ] Clear success/error feedback
- [ ] Loading state during upload
- [ ] Can clear and reselect images
- [ ] Mobile responsive
- [ ] Code reviewed
- [ ] Manually tested

## Notes

- This story provides the foundation for more advanced features
- Keep the implementation simple and reliable
- Focus on user feedback and validation
- Ensure proper cleanup of object URLs to prevent memory leaks

## Estimation Breakdown

- Basic preview functionality: 1 hour
- File validation: 0.5 hours
- Upload with feedback: 1 hour
- Error handling: 0.5 hours
- Testing: 1 hour
- Total: ~4 hours (2 story points)
