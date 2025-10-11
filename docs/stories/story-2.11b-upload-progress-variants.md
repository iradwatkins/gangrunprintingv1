# Story 3b: Upload Progress & Variants Display

## Story Title

Add Upload Progress Tracking and Display Image Variants

## Story Type

Feature Enhancement

## Story Points

2

## Priority

P1 - High (User experience improvement)

## Story Description

As an **admin user**, I want to see real-time upload progress and view all generated image variants after upload, so that I know the upload is working and can verify all image sizes were created successfully.

## Background

Building on Story 3a's basic upload, this story adds:

- Real-time progress tracking during upload
- Display of all generated image variants (thumbnail, medium, large)
- Better visibility into the upload process
- Confirmation that image processing completed

## Acceptance Criteria

### Must Have

- [ ] Progress bar shows 0-100% during upload
- [ ] Progress updates smoothly in real-time
- [ ] All three variants display after successful upload
- [ ] Each variant shows its designated size label
- [ ] Variant URLs are accessible and display correctly
- [ ] Upload can handle slow connections gracefully

### Should Have

- [ ] Upload speed indicator (KB/s)
- [ ] Time remaining estimate
- [ ] File size shown for each variant
- [ ] Ability to copy variant URLs

## Technical Details

### Enhanced Upload Component

```tsx
import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Image as ImageIcon } from 'lucide-react'

interface ImageVariants {
  thumbnail: string
  medium: string
  large: string
}

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
  speed?: number
}

function UploadProgressAndVariants({ file, onComplete }) {
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  })
  const [variants, setVariants] = useState<ImageVariants | null>(null)
  const [uploading, setUploading] = useState(false)

  const uploadWithProgress = async () => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      let startTime = Date.now()

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100)
          const elapsedTime = (Date.now() - startTime) / 1000 // seconds
          const speed = e.loaded / elapsedTime / 1024 // KB/s

          setProgress({
            loaded: e.loaded,
            total: e.total,
            percentage,
            speed: Math.round(speed),
          })
        }
      })

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            setVariants(response.variants)
            setUploading(false)
            onComplete(response)
            resolve(response)
          } catch (error) {
            reject(new Error('Invalid response format'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      // Handle errors
      xhr.addEventListener('error', () => {
        setUploading(false)
        reject(new Error('Network error during upload'))
      })

      // Handle abort
      xhr.addEventListener('abort', () => {
        setUploading(false)
        reject(new Error('Upload cancelled'))
      })

      xhr.open('POST', '/api/products/upload-image')
      xhr.send(formData)
    })
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Progress */}
      {uploading && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Uploading {file.name}</span>
              <span className="text-gray-500">{progress.percentage}%</span>
            </div>

            <Progress value={progress.percentage} className="h-2" />

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
              </span>
              {progress.speed && <span>{progress.speed} KB/s</span>}
            </div>
          </div>
        </Card>
      )}

      {/* Image Variants Display */}
      {variants && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium">Upload Complete</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Thumbnail Variant */}
              <div className="space-y-2">
                <div className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                  <img
                    src={variants.thumbnail}
                    alt="Thumbnail"
                    className="object-cover w-full h-full"
                  />
                  <Badge className="absolute top-1 right-1" variant="secondary">
                    Thumb
                  </Badge>
                </div>
                <div className="text-xs text-center text-gray-500">150x150</div>
              </div>

              {/* Medium Variant */}
              <div className="space-y-2">
                <div className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                  <img src={variants.medium} alt="Medium" className="object-cover w-full h-full" />
                  <Badge className="absolute top-1 right-1" variant="secondary">
                    Medium
                  </Badge>
                </div>
                <div className="text-xs text-center text-gray-500">500x500</div>
              </div>

              {/* Large Variant */}
              <div className="space-y-2">
                <div className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                  <img src={variants.large} alt="Large" className="object-cover w-full h-full" />
                  <Badge className="absolute top-1 right-1" variant="secondary">
                    Large
                  </Badge>
                </div>
                <div className="text-xs text-center text-gray-500">1000x1000</div>
              </div>
            </div>

            {/* Variant URLs for debugging/copying */}
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                View URLs
              </summary>
              <div className="mt-2 space-y-1 font-mono text-gray-600">
                <div className="p-2 bg-gray-50 rounded break-all">
                  <strong>Thumbnail:</strong> {variants.thumbnail}
                </div>
                <div className="p-2 bg-gray-50 rounded break-all">
                  <strong>Medium:</strong> {variants.medium}
                </div>
                <div className="p-2 bg-gray-50 rounded break-all">
                  <strong>Large:</strong> {variants.large}
                </div>
              </div>
            </details>
          </div>
        </Card>
      )}
    </div>
  )
}
```

### API Enhancement for Variants

```typescript
// /api/products/upload-image/route.ts enhancement
async function processAndGenerateVariants(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())

  const variants = {
    thumbnail: await sharp(buffer).resize(150, 150, { fit: 'cover' }).toBuffer(),
    medium: await sharp(buffer).resize(500, 500, { fit: 'cover' }).toBuffer(),
    large: await sharp(buffer).resize(1000, 1000, { fit: 'inside' }).toBuffer(),
  }

  // Upload to MinIO and get URLs
  const urls = {
    thumbnail: await uploadToMinIO(variants.thumbnail, 'thumb'),
    medium: await uploadToMinIO(variants.medium, 'medium'),
    large: await uploadToMinIO(variants.large, 'large'),
  }

  return urls
}
```

## Testing Requirements

### Manual Testing Checklist

- [ ] Progress bar updates smoothly from 0-100%
- [ ] Upload speed displays correctly
- [ ] All three variants display after upload
- [ ] Variant images are properly sized
- [ ] URLs are accessible from browser
- [ ] Slow connection handling (throttle network)
- [ ] Large file upload progress tracking
- [ ] Progress resets for new upload

## Dependencies

- XMLHttpRequest for progress tracking
- Sharp for image processing
- MinIO for variant storage
- Progress component from shadcn/ui

## Definition of Done

- [ ] Progress bar tracks upload accurately
- [ ] All variants display correctly
- [ ] Variant URLs are functional
- [ ] Progress updates are smooth
- [ ] Works on slow connections
- [ ] Code reviewed
- [ ] Tested with various image sizes

## Notes

- XMLHttpRequest is used instead of fetch for progress tracking
- Consider adding WebSocket for more accurate progress on very large files
- Variants should be generated server-side for consistency
- Ensure proper error handling for processing failures

## Estimation Breakdown

- Implement progress tracking: 1 hour
- Display variants grid: 1 hour
- Connect to API: 0.5 hours
- Testing with various files: 1 hour
- Polish and error handling: 0.5 hours
- Total: ~4 hours (2 story points)
