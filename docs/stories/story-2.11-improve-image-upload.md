# Story 3: Improve Image Upload Experience

## Story Title
Enhance Product Image Upload with Preview, Progress, and Retry Capabilities

## Story Type
Feature Enhancement

## Story Points
5

## Priority
P1 - High (UX Enhancement)

## Story Description

As an **admin user**, I want to preview images before uploading, see upload progress, view all generated image variants, and retry failed uploads, so that I can confidently manage product images without uncertainty or repeated attempts.

## Background

Current image upload experience lacks feedback and transparency:
- No preview before committing to upload
- No progress indicator during upload (users unsure if it's working)
- Generated variants (thumbnail, medium, large) not visible after upload
- Failed uploads require page refresh and complete restart
- Users often upload wrong images and must delete/re-upload

## Acceptance Criteria

### Must Have
- [ ] Image preview displays immediately after file selection
- [ ] Upload progress bar shows percentage completion
- [ ] All generated variants display after successful upload
- [ ] Retry button appears for failed uploads
- [ ] Cancel button available during upload
- [ ] Multiple image upload support with individual progress
- [ ] Image URLs properly formatted and accessible from CDN

### Should Have
- [ ] Drag-and-drop upload support
- [ ] Image optimization suggestions (file size, dimensions)
- [ ] Ability to reorder uploaded images
- [ ] Delete individual images without affecting others
- [ ] Image cropping/basic editing before upload

### Could Have
- [ ] Batch upload from URL
- [ ] Auto-retry on network failure
- [ ] Image metadata preservation (alt text, title)
- [ ] Upload history/recently uploaded images

## Technical Details

### Component Implementation

1. **Enhanced ProductImageUpload Component**:
```tsx
import { useState, useCallback } from 'react';
import { Upload, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

interface UploadState {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  variants?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  error?: string;
}

function ProductImageUpload({ onUploadComplete }) {
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback((files: FileList) => {
    const newUploads = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Start uploads
    newUploads.forEach((upload, index) => {
      uploadFile(upload, index);
    });
  }, []);

  const uploadFile = async (upload: UploadState, index: number) => {
    const formData = new FormData();
    formData.append('file', upload.file);

    try {
      // Update status to uploading
      updateUpload(index, { status: 'uploading' });

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          updateUpload(index, { progress });
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          updateUpload(index, {
            status: 'success',
            progress: 100,
            variants: response.variants
          });
          onUploadComplete(response);
        } else {
          throw new Error('Upload failed');
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        updateUpload(index, {
          status: 'error',
          error: 'Upload failed. Please try again.'
        });
      });

      xhr.open('POST', '/api/products/upload-image');
      xhr.send(formData);

    } catch (error) {
      updateUpload(index, {
        status: 'error',
        error: error.message || 'Upload failed'
      });
    }
  };

  const updateUpload = (index: number, updates: Partial<UploadState>) => {
    setUploads(prev => prev.map((upload, i) =>
      i === index ? { ...upload, ...updates } : upload
    ));
  };

  const retryUpload = (index: number) => {
    const upload = uploads[index];
    updateUpload(index, {
      status: 'pending',
      progress: 0,
      error: undefined
    });
    uploadFile(upload, index);
  };

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
        `}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFileSelect(e.dataTransfer.files);
        }}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop images here, or{' '}
          <label className="text-primary cursor-pointer hover:underline">
            browse
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files!)}
            />
          </label>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PNG, JPG, GIF up to 10MB
        </p>
      </div>

      {/* Upload Items */}
      <div className="space-y-3">
        {uploads.map((upload, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex gap-4">
              {/* Preview */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={upload.preview}
                  alt="Preview"
                  fill
                  className="object-cover rounded"
                />
                {upload.status === 'success' && (
                  <div className="absolute inset-0 bg-green-500/20 rounded flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                )}
              </div>

              {/* Details and Progress */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{upload.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeUpload(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                {upload.status === 'uploading' && (
                  <div className="space-y-1">
                    <Progress value={upload.progress} className="h-2" />
                    <p className="text-xs text-gray-500">{upload.progress}% uploaded</p>
                  </div>
                )}

                {/* Error State */}
                {upload.status === 'error' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {upload.error}
                    </div>
                    <button
                      onClick={() => retryUpload(index)}
                      className="text-sm text-primary hover:underline flex items-center"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </button>
                  </div>
                )}

                {/* Success - Show Variants */}
                {upload.status === 'success' && upload.variants && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center">
                      <img
                        src={upload.variants.thumbnail}
                        alt="Thumbnail"
                        className="w-full h-12 object-cover rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">Thumbnail</p>
                    </div>
                    <div className="text-center">
                      <img
                        src={upload.variants.medium}
                        alt="Medium"
                        className="w-full h-12 object-cover rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">Medium</p>
                    </div>
                    <div className="text-center">
                      <img
                        src={upload.variants.large}
                        alt="Large"
                        className="w-full h-12 object-cover rounded"
                      />
                      <p className="text-xs text-gray-500 mt-1">Large</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

2. **Update API Response Format**:
```typescript
// /api/products/upload-image/route.ts
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Process and upload to MinIO
    const variants = await processAndUploadImage(file);

    return NextResponse.json({
      success: true,
      variants: {
        thumbnail: variants.thumbnail.url,
        medium: variants.medium.url,
        large: variants.large.url
      },
      metadata: {
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## Testing Requirements

### Unit Tests
- [ ] Test file validation (size, type)
- [ ] Test progress calculation
- [ ] Test retry mechanism
- [ ] Test variant display logic

### Integration Tests
- [ ] Upload various image formats
- [ ] Test upload cancellation
- [ ] Verify MinIO storage
- [ ] Test CDN URL accessibility

### Manual Testing Checklist
- [ ] Upload single image and verify all variants
- [ ] Upload multiple images simultaneously
- [ ] Test drag-and-drop functionality
- [ ] Cancel upload mid-progress
- [ ] Retry failed upload
- [ ] Upload oversized image (>10MB)
- [ ] Upload non-image file
- [ ] Verify images display on customer pages
- [ ] Test on slow network connection
- [ ] Test on mobile devices

## Dependencies
- MinIO storage configuration
- Sharp image processing library
- shadcn/ui Progress component
- XMLHttpRequest for progress tracking
- CDN configuration for image serving

## Definition of Done
- [ ] Image preview shows before upload
- [ ] Progress bar displays during upload
- [ ] All variants (thumbnail, medium, large) visible
- [ ] Retry mechanism works for failures
- [ ] Drag-and-drop functionality works
- [ ] Multiple uploads handled simultaneously
- [ ] Images accessible from customer pages
- [ ] Mobile experience is smooth
- [ ] Performance is acceptable (<3s for average image)
- [ ] Code reviewed and approved

## Notes
- Consider implementing WebSocket for real-time progress if many concurrent uploads
- Add image compression on client-side for faster uploads
- Cache recently uploaded images for quick re-use
- Consider progressive image loading for better UX
- Ensure CORS is properly configured for CDN

## Estimation Breakdown
- Implement preview functionality: 1.5 hours
- Add progress tracking: 2 hours
- Display variants after upload: 1.5 hours
- Implement retry mechanism: 1 hour
- Add drag-and-drop support: 1.5 hours
- Testing and edge cases: 2 hours
- Mobile optimization: 1.5 hours
- Total: ~11 hours (5 story points)