'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface ReferenceImage {
  url: string
  name: string
}

interface ReferenceImageUploaderProps {
  images: ReferenceImage[]
  onChange: (images: ReferenceImage[]) => void
}

export function ReferenceImageUploader({ images, onChange }: ReferenceImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter((f) => !validTypes.includes(f.type))

    if (invalidFiles.length > 0) {
      toast.error('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    // Validate file sizes (max 10MB each)
    const oversizedFiles = files.filter((f) => f.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be smaller than 10MB')
      return
    }

    setUploading(true)
    try {
      const uploadedImages: ReferenceImage[] = []

      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'reference')

        const response = await fetch('/api/admin/design-center/upload-reference', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const data = await response.json()
        uploadedImages.push({
          url: data.url,
          name: file.name,
        })
      }

      onChange([...images, ...uploadedImages])
      toast.success(`Uploaded ${uploadedImages.length} reference image(s)`)

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
    toast.success('Reference image removed')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-semibold">Reference Images</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Upload reference images to guide AI generation (optional)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Add Images
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {images.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              No reference images uploaded
            </p>
            <p className="text-xs text-muted-foreground">
              Reference images help AI understand your desired style and composition
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2 bg-background border-t">
                <p className="text-xs truncate" title={image.name}>
                  {image.name}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} reference image{images.length !== 1 ? 's' : ''} • These images will guide the AI during generation
        </p>
      )}
    </div>
  )
}
