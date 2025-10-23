'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, CheckCircle } from 'lucide-react'
import toast from '@/lib/toast'
import { Progress } from '@/components/ui/progress'

interface Props {
  orderId: string
  onSuccess?: () => void
}

export function SimpleFileUpload({ orderId, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB')
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/postscript', // .ai
      'image/vnd.adobe.photoshop', // .psd
    ]
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.ai', '.psd', '.eps']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error('File type not supported. Please upload PDF, JPG, PNG, AI, PSD, or EPS files.')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadComplete(false)

    try {
      // Simulate upload progress (in real implementation, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Upload file to temporary storage first, then associate with order
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadResponse = await fetch('/api/upload/temporary', {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadResponse.ok) {
        throw new Error('File upload failed')
      }
      
      const uploadData = await uploadResponse.json()
      const uploadedFile = uploadData.files[0]
      
      // Use the file URL from the upload response
      const fileUrl = `/api/upload/temporary/${uploadedFile.fileId}`
      const thumbnailUrl = uploadedFile.thumbnailUrl

      const response = await fetch(`/api/orders/${orderId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          thumbnailUrl,
          fileType: 'ADMIN_PROOF', // Always set as proof requiring approval
          label: `Proof - ${file.name}`,
          approvalStatus: 'WAITING', // Always requires customer approval
          notifyCustomer: true,
        }),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        setUploadComplete(true)
        toast.success(`File uploaded successfully! Customer will be notified.`)

        // Reset after delay
        setTimeout(() => {
          setUploading(false)
          setUploadProgress(0)
          setUploadComplete(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          onSuccess?.()
        }, 1500)
      } else {
        const error = await response.json()
        toast.error(`Upload failed: ${error.error || 'Unknown error'}`)
        setUploading(false)
        setUploadProgress(0)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Upload failed. Please try again.')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        accept=".pdf,.jpg,.jpeg,.png,.ai,.psd,.eps"
        className="hidden"
        disabled={uploading}
        type="file"
        onChange={handleFileSelect}
      />

      <Button
        disabled={uploading}
        size="sm"
        onClick={handleButtonClick}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : uploadComplete ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Uploaded!
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload File for Approval
          </>
        )}
      </Button>

      {uploading && (
        <div className="space-y-1">
          <Progress className="h-2" value={uploadProgress} />
          <p className="text-xs text-muted-foreground">
            {uploadProgress < 100
              ? `Uploading... ${uploadProgress}%`
              : 'Processing...'}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Upload a file for customer approval. Accepts PDF, JPG, PNG, AI, PSD, or EPS (max 50MB)
      </p>
    </div>
  )
}
