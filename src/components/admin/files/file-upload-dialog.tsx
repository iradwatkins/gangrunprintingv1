'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  onSuccess: () => void
}

export function FileUploadDialog({ open, onOpenChange, orderId, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<string>('ADMIN_PROOF')
  const [label, setLabel] = useState('')
  const [message, setMessage] = useState('')
  const [approvalStatus, setApprovalStatus] = useState<string>('WAITING')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!label) {
        setLabel(file.name)
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)

    try {
      // Upload file to temporary storage first, then create order file record
      const formData = new FormData()
      formData.append('file', selectedFile)

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
          filename: selectedFile.name,
          fileUrl,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          thumbnailUrl,
          fileType,
          label: label || selectedFile.name,
          approvalStatus: fileType === 'ADMIN_PROOF' ? approvalStatus : 'NOT_REQUIRED',
          message: message || undefined,
        }),
      })

      if (response.ok) {
        onSuccess()
        // Reset form
        setSelectedFile(null)
        setFileType('ADMIN_PROOF')
        setLabel('')
        setMessage('')
        setApprovalStatus('WAITING')
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Upload a file to this order. Proofs will require customer approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              accept=".pdf,.jpg,.jpeg,.png,.ai,.psd,.eps"
              disabled={uploading}
              id="file"
              type="file"
              onChange={handleFileSelect}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileType">File Type</Label>
            <Select disabled={uploading} value={fileType} onValueChange={setFileType}>
              <SelectTrigger id="fileType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN_PROOF">Proof (requires approval)</SelectItem>
                <SelectItem value="CUSTOMER_ARTWORK">Customer Artwork</SelectItem>
                <SelectItem value="PRODUCTION_FILE">Production File</SelectItem>
                <SelectItem value="REFERENCE">Reference</SelectItem>
                <SelectItem value="ATTACHMENT">Attachment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {fileType === 'ADMIN_PROOF' && (
            <div className="space-y-2">
              <Label htmlFor="approvalStatus">Approval Status</Label>
              <Select disabled={uploading} value={approvalStatus} onValueChange={setApprovalStatus}>
                <SelectTrigger id="approvalStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WAITING">Waiting for Approval</SelectItem>
                  <SelectItem value="NOT_REQUIRED">No Approval Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="label">Label (optional)</Label>
            <Input
              disabled={uploading}
              id="label"
              placeholder="e.g., Final Proof V2"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              disabled={uploading}
              id="message"
              placeholder="Add a note about this file..."
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={uploading} variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedFile || uploading} onClick={handleUpload}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
